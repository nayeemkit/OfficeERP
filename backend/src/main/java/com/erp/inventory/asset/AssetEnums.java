package com.erp.inventory.asset;

public class AssetEnums {

    public enum AssetStatus {
        AVAILABLE, ASSIGNED, UNDER_REPAIR, DISPOSED, LOST
    }

    public enum AssetCondition {
        NEW, GOOD, FAIR, POOR, DAMAGED
    }

    public enum AssetAction {
        CREATED, ASSIGNED, UNASSIGNED, TRANSFERRED, SENT_FOR_REPAIR, REPAIRED, DISPOSED, LOST, UPDATED
    }
}
