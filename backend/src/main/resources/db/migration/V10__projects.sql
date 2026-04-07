-- V10__projects.sql

CREATE TABLE proj_projects (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    start_date      DATE,
    end_date        DATE,
    status          VARCHAR(20)  NOT NULL DEFAULT 'PLANNING',
    priority        VARCHAR(10)  NOT NULL DEFAULT 'MEDIUM',
    owner_id        UUID         REFERENCES hr_employees(id),
    progress        INT          NOT NULL DEFAULT 0,
    is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    created_by      UUID
);

CREATE TABLE proj_tasks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID         NOT NULL REFERENCES proj_projects(id),
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    assignee_id     UUID         REFERENCES hr_employees(id),
    priority        VARCHAR(10)  NOT NULL DEFAULT 'MEDIUM',
    status          VARCHAR(20)  NOT NULL DEFAULT 'TODO',
    due_date        DATE,
    estimated_hours DECIMAL(6,1),
    actual_hours    DECIMAL(6,1),
    sort_order      INT          NOT NULL DEFAULT 0,
    is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    created_by      UUID
);

CREATE TABLE proj_milestones (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID         NOT NULL REFERENCES proj_projects(id),
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    target_date     DATE         NOT NULL,
    completed       BOOLEAN      NOT NULL DEFAULT FALSE,
    completed_date  DATE,
    is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    created_by      UUID
);

CREATE INDEX idx_proj_projects_status ON proj_projects(status);
CREATE INDEX idx_proj_tasks_project ON proj_tasks(project_id);
CREATE INDEX idx_proj_tasks_assignee ON proj_tasks(assignee_id);
CREATE INDEX idx_proj_milestones_project ON proj_milestones(project_id);
