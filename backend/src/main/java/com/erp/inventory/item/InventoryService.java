package com.erp.inventory.item;

import com.erp.inventory.item.dto.*;
import com.erp.inventory.stock.StockTransactionRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryService {

    private final ItemRepository itemRepository;
    private final CategoryRepository categoryRepository;
    private final StockTransactionRepository stockTransactionRepository;

    // --- Categories ---

    public List<CategoryResponse> getActiveCategories() {
        return categoryRepository.findAllByIsDeletedFalseAndIsActiveTrue()
                .stream().map(this::toCategoryResponse).toList();
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByNameAndIsDeletedFalse(request.getName())) {
            throw new IllegalArgumentException("Category already exists: " + request.getName());
        }
        Category cat = Category.builder().name(request.getName()).description(request.getDescription()).isActive(true).build();
        cat.setIsDeleted(false);
        categoryRepository.save(cat);
        return toCategoryResponse(cat);
    }

    @Transactional
    public void deleteCategory(UUID id) {
        Category cat = categoryRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));
        cat.setIsDeleted(true);
        categoryRepository.save(cat);
    }

    // --- Items ---

    public Page<ItemResponse> getItems(String search, UUID categoryId, Boolean isActive, Pageable pageable) {
        return itemRepository.findAllWithFilters(search, categoryId, isActive, pageable)
                .map(this::toItemResponse);
    }

    public ItemResponse getItemById(UUID id) {
        return toItemResponse(findItemOrThrow(id));
    }

    @Transactional
    public ItemResponse createItem(ItemRequest request) {
        if (itemRepository.existsBySkuAndIsDeletedFalse(request.getSku())) {
            throw new IllegalArgumentException("SKU already exists: " + request.getSku());
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findByIdAndIsDeletedFalse(request.getCategoryId())
                    .orElseThrow(() -> new EntityNotFoundException("Category not found"));
        }

        Item item = Item.builder()
                .name(request.getName())
                .sku(request.getSku())
                .category(category)
                .description(request.getDescription())
                .unit(request.getUnit() != null ? request.getUnit() : "PCS")
                .unitPrice(request.getUnitPrice() != null ? request.getUnitPrice() : BigDecimal.ZERO)
                .reorderLevel(request.getReorderLevel() != null ? request.getReorderLevel() : 10)
                .currentStock(0)
                .isActive(true)
                .build();
        item.setIsDeleted(false);

        itemRepository.save(item);
        log.info("Item created: {} ({})", item.getName(), item.getSku());
        return toItemResponse(item);
    }

    @Transactional
    public ItemResponse updateItem(UUID id, ItemRequest request) {
        Item item = findItemOrThrow(id);

        if (request.getName() != null) item.setName(request.getName());
        if (request.getSku() != null && !request.getSku().equals(item.getSku())) {
            if (itemRepository.existsBySkuAndIsDeletedFalse(request.getSku())) {
                throw new IllegalArgumentException("SKU already in use");
            }
            item.setSku(request.getSku());
        }
        if (request.getCategoryId() != null) {
            Category cat = categoryRepository.findByIdAndIsDeletedFalse(request.getCategoryId())
                    .orElseThrow(() -> new EntityNotFoundException("Category not found"));
            item.setCategory(cat);
        }
        if (request.getDescription() != null) item.setDescription(request.getDescription());
        if (request.getUnit() != null) item.setUnit(request.getUnit());
        if (request.getUnitPrice() != null) item.setUnitPrice(request.getUnitPrice());
        if (request.getReorderLevel() != null) item.setReorderLevel(request.getReorderLevel());

        itemRepository.save(item);
        log.info("Item updated: {} ({})", item.getName(), item.getSku());
        return toItemResponse(item);
    }

    @Transactional
    public void deleteItem(UUID id) {
        Item item = findItemOrThrow(id);
        item.setIsDeleted(true);
        item.setIsActive(false);
        itemRepository.save(item);
        log.info("Item deleted: {}", item.getSku());
    }

    public List<ItemResponse> getLowStockItems() {
        return itemRepository.findLowStockItems().stream().map(this::toItemResponse).toList();
    }

    public InventoryStats getStats() {
        return InventoryStats.builder()
                .totalItems(itemRepository.countByIsDeletedFalse())
                .lowStockItems(itemRepository.countLowStock())
                .totalTransactions(stockTransactionRepository.countByIsDeletedFalse())
                .build();
    }

    private Item findItemOrThrow(UUID id) {
        return itemRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Item not found: " + id));
    }

    private ItemResponse toItemResponse(Item i) {
        return ItemResponse.builder()
                .id(i.getId())
                .name(i.getName())
                .sku(i.getSku())
                .categoryId(i.getCategory() != null ? i.getCategory().getId() : null)
                .categoryName(i.getCategory() != null ? i.getCategory().getName() : null)
                .description(i.getDescription())
                .unit(i.getUnit())
                .unitPrice(i.getUnitPrice())
                .reorderLevel(i.getReorderLevel())
                .currentStock(i.getCurrentStock())
                .isActive(i.getIsActive())
                .lowStock(i.isLowStock())
                .createdAt(i.getCreatedAt())
                .build();
    }

    private CategoryResponse toCategoryResponse(Category c) {
        return CategoryResponse.builder().id(c.getId()).name(c.getName())
                .description(c.getDescription()).isActive(c.getIsActive()).build();
    }
}
