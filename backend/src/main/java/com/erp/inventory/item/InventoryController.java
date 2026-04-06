package com.erp.inventory.item;

import com.erp.common.ApiResponse;
import com.erp.inventory.item.dto.*;
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
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    // --- Categories ---

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.ok("Categories fetched", inventoryService.getActiveCategories()));
    }

    @PostMapping("/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Category created", inventoryService.createCategory(request)));
    }

    @DeleteMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable UUID id) {
        inventoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.ok("Category deleted", null));
    }

    // --- Items ---

    @GetMapping("/items")
    public ResponseEntity<ApiResponse<Page<ItemResponse>>> getItems(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) Boolean isActive,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Items fetched",
                inventoryService.getItems(search, categoryId, isActive, pageable)));
    }

    @GetMapping("/items/{id}")
    public ResponseEntity<ApiResponse<ItemResponse>> getItem(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok("Item fetched", inventoryService.getItemById(id)));
    }

    @PostMapping("/items")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ItemResponse>> createItem(@Valid @RequestBody ItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Item created", inventoryService.createItem(request)));
    }

    @PutMapping("/items/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ItemResponse>> updateItem(
            @PathVariable UUID id, @Valid @RequestBody ItemRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Item updated", inventoryService.updateItem(id, request)));
    }

    @DeleteMapping("/items/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteItem(@PathVariable UUID id) {
        inventoryService.deleteItem(id);
        return ResponseEntity.ok(ApiResponse.ok("Item deleted", null));
    }

    @GetMapping("/items/low-stock")
    public ResponseEntity<ApiResponse<List<ItemResponse>>> getLowStockItems() {
        return ResponseEntity.ok(ApiResponse.ok("Low stock items", inventoryService.getLowStockItems()));
    }

    // --- Stats ---

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<InventoryStats>> getStats() {
        return ResponseEntity.ok(ApiResponse.ok("Inventory stats", inventoryService.getStats()));
    }
}
