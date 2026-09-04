-- ============================================================================
-- IRAYA HOMES VILLA CRM - HOTEL / PROPERTY INVENTORY TRACKING SCHEMA
-- Database: PostgreSQL / Supabase
-- Tables: inventory_items, inventory_daily_logs
-- View: v_monthly_inventory_summary
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLE: inventory_items
-- Catalog of consumable amenities, linen, and cleaning supplies for the property
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    unit TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TABLE: inventory_daily_logs
-- Daily operational stock logs submitted by villa staff
CREATE TABLE IF NOT EXISTS inventory_daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    opening_stock INT NOT NULL CHECK (opening_stock >= 0),
    used_count INT NOT NULL DEFAULT 0 CHECK (used_count >= 0),
    added_stock INT NOT NULL DEFAULT 0 CHECK (added_stock >= 0),
    -- Calculated remaining stock with check constraint ensuring non-negative values
    remaining_stock INT NOT NULL DEFAULT 0 CHECK (remaining_stock >= 0),
    logged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_inventory_item_log_date UNIQUE (item_id, log_date)
);

-- Index for high performance date-range queries & pre-population lookups
CREATE INDEX IF NOT EXISTS idx_inventory_daily_logs_lookup 
ON inventory_daily_logs (item_id, log_date DESC);

-- Trigger to calculate and guarantee remaining_stock integrity on insert or update
CREATE OR REPLACE FUNCTION calc_inventory_remaining_stock()
RETURNS TRIGGER AS $$
BEGIN
    NEW.remaining_stock := NEW.opening_stock + NEW.added_stock - NEW.used_count;
    IF NEW.remaining_stock < 0 THEN
        RAISE EXCEPTION 'Remaining stock cannot be negative: used_count exceeds opening_stock + added_stock';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calc_inventory_remaining_stock ON inventory_daily_logs;
CREATE TRIGGER trg_calc_inventory_remaining_stock
BEFORE INSERT OR UPDATE ON inventory_daily_logs
FOR EACH ROW EXECUTE FUNCTION calc_inventory_remaining_stock();

-- ============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_daily_logs ENABLE ROW LEVEL SECURITY;

-- Allow reading inventory items for authenticated users and anon clients
DROP POLICY IF EXISTS "Allow select inventory_items" ON inventory_items;
CREATE POLICY "Allow select inventory_items" 
ON inventory_items FOR SELECT 
TO public, authenticated, anon 
USING (true);

DROP POLICY IF EXISTS "Allow modify inventory_items" ON inventory_items;
CREATE POLICY "Allow modify inventory_items" 
ON inventory_items FOR ALL 
TO authenticated, anon 
USING (true) WITH CHECK (true);

-- Allow reading daily logs
DROP POLICY IF EXISTS "Allow select inventory_daily_logs" ON inventory_daily_logs;
CREATE POLICY "Allow select inventory_daily_logs" 
ON inventory_daily_logs FOR SELECT 
TO public, authenticated, anon 
USING (true);

-- Allow staff to insert / update daily logs
DROP POLICY IF EXISTS "Allow insert_update inventory_daily_logs" ON inventory_daily_logs;
CREATE POLICY "Allow insert_update inventory_daily_logs" 
ON inventory_daily_logs FOR ALL 
TO authenticated, anon 
USING (true) WITH CHECK (true);

-- ============================================================================
-- 4. DATABASE VIEW: v_monthly_inventory_summary
-- Aggregates logs by item and by month (YYYY-MM)
-- Returns:
--   - item_id, item_name, unit, summary_month
--   - total_used (SUM of used_count)
--   - total_added (SUM of added_stock)
--   - month_opening_stock (earliest log's opening stock for that month)
--   - month_closing_stock (latest log's remaining stock for that month)
-- ============================================================================
CREATE OR REPLACE VIEW v_monthly_inventory_summary AS
WITH ranked_logs AS (
    SELECT 
        l.id,
        l.item_id,
        i.name AS item_name,
        i.unit,
        to_char(l.log_date, 'YYYY-MM') AS summary_month,
        l.log_date,
        l.opening_stock,
        l.used_count,
        l.added_stock,
        l.remaining_stock,
        ROW_NUMBER() OVER (
            PARTITION BY l.item_id, to_char(l.log_date, 'YYYY-MM') 
            ORDER BY l.log_date ASC, l.created_at ASC
        ) AS rn_first,
        ROW_NUMBER() OVER (
            PARTITION BY l.item_id, to_char(l.log_date, 'YYYY-MM') 
            ORDER BY l.log_date DESC, l.created_at DESC
        ) AS rn_last
    FROM inventory_daily_logs l
    JOIN inventory_items i ON l.item_id = i.id
),
monthly_agg AS (
    SELECT 
        item_id,
        item_name,
        unit,
        summary_month,
        COALESCE(SUM(used_count), 0)::INT AS total_used,
        COALESCE(SUM(added_stock), 0)::INT AS total_added
    FROM ranked_logs
    GROUP BY item_id, item_name, unit, summary_month
),
first_logs AS (
    SELECT item_id, summary_month, opening_stock AS month_opening_stock
    FROM ranked_logs
    WHERE rn_first = 1
),
last_logs AS (
    SELECT item_id, summary_month, remaining_stock AS month_closing_stock
    FROM ranked_logs
    WHERE rn_last = 1
)
SELECT 
    m.item_id,
    m.item_name,
    m.unit,
    m.summary_month,
    m.total_used,
    m.total_added,
    COALESCE(f.month_opening_stock, 0)::INT AS month_opening_stock,
    COALESCE(l.month_closing_stock, 0)::INT AS month_closing_stock
FROM monthly_agg m
LEFT JOIN first_logs f ON m.item_id = f.item_id AND m.summary_month = f.summary_month
LEFT JOIN last_logs l ON m.item_id = l.item_id AND m.summary_month = l.summary_month;

-- ============================================================================
-- 5. INITIAL SEED DATA: 9 Required Inventory Items
-- ============================================================================
INSERT INTO inventory_items (id, name, unit)
VALUES
    ('a1000000-0000-4000-8000-000000000001', 'Dental Kit', 'Kits'),
    ('a1000000-0000-4000-8000-000000000002', 'Shampoo', 'Bottles (50ml)'),
    ('a1000000-0000-4000-8000-000000000003', 'Body wash', 'Bottles (50ml)'),
    ('a1000000-0000-4000-8000-000000000004', 'Towel', 'Pcs (Plush Cotton)'),
    ('a1000000-0000-4000-8000-000000000005', 'Bedsheets', 'Sets (King/Queen)'),
    ('a1000000-0000-4000-8000-000000000006', 'Pillow Cover', 'Pcs'),
    ('a1000000-0000-4000-8000-000000000007', 'Bed Runner', 'Pcs (Silk Maroon)'),
    ('a1000000-0000-4000-8000-000000000008', 'Floor Cleaner', 'Litres'),
    ('a1000000-0000-4000-8000-000000000009', 'Glass cleaner', 'Bottles (500ml)')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    unit = EXCLUDED.unit;
