package com.erp.hr.leave.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveTypeResponse {

    private UUID id;
    private String name;
    private String description;
    private Integer defaultDays;
    private Boolean isPaid;
    private Boolean isActive;
}