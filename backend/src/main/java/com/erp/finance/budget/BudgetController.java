package com.erp.finance.budget;

import com.erp.common.ApiResponse;
import com.erp.finance.budget.dto.*;
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

import java.net.URI;
import java.util.Collections;
import java.util.Map;
import java.util.UUID;

@RestController @RequestMapping("/api/v1/finance/budgets") @RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class BudgetController {

    private final BudgetService budgetService;
    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<BudgetResponse>>> getAll(
            @RequestParam(required = false) UUID departmentId, @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @PageableDefault(size = 20, sort = "year", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok("Budgets fetched", budgetService.getAll(departmentId, year, month, pageable)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BudgetResponse>> createOrUpdate(@Valid @RequestBody BudgetRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Budget saved", budgetService.createOrUpdate(req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        budgetService.delete(id); return ResponseEntity.ok(ApiResponse.ok("Deleted", null));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<BudgetStats>> getStats(@RequestParam(required = false) Integer year) {
        return ResponseEntity.ok(ApiResponse.ok("Budget stats", budgetService.getStats(year)));
    }

    // Use THIS instead of @jakarta...PermitAll to ensure it overrides the class @PreAuthorize
    @PreAuthorize("permitAll()")
    @PostMapping("/initiate")
    public ResponseEntity<Map<String, String>> start(@RequestParam double amount) {
        System.out.println("Endpoint reached! Amount: " + amount); // Log for debugging
        String trxnId = "TXN_" + System.currentTimeMillis();
        String paymentUrl = paymentService.initiatePayment(amount, trxnId);

        return ResponseEntity.ok(Collections.singletonMap("url", paymentUrl));
    }

    @PreAuthorize("permitAll()")
    @PostMapping("/success")
    public ResponseEntity<String> handleSuccess(@RequestParam Map<String, String> requestParams) {
        // This is where SSLCommerz data arrives
        System.out.println("--- PAYMENT SUCCESS CALLBACK RECEIVED ---");
        System.out.println("Transaction ID: " + requestParams.get("tran_id"));
        System.out.println("Amount: " + requestParams.get("amount"));
        System.out.println("Status: " + requestParams.get("status"));

        // Here you would update your database (e.g., mark budget as PAID)

        // For now, return a simple message or a redirect
        return ResponseEntity.ok("Payment processed successfully! You can close this window.");
    }

    @PreAuthorize("permitAll()")
    @PostMapping("/fail")
    public ResponseEntity<String> handleFailure(@RequestParam Map<String, String> requestParams) {
        System.out.println("Payment Failed for: " + requestParams.get("tran_id"));
        return ResponseEntity.ok("Payment Failed. Please try again.");
    }
}
