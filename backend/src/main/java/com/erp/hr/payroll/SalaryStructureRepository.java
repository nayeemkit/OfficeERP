package com.erp.hr.payroll;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SalaryStructureRepository extends JpaRepository<SalaryStructure, UUID> {

    Optional<SalaryStructure> findByEmployeeIdAndIsActiveTrueAndIsDeletedFalse(UUID employeeId);

    Optional<SalaryStructure> findByIdAndIsDeletedFalse(UUID id);
}
