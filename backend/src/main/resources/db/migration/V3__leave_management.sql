-- V3__leave_management.sql

CREATE TABLE hr_leave_types (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(50)  NOT NULL UNIQUE,
    description     VARCHAR(255),
    default_days    INT          NOT NULL DEFAULT 0,
    is_paid         BOOLEAN      NOT NULL DEFAULT TRUE,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    created_by      UUID
);

CREATE TABLE hr_leave_balances (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id     UUID         NOT NULL REFERENCES hr_employees(id),
    leave_type_id   UUID         NOT NULL REFERENCES hr_leave_types(id),
    year            INT          NOT NULL,
    total_days      DECIMAL(4,1) NOT NULL DEFAULT 0,
    used_days       DECIMAL(4,1) NOT NULL DEFAULT 0,
    pending_days    DECIMAL(4,1) NOT NULL DEFAULT 0,
    is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    created_by      UUID,
    UNIQUE(employee_id, leave_type_id, year)
);

CREATE TABLE hr_leave_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id     UUID         NOT NULL REFERENCES hr_employees(id),
    leave_type_id   UUID         NOT NULL REFERENCES hr_leave_types(id),
    start_date      DATE         NOT NULL,
    end_date        DATE         NOT NULL,
    total_days      DECIMAL(4,1) NOT NULL,
    reason          TEXT,
    status          VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    reviewed_by     UUID         REFERENCES users(id),
    reviewed_at     TIMESTAMP,
    review_comment  TEXT,
    is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    created_by      UUID
);

CREATE INDEX idx_leave_requests_employee ON hr_leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON hr_leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON hr_leave_requests(start_date, end_date);
CREATE INDEX idx_leave_balances_employee ON hr_leave_balances(employee_id);
CREATE INDEX idx_leave_balances_year ON hr_leave_balances(year);

-- Seed default leave types
INSERT INTO hr_leave_types (name, description, default_days, is_paid) VALUES
    ('Annual Leave', 'Yearly paid vacation leave', 20, true),
    ('Sick Leave', 'Medical and health-related leave', 14, true),
    ('Casual Leave', 'Short-notice personal leave', 10, true),
    ('Maternity Leave', 'Leave for childbirth and recovery', 120, true),
    ('Paternity Leave', 'Leave for new fathers', 14, true),
    ('Unpaid Leave', 'Leave without pay', 30, false);
