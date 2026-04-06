package com.erp.inventory.item.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryStats {

    private long totalItems;
    private long lowStockItems;
    private long totalTransactions;
}
