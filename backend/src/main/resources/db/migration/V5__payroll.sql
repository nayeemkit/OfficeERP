-- V5__payroll.sql

CREATE TABLE hr_salary_structures (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id     UUID         NOT NULL REFERENCES hr_employees(id),
    basic_salary    DECIMAL(12,2) NOT NULL DEFAULT 0,
    house_allowance DECIMAL(12,2) NOT NULL DEFAULT 0,
    transport_allowance DECIMAL(12,2) NOT NULL DEFAULT 0,
    medical_allowance DECIMAL(12,2) NOT NULL DEFAULT 0,
    other_allowance DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_deduction   DECIMAL(12,2) NOT NULL DEFAULT 0,
    insurance_deduction DECIMAL(12,2) NOT NULL DEFAULT 0,
    other_deduction DECIMAL(12,2) NOT NULL DEFAULT 0,
    effective_from  DATE         NOT NULL,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    created_by      UUID
);

CREATE TABLE hr_payslips (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id     UUID         NOT NULL REFERENCES hr_employees(id),
    year            INT          NOT NULL,
    month           INT          NOT NULL,
    basic_salary    DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_allowances DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_deductions DECIMAL(12,2) NOT NULL DEFAULT 0,
    gross_salary    DECIMAL(12,2) NOT NULL DEFAULT 0,
    net_salary      DECIMAL(12,2) NOT NULL DEFAULT 0,
    working_days    INT          NOT NULL DEFAULT 0,
    present_days    INT          NOT NULL DEFAULT 0,
    status          VARCHAR(20)  NOT NULL DEFAULT 'DRAFT',
    paid_at         TIMESTAMP,
    remarks         VARCHAR(500),
    is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    created_by      UUID,
    UNIQUE(employee_id, year, month)
);

CREATE INDEX idx_salary_structure_employee ON hr_salary_structures(employee_id);
CREATE INDEX idx_payslips_employee ON hr_payslips(employee_id);
CREATE INDEX idx_payslips_year_month ON hr_payslips(year, month);
CREATE INDEX idx_payslips_status ON hr_payslips(status);
