package com.erp.inventory.item.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemResponse {

    private UUID id;
    private String name;
    private String sku;
    private UUID categoryId;
    private String categoryName;
    private String description;
    private String unit;
    private BigDecimal unitPrice;
    private Integer reorderLevel;
    private Integer currentStock;
    private Boolean isActive;
    private Boolean lowStock;
    private LocalDateTime createdAt;
}
