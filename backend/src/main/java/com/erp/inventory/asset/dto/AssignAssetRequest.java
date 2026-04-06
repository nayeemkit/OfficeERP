package com.erp.inventory.asset.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class AssignAssetRequest {

    @NotNull(message = "Employee is required")
    private UUID employeeId;

    private String note;
}
