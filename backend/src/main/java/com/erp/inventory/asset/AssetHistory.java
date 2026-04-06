package com.erp.inventory.asset;

import com.erp.hr.employee.Employee;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "inv_asset_history")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AssetEnums.AssetAction action;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_employee")
    private Employee fromEmployee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_employee")
    private Employee toEmployee;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "performed_at", nullable = false)
    @Builder.Default
    private LocalDateTime performedAt = LocalDateTime.now();

    @Column(name = "performed_by")
    private UUID performedBy;
}
