package com.erp.inventory.item.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class ItemRequest {

    @NotBlank(message = "Item name is required")
    @Size(max = 200)
    private String name;

    @NotBlank(message = "SKU is required")
    @Size(max = 50)
    private String sku;

    private UUID categoryId;

    private String description;

    @NotBlank(message = "Unit is required")
    private String unit;

    @DecimalMin(value = "0", message = "Price cannot be negative")
    private BigDecimal unitPrice;

    @Min(value = 0, message = "Reorder level cannot be negative")
    private Integer reorderLevel;
}
