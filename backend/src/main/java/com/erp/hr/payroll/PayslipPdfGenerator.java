package com.erp.hr.payroll;

import com.erp.hr.employee.Employee;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.Locale;

@Slf4j
@Component
public class PayslipPdfGenerator {

    public byte[] generate(Payslip payslip) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document doc = new Document(pdf, PageSize.A4);
            doc.setMargins(40, 40, 40, 40);

            Employee emp = payslip.getEmployee();
            String monthName = Month.of(payslip.getMonth()).getDisplayName(TextStyle.FULL, Locale.ENGLISH);

            // Header
            doc.add(new Paragraph("OFFICE ERP")
                    .setFontSize(20).setBold().setTextAlignment(TextAlignment.CENTER));
            doc.add(new Paragraph("PAYSLIP")
                    .setFontSize(16).setTextAlignment(TextAlignment.CENTER));
            doc.add(new Paragraph(monthName + " " + payslip.getYear())
                    .setFontSize(12).setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20));

            // Employee Info
            Table infoTable = new Table(UnitValue.createPercentArray(new float[]{1, 2, 1, 2}))
                    .useAllAvailableWidth();

            addInfoRow(infoTable, "Employee", emp.getFullName());
            addInfoRow(infoTable, "Code", emp.getEmployeeCode());
            addInfoRow(infoTable, "Department", emp.getDepartment() != null ? emp.getDepartment().getName() : "-");
            addInfoRow(infoTable, "Designation", emp.getDesignation() != null ? emp.getDesignation().getTitle() : "-");
            addInfoRow(infoTable, "Working Days", String.valueOf(payslip.getWorkingDays()));
            addInfoRow(infoTable, "Present Days", String.valueOf(payslip.getPresentDays()));

            doc.add(infoTable);
            doc.add(new Paragraph("").setMarginBottom(15));

            // Earnings & Deductions
            Table salaryTable = new Table(UnitValue.createPercentArray(new float[]{3, 2, 3, 2}))
                    .useAllAvailableWidth();

            // Header row
            addHeaderCell(salaryTable, "Earnings");
            addHeaderCell(salaryTable, "Amount");
            addHeaderCell(salaryTable, "Deductions");
            addHeaderCell(salaryTable, "Amount");

            // Data rows
            salaryTable.addCell(cell("Basic Salary"));
            salaryTable.addCell(cell(format(payslip.getBasicSalary())));
            salaryTable.addCell(cell("Total Deductions"));
            salaryTable.addCell(cell(format(payslip.getTotalDeductions())));

            salaryTable.addCell(cell("Allowances"));
            salaryTable.addCell(cell(format(payslip.getTotalAllowances())));
            salaryTable.addCell(cell(""));
            salaryTable.addCell(cell(""));

            doc.add(salaryTable);
            doc.add(new Paragraph("").setMarginBottom(15));

            // Summary
            Table summaryTable = new Table(UnitValue.createPercentArray(new float[]{3, 2}))
                    .useAllAvailableWidth();

            addSummaryRow(summaryTable, "Gross Salary", format(payslip.getGrossSalary()));
            addSummaryRow(summaryTable, "Total Deductions", format(payslip.getTotalDeductions()));

            summaryTable.addCell(new Cell().add(new Paragraph("NET SALARY").setBold())
                    .setBackgroundColor(ColorConstants.LIGHT_GRAY).setPadding(8));
            summaryTable.addCell(new Cell().add(new Paragraph(format(payslip.getNetSalary())).setBold())
                    .setBackgroundColor(ColorConstants.LIGHT_GRAY).setPadding(8)
                    .setTextAlignment(TextAlignment.RIGHT));

            doc.add(summaryTable);
            doc.add(new Paragraph("").setMarginBottom(30));

            // Footer
            doc.add(new Paragraph("Status: " + payslip.getStatus().name())
                    .setFontSize(10).setFontColor(ColorConstants.GRAY));
            doc.add(new Paragraph("This is a computer-generated payslip and does not require a signature.")
                    .setFontSize(8).setFontColor(ColorConstants.GRAY)
                    .setTextAlignment(TextAlignment.CENTER).setMarginTop(30));

            doc.close();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate payslip PDF", e);
            throw new RuntimeException("Failed to generate PDF: " + e.getMessage());
        }
    }

    private void addInfoRow(Table table, String label, String value) {
        table.addCell(new Cell().add(new Paragraph(label).setBold().setFontSize(10)).setPadding(5).setBorder(null));
        table.addCell(new Cell().add(new Paragraph(value).setFontSize(10)).setPadding(5).setBorder(null));
    }

    private void addHeaderCell(Table table, String text) {
        table.addCell(new Cell().add(new Paragraph(text).setBold().setFontSize(10))
                .setBackgroundColor(ColorConstants.LIGHT_GRAY).setPadding(8));
    }

    private void addSummaryRow(Table table, String label, String value) {
        table.addCell(new Cell().add(new Paragraph(label).setFontSize(10)).setPadding(8));
        table.addCell(new Cell().add(new Paragraph(value).setFontSize(10))
                .setPadding(8).setTextAlignment(TextAlignment.RIGHT));
    }

    private Cell cell(String text) {
        return new Cell().add(new Paragraph(text).setFontSize(10)).setPadding(6);
    }

    private String format(java.math.BigDecimal amount) {
        return String.format("%,.2f", amount);
    }
}
