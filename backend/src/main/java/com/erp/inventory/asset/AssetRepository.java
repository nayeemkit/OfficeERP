package com.erp.inventory.asset;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssetRepository extends JpaRepository<Asset, UUID> {

    Optional<Asset> findByIdAndIsDeletedFalse(UUID id);

    boolean existsByAssetCodeAndIsDeletedFalse(String assetCode);

    @Query("""
        SELECT a FROM Asset a
        LEFT JOIN FETCH a.category
        LEFT JOIN FETCH a.assignedTo
        WHERE a.isDeleted = false
        AND (:search IS NULL OR :search = ''
            OR LOWER(a.name) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(a.assetCode) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(a.serialNumber) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:categoryId IS NULL OR a.category.id = :categoryId)
        AND (:status IS NULL OR a.status = :status)
    """)
    Page<Asset> findAllWithFilters(
            @Param("search") String search,
            @Param("categoryId") UUID categoryId,
            @Param("status") AssetEnums.AssetStatus status,
            Pageable pageable
    );

    long countByIsDeletedFalse();

    long countByStatusAndIsDeletedFalse(AssetEnums.AssetStatus status);

    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(a.assetCode, 5) AS int)), 0) FROM Asset a WHERE a.assetCode LIKE 'AST-%'")
    int findMaxAssetCodeNumber();
}
