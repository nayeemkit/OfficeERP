package com.erp.inventory.asset.dto;

import com.erp.inventory.asset.AssetEnums;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetHistoryResponse {

    private UUID id;
    private AssetEnums.AssetAction action;
    private String fromEmployeeName;
    private String toEmployeeName;
    private String note;
    private LocalDateTime performedAt;
}
