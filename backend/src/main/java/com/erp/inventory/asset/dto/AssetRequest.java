package com.erp.inventory.asset.dto;

import com.erp.inventory.asset.AssetEnums;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class AssetRequest {

    @NotBlank(message = "Asset name is required")
    @Size(max = 200)
    private String name;

    private String description;
    private UUID categoryId;

    @Size(max = 100)
    private String serialNumber;

    private LocalDate purchaseDate;
    private BigDecimal purchasePrice;
    private LocalDate warrantyExpiry;
    private String location;
    private AssetEnums.AssetCondition condition;
}
