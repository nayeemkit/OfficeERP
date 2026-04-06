-- V7__assets.sql

CREATE TABLE inv_assets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_code      VARCHAR(30)  NOT NULL UNIQUE,
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    category_id     UUID         REFERENCES inv_categories(id),
    serial_number   VARCHAR(100),
    purchase_date   DATE,
    purchase_price  DECIMAL(12,2),
    warranty_expiry DATE,
    assigned_to     UUID         REFERENCES hr_employees(id),
    assigned_date   DATE,
    status          VARCHAR(20)  NOT NULL DEFAULT 'AVAILABLE',
    location        VARCHAR(200),
    condition       VARCHAR(20)  NOT NULL DEFAULT 'GOOD',
    is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    created_by      UUID
);

CREATE TABLE inv_asset_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id        UUID         NOT NULL REFERENCES inv_assets(id),
    action          VARCHAR(30)  NOT NULL,
    from_employee   UUID         REFERENCES hr_employees(id),
    to_employee     UUID         REFERENCES hr_employees(id),
    note            TEXT,
    performed_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    performed_by    UUID
);

CREATE INDEX idx_assets_code ON inv_assets(asset_code);
CREATE INDEX idx_assets_status ON inv_assets(status);
CREATE INDEX idx_assets_assigned ON inv_assets(assigned_to);
CREATE INDEX idx_assets_category ON inv_assets(category_id);
CREATE INDEX idx_asset_history_asset ON inv_asset_history(asset_id);
