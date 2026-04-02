package com.erp.hr.attendance;

import com.erp.hr.attendance.dto.*;
import com.erp.hr.employee.Employee;
import com.erp.hr.employee.EmployeeRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    private static final LocalDateTime STANDARD_START = LocalDate.now().atTime(9, 0);
    private static final BigDecimal HALF_DAY_HOURS = new BigDecimal("4.0");

    public Page<AttendanceResponse> getAll(UUID employeeId, UUID departmentId,
                                            AttendanceStatus status, LocalDate dateFrom,
                                            LocalDate dateTo, Pageable pageable) {
        return attendanceRepository.findAllWithFilters(employeeId, departmentId, status, dateFrom, dateTo, pageable)
                .map(this::toResponse);
    }

    @Transactional
    public AttendanceResponse checkIn(CheckInRequest request) {
        Employee employee = findEmployee(request.getEmployeeId());
        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();

        // Check if already checked in today
        var existing = attendanceRepository.findByEmployeeIdAndDateAndIsDeletedFalse(employee.getId(), today);
        if (existing.isPresent() && existing.get().getCheckIn() != null) {
            throw new IllegalArgumentException("Already checked in today");
        }

        AttendanceStatus status = AttendanceStatus.PRESENT;
        if (now.getHour() >= 10) {
            status = AttendanceStatus.LATE;
        }

        Attendance attendance;
        if (existing.isPresent()) {
            attendance = existing.get();
            attendance.setCheckIn(now);
            attendance.setStatus(status);
            if (request.getRemarks() != null) attendance.setRemarks(request.getRemarks());
        } else {
            attendance = Attendance.builder()
                    .employee(employee)
                    .date(today)
                    .checkIn(now)
                    .status(status)
                    .remarks(request.getRemarks())
                    .build();
            attendance.setIsDeleted(false);
        }

        attendanceRepository.save(attendance);
        log.info("Check-in: {} at {}", employee.getFullName(), now);
        return toResponse(attendance);
    }

    @Transactional
    public AttendanceResponse checkOut(CheckOutRequest request) {
        Employee employee = findEmployee(request.getEmployeeId());
        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();

        Attendance attendance = attendanceRepository
                .findByEmployeeIdAndDateAndIsDeletedFalse(employee.getId(), today)
                .orElseThrow(() -> new IllegalArgumentException("No check-in found for today. Please check in first."));

        if (attendance.getCheckIn() == null) {
            throw new IllegalArgumentException("No check-in found for today");
        }
        if (attendance.getCheckOut() != null) {
            throw new IllegalArgumentException("Already checked out today");
        }

        attendance.setCheckOut(now);

        // Calculate work hours
        Duration duration = Duration.between(attendance.getCheckIn(), now);
        BigDecimal hours = BigDecimal.valueOf(duration.toMinutes())
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
        attendance.setWorkHours(hours);

        // Update status if half day
        if (hours.compareTo(HALF_DAY_HOURS) <= 0) {
            attendance.setStatus(AttendanceStatus.HALF_DAY);
        }

        if (request.getRemarks() != null) {
            String existingRemarks = attendance.getRemarks() != null ? attendance.getRemarks() + " | " : "";
            attendance.setRemarks(existingRemarks + request.getRemarks());
        }

        attendanceRepository.save(attendance);
        log.info("Check-out: {} at {} ({}h)", employee.getFullName(), now, hours);
        return toResponse(attendance);
    }

    @Transactional
    public AttendanceResponse markManual(ManualAttendanceRequest request) {
        Employee employee = findEmployee(request.getEmployeeId());

        var existing = attendanceRepository
                .findByEmployeeIdAndDateAndIsDeletedFalse(employee.getId(), request.getDate());

        Attendance attendance;
        if (existing.isPresent()) {
            attendance = existing.get();
        } else {
            attendance = Attendance.builder()
                    .employee(employee)
                    .date(request.getDate())
                    .build();
            attendance.setIsDeleted(false);
        }

        attendance.setCheckIn(request.getCheckIn());
        attendance.setCheckOut(request.getCheckOut());
        attendance.setStatus(request.getStatus());
        attendance.setRemarks(request.getRemarks());

        if (request.getCheckIn() != null && request.getCheckOut() != null) {
            Duration duration = Duration.between(request.getCheckIn(), request.getCheckOut());
            attendance.setWorkHours(BigDecimal.valueOf(duration.toMinutes())
                    .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP));
        }

        attendanceRepository.save(attendance);
        log.info("Manual attendance: {} on {} - {}", employee.getFullName(), request.getDate(), request.getStatus());
        return toResponse(attendance);
    }

    public MonthlySummary getMonthlySummary(UUID employeeId, int year, int month) {
        Employee employee = findEmployee(employeeId);
        YearMonth ym = YearMonth.of(year, month);
        LocalDate startDate = ym.atDay(1);
        LocalDate endDate = ym.atEndOfMonth();

        List<Attendance> records = attendanceRepository.findByEmployeeAndDateRange(employeeId, startDate, endDate);

        long present = records.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count();
        long absent = records.stream().filter(a -> a.getStatus() == AttendanceStatus.ABSENT).count();
        long late = records.stream().filter(a -> a.getStatus() == AttendanceStatus.LATE).count();
        long halfDays = records.stream().filter(a -> a.getStatus() == AttendanceStatus.HALF_DAY).count();
        long onLeave = records.stream().filter(a -> a.getStatus() == AttendanceStatus.ON_LEAVE).count();

        BigDecimal totalHours = records.stream()
                .map(Attendance::getWorkHours)
                .filter(h -> h != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long workedDays = present + late + halfDays;
        BigDecimal avgHours = workedDays > 0
                ? totalHours.divide(BigDecimal.valueOf(workedDays), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return MonthlySummary.builder()
                .employeeId(employeeId)
                .employeeName(employee.getFullName())
                .employeeCode(employee.getEmployeeCode())
                .year(year)
                .month(month)
                .totalWorkingDays(ym.lengthOfMonth())
                .presentDays(present)
                .absentDays(absent)
                .lateDays(late)
                .halfDays(halfDays)
                .leaveDays(onLeave)
                .totalWorkHours(totalHours)
                .avgWorkHours(avgHours)
                .dailyRecords(records.stream().map(this::toResponse).toList())
                .build();
    }

    public DailyStats getDailyStats(LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        return DailyStats.builder()
                .date(targetDate)
                .totalCheckedIn(attendanceRepository.countCheckedInByDate(targetDate))
                .present(attendanceRepository.countByDateAndStatus(targetDate, AttendanceStatus.PRESENT))
                .absent(attendanceRepository.countByDateAndStatus(targetDate, AttendanceStatus.ABSENT))
                .late(attendanceRepository.countByDateAndStatus(targetDate, AttendanceStatus.LATE))
                .halfDay(attendanceRepository.countByDateAndStatus(targetDate, AttendanceStatus.HALF_DAY))
                .onLeave(attendanceRepository.countByDateAndStatus(targetDate, AttendanceStatus.ON_LEAVE))
                .build();
    }

    private Employee findEmployee(UUID id) {
        return employeeRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found: " + id));
    }

    private AttendanceResponse toResponse(Attendance a) {
        return AttendanceResponse.builder()
                .id(a.getId())
                .employeeId(a.getEmployee().getId())
                .employeeName(a.getEmployee().getFullName())
                .employeeCode(a.getEmployee().getEmployeeCode())
                .departmentName(a.getEmployee().getDepartment() != null ? a.getEmployee().getDepartment().getName() : null)
                .date(a.getDate())
                .checkIn(a.getCheckIn())
                .checkOut(a.getCheckOut())
                .workHours(a.getWorkHours())
                .status(a.getStatus())
                .remarks(a.getRemarks())
                .build();
    }
}
