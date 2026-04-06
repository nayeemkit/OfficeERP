-- V6__inventory.sql

CREATE TABLE inv_categories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL UNIQUE,
    description     VARCHAR(500),
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    created_by      UUID
);

CREATE TABLE inv_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200) NOT NULL,
    sku             VARCHAR(50)  NOT NULL UNIQUE,
    category_id     UUID         REFERENCES inv_categories(id),
    description     TEXT,
    unit            VARCHAR(20)  NOT NULL DEFAULT 'PCS',
    unit_price      DECIMAL(12,2) NOT NULL DEFAULT 0,
    reorder_level   INT          NOT NULL DEFAULT 10,
    current_stock   INT          NOT NULL DEFAULT 0,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    created_by      UUID
);

CREATE TABLE inv_stock_transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id         UUID         NOT NULL REFERENCES inv_items(id),
    type            VARCHAR(10)  NOT NULL,
    quantity        INT          NOT NULL,
    unit_price      DECIMAL(12,2),
    total_price     DECIMAL(12,2),
    reference       VARCHAR(100),
    note            TEXT,
    transaction_date DATE        NOT NULL DEFAULT CURRENT_DATE,
    is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    created_by      UUID
);

CREATE INDEX idx_inv_items_sku ON inv_items(sku);
CREATE INDEX idx_inv_items_category ON inv_items(category_id);
CREATE INDEX idx_inv_stock_txn_item ON inv_stock_transactions(item_id);
CREATE INDEX idx_inv_stock_txn_type ON inv_stock_transactions(type);
CREATE INDEX idx_inv_stock_txn_date ON inv_stock_transactions(transaction_date);

-- Seed categories
INSERT INTO inv_categories (name, description) VALUES
    ('Office Supplies', 'Pens, paper, stationery'),
    ('Electronics', 'Laptops, monitors, peripherals'),
    ('Furniture', 'Desks, chairs, shelves'),
    ('Cleaning Supplies', 'Cleaning products and tools'),
    ('Kitchen Supplies', 'Kitchen and pantry items');

-- Seed sample items
INSERT INTO inv_items (name, sku, category_id, unit, unit_price, reorder_level, current_stock) VALUES
    ('A4 Paper (Ream)', 'OFF-001', (SELECT id FROM inv_categories WHERE name = 'Office Supplies'), 'REAM', 5.00, 20, 100),
    ('Ballpoint Pen (Box)', 'OFF-002', (SELECT id FROM inv_categories WHERE name = 'Office Supplies'), 'BOX', 3.50, 10, 50),
    ('Laptop - Dell Latitude', 'ELC-001', (SELECT id FROM inv_categories WHERE name = 'Electronics'), 'PCS', 850.00, 2, 10),
    ('Monitor 24"', 'ELC-002', (SELECT id FROM inv_categories WHERE name = 'Electronics'), 'PCS', 250.00, 3, 15),
    ('Office Chair', 'FUR-001', (SELECT id FROM inv_categories WHERE name = 'Furniture'), 'PCS', 120.00, 5, 20),
    ('Standing Desk', 'FUR-002', (SELECT id FROM inv_categories WHERE name = 'Furniture'), 'PCS', 350.00, 3, 8);
