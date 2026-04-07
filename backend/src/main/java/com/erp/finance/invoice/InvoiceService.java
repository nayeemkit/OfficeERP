package com.erp.finance.invoice;

import com.erp.finance.invoice.dto.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Slf4j @Service @RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;

    public Page<InvoiceResponse> getAll(String search, InvoiceStatus status, Pageable pageable) {
        return invoiceRepository.findAllWithFilters(search, status, pageable).map(this::toResponse);
    }

    public InvoiceResponse getById(UUID id) { return toResponse(findOrThrow(id)); }

    @Transactional
    public InvoiceResponse create(InvoiceRequest req) {
        BigDecimal tax = req.getTaxAmount() != null ? req.getTaxAmount() : BigDecimal.ZERO;
        BigDecimal total = req.getAmount().add(tax);
        String number = String.format("INV-%04d", invoiceRepository.findMaxInvoiceNumber() + 1);

        Invoice inv = Invoice.builder()
                .invoiceNumber(number).clientName(req.getClientName())
                .clientEmail(req.getClientEmail()).clientAddress(req.getClientAddress())
                .amount(req.getAmount()).taxAmount(tax).totalAmount(total)
                .issueDate(req.getIssueDate()).dueDate(req.getDueDate())
                .status(InvoiceStatus.DRAFT).notes(req.getNotes()).build();
        inv.setIsDeleted(false);
        invoiceRepository.save(inv);
        log.info("Invoice created: {}", number);
        return toResponse(inv);
    }

    @Transactional
    public InvoiceResponse update(UUID id, InvoiceRequest req) {
        Invoice inv = findOrThrow(id);
        if (req.getClientName() != null) inv.setClientName(req.getClientName());
        if (req.getClientEmail() != null) inv.setClientEmail(req.getClientEmail());
        if (req.getClientAddress() != null) inv.setClientAddress(req.getClientAddress());
        if (req.getAmount() != null) {
            inv.setAmount(req.getAmount());
            BigDecimal tax = req.getTaxAmount() != null ? req.getTaxAmount() : inv.getTaxAmount();
            inv.setTaxAmount(tax);
            inv.setTotalAmount(req.getAmount().add(tax));
        }
        if (req.getIssueDate() != null) inv.setIssueDate(req.getIssueDate());
        if (req.getDueDate() != null) inv.setDueDate(req.getDueDate());
        if (req.getNotes() != null) inv.setNotes(req.getNotes());
        invoiceRepository.save(inv);
        return toResponse(inv);
    }

    @Transactional
    public InvoiceResponse changeStatus(UUID id, InvoiceStatus newStatus) {
        Invoice inv = findOrThrow(id);
        if (newStatus == InvoiceStatus.PAID) inv.setPaidDate(LocalDate.now());
        inv.setStatus(newStatus);
        invoiceRepository.save(inv);
        log.info("Invoice {} → {}", inv.getInvoiceNumber(), newStatus);
        return toResponse(inv);
    }

    @Transactional
    public void delete(UUID id) { Invoice inv = findOrThrow(id); inv.setIsDeleted(true); invoiceRepository.save(inv); }

    public InvoiceStats getStats() {
        long overdue = invoiceRepository.findOverdueInvoices(LocalDate.now()).size();
        return InvoiceStats.builder()
                .totalInvoices(invoiceRepository.countByStatusAndIsDeletedFalse(InvoiceStatus.DRAFT)
                        + invoiceRepository.countByStatusAndIsDeletedFalse(InvoiceStatus.SENT)
                        + invoiceRepository.countByStatusAndIsDeletedFalse(InvoiceStatus.PAID) + overdue)
                .draftCount(invoiceRepository.countByStatusAndIsDeletedFalse(InvoiceStatus.DRAFT))
                .sentCount(invoiceRepository.countByStatusAndIsDeletedFalse(InvoiceStatus.SENT))
                .paidCount(invoiceRepository.countByStatusAndIsDeletedFalse(InvoiceStatus.PAID))
                .overdueCount(overdue)
                .totalPaid(invoiceRepository.sumByStatus(InvoiceStatus.PAID))
                .totalOutstanding(invoiceRepository.sumByStatus(InvoiceStatus.SENT))
                .build();
    }

    private Invoice findOrThrow(UUID id) {
        return invoiceRepository.findByIdAndIsDeletedFalse(id).orElseThrow(() -> new EntityNotFoundException("Invoice not found"));
    }

    private InvoiceResponse toResponse(Invoice i) {
        return InvoiceResponse.builder()
                .id(i.getId()).invoiceNumber(i.getInvoiceNumber()).clientName(i.getClientName())
                .clientEmail(i.getClientEmail()).clientAddress(i.getClientAddress())
                .amount(i.getAmount()).taxAmount(i.getTaxAmount()).totalAmount(i.getTotalAmount())
                .issueDate(i.getIssueDate()).dueDate(i.getDueDate()).paidDate(i.getPaidDate())
                .status(i.getStatus()).notes(i.getNotes()).createdAt(i.getCreatedAt()).build();
    }
}
