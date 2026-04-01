package com.erp.hr.department;

import com.erp.hr.department.dto.DepartmentRequest;
import com.erp.hr.department.dto.DepartmentResponse;
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
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public Page<DepartmentResponse> getAll(String search, Pageable pageable) {
        return departmentRepository.findAllWithSearch(search, pageable)
                .map(this::toResponse);
    }

    public List<DepartmentResponse> getAllActive() {
        return departmentRepository.findAllByIsDeletedFalseAndIsActiveTrue()
                .stream().map(this::toResponse).toList();
    }

    public DepartmentResponse getById(UUID id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public DepartmentResponse create(DepartmentRequest request) {
        if (departmentRepository.existsByNameAndIsDeletedFalse(request.getName())) {
            throw new IllegalArgumentException("Department already exists: " + request.getName());
        }

        Department dept = Department.builder()
                .name(request.getName())
                .description(request.getDescription())
                .managerId(request.getManagerId())
                .isActive(true)
                .build();
        dept.setIsDeleted(false);

        departmentRepository.save(dept);
        log.info("Department created: {}", dept.getName());
        return toResponse(dept);
    }

    @Transactional
    public DepartmentResponse update(UUID id, DepartmentRequest request) {
        Department dept = findOrThrow(id);

        if (request.getName() != null && !request.getName().equals(dept.getName())) {
            if (departmentRepository.existsByNameAndIsDeletedFalse(request.getName())) {
                throw new IllegalArgumentException("Department name already in use: " + request.getName());
            }
            dept.setName(request.getName());
        }
        if (request.getDescription() != null) dept.setDescription(request.getDescription());
        if (request.getManagerId() != null) dept.setManagerId(request.getManagerId());
        if (request.getIsActive() != null) dept.setIsActive(request.getIsActive());

        departmentRepository.save(dept);
        log.info("Department updated: {}", dept.getName());
        return toResponse(dept);
    }

    @Transactional
    public void delete(UUID id) {
        Department dept = findOrThrow(id);
        dept.setIsDeleted(true);
        dept.setIsActive(false);
        departmentRepository.save(dept);
        log.info("Department deleted: {}", dept.getName());
    }

    private Department findOrThrow(UUID id) {
        return departmentRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Department not found: " + id));
    }

    private DepartmentResponse toResponse(Department dept) {
        return DepartmentResponse.builder()
                .id(dept.getId())
                .name(dept.getName())
                .description(dept.getDescription())
                .managerId(dept.getManagerId())
                .isActive(dept.getIsActive())
                .createdAt(dept.getCreatedAt())
                .build();
    }
}
