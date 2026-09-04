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

-- Optional initial seed logs for September 2026
INSERT INTO inventory_daily_logs (id, item_id, log_date, opening_stock, used_count, added_stock, remaining_stock, notes)
VALUES
    ('b1000000-0000-4000-8000-000000000021', 'a1000000-0000-4000-8000-000000000001', '2026-09-01', 63, 8, 0, 55, 'Full villa check-in welcome kit deployment'),
    ('b1000000-0000-4000-8000-000000000022', 'a1000000-0000-4000-8000-000000000002', '2026-09-01', 54, 8, 0, 46, 'Placed 2 bottles per ensuite washroom'),
    ('b1000000-0000-4000-8000-000000000023', 'a1000000-0000-4000-8000-000000000003', '2026-09-01', 50, 8, 0, 42, 'Placed 2 bottles per ensuite washroom'),
    ('b1000000-0000-4000-8000-000000000024', 'a1000000-0000-4000-8000-000000000004', '2026-09-01', 28, 10, 0, 18, 'Pool towels basket and suite setup'),
    ('b1000000-0000-4000-8000-000000000025', 'a1000000-0000-4000-8000-000000000005', '2026-09-01', 18, 4, 0, 14, 'Fresh 400-TC Egyptian cotton dressed'),
    ('b1000000-0000-4000-8000-000000000026', 'a1000000-0000-4000-8000-000000000006', '2026-09-01', 34, 8, 0, 26, '4 double beds dressing'),
    ('b1000000-0000-4000-8000-000000000027', 'a1000000-0000-4000-8000-000000000007', '2026-09-01', 13, 4, 0, 9, 'Maroon runners dressed on all beds'),
    ('b1000000-0000-4000-8000-000000000028', 'a1000000-0000-4000-8000-000000000008', '2026-09-01', 20, 2, 0, 18, 'Entire ground & first floor deep mop'),
    ('b1000000-0000-4000-8000-000000000029', 'a1000000-0000-4000-8000-000000000009', '2026-09-01', 11, 1, 0, 10, 'Terrace & bathroom glass cleaning'),

    ('b1000000-0000-4000-8000-000000000031', 'a1000000-0000-4000-8000-000000000001', '2026-09-02', 55, 4, 0, 51, 'Mid-stay replacement requested in Suite 2'),
    ('b1000000-0000-4000-8000-000000000032', 'a1000000-0000-4000-8000-000000000002', '2026-09-02', 46, 3, 0, 43, 'Housekeeping round refill'),
    ('b1000000-0000-4000-8000-000000000033', 'a1000000-0000-4000-8000-000000000003', '2026-09-02', 42, 3, 0, 39, 'Housekeeping round refill'),
    ('b1000000-0000-4000-8000-000000000034', 'a1000000-0000-4000-8000-000000000004', '2026-09-02', 18, 6, 12, 24, 'Received 12 clean towels from laundry; 6 extra pool towels used'),
    ('b1000000-0000-4000-8000-000000000035', 'a1000000-0000-4000-8000-000000000005', '2026-09-02', 14, 1, 0, 13, 'Suite 3 spill replacement'),
    ('b1000000-0000-4000-8000-000000000036', 'a1000000-0000-4000-8000-000000000006', '2026-09-02', 26, 2, 0, 24, 'Extra pillows requested for master suite'),
    ('b1000000-0000-4000-8000-000000000037', 'a1000000-0000-4000-8000-000000000007', '2026-09-02', 9, 0, 0, 9, 'No runner changes needed'),
    ('b1000000-0000-4000-8000-000000000038', 'a1000000-0000-4000-8000-000000000008', '2026-09-02', 18, 1, 0, 17, 'Kitchen & poolside sanitization'),
    ('b1000000-0000-4000-8000-000000000039', 'a1000000-0000-4000-8000-000000000009', '2026-09-02', 10, 1, 0, 9, 'Dining table & sliding door glass wipe')
ON CONFLICT (item_id, log_date) DO UPDATE SET
    opening_stock = EXCLUDED.opening_stock,
    used_count = EXCLUDED.used_count,
    added_stock = EXCLUDED.added_stock,
    remaining_stock = EXCLUDED.remaining_stock,
    notes = EXCLUDED.notes;

-- Realtime replication (if enabled)
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE inventory_items, inventory_daily_logs;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
