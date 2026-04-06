package com.erp.inventory.stock;

import com.erp.inventory.item.InventoryEnums;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.UUID;

@Repository
public interface StockTransactionRepository extends JpaRepository<StockTransaction, UUID> {

    @Query("""
        SELECT st FROM StockTransaction st
        LEFT JOIN FETCH st.item i
        LEFT JOIN FETCH i.category
        WHERE st.isDeleted = false
        AND (:itemId IS NULL OR st.item.id = :itemId)
        AND (:type IS NULL OR st.type = :type)
        AND (CAST(:dateFrom AS date) IS NULL OR st.transactionDate >= :dateFrom)
        AND (CAST(:dateTo AS date) IS NULL OR st.transactionDate <= :dateTo)
    """)
    Page<StockTransaction> findAllWithFilters(
            @Param("itemId") UUID itemId,
            @Param("type") InventoryEnums.StockTransactionType type,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            Pageable pageable
    );

    long countByIsDeletedFalse();
}
