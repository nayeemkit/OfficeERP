package com.erp.inventory.asset;

import com.erp.hr.employee.Employee;
import com.erp.hr.employee.EmployeeRepository;
import com.erp.inventory.asset.dto.*;
import com.erp.inventory.item.Category;
import com.erp.inventory.item.CategoryRepository;
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
public class AssetService {

    private final AssetRepository assetRepository;
    private final AssetHistoryRepository historyRepository;
    private final CategoryRepository categoryRepository;
    private final EmployeeRepository employeeRepository;

    public Page<AssetResponse> getAll(String search, UUID categoryId, AssetEnums.AssetStatus status, Pageable pageable) {
        return assetRepository.findAllWithFilters(search, categoryId, status, pageable).map(this::toResponse);
    }

    public AssetResponse getById(UUID id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public AssetResponse create(AssetRequest request) {
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findByIdAndIsDeletedFalse(request.getCategoryId())
                    .orElseThrow(() -> new EntityNotFoundException("Category not found"));
        }

        String assetCode = generateAssetCode();

        Asset asset = Asset.builder()
                .assetCode(assetCode)
                .name(request.getName())
                .description(request.getDescription())
                .category(category)
                .serialNumber(request.getSerialNumber())
                .purchaseDate(request.getPurchaseDate())
                .purchasePrice(request.getPurchasePrice())
                .warrantyExpiry(request.getWarrantyExpiry())
                .location(request.getLocation())
                .condition(request.getCondition() != null ? request.getCondition() : AssetEnums.AssetCondition.GOOD)
                .status(AssetEnums.AssetStatus.AVAILABLE)
                .build();
        asset.setIsDeleted(false);

        assetRepository.save(asset);
        addHistory(asset, AssetEnums.AssetAction.CREATED, null, null, "Asset registered");
        log.info("Asset created: {} ({})", asset.getName(), asset.getAssetCode());
        return toResponse(asset);
    }

    @Transactional
    public AssetResponse update(UUID id, AssetRequest request) {
        Asset asset = findOrThrow(id);
        if (request.getName() != null) asset.setName(request.getName());
        if (request.getDescription() != null) asset.setDescription(request.getDescription());
        if (request.getCategoryId() != null) {
            Category cat = categoryRepository.findByIdAndIsDeletedFalse(request.getCategoryId())
                    .orElseThrow(() -> new EntityNotFoundException("Category not found"));
            asset.setCategory(cat);
        }
        if (request.getSerialNumber() != null) asset.setSerialNumber(request.getSerialNumber());
        if (request.getPurchaseDate() != null) asset.setPurchaseDate(request.getPurchaseDate());
        if (request.getPurchasePrice() != null) asset.setPurchasePrice(request.getPurchasePrice());
        if (request.getWarrantyExpiry() != null) asset.setWarrantyExpiry(request.getWarrantyExpiry());
        if (request.getLocation() != null) asset.setLocation(request.getLocation());
        if (request.getCondition() != null) asset.setCondition(request.getCondition());

        assetRepository.save(asset);
        addHistory(asset, AssetEnums.AssetAction.UPDATED, null, null, "Asset details updated");
        return toResponse(asset);
    }

    @Transactional
    public AssetResponse assignAsset(UUID assetId, AssignAssetRequest request) {
        Asset asset = findOrThrow(assetId);
        if (asset.getStatus() != AssetEnums.AssetStatus.AVAILABLE) {
            throw new IllegalArgumentException("Asset is not available for assignment. Current status: " + asset.getStatus());
        }

        Employee employee = employeeRepository.findByIdAndIsDeletedFalse(request.getEmployeeId())
                .orElseThrow(() -> new EntityNotFoundException("Employee not found"));

        Employee previousAssignee = asset.getAssignedTo();
        asset.setAssignedTo(employee);
        asset.setAssignedDate(LocalDate.now());
        asset.setStatus(AssetEnums.AssetStatus.ASSIGNED);
        assetRepository.save(asset);

        addHistory(asset, AssetEnums.AssetAction.ASSIGNED, previousAssignee, employee, request.getNote());
        log.info("Asset {} assigned to {}", asset.getAssetCode(), employee.getFullName());
        return toResponse(asset);
    }

