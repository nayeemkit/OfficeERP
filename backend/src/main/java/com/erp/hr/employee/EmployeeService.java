package com.erp.hr.employee;

import com.erp.hr.department.Department;
import com.erp.hr.department.DepartmentRepository;
import com.erp.hr.designation.Designation;
import com.erp.hr.designation.DesignationRepository;
import com.erp.hr.employee.dto.EmployeeRequest;
import com.erp.hr.employee.dto.EmployeeResponse;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final DesignationRepository designationRepository;

    public Page<EmployeeResponse> getAll(String search, UUID departmentId,
                                          EmployeeEnums.EmployeeStatus status, Pageable pageable) {
        return employeeRepository.findAllWithFilters(search, departmentId, status, pageable)
                .map(this::toResponse);
    }

    public EmployeeResponse getById(UUID id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public EmployeeResponse create(EmployeeRequest request) {
        if (employeeRepository.existsByEmailAndIsDeletedFalse(request.getEmail())) {
            throw new IllegalArgumentException("Employee email already exists: " + request.getEmail());
        }

        Department department = departmentRepository.findByIdAndIsDeletedFalse(request.getDepartmentId())
                .orElseThrow(() -> new EntityNotFoundException("Department not found"));

        Designation designation = null;
        if (request.getDesignationId() != null) {
            designation = designationRepository.findByIdAndIsDeletedFalse(request.getDesignationId())
                    .orElseThrow(() -> new EntityNotFoundException("Designation not found"));
        }

        String employeeCode = generateEmployeeCode();

        Employee employee = Employee.builder()
                .employeeCode(employeeCode)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .department(department)
                .designation(designation)
                .reportingTo(request.getReportingTo())
                .joinDate(request.getJoinDate())
                .salary(request.getSalary() != null ? request.getSalary() : BigDecimal.ZERO)
                .employmentType(request.getEmploymentType() != null
                        ? request.getEmploymentType() : EmployeeEnums.EmploymentType.FULL_TIME)
                .status(request.getStatus() != null
                        ? request.getStatus() : EmployeeEnums.EmployeeStatus.ACTIVE)
                .address(request.getAddress())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .build();
        employee.setIsDeleted(false);

        employeeRepository.save(employee);
        log.info("Employee created: {} ({})", employee.getFullName(), employee.getEmployeeCode());
        return toResponse(employee);
    }

    @Transactional
    public EmployeeResponse update(UUID id, EmployeeRequest request) {
        Employee employee = findOrThrow(id);

        if (request.getFirstName() != null) employee.setFirstName(request.getFirstName());
        if (request.getLastName() != null) employee.setLastName(request.getLastName());

        if (request.getEmail() != null && !request.getEmail().equals(employee.getEmail())) {
            if (employeeRepository.existsByEmailAndIsDeletedFalse(request.getEmail())) {
                throw new IllegalArgumentException("Email already in use: " + request.getEmail());
            }
            employee.setEmail(request.getEmail());
        }

        if (request.getPhone() != null) employee.setPhone(request.getPhone());

        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findByIdAndIsDeletedFalse(request.getDepartmentId())
                    .orElseThrow(() -> new EntityNotFoundException("Department not found"));
            employee.setDepartment(dept);
        }

        if (request.getDesignationId() != null) {
            Designation desig = designationRepository.findByIdAndIsDeletedFalse(request.getDesignationId())
                    .orElseThrow(() -> new EntityNotFoundException("Designation not found"));
            employee.setDesignation(desig);
        }

        if (request.getReportingTo() != null) employee.setReportingTo(request.getReportingTo());
        if (request.getJoinDate() != null) employee.setJoinDate(request.getJoinDate());
        if (request.getSalary() != null) employee.setSalary(request.getSalary());
        if (request.getEmploymentType() != null) employee.setEmploymentType(request.getEmploymentType());
        if (request.getStatus() != null) employee.setStatus(request.getStatus());
        if (request.getAddress() != null) employee.setAddress(request.getAddress());
        if (request.getDateOfBirth() != null) employee.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null) employee.setGender(request.getGender());

        employeeRepository.save(employee);
        log.info("Employee updated: {} ({})", employee.getFullName(), employee.getEmployeeCode());
        return toResponse(employee);
    }

    @Transactional
    public void delete(UUID id) {
        Employee employee = findOrThrow(id);
        employee.setIsDeleted(true);
        employee.setStatus(EmployeeEnums.EmployeeStatus.TERMINATED);
        employeeRepository.save(employee);
        log.info("Employee deleted: {} ({})", employee.getFullName(), employee.getEmployeeCode());
    }

    public EmployeeStats getStats() {
        long total = employeeRepository.countByIsDeletedFalse();
        long active = employeeRepository.countByStatusAndIsDeletedFalse(EmployeeEnums.EmployeeStatus.ACTIVE);
        long onLeave = employeeRepository.countByStatusAndIsDeletedFalse(EmployeeEnums.EmployeeStatus.ON_LEAVE);
        long resigned = employeeRepository.countByStatusAndIsDeletedFalse(EmployeeEnums.EmployeeStatus.RESIGNED);

        return EmployeeStats.builder()
                .totalEmployees(total)
                .activeEmployees(active)
                .onLeave(onLeave)
                .resigned(resigned)
                .build();
    }

    private String generateEmployeeCode() {
        int nextNumber = employeeRepository.findMaxEmployeeCodeNumber() + 1;
        return String.format("EMP-%04d", nextNumber);
    }

    private Employee findOrThrow(UUID id) {
        return employeeRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found: " + id));
    }

    private EmployeeResponse toResponse(Employee e) {
        return EmployeeResponse.builder()
                .id(e.getId())
                .employeeCode(e.getEmployeeCode())
                .firstName(e.getFirstName())
                .lastName(e.getLastName())
                .fullName(e.getFullName())
                .email(e.getEmail())
                .phone(e.getPhone())
                .departmentId(e.getDepartment() != null ? e.getDepartment().getId() : null)
                .departmentName(e.getDepartment() != null ? e.getDepartment().getName() : null)
                .designationId(e.getDesignation() != null ? e.getDesignation().getId() : null)
                .designationTitle(e.getDesignation() != null ? e.getDesignation().getTitle() : null)
                .reportingTo(e.getReportingTo())
                .joinDate(e.getJoinDate())
                .salary(e.getSalary())
                .employmentType(e.getEmploymentType())
                .status(e.getStatus())
                .address(e.getAddress())
                .dateOfBirth(e.getDateOfBirth())
                .gender(e.getGender())
                .createdAt(e.getCreatedAt())
                .build();
    }
}
