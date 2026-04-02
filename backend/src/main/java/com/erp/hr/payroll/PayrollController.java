package com.erp.hr.payroll;

import com.erp.common.ApiResponse;
import com.erp.hr.payroll.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hr/payroll")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class PayrollController {

    private final PayrollService payrollService;
    private final PayslipPdfGenerator pdfGenerator;
    private final PayslipRepository payslipRepository;

    // --- Salary Structure ---

    @GetMapping("/salary/{employeeId}")
    public ResponseEntity<ApiResponse<SalaryStructureResponse>> getSalaryStructure(@PathVariable UUID employeeId) {
        return ResponseEntity.ok(ApiResponse.ok("Salary structure fetched", payrollService.getSalaryStructure(employeeId)));
    }

    @PostMapping("/salary")
    public ResponseEntity<ApiResponse<SalaryStructureResponse>> saveSalaryStructure(
            @Valid @RequestBody SalaryStructureRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Salary structure saved", payrollService.saveSalaryStructure(request)));
    }

    // --- Payslips ---

    @GetMapping("/payslips")
    public ResponseEntity<ApiResponse<Page<PayslipResponse>>> getPayslips(
            @RequestParam(required = false) UUID employeeId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) PayslipStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Payslips fetched",
                payrollService.getPayslips(employeeId, year, month, status, pageable)));
    }

    @GetMapping("/payslips/{id}")
    public ResponseEntity<ApiResponse<PayslipResponse>> getPayslip(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok("Payslip fetched", payrollService.getPayslipById(id)));
    }

    @PostMapping("/generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<PayslipResponse>>> generatePayroll(
            @Valid @RequestBody GeneratePayrollRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Payroll generated", payrollService.generatePayroll(request)));
    }

    @PatchMapping("/payslips/{id}/confirm")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PayslipResponse>> confirmPayslip(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok("Payslip confirmed", payrollService.confirmPayslip(id)));
    }

    @PatchMapping("/payslips/{id}/pay")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PayslipResponse>> markAsPaid(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok("Payslip marked as paid", payrollService.markAsPaid(id)));
    }

    // --- PDF ---

    @GetMapping("/payslips/{id}/pdf")
    public ResponseEntity<byte[]> downloadPayslipPdf(@PathVariable UUID id) {
        Payslip payslip = payslipRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Payslip not found"));

        byte[] pdfBytes = pdfGenerator.generate(payslip);

        String filename = String.format("payslip_%s_%d_%02d.pdf",
                payslip.getEmployee().getEmployeeCode(), payslip.getYear(), payslip.getMonth());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    // --- Stats ---

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<PayrollStats>> getStats(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Payroll stats", payrollService.getStats(year, month)));
    }
}
