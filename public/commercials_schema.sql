-- ============================================================================
-- IRAYA HOMES / PIXELGROVE — COMMERCIALS (EXPENSE TRACKING) MODULE
-- SUPABASE POSTGRESQL SCHEMA SPECIFICATION
-- ============================================================================

-- 1. Create Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR(100) PRIMARY KEY DEFAULT 'exp_' || gen_random_uuid(),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    category VARCHAR(100) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'Cash',
    receipt_url TEXT,
    notes TEXT,
    user_id VARCHAR(100),
    user_name VARCHAR(150) DEFAULT 'Staff',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Monthly Balances Table (Formula: Closing = Opening - Total Spent)
CREATE TABLE IF NOT EXISTS monthly_balances (
    id VARCHAR(100) PRIMARY KEY DEFAULT 'bal_' || gen_random_uuid(),
    month VARCHAR(7) NOT NULL UNIQUE, -- YYYY-MM format
    opening_balance NUMERIC(12, 2) NOT NULL DEFAULT 150000.00,
    total_expenses NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    closing_balance NUMERIC(12, 2) NOT NULL DEFAULT 150000.00,
    auto_carry_forward BOOLEAN DEFAULT TRUE,
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Expense Categories Table (Predefined & Scalable Custom)
CREATE TABLE IF NOT EXISTS expense_categories (
    id VARCHAR(100) PRIMARY KEY DEFAULT 'cat_' || gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(20) DEFAULT '#721828',
    is_predefined BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
DROP POLICY IF EXISTS "Allow authenticated full access to expenses" ON expenses;
CREATE POLICY "Allow authenticated full access to expenses" ON expenses
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon read/write to expenses" ON expenses;
CREATE POLICY "Allow anon read/write to expenses" ON expenses
    FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated full access to monthly_balances" ON monthly_balances;
CREATE POLICY "Allow authenticated full access to monthly_balances" ON monthly_balances
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon read/write to monthly_balances" ON monthly_balances;
CREATE POLICY "Allow anon read/write to monthly_balances" ON monthly_balances
    FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read to expense_categories" ON expense_categories;
CREATE POLICY "Allow public read to expense_categories" ON expense_categories
    FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow authenticated manage expense_categories" ON expense_categories;
CREATE POLICY "Allow authenticated manage expense_categories" ON expense_categories
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_monthly_balances_month ON monthly_balances(month);

-- 7. Analytical View for Category Spending
CREATE OR REPLACE VIEW v_monthly_category_spending AS
SELECT 
    TO_CHAR(date, 'YYYY-MM') AS expense_month,
    category,
    COUNT(*) AS transaction_count,
    SUM(amount) AS total_amount
FROM expenses
GROUP BY TO_CHAR(date, 'YYYY-MM'), category;

-- 8. Pre-seed Standard Predefined Categories
INSERT INTO expense_categories (name, description, color, is_predefined)
VALUES 
  ('Marketing & Ads', 'Meta, Google Ads, OTA listing promos & influencer stays', '#721828', true),
  ('Software & Tools', 'PMS licenses, channel manager, accounting software & AI agents', '#c29342', true),
  ('Office Supplies', 'Front-desk stationery, guest registration cards, print supplies', '#64748b', true),
  ('Travel & Transport', 'Guest airport transfers, local staff errands & fuel expenses', '#0284c7', true),
  ('Food & Beverages', 'Breakfast ingredients, tea/coffee bar, pool snacks & mineral water', '#d97706', true),
  ('Utilities', 'Electricity (UPPCL), high-speed Wi-Fi, diesel generator fuel & gas', '#2d5a43', true),
  ('Salaries & Wages', 'Villa host stipends, housekeeping team wages, chef & security', '#7c3aed', true),
  ('Miscellaneous', 'Incidental repairs, seasonal decor & unforeseen villa upkeep', '#db2777', true)
ON CONFLICT (name) DO NOTHING;
