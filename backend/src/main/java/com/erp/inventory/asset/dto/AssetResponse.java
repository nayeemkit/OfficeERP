package com.erp.inventory.asset.dto;

import com.erp.inventory.asset.AssetEnums;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetResponse {

    private UUID id;
    private String assetCode;
    private String name;
    private String description;
    private UUID categoryId;
    private String categoryName;
    private String serialNumber;
    private LocalDate purchaseDate;
    private BigDecimal purchasePrice;
    private LocalDate warrantyExpiry;
    private UUID assignedToId;
    private String assignedToName;
    private String assignedToCode;
    private LocalDate assignedDate;
    private AssetEnums.AssetStatus status;
    private String location;
    private AssetEnums.AssetCondition condition;
    private LocalDateTime createdAt;
}
