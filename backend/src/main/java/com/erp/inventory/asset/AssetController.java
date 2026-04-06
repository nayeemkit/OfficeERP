package com.erp.inventory.asset;

import com.erp.common.ApiResponse;
import com.erp.inventory.asset.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AssetResponse>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) AssetEnums.AssetStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Assets fetched", assetService.getAll(search, categoryId, status, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AssetResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok("Asset fetched", assetService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<AssetResponse>> create(@Valid @RequestBody AssetRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Asset created", assetService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<AssetResponse>> update(@PathVariable UUID id, @Valid @RequestBody AssetRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Asset updated", assetService.update(id, request)));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<AssetResponse>> assign(@PathVariable UUID id, @Valid @RequestBody AssignAssetRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Asset assigned", assetService.assignAsset(id, request)));
    }

    @PatchMapping("/{id}/unassign")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<AssetResponse>> unassign(@PathVariable UUID id, @RequestParam(required = false) String note) {
        return ResponseEntity.ok(ApiResponse.ok("Asset unassigned", assetService.unassignAsset(id, note)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<AssetResponse>> changeStatus(
            @PathVariable UUID id, @RequestParam AssetEnums.AssetStatus status,
            @RequestParam(required = false) String note) {
        return ResponseEntity.ok(ApiResponse.ok("Status updated", assetService.changeStatus(id, status, note)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        assetService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Asset deleted", null));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<AssetHistoryResponse>>> getHistory(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok("Asset history", assetService.getHistory(id)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AssetStats>> getStats() {
        return ResponseEntity.ok(ApiResponse.ok("Asset stats", assetService.getStats()));
    }
}
