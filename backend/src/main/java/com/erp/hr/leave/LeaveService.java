package com.erp.hr.leave;

import com.erp.hr.employee.Employee;
import com.erp.hr.employee.EmployeeRepository;
import com.erp.hr.leave.dto.*;
import com.erp.user.User;
import com.erp.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    // --- Leave Types ---

    public List<LeaveTypeResponse> getAllLeaveTypes() {
        return leaveTypeRepository.findAllByIsDeletedFalseAndIsActiveTrue()
                .stream().map(this::toLeaveTypeResponse).toList();
    }

    // --- Leave Balances ---

    public List<LeaveBalanceResponse> getEmployeeBalances(UUID employeeId, Integer year) {
        int targetYear = year != null ? year : LocalDate.now().getYear();
        return leaveBalanceRepository.findBalancesWithDetails(employeeId, targetYear)
                .stream().map(this::toBalanceResponse).toList();
    }

    @Transactional
    public void initializeBalancesForEmployee(UUID employeeId, Integer year) {
        Employee employee = employeeRepository.findByIdAndIsDeletedFalse(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found"));

        List<LeaveType> leaveTypes = leaveTypeRepository.findAllByIsDeletedFalseAndIsActiveTrue();
        int targetYear = year != null ? year : LocalDate.now().getYear();

        for (LeaveType lt : leaveTypes) {
            boolean exists = leaveBalanceRepository
                    .findByEmployeeIdAndLeaveTypeIdAndYearAndIsDeletedFalse(employeeId, lt.getId(), targetYear)
                    .isPresent();

            if (!exists) {
                LeaveBalance balance = LeaveBalance.builder()
                        .employee(employee)
                        .leaveType(lt)
                        .year(targetYear)
                        .totalDays(BigDecimal.valueOf(lt.getDefaultDays()))
                        .usedDays(BigDecimal.ZERO)
                        .pendingDays(BigDecimal.ZERO)
                        .build();
                balance.setIsDeleted(false);
                leaveBalanceRepository.save(balance);
            }
        }
        log.info("Leave balances initialized for employee {} year {}", employeeId, targetYear);
    }

    // --- Leave Requests ---

    public Page<LeaveRequestResponse> getLeaveRequests(UUID employeeId, LeaveEnums.LeaveStatus status,
                                                        UUID departmentId, Pageable pageable) {
        return leaveRequestRepository.findAllWithFilters(employeeId, status, departmentId, pageable)
                .map(this::toRequestResponse);
    }

    public LeaveRequestResponse getLeaveRequestById(UUID id) {
        return toRequestResponse(findRequestOrThrow(id));
    }

    @Transactional
    public LeaveRequestResponse applyLeave(LeaveRequestDTO request) {
        Employee employee = employeeRepository.findByIdAndIsDeletedFalse(request.getEmployeeId())
                .orElseThrow(() -> new EntityNotFoundException("Employee not found"));

        LeaveType leaveType = leaveTypeRepository.findByIdAndIsDeletedFalse(request.getLeaveTypeId())
                .orElseThrow(() -> new EntityNotFoundException("Leave type not found"));

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }

        BigDecimal totalDays = BigDecimal.valueOf(
                ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1);

        // Check balance
        int year = request.getStartDate().getYear();
        LeaveBalance balance = leaveBalanceRepository
                .findByEmployeeIdAndLeaveTypeIdAndYearAndIsDeletedFalse(employee.getId(), leaveType.getId(), year)
                .orElse(null);

        if (balance == null) {
            initializeBalancesForEmployee(employee.getId(), year);
            balance = leaveBalanceRepository
                    .findByEmployeeIdAndLeaveTypeIdAndYearAndIsDeletedFalse(employee.getId(), leaveType.getId(), year)
                    .orElseThrow(() -> new IllegalStateException("Could not initialize leave balance"));
        }

        if (balance.getAvailableDays().compareTo(totalDays) < 0) {
            throw new IllegalArgumentException(
                    String.format("Insufficient leave balance. Available: %s days, Requested: %s days",
                            balance.getAvailableDays(), totalDays));
        }

        // Create request
        LeaveRequest leaveRequest = LeaveRequest.builder()
                .employee(employee)
                .leaveType(leaveType)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalDays(totalDays)
                .reason(request.getReason())
                .status(LeaveEnums.LeaveStatus.PENDING)
                .build();
        leaveRequest.setIsDeleted(false);
        leaveRequestRepository.save(leaveRequest);

        // Update pending balance
        balance.setPendingDays(balance.getPendingDays().add(totalDays));
        leaveBalanceRepository.save(balance);

        log.info("Leave applied: {} - {} days of {} ({})",
                employee.getFullName(), totalDays, leaveType.getName(), leaveRequest.getId());

        return toRequestResponse(leaveRequest);
    }

    @Transactional
    public LeaveRequestResponse reviewLeave(UUID leaveRequestId, LeaveReviewDTO review, UUID reviewerUserId) {
        LeaveRequest leaveRequest = findRequestOrThrow(leaveRequestId);

        if (leaveRequest.getStatus() != LeaveEnums.LeaveStatus.PENDING) {
            throw new IllegalArgumentException("Only pending requests can be reviewed");
        }

        User reviewer = userRepository.findById(reviewerUserId)
                .orElseThrow(() -> new EntityNotFoundException("Reviewer not found"));

        LeaveBalance balance = leaveBalanceRepository
                .findByEmployeeIdAndLeaveTypeIdAndYearAndIsDeletedFalse(
                        leaveRequest.getEmployee().getId(),
                        leaveRequest.getLeaveType().getId(),
                        leaveRequest.getStartDate().getYear())
                .orElseThrow(() -> new IllegalStateException("Leave balance not found"));

        leaveRequest.setStatus(review.getStatus());
        leaveRequest.setReviewedBy(reviewer);
        leaveRequest.setReviewedAt(LocalDateTime.now());
        leaveRequest.setReviewComment(review.getComment());

        // Update balance based on decision
        balance.setPendingDays(balance.getPendingDays().subtract(leaveRequest.getTotalDays()));

        if (review.getStatus() == LeaveEnums.LeaveStatus.APPROVED) {
            balance.setUsedDays(balance.getUsedDays().add(leaveRequest.getTotalDays()));
            log.info("Leave approved: {} - {} days", leaveRequest.getEmployee().getFullName(), leaveRequest.getTotalDays());
        } else if (review.getStatus() == LeaveEnums.LeaveStatus.REJECTED) {
            log.info("Leave rejected: {} - {} days", leaveRequest.getEmployee().getFullName(), leaveRequest.getTotalDays());
        }

        leaveRequestRepository.save(leaveRequest);
        leaveBalanceRepository.save(balance);

        return toRequestResponse(leaveRequest);
    }

    @Transactional
    public void cancelLeave(UUID leaveRequestId) {
        LeaveRequest leaveRequest = findRequestOrThrow(leaveRequestId);

        if (leaveRequest.getStatus() != LeaveEnums.LeaveStatus.PENDING) {
            throw new IllegalArgumentException("Only pending requests can be cancelled");
        }

        LeaveBalance balance = leaveBalanceRepository
                .findByEmployeeIdAndLeaveTypeIdAndYearAndIsDeletedFalse(
                        leaveRequest.getEmployee().getId(),
                        leaveRequest.getLeaveType().getId(),
                        leaveRequest.getStartDate().getYear())
                .orElse(null);

        if (balance != null) {
            balance.setPendingDays(balance.getPendingDays().subtract(leaveRequest.getTotalDays()));
            leaveBalanceRepository.save(balance);
        }

        leaveRequest.setStatus(LeaveEnums.LeaveStatus.CANCELLED);
        leaveRequestRepository.save(leaveRequest);

        log.info("Leave cancelled: {} - {}", leaveRequest.getEmployee().getFullName(), leaveRequestId);
    }

    public LeaveStats getStats(UUID departmentId) {
        long pending, approved, rejected;
        if (departmentId != null) {
            pending = leaveRequestRepository.countByDepartmentAndStatus(departmentId, LeaveEnums.LeaveStatus.PENDING);
            approved = leaveRequestRepository.countByDepartmentAndStatus(departmentId, LeaveEnums.LeaveStatus.APPROVED);
            rejected = leaveRequestRepository.countByDepartmentAndStatus(departmentId, LeaveEnums.LeaveStatus.REJECTED);
        } else {
            pending = leaveRequestRepository.countByStatusAndIsDeletedFalse(LeaveEnums.LeaveStatus.PENDING);
            approved = leaveRequestRepository.countByStatusAndIsDeletedFalse(LeaveEnums.LeaveStatus.APPROVED);
            rejected = leaveRequestRepository.countByStatusAndIsDeletedFalse(LeaveEnums.LeaveStatus.REJECTED);
        }
        return LeaveStats.builder()
                .totalRequests(pending + approved + rejected)
                .pendingRequests(pending)
                .approvedRequests(approved)
                .rejectedRequests(rejected)
                .build();
    }

    // --- Mappers ---

    private LeaveRequest findRequestOrThrow(UUID id) {
        return leaveRequestRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Leave request not found: " + id));
    }

    private LeaveRequestResponse toRequestResponse(LeaveRequest lr) {
        return LeaveRequestResponse.builder()
                .id(lr.getId())
                .employeeId(lr.getEmployee().getId())
                .employeeName(lr.getEmployee().getFullName())
                .employeeCode(lr.getEmployee().getEmployeeCode())
                .departmentName(lr.getEmployee().getDepartment() != null ? lr.getEmployee().getDepartment().getName() : null)
                .leaveTypeId(lr.getLeaveType().getId())
                .leaveTypeName(lr.getLeaveType().getName())
                .startDate(lr.getStartDate())
                .endDate(lr.getEndDate())
                .totalDays(lr.getTotalDays())
                .reason(lr.getReason())
                .status(lr.getStatus())
                .reviewedByName(lr.getReviewedBy() != null ? lr.getReviewedBy().getFullName() : null)
                .reviewedAt(lr.getReviewedAt())
                .reviewComment(lr.getReviewComment())
                .createdAt(lr.getCreatedAt())
                .build();
    }

    private LeaveBalanceResponse toBalanceResponse(LeaveBalance lb) {
        return LeaveBalanceResponse.builder()
                .id(lb.getId())
                .leaveTypeId(lb.getLeaveType().getId())
                .leaveTypeName(lb.getLeaveType().getName())
                .isPaid(lb.getLeaveType().getIsPaid())
                .year(lb.getYear())
                .totalDays(lb.getTotalDays())
                .usedDays(lb.getUsedDays())
                .pendingDays(lb.getPendingDays())
                .availableDays(lb.getAvailableDays())
                .build();
    }

    private LeaveTypeResponse toLeaveTypeResponse(LeaveType lt) {
        return LeaveTypeResponse.builder()
                .id(lt.getId())
                .name(lt.getName())
                .description(lt.getDescription())
                .defaultDays(lt.getDefaultDays())
                .isPaid(lt.getIsPaid())
                .isActive(lt.getIsActive())
                .build();
    }
}
