-- V9__invoices_budgets.sql

CREATE TABLE fin_invoices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number  VARCHAR(20)  NOT NULL UNIQUE,
    client_name     VARCHAR(200) NOT NULL,
    client_email    VARCHAR(255),
    client_address  TEXT,
    amount          DECIMAL(12,2) NOT NULL,
    tax_amount      DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount    DECIMAL(12,2) NOT NULL,
    issue_date      DATE         NOT NULL,
    due_date        DATE         NOT NULL,
    paid_date       DATE,
    status          VARCHAR(20)  NOT NULL DEFAULT 'DRAFT',
    notes           TEXT,
    is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    created_by      UUID
);

CREATE TABLE fin_budgets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id   UUID         NOT NULL REFERENCES hr_departments(id),
    year            INT          NOT NULL,
    month           INT          NOT NULL,
    allocated       DECIMAL(12,2) NOT NULL DEFAULT 0,
    spent           DECIMAL(12,2) NOT NULL DEFAULT 0,
    notes           VARCHAR(500),
    is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    created_by      UUID,
    UNIQUE(department_id, year, month)
);

CREATE INDEX idx_fin_invoices_number ON fin_invoices(invoice_number);
CREATE INDEX idx_fin_invoices_status ON fin_invoices(status);
CREATE INDEX idx_fin_invoices_due ON fin_invoices(due_date);
CREATE INDEX idx_fin_budgets_dept ON fin_budgets(department_id);
CREATE INDEX idx_fin_budgets_period ON fin_budgets(year, month);
