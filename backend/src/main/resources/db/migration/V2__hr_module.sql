-- V2__hr_module.sql

CREATE TABLE hr_departments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL UNIQUE,
    description     VARCHAR(500),
    manager_id      UUID,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    created_by      UUID
);

CREATE TABLE hr_designations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(100) NOT NULL UNIQUE,
    description     VARCHAR(500),
    department_id   UUID         REFERENCES hr_departments(id),
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    created_by      UUID
);

CREATE TABLE hr_employees (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code   VARCHAR(20)  NOT NULL UNIQUE,
    user_id         UUID         REFERENCES users(id),
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    phone           VARCHAR(20),
    department_id   UUID         NOT NULL REFERENCES hr_departments(id),
    designation_id  UUID         REFERENCES hr_designations(id),
    reporting_to    UUID         REFERENCES hr_employees(id),
    join_date       DATE         NOT NULL,
    salary          DECIMAL(12,2) NOT NULL DEFAULT 0,
    employment_type VARCHAR(20)  NOT NULL DEFAULT 'FULL_TIME',
    status          VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    address         TEXT,
    date_of_birth   DATE,
    gender          VARCHAR(10),
    is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    created_by      UUID
);

CREATE INDEX idx_hr_employees_dept ON hr_employees(department_id);
CREATE INDEX idx_hr_employees_designation ON hr_employees(designation_id);
CREATE INDEX idx_hr_employees_code ON hr_employees(employee_code);
CREATE INDEX idx_hr_employees_email ON hr_employees(email);
CREATE INDEX idx_hr_employees_status ON hr_employees(status);

INSERT INTO hr_departments (name, description) VALUES
    ('Human Resources', 'HR and people operations'),
    ('Engineering', 'Software development and engineering'),
    ('Finance', 'Finance and accounting'),
    ('Operations', 'Business operations and logistics'),
    ('Marketing', 'Marketing and communications');

INSERT INTO hr_designations (title, description, department_id) VALUES
    ('Software Engineer', 'Develops and maintains software', (SELECT id FROM hr_departments WHERE name = 'Engineering')),
    ('Senior Software Engineer', 'Leads development efforts', (SELECT id FROM hr_departments WHERE name = 'Engineering')),
    ('HR Manager', 'Manages HR operations', (SELECT id FROM hr_departments WHERE name = 'Human Resources')),
    ('Accountant', 'Handles financial records', (SELECT id FROM hr_departments WHERE name = 'Finance')),
    ('Operations Manager', 'Manages daily operations', (SELECT id FROM hr_departments WHERE name = 'Operations'));
