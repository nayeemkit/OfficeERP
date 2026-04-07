package com.erp.finance.invoice.dto;

import lombok.*;
import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class InvoiceStats {
    private long totalInvoices; private long draftCount; private long sentCount;
    private long paidCount; private long overdueCount;
    private BigDecimal totalPaid; private BigDecimal totalOutstanding;
}
