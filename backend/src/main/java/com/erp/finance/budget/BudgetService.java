package com.erp.finance.budget;

import com.erp.finance.budget.dto.*;
import com.erp.hr.department.Department;
import com.erp.hr.department.DepartmentRepository;
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
import java.util.UUID;

@Slf4j @Service @RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final DepartmentRepository departmentRepository;

    public Page<BudgetResponse> getAll(UUID departmentId, Integer year, Integer month, Pageable pageable) {
        return budgetRepository.findAllWithFilters(departmentId, year, month, pageable).map(this::toResponse);
    }

    public BudgetResponse getById(UUID id) { return toResponse(findOrThrow(id)); }

    @Transactional
    public BudgetResponse createOrUpdate(BudgetRequest req) {
        Department dept = departmentRepository.findByIdAndIsDeletedFalse(req.getDepartmentId())
                .orElseThrow(() -> new EntityNotFoundException("Department not found"));

        Budget budget = budgetRepository.findByDepartmentIdAndYearAndMonthAndIsDeletedFalse(
                req.getDepartmentId(), req.getYear(), req.getMonth()).orElse(null);

        if (budget == null) {
            budget = Budget.builder().department(dept).year(req.getYear()).month(req.getMonth())
                    .allocated(req.getAllocated()).spent(req.getSpent() != null ? req.getSpent() : BigDecimal.ZERO)
                    .notes(req.getNotes()).build();
            budget.setIsDeleted(false);
        } else {
            budget.setAllocated(req.getAllocated());
            if (req.getSpent() != null) budget.setSpent(req.getSpent());
            if (req.getNotes() != null) budget.setNotes(req.getNotes());
        }

        budgetRepository.save(budget);
        log.info("Budget saved: {} {}/{} = {}", dept.getName(), req.getYear(), req.getMonth(), req.getAllocated());
        return toResponse(budget);
    }

    @Transactional
    public void delete(UUID id) { Budget b = findOrThrow(id); b.setIsDeleted(true); budgetRepository.save(b); }

    public BudgetStats getStats(Integer year) {
        int y = year != null ? year : LocalDate.now().getYear();
        BigDecimal allocated = budgetRepository.sumAllocatedByYear(y);
        BigDecimal spent = budgetRepository.sumSpentByYear(y);
        double util = allocated.compareTo(BigDecimal.ZERO) > 0
                ? spent.divide(allocated, 4, RoundingMode.HALF_UP).doubleValue() * 100 : 0;
        return BudgetStats.builder().totalAllocated(allocated).totalSpent(spent)
                .totalRemaining(allocated.subtract(spent)).overallUtilization(util).build();
    }

    private Budget findOrThrow(UUID id) {
        return budgetRepository.findByIdAndIsDeletedFalse(id).orElseThrow(() -> new EntityNotFoundException("Budget not found"));
    }

    private BudgetResponse toResponse(Budget b) {
        return BudgetResponse.builder().id(b.getId())
                .departmentId(b.getDepartment().getId()).departmentName(b.getDepartment().getName())
                .year(b.getYear()).month(b.getMonth()).allocated(b.getAllocated()).spent(b.getSpent())
                .remaining(b.getRemaining()).utilization(b.getUtilization()).notes(b.getNotes()).build();
    }
}
