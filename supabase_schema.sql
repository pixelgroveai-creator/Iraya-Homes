-- ============================================================================
-- SUPABASE / POSTGRESQL SCHEMA & INITIAL SEED FOR IRAYA HOMES VILLA CRM
-- Villa: Iraya Homes (4 BHK Luxury Villa, Lucknow)
-- All tables, columns, foreign keys, indexes, triggers & RLS policies included
-- ============================================================================

-- 1. Enable UUID Extension (if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. CREATE ENUMS / CUSTOM TYPES
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM (
        'Senior Social Media Manager',
        'Admin / Owner',
        'Manager',
        'Front Desk / Host',
        'Housekeeping / Ops',
        'Read-Only / Finance'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE lead_source_enum AS ENUM (
        'Phone',
        'WhatsApp',
        'Instagram',
        'Website',
        'Referral',
        'Direct Walk-in'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE lead_status_enum AS ENUM (
        'NEW',
        'CONTACTED',
        'FOLLOW-UP',
        'QUALIFIED',
        'BOOKING PENDING',
        'WON',
        'LOST'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE stay_purpose_enum AS ENUM (
        'Family',
        'Friends',
        'Group',
        'Event'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status_enum AS ENUM (
        'Enquiry',
        'Hold',
        'Confirmed',
        'Checked-in',
        'Checked-out',
        'Cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE activity_type_enum AS ENUM (
        'Call',
        'WhatsApp',
        'Pool Check',
        'Room Inspection',
        'Payment',
        'Guest Request',
        'Status Change',
        'Task Completed',
        'Note'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_priority_enum AS ENUM (
        'Low',
        'Medium',
        'High',
        'Urgent'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_status_enum AS ENUM (
        'To Do',
        'In Progress',
        'Blocked',
        'Done'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_category_enum AS ENUM (
        'Housekeeping',
        'Maintenance',
        'Front Desk',
        'Guest Request',
        'Follow-up',
        'Inspection'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE property_area_enum AS ENUM (
        'suite-1',
        'suite-2',
        'suite-3',
        'suite-4',
        'pool',
        'kitchen',
        'lounge-pool-table',
        'terrace-balcony'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE issue_category_enum AS ENUM (
        'Electrical',
        'Plumbing',
        'Pool',
        'Cleanliness',
        'Amenities',
        'HVAC/AC',
        'Furniture'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE issue_severity_enum AS ENUM (
        'Low',
        'Medium',
        'High',
        'Urgent'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE issue_status_enum AS ENUM (
        'Open',
        'In Progress',
        'Awaiting Parts',
        'Resolved'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE area_status_enum AS ENUM (
        'Ready',
        'In Progress',
        'Needs Attention',
        'Pending Reset'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 3. CREATE TABLES WITH ALL COLUMNS & CONSTRAINTS
-- ============================================================================

-- Table: staff_users
CREATE TABLE IF NOT EXISTS staff_users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'Senior Social Media Manager',
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    avatar TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    pin VARCHAR(10) DEFAULT '1234',
    department VARCHAR(255) DEFAULT 'Operations',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: guests
CREATE TABLE IF NOT EXISTS guests (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255),
    city VARCHAR(255),
    total_stays INT NOT NULL DEFAULT 0,
    lifetime_value NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    preferences JSONB DEFAULT '[]'::jsonb,
    service_notes TEXT DEFAULT '',
    first_stay_date DATE,
    last_stay_date DATE,
    booking_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
    vip_status BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: leads
CREATE TABLE IF NOT EXISTS leads (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    source lead_source_enum NOT NULL DEFAULT 'WhatsApp',
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    guest_count INT NOT NULL DEFAULT 2,
    stay_purpose stay_purpose_enum NOT NULL DEFAULT 'Family',
    status lead_status_enum NOT NULL DEFAULT 'NEW',
    assigned_staff_id VARCHAR(50) REFERENCES staff_users(id) ON DELETE SET NULL,
    scheduled_follow_up TIMESTAMPTZ,
    quote_amount NUMERIC(12, 2),
    notes TEXT,
    lost_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: bookings
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(50) PRIMARY KEY,
    lead_id VARCHAR(50) REFERENCES leads(id) ON DELETE SET NULL,
    guest_id VARCHAR(50) NOT NULL REFERENCES guests(id) ON DELETE RESTRICT,
    guest_name VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(50) NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    guest_count INT NOT NULL DEFAULT 4,
    stay_purpose stay_purpose_enum NOT NULL DEFAULT 'Family',
    status booking_status_enum NOT NULL DEFAULT 'Confirmed',
    
    -- Commercial breakdown
    total_quote NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    advance_deposit_paid NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    balance_due NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    security_deposit_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    security_deposit_refunded BOOLEAN NOT NULL DEFAULT false,
    
    -- Inspections & Notes
    pre_arrival_inspection_done BOOLEAN NOT NULL DEFAULT false,
    post_checkout_inspection_done BOOLEAN NOT NULL DEFAULT false,
    special_requests TEXT,
    notes TEXT,
    assigned_host_id VARCHAR(50) REFERENCES staff_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: tasks
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority task_priority_enum NOT NULL DEFAULT 'Medium',
    status task_status_enum NOT NULL DEFAULT 'To Do',
    category task_category_enum NOT NULL DEFAULT 'Housekeeping',
    assigned_staff_id VARCHAR(50) NOT NULL REFERENCES staff_users(id) ON DELETE CASCADE,
    due_date DATE NOT NULL,
    linked_booking_id VARCHAR(50) REFERENCES bookings(id) ON DELETE SET NULL,
    linked_area_id VARCHAR(50),
    completed_at TIMESTAMPTZ,
    completed_by_staff_id VARCHAR(50) REFERENCES staff_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: issues (Maintenance tickets)
CREATE TABLE IF NOT EXISTS issues (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category issue_category_enum NOT NULL DEFAULT 'Plumbing',
    property_area_id property_area_enum NOT NULL DEFAULT 'suite-1',
    severity issue_severity_enum NOT NULL DEFAULT 'Medium',
    status issue_status_enum NOT NULL DEFAULT 'Open',
    reported_by_staff_id VARCHAR(50) NOT NULL REFERENCES staff_users(id) ON DELETE CASCADE,
    assigned_to_staff_or_vendor VARCHAR(255) NOT NULL,
    linked_booking_id VARCHAR(50) REFERENCES bookings(id) ON DELETE SET NULL,
    impacts_upcoming_stay BOOLEAN NOT NULL DEFAULT false,
    reported_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    estimated_cost NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: activities (Real-time timeline actions)
CREATE TABLE IF NOT EXISTS activities (
    id VARCHAR(50) PRIMARY KEY,
    type activity_type_enum NOT NULL DEFAULT 'Note',
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    staff_id VARCHAR(50) NOT NULL REFERENCES staff_users(id) ON DELETE CASCADE,
    staff_name VARCHAR(255) NOT NULL,
    related_lead_id VARCHAR(50) REFERENCES leads(id) ON DELETE SET NULL,
    related_booking_id VARCHAR(50) REFERENCES bookings(id) ON DELETE SET NULL,
    related_guest_id VARCHAR(50) REFERENCES guests(id) ON DELETE SET NULL,
    related_issue_id VARCHAR(50) REFERENCES issues(id) ON DELETE SET NULL,
    outcome TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: area_checklists (SOP Area headers)
CREATE TABLE IF NOT EXISTS area_checklists (
    area_id property_area_enum PRIMARY KEY,
    area_name VARCHAR(255) NOT NULL,
    area_subtitle VARCHAR(255),
    icon_name VARCHAR(50) NOT NULL DEFAULT 'BedDouble',
    status area_status_enum NOT NULL DEFAULT 'Ready',
    last_inspected_at TIMESTAMPTZ,
    last_inspected_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: checklist_items (Individual SOP Checklist items)
CREATE TABLE IF NOT EXISTS checklist_items (
    id VARCHAR(50) PRIMARY KEY,
    area_id property_area_enum NOT NULL REFERENCES area_checklists(area_id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN NOT NULL DEFAULT false,
    checked_by VARCHAR(255),
    checked_at TIMESTAMPTZ,
    notes TEXT,
    is_failed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. PERFORMANCE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON leads(assigned_staff_id);
CREATE INDEX IF NOT EXISTS idx_leads_checkin ON leads(check_in_date);

CREATE INDEX IF NOT EXISTS idx_bookings_guest ON bookings(guest_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in_date, check_out_date);

CREATE INDEX IF NOT EXISTS idx_tasks_staff ON tasks(assigned_staff_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date);

CREATE INDEX IF NOT EXISTS idx_activities_staff ON activities(staff_id);
CREATE INDEX IF NOT EXISTS idx_activities_timestamp ON activities(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_issues_area ON issues(property_area_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) FOR SUPABASE
-- ============================================================================
ALTER TABLE staff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE area_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

-- Allow authenticated and anon access for full operational control (or tailor to auth.uid())
CREATE POLICY "Allow public read/write on staff_users" ON staff_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on guests" ON guests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on leads" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on bookings" ON bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on issues" ON issues FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on activities" ON activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on area_checklists" ON area_checklists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on checklist_items" ON checklist_items FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- 6. SEED DATA (KUNAL SINGH + PRODUCTION VILLA ENTRIES)
-- ============================================================================

-- Seed: staff_users
INSERT INTO staff_users (id, name, role, email, phone, avatar, active, pin, department)
VALUES (
    'STF-01',
    'Kunal Singh',
    'Senior Social Media Manager',
    'kunal.singh@irayahomes.in',
    '+91 98765 43210',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    true,
    '1234',
    'Digital Marketing & Social Media'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    department = EXCLUDED.department;

-- Seed: guests
INSERT INTO guests (id, name, phone, email, city, total_stays, lifetime_value, preferences, service_notes, first_stay_date, last_stay_date, booking_ids, vip_status)
VALUES 
(
    'GST-3091',
    'Vikramaditya Roy',
    '+91 98112 34567',
    'vikram.roy@techcap.in',
    'New Delhi',
    3,
    185000.00,
    '[{"category": "Pool & Recreation", "note": "Prefers pool heated early morning (7 AM)"}, {"category": "Dietary", "note": "Strictly vegetarian breakfast prep (Almond milk required)"}, {"category": "Room Setup", "note": "Suite 1 Royal Parkview is their favorite room"}]'::jsonb,
    'High-value tech corporate client. Host welcome with fruit basket & Lucknow sweets.',
    '2025-11-14',
    '2026-09-01',
    ARRAY['BK-2026-101'],
    true
),
(
    'GST-3092',
    'Dr. Ananya Mishra',
    '+91 94152 88990',
    'ananya.mishra@apollo.org',
    'Varanasi',
    2,
    95000.00,
    '[{"category": "Timing", "note": "Early check-in around 11:30 AM requested whenever feasible"}, {"category": "Room Setup", "note": "Extra feathered pillows in all suites"}]'::jsonb,
    'Family holiday trips with elderly parents. Ground floor Suite 4 preferred for easy access.',
    '2026-03-20',
    '2026-07-15',
    ARRAY['BK-2026-095'],
    false
),
(
    'GST-3093',
    'Karan Mehra',
    '+91 98200 44556',
    'karan.mehra@mumbaiproductions.com',
    'Mumbai',
    1,
    75000.00,
    '[{"category": "Pool & Recreation", "note": "Pool table tournament cues set & late evening terrace access"}, {"category": "Dietary", "note": "Non-vegetarian barbecue grill setup requested"}]'::jsonb,
    'Creative crew shoot & private retreat. Highly values privacy and fast Wi-Fi.',
    '2026-09-04',
    '2026-09-06',
    ARRAY['BK-2026-102'],
    false
),
(
    'GST-3094',
    'Shweta Singhal',
    '+91 98391 77665',
    'shweta.singhal@gmail.com',
    'Lucknow',
    1,
    48000.00,
    '[{"category": "Room Setup", "note": "Kids cot needed in Suite 2"}]'::jsonb,
    'Local family reunion staycation.',
    '2026-08-10',
    '2026-08-12',
    ARRAY['BK-2026-088'],
    false
)
ON CONFLICT (id) DO NOTHING;

-- Seed: leads
INSERT INTO leads (id, name, phone, email, source, check_in_date, check_out_date, guest_count, stay_purpose, status, assigned_staff_id, scheduled_follow_up, quote_amount, notes, lost_reason, created_at, updated_at)
VALUES
(
    'LD-10024',
    'Sameer Kapoor',
    '+91 98711 22334',
    'sameer.kapoor@innovate.co',
    'WhatsApp',
    '2026-09-12',
    '2026-09-14',
    8,
    'Family',
    'FOLLOW-UP',
    'STF-01',
    '2026-09-01T14:00:00Z',
    65000.00,
    'Inquired on WhatsApp for 2-night family reunion weekend. Wants private indoor pool & chef service options.',
    NULL,
    '2026-08-29T11:20:00Z',
    '2026-08-31T16:00:00Z'
),
(
    'LD-10025',
    'Nandini Gupta',
    '+91 99350 99881',
    'nandini.g@architects.in',
    'Instagram',
    '2026-09-19',
    '2026-09-21',
    10,
    'Friends',
    'NEW',
    'STF-01',
    '2026-09-01T11:00:00Z',
    70000.00,
    'Saw villa terrace & pool photos on Instagram Reel. Looking for a weekend friends getaway.',
    NULL,
    '2026-09-01T06:30:00Z',
    '2026-09-01T06:30:00Z'
),
(
    'LD-10026',
    'Rajesh Aggarwal',
    '+91 98100 11223',
    'rajesh@aggarwaltextiles.com',
    'Phone',
    '2026-09-25',
    '2026-09-27',
    6,
    'Group',
    'QUALIFIED',
    'STF-01',
    '2026-09-02T15:30:00Z',
    60000.00,
    'Direct phone call enquiry. Budget approved. Sending hold agreement & advance payment link.',
    NULL,
    '2026-08-28T14:00:00Z',
    '2026-08-31T18:00:00Z'
),
(
    'LD-10027',
    'Meera Singhania',
    '+91 97110 55443',
    'meera.s@weddingmoments.in',
    'Referral',
    '2026-10-02',
    '2026-10-05',
    12,
    'Event',
    'BOOKING PENDING',
    'STF-01',
    '2026-09-01T16:00:00Z',
    110000.00,
    'Pre-wedding intimate cocktail night & family stay. Sent custom quote for 3 nights + catering support.',
    NULL,
    '2026-08-25T10:00:00Z',
    '2026-08-31T12:00:00Z'
),
(
    'LD-10028',
    'Prateek Tandon',
    '+91 94500 66778',
    'prateek.t@gmail.com',
    'Website',
    '2026-09-08',
    '2026-09-09',
    4,
    'Family',
    'CONTACTED',
    'STF-01',
    '2026-09-01T17:00:00Z',
    35000.00,
    'Local Gomti Nagar resident looking for a 1-night birthday staycation for parents.',
    NULL,
    '2026-08-31T09:15:00Z',
    '2026-08-31T14:00:00Z'
),
(
    'LD-10029',
    'Aalok Srivastava',
    '+91 98899 44332',
    NULL,
    'Referral',
    '2026-09-04',
    '2026-09-06',
    8,
    'Friends',
    'LOST',
    'STF-01',
    NULL,
    58000.00,
    'Referred by Vikramaditya Roy. Dates unavailable.',
    'Dates clashed with another booking already held.',
    '2026-08-22T15:00:00Z',
    '2026-08-24T11:00:00Z'
)
ON CONFLICT (id) DO NOTHING;

-- Seed: bookings
INSERT INTO bookings (id, lead_id, guest_id, guest_name, guest_phone, check_in_date, check_out_date, guest_count, stay_purpose, status, total_quote, advance_deposit_paid, balance_due, security_deposit_amount, security_deposit_refunded, pre_arrival_inspection_done, post_checkout_inspection_done, special_requests, notes, assigned_host_id, created_at, updated_at)
VALUES
(
    'BK-2026-101',
    NULL,
    'GST-3091',
    'Vikramaditya Roy',
    '+91 98112 34567',
    '2026-09-01',
    '2026-09-03',
    6,
    'Family',
    'Checked-in',
    72000.00,
    72000.00,
    0.00,
    15000.00,
    false,
    true,
    false,
    'Warm pool at 7:00 AM, Lucknow Galouti kebab dinner recommendations, 2 extra sets of pool towels.',
    'Checked in at 12:45 PM by Kunal Singh. Keys handed over. Welcome drinks served in lounge.',
    'STF-01',
    '2026-08-15T10:00:00Z',
    '2026-09-01T07:15:00Z'
),
(
    'BK-2026-102',
    NULL,
    'GST-3093',
    'Karan Mehra',
    '+91 98200 44556',
    '2026-09-04',
    '2026-09-06',
    8,
    'Friends',
    'Confirmed',
    75000.00,
    40000.00,
    35000.00,
    15000.00,
    false,
    false,
    false,
    'Pool table cues straight & chalk ready, evening barbecue setup on terrace.',
    'Advance 50% received via IMPS. Balance due on arrival. Housekeeping scheduled for Friday morning.',
    'STF-01',
    '2026-08-20T14:30:00Z',
    '2026-08-30T11:00:00Z'
),
(
    'BK-2026-103',
    'LD-10027',
    'GST-3092',
    'Dr. Ananya Mishra',
    '+91 94152 88990',
    '2026-09-18',
    '2026-09-20',
    5,
    'Family',
    'Hold',
    62000.00,
    15000.00,
    47000.00,
    10000.00,
    false,
    false,
    false,
    'Ground floor Suite 4 for grandparents, wheelchair-friendly ramp assistance at entrance.',
    'Token hold amount received. Full advance expected by Sep 3rd.',
    'STF-01',
    '2026-08-28T16:00:00Z',
    '2026-08-31T09:00:00Z'
),
(
    'BK-2026-088',
    NULL,
    'GST-3094',
    'Shweta Singhal',
    '+91 98391 77665',
    '2026-08-10',
    '2026-08-12',
    4,
    'Family',
    'Checked-out',
    48000.00,
    48000.00,
    0.00,
    10000.00,
    true,
    true,
    true,
    'Cot in Suite 2.',
    'Stay completed successfully. Post-checkout inspection cleared, security deposit 100% refunded.',
    'STF-01',
    '2026-08-01T09:00:00Z',
    '2026-08-12T13:00:00Z'
)
ON CONFLICT (id) DO NOTHING;

-- Seed: tasks
INSERT INTO tasks (id, title, description, priority, status, category, assigned_staff_id, due_date, linked_booking_id, linked_area_id, completed_at, completed_by_staff_id, created_at)
VALUES
(
    'TSK-901',
    'Heated Pool Chlorine & pH Check for Check-in',
    'Perform chemical check, test heater setpoint to 29°C for Vikramaditya Roy arrival.',
    'Urgent',
    'In Progress',
    'Housekeeping',
    'STF-01',
    '2026-09-01',
    'BK-2026-101',
    'pool',
    NULL,
    NULL,
    '2026-09-01T06:00:00Z'
),
(
    'TSK-902',
    'Call Sameer Kapoor for Hold Confirmation',
    'Confirm if catering add-on is required for Sep 12-14 family stay.',
    'High',
    'To Do',
    'Follow-up',
    'STF-01',
    '2026-09-01',
    NULL,
    NULL,
    NULL,
    NULL,
    '2026-08-31T16:00:00Z'
),
(
    'TSK-903',
    'Plumber Inspection - Suite 3 Geyser Leaking Valve',
    'Plumber Ram Lal scheduled to visit at 2:00 PM today before next booking arrives.',
    'High',
    'To Do',
    'Maintenance',
    'STF-01',
    '2026-09-01',
    NULL,
    'suite-3',
    NULL,
    NULL,
    '2026-08-31T17:00:00Z'
),
(
    'TSK-904',
    'Restock Pool Table Chalk & Polish Cues',
    'Ensure all 4 cue sticks straight, new chalk pieces in tray for Karan Mehra weekend stay.',
    'Medium',
    'To Do',
    'Housekeeping',
    'STF-01',
    '2026-09-03',
    'BK-2026-102',
    'lounge-pool-table',
    NULL,
    NULL,
    '2026-08-30T15:00:00Z'
),
(
    'TSK-905',
    'Deep Clean Kitchen Modular Exhaust Hood & RO filter',
    'Monthly routine service with Kent RO technician.',
    'Low',
    'Done',
    'Housekeeping',
    'STF-01',
    '2026-08-31',
    NULL,
    'kitchen',
    '2026-08-31T18:30:00Z',
    'STF-01',
    '2026-08-29T10:00:00Z'
),
(
    'TSK-906',
    'Verify Crockery Count & Wine Glass Set',
    'Inventory check for 16 guests party sets.',
    'Urgent',
    'To Do',
    'Inspection',
    'STF-01',
    '2026-08-30',
    NULL,
    'kitchen',
    NULL,
    NULL,
    '2026-08-28T09:00:00Z'
)
ON CONFLICT (id) DO NOTHING;

-- Seed: issues
INSERT INTO issues (id, title, description, category, property_area_id, severity, status, reported_by_staff_id, assigned_to_staff_or_vendor, impacts_upcoming_stay, reported_at, resolved_at, resolution_notes, estimated_cost)
VALUES
(
    'ISS-401',
    'Geyser Outlet Valve Dripping in Suite 3 Bathroom',
    'Small drip noticed under the 25L geyser connection pipe. Requires washer replacement.',
    'Plumbing',
    'suite-3',
    'High',
    'In Progress',
    'STF-01',
    'Ram Lal Plumbing Services (Lucknow)',
    true,
    '2026-08-31T17:00:00Z',
    NULL,
    NULL,
    800.00
),
(
    'ISS-402',
    'Underwater Pool Light #2 Flickering',
    'Submersible LED light near shallow steps turns off intermittently when main pump runs.',
    'Electrical',
    'pool',
    'Medium',
    'Open',
    'STF-01',
    'Sharma Electricals',
    false,
    '2026-08-30T19:30:00Z',
    NULL,
    NULL,
    1500.00
),
(
    'ISS-403',
    'Pool Table Corner Pocket Net Loose',
    'Leather drop pocket strap was loose; re-stitched and secured with brass rivet.',
    'Furniture',
    'lounge-pool-table',
    'Low',
    'Resolved',
    'STF-01',
    'Kunal Singh',
    false,
    '2026-08-28T14:00:00Z',
    '2026-08-29T11:00:00Z',
    'Re-aligned leather strap and verified with 57.2mm cue ball test drop.',
    300.00
)
ON CONFLICT (id) DO NOTHING;

-- Seed: activities
INSERT INTO activities (id, type, title, description, timestamp, staff_id, staff_name, related_booking_id, related_lead_id, related_guest_id, related_issue_id, outcome)
VALUES
(
    'ACT-801',
    'Pool Check',
    'Daily Morning Pool Quality Verification',
    'Indoor pool pH tested at 7.4 pH. Chlorine 1.5 ppm. Water clarity pristine. Filter backwash completed.',
    '2026-09-01T07:10:00Z',
    'STF-01',
    'Kunal Singh',
    'BK-2026-101',
    NULL,
    NULL,
    NULL,
    'Pool certified ready for guest use'
),
(
    'ACT-802',
    'Room Inspection',
    'Pre-Arrival Inspection Suite 1 & Suite 4',
    'All 4 suites inspected. AC tested, linen dressed, organic toiletries restocked for Vikramaditya Roy party.',
    '2026-09-01T07:30:00Z',
    'STF-01',
    'Kunal Singh',
    'BK-2026-101',
    NULL,
    NULL,
    NULL,
    'Property passed pre-arrival readiness'
),
(
    'ACT-803',
    'Call',
    'Follow-up Call with Sameer Kapoor',
    'Discussed family reunion requirements for Sep 12-14. Sent villa video tour link via WhatsApp.',
    '2026-08-31T15:45:00Z',
    'STF-01',
    'Kunal Singh',
    NULL,
    'LD-10024',
    NULL,
    NULL,
    'Guest confirmed interest, scheduling final confirmation call today at 2 PM'
),
(
    'ACT-804',
    'WhatsApp',
    'Enquiry Received from Instagram Lead',
    'Nandini Gupta asked about booking villa for 10 friends for a weekend celebration.',
    '2026-09-01T06:35:00Z',
    'STF-01',
    'Kunal Singh',
    NULL,
    'LD-10025',
    NULL,
    NULL,
    'Shared brochure and tariffs'
),
(
    'ACT-805',
    'Payment',
    'Advance Deposit Received - Karan Mehra',
    '₹40,000 advance received for Sep 4-6 stay via Bank Transfer (Ref #AXIS883921).',
    '2026-08-30T11:00:00Z',
    'STF-01',
    'Kunal Singh',
    'BK-2026-102',
    NULL,
    NULL,
    NULL,
    'Booking transitioned to Confirmed'
)
ON CONFLICT (id) DO NOTHING;

-- Seed: area_checklists
INSERT INTO area_checklists (area_id, area_name, area_subtitle, icon_name, status, last_inspected_at, last_inspected_by)
VALUES
('suite-1', 'Suite 1 — Royal Parkview', 'King Bed, Ensuite Luxury Bath & Scenic Park Vista', 'BedDouble', 'Ready', '2026-09-01T07:30:00Z', 'Kunal Singh'),
('suite-2', 'Suite 2 — Garden Haven', 'King Bed, Ensuite Bathroom & Smart Entertainment Unit', 'Bed', 'Ready', '2026-09-01T07:45:00Z', 'Kunal Singh'),
('suite-3', 'Suite 3 — Terrace Suite', 'King Bed, Attached Bath & Direct Private Terrace Access', 'Building', 'Needs Attention', '2026-09-01T07:55:00Z', 'Kunal Singh'),
('suite-4', 'Suite 4 — Courtyard Suite', 'Family Configuration (Queen + Twin Bed) & Attached Bath', 'Users', 'Ready', '2026-09-01T08:00:00Z', 'Kunal Singh'),
('pool', 'Indoor Swimming Pool', 'Private Heated Pool, Deck Lounge & Mood Lighting', 'Waves', 'Ready', '2026-09-01T07:10:00Z', 'Kunal Singh'),
('kitchen', 'Fully Equipped Kitchen', 'Modular Island, Double Door Refrigerator, Microwave & Crockery', 'UtensilsCrossed', 'Ready', '2026-09-01T07:20:00Z', 'Kunal Singh'),
('lounge-pool-table', 'Entertainment & Pool Table Lounge', '8-ft Tournament Slate Pool Table, Leather Seating & Audio', 'Trophy', 'Ready', '2026-09-01T07:40:00Z', 'Kunal Singh'),
('terrace-balcony', 'Private Terrace & Scenic Balcony', 'Park-facing Overlook, Outdoor Seating & Garden Accents', 'Trees', 'Ready', '2026-09-01T07:25:00Z', 'Kunal Singh')
ON CONFLICT (area_id) DO UPDATE SET
    area_name = EXCLUDED.area_name,
    area_subtitle = EXCLUDED.area_subtitle,
    status = EXCLUDED.status,
    last_inspected_at = EXCLUDED.last_inspected_at,
    last_inspected_by = EXCLUDED.last_inspected_by;

-- Seed: checklist_items
INSERT INTO checklist_items (id, area_id, label, description, completed, checked_by, checked_at, notes, is_failed)
VALUES
('s1-1', 'suite-1', 'Fresh high-thread linen replacement & pillow dressing', NULL, true, 'Kunal Singh', '2026-09-01T07:15:00Z', NULL, false),
('s1-2', 'suite-1', 'Toiletry restock (organic soaps, shampoo, conditioner, dental kit)', NULL, true, 'Kunal Singh', '2026-09-01T07:18:00Z', NULL, false),
('s1-3', 'suite-1', 'AC remote test, thermostat set to 23°C & filter check', NULL, true, 'Kunal Singh', '2026-09-01T07:22:00Z', NULL, false),
('s1-4', 'suite-1', 'Washroom deep cleanliness, mirror shine & hot water geyser test', NULL, true, 'Kunal Singh', '2026-09-01T07:28:00Z', NULL, false),

('s2-1', 'suite-2', 'Crisp linen dressing & wardrobe hanger replenishment', NULL, true, 'Kunal Singh', '2026-09-01T07:32:00Z', NULL, false),
('s2-2', 'suite-2', 'Toiletry kit, plush bath towels & floor mat layout', NULL, true, 'Kunal Singh', '2026-09-01T07:35:00Z', NULL, false),
('s2-3', 'suite-2', 'Dual AC & ceiling fan speed regulation verification', NULL, true, 'Kunal Singh', '2026-09-01T07:40:00Z', NULL, false),
('s2-4', 'suite-2', 'Ensuite washroom sanitation & drain flow check', NULL, true, 'Kunal Singh', '2026-09-01T07:44:00Z', NULL, false),

('s3-1', 'suite-3', 'Linen replacement & blackout curtain tracks check', NULL, true, 'Kunal Singh', '2026-09-01T07:48:00Z', NULL, false),
('s3-2', 'suite-3', 'Restock premium bath amenities & vanity mirrors wipe', NULL, true, 'Kunal Singh', '2026-09-01T07:50:00Z', NULL, false),
('s3-3', 'suite-3', 'AC cooling test & ambient side-lamp check', NULL, true, 'Kunal Singh', '2026-09-01T07:52:00Z', NULL, false),
('s3-4', 'suite-3', 'Washroom water pressure & geyser operation check', NULL, false, NULL, NULL, 'Geyser outlet valve leaking slightly. Maintenance ticket logged.', true),

('s4-1', 'suite-4', 'Double bed linen change & extra cozy duvet preparation', NULL, true, 'Kunal Singh', '2026-09-01T07:50:00Z', NULL, false),
('s4-2', 'suite-4', 'Toiletry kit for multi-guest occupancy & fresh towels', NULL, true, 'Kunal Singh', '2026-09-01T07:54:00Z', NULL, false),
('s4-3', 'suite-4', 'In-room AC check and lighting ambiance preset', NULL, true, 'Kunal Singh', '2026-09-01T07:57:00Z', NULL, false),
('s4-4', 'suite-4', 'Washroom deep disinfection & exhaust fan check', NULL, true, 'Kunal Singh', '2026-09-01T08:00:00Z', NULL, false),

('p-1', 'pool', 'Water pH level check (Target: 7.2 - 7.6 pH, Chlorine 1.5ppm)', NULL, true, 'Kunal Singh', '2026-09-01T07:02:00Z', 'pH tested at 7.4 pH - Crystal clear', false),
('p-2', 'pool', 'Recirculation filtration system verification & skimmer basket cleanup', NULL, true, 'Kunal Singh', '2026-09-01T07:05:00Z', NULL, false),
('p-3', 'pool', 'Pool deck floor mop, anti-skid mats & poolside loungers sanitize', NULL, true, 'Kunal Singh', '2026-09-01T07:08:00Z', NULL, false),
('p-4', 'pool', 'Clean pool towel basket restock (12 fresh micro-fiber towels)', NULL, true, 'Kunal Singh', '2026-09-01T07:10:00Z', NULL, false),

('k-1', 'kitchen', 'Appliance functionality test (Microwave, Induction/Gas, Refrigerator, RO purifier)', NULL, true, 'Kunal Singh', '2026-09-01T07:12:00Z', NULL, false),
('k-2', 'kitchen', 'Premium crockery, wine glasses & cutlery inventory verification (16 sets)', NULL, true, 'Kunal Singh', '2026-09-01T07:15:00Z', NULL, false),
('k-3', 'kitchen', 'Gas pipeline / electric induction safety & regulator inspection', NULL, true, 'Kunal Singh', '2026-09-01T07:17:00Z', NULL, false),
('k-4', 'kitchen', 'Tea/Coffee bar restock (Gourmet tea bags, coffee pods, sugar, dairy sachets)', NULL, true, 'Kunal Singh', '2026-09-01T07:20:00Z', NULL, false),

('l-1', 'lounge-pool-table', 'Pool table felt brush & vacuum, level balance verification', NULL, true, 'Kunal Singh', '2026-09-01T07:33:00Z', NULL, false),
('l-2', 'lounge-pool-table', 'Full 16-ball set present, 4 straight cue sticks & cue chalk in tray', NULL, true, 'Kunal Singh', '2026-09-01T07:35:00Z', NULL, false),
('l-3', 'lounge-pool-table', 'Overhead tournament spotlight & ambient accent lighting test', NULL, true, 'Kunal Singh', '2026-09-01T07:38:00Z', NULL, false),
('l-4', 'lounge-pool-table', 'Soundbar Bluetooth reset & leather lounger upholstery polish', NULL, true, 'Kunal Singh', '2026-09-01T07:40:00Z', NULL, false),

('tb-1', 'terrace-balcony', 'Terrace cane lounge setup & weather-resistant cushions deployed', NULL, true, 'Kunal Singh', '2026-09-01T07:21:00Z', NULL, false),
('tb-2', 'terrace-balcony', 'Balcony glass balustrades wiped & safety rail anchor check', NULL, true, 'Kunal Singh', '2026-09-01T07:23:00Z', NULL, false),
('tb-3', 'terrace-balcony', 'Garden view floor swept & potted exotic palms watered', NULL, true, 'Kunal Singh', '2026-09-01T07:25:00Z', NULL, false)
ON CONFLICT (id) DO UPDATE SET
    completed = EXCLUDED.completed,
    checked_by = EXCLUDED.checked_by,
    checked_at = EXCLUDED.checked_at,
    notes = EXCLUDED.notes,
    is_failed = EXCLUDED.is_failed;

-- ============================================================================
-- 7. HOTEL / PROPERTY INVENTORY TRACKING (DAILY LOGS & MONTHLY VIEW)
-- ============================================================================

-- Table: inventory_items
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    unit TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: inventory_daily_logs
CREATE TABLE IF NOT EXISTS inventory_daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    opening_stock INT NOT NULL CHECK (opening_stock >= 0),
    used_count INT NOT NULL DEFAULT 0 CHECK (used_count >= 0),
    added_stock INT NOT NULL DEFAULT 0 CHECK (added_stock >= 0),
    remaining_stock INT NOT NULL DEFAULT 0 CHECK (remaining_stock >= 0),
    logged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_inventory_item_log_date UNIQUE (item_id, log_date)
);

CREATE INDEX IF NOT EXISTS idx_inventory_daily_logs_lookup 
ON inventory_daily_logs (item_id, log_date DESC);

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

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_daily_logs ENABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS "Allow select inventory_daily_logs" ON inventory_daily_logs;
CREATE POLICY "Allow select inventory_daily_logs" 
ON inventory_daily_logs FOR SELECT 
TO public, authenticated, anon 
USING (true);

DROP POLICY IF EXISTS "Allow insert_update inventory_daily_logs" ON inventory_daily_logs;
CREATE POLICY "Allow insert_update inventory_daily_logs" 
ON inventory_daily_logs FOR ALL 
TO authenticated, anon 
USING (true) WITH CHECK (true);

-- View: v_monthly_inventory_summary
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

-- Seed: inventory_items (9 Required Items)
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

-- ============================================================================
-- 8. REALTIME REPLICATION (OPTIONAL FOR SUPABASE LIVE CHAT / UPDATES)
-- ============================================================================
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE staff_users, leads, bookings, tasks, issues, activities, area_checklists, checklist_items, inventory_items, inventory_daily_logs;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

