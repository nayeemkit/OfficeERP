-- V8__finance_expenses.sql

CREATE TABLE fin_expense_categories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL UNIQUE,
    description     VARCHAR(500),
    budget_limit    DECIMAL(12,2),
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    created_by      UUID
);

CREATE TABLE fin_expenses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_number  VARCHAR(20)  NOT NULL UNIQUE,
    employee_id     UUID         NOT NULL REFERENCES hr_employees(id),
    category_id     UUID         NOT NULL REFERENCES fin_expense_categories(id),
    amount          DECIMAL(12,2) NOT NULL,
    expense_date    DATE         NOT NULL,
    description     TEXT         NOT NULL,
    receipt_ref     VARCHAR(200),
    status          VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    reviewed_by     UUID         REFERENCES users(id),
    reviewed_at     TIMESTAMP,
    review_comment  TEXT,
    is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    created_by      UUID
);

CREATE INDEX idx_fin_expenses_employee ON fin_expenses(employee_id);
CREATE INDEX idx_fin_expenses_category ON fin_expenses(category_id);
CREATE INDEX idx_fin_expenses_status ON fin_expenses(status);
CREATE INDEX idx_fin_expenses_date ON fin_expenses(expense_date);
CREATE INDEX idx_fin_expenses_number ON fin_expenses(expense_number);

-- Seed expense categories
INSERT INTO fin_expense_categories (name, description, budget_limit) VALUES
    ('Travel', 'Business travel and transportation', 5000.00),
    ('Meals & Entertainment', 'Client meals and team events', 2000.00),
    ('Office Supplies', 'Stationery and office materials', 1000.00),
    ('Software & Subscriptions', 'Software licenses and SaaS', 3000.00),
    ('Training & Education', 'Courses, certifications, conferences', 2500.00),
    ('Equipment', 'Hardware and equipment purchases', 5000.00),
    ('Miscellaneous', 'Other business expenses', 1000.00);
