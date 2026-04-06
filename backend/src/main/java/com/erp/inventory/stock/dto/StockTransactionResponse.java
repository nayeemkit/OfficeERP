package com.erp.inventory.stock.dto;

import com.erp.inventory.item.InventoryEnums;
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
public class StockTransactionResponse {

    private UUID id;
    private UUID itemId;
    private String itemName;
    private String itemSku;
    private String categoryName;
    private InventoryEnums.StockTransactionType type;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String reference;
    private String note;
    private LocalDate transactionDate;
    private LocalDateTime createdAt;
}
