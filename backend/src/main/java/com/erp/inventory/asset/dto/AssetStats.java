package com.erp.inventory.asset.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetStats {

    private long totalAssets;
    private long available;
    private long assigned;
    private long underRepair;
    private long disposed;
}
