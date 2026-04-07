package com.erp.finance.expense;

import com.erp.finance.expense.dto.*;
import com.erp.hr.employee.Employee;
import com.erp.hr.employee.EmployeeRepository;
import com.erp.user.User;
import com.erp.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseCategoryRepository categoryRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    // --- Categories ---

    public List<ExpenseCategoryResponse> getActiveCategories() {
        return categoryRepository.findAllByIsDeletedFalseAndIsActiveTrue()
                .stream().map(this::toCategoryResponse).toList();
    }

    @Transactional
    public ExpenseCategoryResponse createCategory(ExpenseCategoryRequest request) {
        if (categoryRepository.existsByNameAndIsDeletedFalse(request.getName())) {
            throw new IllegalArgumentException("Category already exists");
        }
        ExpenseCategory cat = ExpenseCategory.builder()
                .name(request.getName()).description(request.getDescription())
                .budgetLimit(request.getBudgetLimit()).isActive(true).build();
        cat.setIsDeleted(false);
        categoryRepository.save(cat);
        return toCategoryResponse(cat);
    }

    // --- Expenses ---

    public Page<ExpenseResponse> getExpenses(UUID employeeId, UUID categoryId, ExpenseStatus status,
                                              LocalDate dateFrom, LocalDate dateTo, Pageable pageable) {
        return expenseRepository.findAllWithFilters(employeeId, categoryId, status, dateFrom, dateTo, pageable)
                .map(this::toResponse);
    }

    public ExpenseResponse getById(UUID id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public ExpenseResponse submit(ExpenseRequest request) {
        Employee employee = employeeRepository.findByIdAndIsDeletedFalse(request.getEmployeeId())
                .orElseThrow(() -> new EntityNotFoundException("Employee not found"));
        ExpenseCategory category = categoryRepository.findByIdAndIsDeletedFalse(request.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));

        String expenseNumber = generateExpenseNumber();

        Expense expense = Expense.builder()
                .expenseNumber(expenseNumber)
                .employee(employee)
                .category(category)
                .amount(request.getAmount())
                .expenseDate(request.getExpenseDate())
                .description(request.getDescription())
                .receiptRef(request.getReceiptRef())
                .status(ExpenseStatus.PENDING)
                .build();
        expense.setIsDeleted(false);

        expenseRepository.save(expense);
        log.info("Expense submitted: {} - {} by {}", expenseNumber, request.getAmount(), employee.getFullName());
        return toResponse(expense);
    }

    @Transactional
    public ExpenseResponse review(UUID expenseId, ExpenseReviewRequest request, UUID reviewerUserId) {
        Expense expense = findOrThrow(expenseId);
        if (expense.getStatus() != ExpenseStatus.PENDING) {
            throw new IllegalArgumentException("Only pending expenses can be reviewed");
        }

        User reviewer = userRepository.findById(reviewerUserId)
                .orElseThrow(() -> new EntityNotFoundException("Reviewer not found"));

        expense.setStatus(request.getStatus());
        expense.setReviewedBy(reviewer);
        expense.setReviewedAt(LocalDateTime.now());
        expense.setReviewComment(request.getComment());
        expenseRepository.save(expense);

        log.info("Expense {} {}: {}", expense.getExpenseNumber(), request.getStatus(), expense.getAmount());
        return toResponse(expense);
    }

    @Transactional
    public void cancel(UUID id) {
        Expense expense = findOrThrow(id);
        if (expense.getStatus() != ExpenseStatus.PENDING) {
            throw new IllegalArgumentException("Only pending expenses can be cancelled");
        }
        expense.setStatus(ExpenseStatus.CANCELLED);
        expenseRepository.save(expense);
    }

    public ExpenseStats getStats() {
        return ExpenseStats.builder()
                .totalExpenses(expenseRepository.countByStatusAndIsDeletedFalse(ExpenseStatus.PENDING)
                        + expenseRepository.countByStatusAndIsDeletedFalse(ExpenseStatus.APPROVED)
                        + expenseRepository.countByStatusAndIsDeletedFalse(ExpenseStatus.REJECTED))
                .pendingCount(expenseRepository.countByStatusAndIsDeletedFalse(ExpenseStatus.PENDING))
                .approvedCount(expenseRepository.countByStatusAndIsDeletedFalse(ExpenseStatus.APPROVED))
                .rejectedCount(expenseRepository.countByStatusAndIsDeletedFalse(ExpenseStatus.REJECTED))
                .totalApprovedAmount(expenseRepository.sumApprovedAmount())
                .totalPendingAmount(expenseRepository.sumPendingAmount())
                .build();
    }

    private String generateExpenseNumber() {
        int next = expenseRepository.findMaxExpenseNumber() + 1;
        return String.format("EXP-%04d", next);
    }

    private Expense findOrThrow(UUID id) {
        return expenseRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Expense not found"));
    }

    private ExpenseResponse toResponse(Expense e) {
        return ExpenseResponse.builder()
                .id(e.getId()).expenseNumber(e.getExpenseNumber())
                .employeeId(e.getEmployee().getId()).employeeName(e.getEmployee().getFullName())
                .employeeCode(e.getEmployee().getEmployeeCode())
                .departmentName(e.getEmployee().getDepartment() != null ? e.getEmployee().getDepartment().getName() : null)
                .categoryId(e.getCategory().getId()).categoryName(e.getCategory().getName())
                .amount(e.getAmount()).expenseDate(e.getExpenseDate()).description(e.getDescription())
                .receiptRef(e.getReceiptRef()).status(e.getStatus())
                .reviewedByName(e.getReviewedBy() != null ? e.getReviewedBy().getFullName() : null)
                .reviewedAt(e.getReviewedAt()).reviewComment(e.getReviewComment())
                .createdAt(e.getCreatedAt()).build();
    }

    private ExpenseCategoryResponse toCategoryResponse(ExpenseCategory c) {
        return ExpenseCategoryResponse.builder()
                .id(c.getId()).name(c.getName()).description(c.getDescription())
                .budgetLimit(c.getBudgetLimit()).isActive(c.getIsActive()).build();
    }
}
