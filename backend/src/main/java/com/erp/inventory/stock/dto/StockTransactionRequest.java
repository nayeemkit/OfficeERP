package com.erp.inventory.stock.dto;

import com.erp.inventory.item.InventoryEnums;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class StockTransactionRequest {

    @NotNull(message = "Item is required")
    private UUID itemId;

    @NotNull(message = "Transaction type is required")
    private InventoryEnums.StockTransactionType type;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    private BigDecimal unitPrice;

    private String reference;

    private String note;

    private LocalDate transactionDate;
}
