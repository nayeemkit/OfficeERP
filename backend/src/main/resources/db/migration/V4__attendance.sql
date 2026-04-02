-- V4__attendance.sql

CREATE TABLE hr_attendance (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id     UUID         NOT NULL REFERENCES hr_employees(id),
    date            DATE         NOT NULL,
    check_in        TIMESTAMP,
    check_out       TIMESTAMP,
    work_hours      DECIMAL(4,2) DEFAULT 0,
    status          VARCHAR(20)  NOT NULL DEFAULT 'PRESENT',
    remarks         VARCHAR(500),
    is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    created_by      UUID,
    UNIQUE(employee_id, date)
);

CREATE INDEX idx_attendance_employee ON hr_attendance(employee_id);
CREATE INDEX idx_attendance_date ON hr_attendance(date);
CREATE INDEX idx_attendance_status ON hr_attendance(status);
CREATE INDEX idx_attendance_employee_date ON hr_attendance(employee_id, date);
