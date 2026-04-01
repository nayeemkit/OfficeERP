package com.erp.hr.designation;

import com.erp.hr.department.Department;
import com.erp.hr.department.DepartmentRepository;
import com.erp.hr.designation.dto.DesignationRequest;
import com.erp.hr.designation.dto.DesignationResponse;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DesignationService {

    private final DesignationRepository designationRepository;
    private final DepartmentRepository departmentRepository;

    public Page<DesignationResponse> getAll(String search, UUID departmentId, Pageable pageable) {
        return designationRepository.findAllWithFilters(search, departmentId, pageable)
                .map(this::toResponse);
    }

    public List<DesignationResponse> getAllActive() {
        return designationRepository.findAllByIsDeletedFalseAndIsActiveTrue()
                .stream().map(this::toResponse).toList();
    }

    public List<DesignationResponse> getByDepartment(UUID departmentId) {
        return designationRepository.findAllByDepartmentIdAndIsDeletedFalseAndIsActiveTrue(departmentId)
                .stream().map(this::toResponse).toList();
    }

    public DesignationResponse getById(UUID id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public DesignationResponse create(DesignationRequest request) {
        if (designationRepository.existsByTitleAndIsDeletedFalse(request.getTitle())) {
            throw new IllegalArgumentException("Designation already exists: " + request.getTitle());
        }

        Department dept = null;
        if (request.getDepartmentId() != null) {
            dept = departmentRepository.findByIdAndIsDeletedFalse(request.getDepartmentId())
                    .orElseThrow(() -> new EntityNotFoundException("Department not found"));
        }

        Designation designation = Designation.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .department(dept)
                .isActive(true)
                .build();
        designation.setIsDeleted(false);

        designationRepository.save(designation);
        log.info("Designation created: {}", designation.getTitle());
        return toResponse(designation);
    }

    @Transactional
    public DesignationResponse update(UUID id, DesignationRequest request) {
        Designation designation = findOrThrow(id);

        if (request.getTitle() != null && !request.getTitle().equals(designation.getTitle())) {
            if (designationRepository.existsByTitleAndIsDeletedFalse(request.getTitle())) {
                throw new IllegalArgumentException("Designation title already in use");
            }
            designation.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) designation.setDescription(request.getDescription());
        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findByIdAndIsDeletedFalse(request.getDepartmentId())
                    .orElseThrow(() -> new EntityNotFoundException("Department not found"));
            designation.setDepartment(dept);
        }
        if (request.getIsActive() != null) designation.setIsActive(request.getIsActive());

        designationRepository.save(designation);
        log.info("Designation updated: {}", designation.getTitle());
        return toResponse(designation);
    }

    @Transactional
    public void delete(UUID id) {
        Designation designation = findOrThrow(id);
        designation.setIsDeleted(true);
        designation.setIsActive(false);
        designationRepository.save(designation);
        log.info("Designation deleted: {}", designation.getTitle());
    }

    private Designation findOrThrow(UUID id) {
        return designationRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Designation not found: " + id));
    }

    private DesignationResponse toResponse(Designation d) {
        return DesignationResponse.builder()
                .id(d.getId())
                .title(d.getTitle())
                .description(d.getDescription())
                .departmentId(d.getDepartment() != null ? d.getDepartment().getId() : null)
                .departmentName(d.getDepartment() != null ? d.getDepartment().getName() : null)
                .isActive(d.getIsActive())
                .createdAt(d.getCreatedAt())
                .build();
    }
}
