package com.erp.inventory.item;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ItemRepository extends JpaRepository<Item, UUID> {

    Optional<Item> findByIdAndIsDeletedFalse(UUID id);

    boolean existsBySkuAndIsDeletedFalse(String sku);

    @Query("""
        SELECT i FROM Item i LEFT JOIN FETCH i.category
        WHERE i.isDeleted = false
        AND (:search IS NULL OR :search = ''
            OR LOWER(i.name) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(i.sku) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:categoryId IS NULL OR i.category.id = :categoryId)
        AND (:isActive IS NULL OR i.isActive = :isActive)
    """)
    Page<Item> findAllWithFilters(
            @Param("search") String search,
            @Param("categoryId") UUID categoryId,
            @Param("isActive") Boolean isActive,
            Pageable pageable
    );

    @Query("SELECT i FROM Item i WHERE i.isDeleted = false AND i.isActive = true AND i.currentStock <= i.reorderLevel")
    List<Item> findLowStockItems();

    long countByIsDeletedFalse();

    @Query("SELECT COUNT(i) FROM Item i WHERE i.isDeleted = false AND i.isActive = true AND i.currentStock <= i.reorderLevel")
    long countLowStock();
}
