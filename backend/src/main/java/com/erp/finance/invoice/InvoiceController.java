package com.erp.finance.invoice;

import com.erp.common.ApiResponse;
import com.erp.finance.invoice.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController @RequestMapping("/api/v1/finance/invoices") @RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<InvoiceResponse>>> getAll(
            @RequestParam(required = false) String search, @RequestParam(required = false) InvoiceStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok("Invoices fetched", invoiceService.getAll(search, status, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InvoiceResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok("Invoice fetched", invoiceService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<InvoiceResponse>> create(@Valid @RequestBody InvoiceRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Invoice created", invoiceService.create(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<InvoiceResponse>> update(@PathVariable UUID id, @Valid @RequestBody InvoiceRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Invoice updated", invoiceService.update(id, req)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<InvoiceResponse>> changeStatus(@PathVariable UUID id, @RequestParam InvoiceStatus status) {
        return ResponseEntity.ok(ApiResponse.ok("Status updated", invoiceService.changeStatus(id, status)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        invoiceService.delete(id); return ResponseEntity.ok(ApiResponse.ok("Deleted", null));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<InvoiceStats>> getStats() {
        return ResponseEntity.ok(ApiResponse.ok("Invoice stats", invoiceService.getStats()));
    }
}
