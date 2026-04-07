package com.erp.finance.invoice;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    Optional<Invoice> findByIdAndIsDeletedFalse(UUID id);

    @Query("""
        SELECT i FROM Invoice i WHERE i.isDeleted = false
        AND (:search IS NULL OR :search = ''
            OR LOWER(i.invoiceNumber) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(i.clientName) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:status IS NULL OR i.status = :status)
    """)
    Page<Invoice> findAllWithFilters(@Param("search") String search, @Param("status") InvoiceStatus status, Pageable pageable);

    long countByStatusAndIsDeletedFalse(InvoiceStatus status);

    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE i.status = :status AND i.isDeleted = false")
    BigDecimal sumByStatus(@Param("status") InvoiceStatus status);

    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(i.invoiceNumber, 5) AS int)), 0) FROM Invoice i WHERE i.invoiceNumber LIKE 'INV-%'")
    int findMaxInvoiceNumber();

    @Query("SELECT i FROM Invoice i WHERE i.isDeleted = false AND i.status = 'SENT' AND i.dueDate < :today")
    java.util.List<Invoice> findOverdueInvoices(@Param("today") LocalDate today);
}
