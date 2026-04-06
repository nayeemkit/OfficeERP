package com.erp.inventory.asset;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AssetHistoryRepository extends JpaRepository<AssetHistory, UUID> {

    @Query("""
        SELECT ah FROM AssetHistory ah
        LEFT JOIN FETCH ah.fromEmployee
        LEFT JOIN FETCH ah.toEmployee
        WHERE ah.asset.id = :assetId
        ORDER BY ah.performedAt DESC
    """)
    List<AssetHistory> findByAssetIdOrderByPerformedAtDesc(@Param("assetId") UUID assetId);
}
