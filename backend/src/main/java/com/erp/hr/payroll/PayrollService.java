package com.erp.hr.payroll;

import com.erp.hr.attendance.AttendanceRepository;
import com.erp.hr.attendance.AttendanceStatus;
import com.erp.hr.employee.Employee;
import com.erp.hr.employee.EmployeeEnums;
import com.erp.hr.employee.EmployeeRepository;
import com.erp.hr.payroll.dto.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PayrollService {

    private final SalaryStructureRepository salaryStructureRepository;
    private final PayslipRepository payslipRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;

    // --- Salary Structure ---

    public SalaryStructureResponse getSalaryStructure(UUID employeeId) {
        SalaryStructure ss = salaryStructureRepository
                .findByEmployeeIdAndIsActiveTrueAndIsDeletedFalse(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("No salary structure found for employee"));
        return toSalaryResponse(ss);
    }

    @Transactional
    public SalaryStructureResponse saveSalaryStructure(SalaryStructureRequest request) {
        Employee employee = employeeRepository.findByIdAndIsDeletedFalse(request.getEmployeeId())
                .orElseThrow(() -> new EntityNotFoundException("Employee not found"));

        // Deactivate existing structure
        salaryStructureRepository.findByEmployeeIdAndIsActiveTrueAndIsDeletedFalse(employee.getId())
                .ifPresent(existing -> {
                    existing.setIsActive(false);
                    salaryStructureRepository.save(existing);
                });

        SalaryStructure ss = SalaryStructure.builder()
                .employee(employee)
                .basicSalary(request.getBasicSalary())
                .houseAllowance(val(request.getHouseAllowance()))
                .transportAllowance(val(request.getTransportAllowance()))
                .medicalAllowance(val(request.getMedicalAllowance()))
                .otherAllowance(val(request.getOtherAllowance()))
                .taxDeduction(val(request.getTaxDeduction()))
                .insuranceDeduction(val(request.getInsuranceDeduction()))
                .otherDeduction(val(request.getOtherDeduction()))
                .effectiveFrom(request.getEffectiveFrom())
                .isActive(true)
                .build();
        ss.setIsDeleted(false);

        salaryStructureRepository.save(ss);
        log.info("Salary structure saved for {}", employee.getFullName());
        return toSalaryResponse(ss);
    }

    // --- Payslip Generation ---

    public Page<PayslipResponse> getPayslips(UUID employeeId, Integer year, Integer month,
                                              PayslipStatus status, Pageable pageable) {
        return payslipRepository.findAllWithFilters(employeeId, year, month, status, pageable)
                .map(this::toPayslipResponse);
    }

    public PayslipResponse getPayslipById(UUID id) {
        return toPayslipResponse(payslipRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Payslip not found")));
    }

    @Transactional
    public List<PayslipResponse> generatePayroll(GeneratePayrollRequest request) {
        List<Employee> employees;
        if (request.getEmployeeId() != null) {
            Employee emp = employeeRepository.findByIdAndIsDeletedFalse(request.getEmployeeId())
                    .orElseThrow(() -> new EntityNotFoundException("Employee not found"));
            employees = List.of(emp);
        } else {
            employees = employeeRepository.findAll().stream()
                    .filter(e -> !e.getIsDeleted() && e.getStatus() == EmployeeEnums.EmployeeStatus.ACTIVE)
                    .toList();
        }

        YearMonth ym = YearMonth.of(request.getYear(), request.getMonth());
        LocalDate startDate = ym.atDay(1);
        LocalDate endDate = ym.atEndOfMonth();
        int workingDays = ym.lengthOfMonth();

        List<PayslipResponse> results = new java.util.ArrayList<>();

        for (Employee employee : employees) {
            // Skip if payslip already exists
            if (payslipRepository.findByEmployeeIdAndYearAndMonthAndIsDeletedFalse(
                    employee.getId(), request.getYear(), request.getMonth()).isPresent()) {
                continue;
            }

            SalaryStructure ss = salaryStructureRepository
                    .findByEmployeeIdAndIsActiveTrueAndIsDeletedFalse(employee.getId())
                    .orElse(null);

            if (ss == null) {
                log.warn("No salary structure for {}, skipping", employee.getFullName());
                continue;
            }

            // Count present days from attendance
            long presentDays = attendanceRepository.countByEmployeeAndMonthAndStatus(
                    employee.getId(), startDate, endDate, AttendanceStatus.PRESENT);
            long lateDays = attendanceRepository.countByEmployeeAndMonthAndStatus(
                    employee.getId(), startDate, endDate, AttendanceStatus.LATE);
            long halfDays = attendanceRepository.countByEmployeeAndMonthAndStatus(
                    employee.getId(), startDate, endDate, AttendanceStatus.HALF_DAY);

            int totalPresent = (int) (presentDays + lateDays + halfDays);

            // Pro-rate salary based on attendance
            BigDecimal ratio = workingDays > 0
                    ? BigDecimal.valueOf(totalPresent).divide(BigDecimal.valueOf(workingDays), 4, RoundingMode.HALF_UP)
                    : BigDecimal.ONE;

            BigDecimal basic = ss.getBasicSalary().multiply(ratio).setScale(2, RoundingMode.HALF_UP);
            BigDecimal allowances = ss.getTotalAllowances().multiply(ratio).setScale(2, RoundingMode.HALF_UP);
            BigDecimal deductions = ss.getTotalDeductions();
            BigDecimal gross = basic.add(allowances);
            BigDecimal net = gross.subtract(deductions);

            Payslip payslip = Payslip.builder()
                    .employee(employee)
                    .year(request.getYear())
                    .month(request.getMonth())
                    .basicSalary(basic)
                    .totalAllowances(allowances)
                    .totalDeductions(deductions)
                    .grossSalary(gross)
                    .netSalary(net)
                    .workingDays(workingDays)
                    .presentDays(totalPresent)
                    .status(PayslipStatus.DRAFT)
                    .build();
            payslip.setIsDeleted(false);

            payslipRepository.save(payslip);
            results.add(toPayslipResponse(payslip));
            log.info("Payslip generated for {} - {}/{}", employee.getFullName(), request.getYear(), request.getMonth());
        }

        return results;
    }

    @Transactional
    public PayslipResponse confirmPayslip(UUID payslipId) {
        Payslip payslip = payslipRepository.findByIdAndIsDeletedFalse(payslipId)
                .orElseThrow(() -> new EntityNotFoundException("Payslip not found"));
        if (payslip.getStatus() != PayslipStatus.DRAFT) {
            throw new IllegalArgumentException("Only draft payslips can be confirmed");
        }
        payslip.setStatus(PayslipStatus.CONFIRMED);
        payslipRepository.save(payslip);
        return toPayslipResponse(payslip);
    }

    @Transactional
    public PayslipResponse markAsPaid(UUID payslipId) {
        Payslip payslip = payslipRepository.findByIdAndIsDeletedFalse(payslipId)
                .orElseThrow(() -> new EntityNotFoundException("Payslip not found"));
        if (payslip.getStatus() != PayslipStatus.CONFIRMED) {
            throw new IllegalArgumentException("Only confirmed payslips can be marked as paid");
        }
        payslip.setStatus(PayslipStatus.PAID);
        payslip.setPaidAt(LocalDateTime.now());
        payslipRepository.save(payslip);
        return toPayslipResponse(payslip);
    }

    public PayrollStats getStats(Integer year, Integer month) {
        int y = year != null ? year : LocalDate.now().getYear();
        int m = month != null ? month : LocalDate.now().getMonthValue();
        return PayrollStats.builder()
                .totalPayslips(payslipRepository.countByYearAndMonthAndIsDeletedFalse(y, m))
                .draftCount(payslipRepository.countByYearAndMonthAndStatusAndIsDeletedFalse(y, m, PayslipStatus.DRAFT))
                .confirmedCount(payslipRepository.countByYearAndMonthAndStatusAndIsDeletedFalse(y, m, PayslipStatus.CONFIRMED))
                .paidCount(payslipRepository.countByYearAndMonthAndStatusAndIsDeletedFalse(y, m, PayslipStatus.PAID))
                .build();
    }

    private BigDecimal val(BigDecimal v) { return v != null ? v : BigDecimal.ZERO; }

    private SalaryStructureResponse toSalaryResponse(SalaryStructure ss) {
        return SalaryStructureResponse.builder()
                .id(ss.getId())
                .employeeId(ss.getEmployee().getId())
                .employeeName(ss.getEmployee().getFullName())
                .basicSalary(ss.getBasicSalary())
                .houseAllowance(ss.getHouseAllowance())
                .transportAllowance(ss.getTransportAllowance())
                .medicalAllowance(ss.getMedicalAllowance())
                .otherAllowance(ss.getOtherAllowance())
                .taxDeduction(ss.getTaxDeduction())
                .insuranceDeduction(ss.getInsuranceDeduction())
                .otherDeduction(ss.getOtherDeduction())
                .totalAllowances(ss.getTotalAllowances())
                .totalDeductions(ss.getTotalDeductions())
                .grossSalary(ss.getGrossSalary())
                .netSalary(ss.getNetSalary())
                .effectiveFrom(ss.getEffectiveFrom())
                .isActive(ss.getIsActive())
                .build();
    }

    private PayslipResponse toPayslipResponse(Payslip p) {
        return PayslipResponse.builder()
                .id(p.getId())
                .employeeId(p.getEmployee().getId())
                .employeeName(p.getEmployee().getFullName())
                .employeeCode(p.getEmployee().getEmployeeCode())
                .departmentName(p.getEmployee().getDepartment() != null ? p.getEmployee().getDepartment().getName() : null)
                .year(p.getYear())
                .month(p.getMonth())
                .basicSalary(p.getBasicSalary())
                .totalAllowances(p.getTotalAllowances())
                .totalDeductions(p.getTotalDeductions())
                .grossSalary(p.getGrossSalary())
                .netSalary(p.getNetSalary())
                .workingDays(p.getWorkingDays())
                .presentDays(p.getPresentDays())
                .status(p.getStatus())
                .paidAt(p.getPaidAt())
                .remarks(p.getRemarks())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