    @Transactional
    public AssetResponse unassignAsset(UUID assetId, String note) {
        Asset asset = findOrThrow(assetId);
        if (asset.getAssignedTo() == null) {
            throw new IllegalArgumentException("Asset is not assigned to anyone");
        }

        Employee previousAssignee = asset.getAssignedTo();
        asset.setAssignedTo(null);
        asset.setAssignedDate(null);
        asset.setStatus(AssetEnums.AssetStatus.AVAILABLE);
        assetRepository.save(asset);

        addHistory(asset, AssetEnums.AssetAction.UNASSIGNED, previousAssignee, null, note);
        log.info("Asset {} unassigned from {}", asset.getAssetCode(), previousAssignee.getFullName());
        return toResponse(asset);
    }

    @Transactional
    public AssetResponse changeStatus(UUID assetId, AssetEnums.AssetStatus newStatus, String note) {
        Asset asset = findOrThrow(assetId);
        AssetEnums.AssetAction action = switch (newStatus) {
            case UNDER_REPAIR -> AssetEnums.AssetAction.SENT_FOR_REPAIR;
            case AVAILABLE -> AssetEnums.AssetAction.REPAIRED;
            case DISPOSED -> AssetEnums.AssetAction.DISPOSED;
            case LOST -> AssetEnums.AssetAction.LOST;
            default -> AssetEnums.AssetAction.UPDATED;
        };

        if (newStatus == AssetEnums.AssetStatus.AVAILABLE && asset.getAssignedTo() != null) {
            asset.setAssignedTo(null);
            asset.setAssignedDate(null);
        }

        asset.setStatus(newStatus);
        assetRepository.save(asset);
        addHistory(asset, action, null, null, note);
        return toResponse(asset);
    }

    @Transactional
    public void delete(UUID id) {
        Asset asset = findOrThrow(id);
        asset.setIsDeleted(true);
        assetRepository.save(asset);
    }

    public List<AssetHistoryResponse> getHistory(UUID assetId) {
        return historyRepository.findByAssetIdOrderByPerformedAtDesc(assetId)
                .stream().map(this::toHistoryResponse).toList();
    }

    public AssetStats getStats() {
        return AssetStats.builder()
                .totalAssets(assetRepository.countByIsDeletedFalse())
                .available(assetRepository.countByStatusAndIsDeletedFalse(AssetEnums.AssetStatus.AVAILABLE))
                .assigned(assetRepository.countByStatusAndIsDeletedFalse(AssetEnums.AssetStatus.ASSIGNED))
                .underRepair(assetRepository.countByStatusAndIsDeletedFalse(AssetEnums.AssetStatus.UNDER_REPAIR))
                .disposed(assetRepository.countByStatusAndIsDeletedFalse(AssetEnums.AssetStatus.DISPOSED))
                .build();
    }

    private String generateAssetCode() {
        int next = assetRepository.findMaxAssetCodeNumber() + 1;
        return String.format("AST-%04d", next);
    }

    private void addHistory(Asset asset, AssetEnums.AssetAction action, Employee from, Employee to, String note) {
        historyRepository.save(AssetHistory.builder()
                .asset(asset).action(action).fromEmployee(from).toEmployee(to)
                .note(note).performedAt(LocalDateTime.now()).build());
    }

    private Asset findOrThrow(UUID id) {
        return assetRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Asset not found: " + id));
    }

    private AssetResponse toResponse(Asset a) {
        return AssetResponse.builder()
                .id(a.getId()).assetCode(a.getAssetCode()).name(a.getName())
                .description(a.getDescription())
                .categoryId(a.getCategory() != null ? a.getCategory().getId() : null)
                .categoryName(a.getCategory() != null ? a.getCategory().getName() : null)
                .serialNumber(a.getSerialNumber()).purchaseDate(a.getPurchaseDate())
                .purchasePrice(a.getPurchasePrice()).warrantyExpiry(a.getWarrantyExpiry())
                .assignedToId(a.getAssignedTo() != null ? a.getAssignedTo().getId() : null)
                .assignedToName(a.getAssignedTo() != null ? a.getAssignedTo().getFullName() : null)
                .assignedToCode(a.getAssignedTo() != null ? a.getAssignedTo().getEmployeeCode() : null)
                .assignedDate(a.getAssignedDate()).status(a.getStatus())
                .location(a.getLocation()).condition(a.getCondition()).createdAt(a.getCreatedAt())
                .build();
    }

    private AssetHistoryResponse toHistoryResponse(AssetHistory h) {
        return AssetHistoryResponse.builder()
                .id(h.getId()).action(h.getAction())
                .fromEmployeeName(h.getFromEmployee() != null ? h.getFromEmployee().getFullName() : null)
                .toEmployeeName(h.getToEmployee() != null ? h.getToEmployee().getFullName() : null)
                .note(h.getNote()).performedAt(h.getPerformedAt()).build();
    }
}
