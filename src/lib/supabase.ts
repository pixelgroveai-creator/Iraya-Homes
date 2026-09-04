import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { 
  StaffUser, 
  Guest, 
  Lead, 
  Booking, 
  Task, 
  Issue, 
  Activity, 
  AreaChecklist, 
  ChecklistItem,
  InventoryItem,
  InventoryDailyLog,
  MonthlyInventorySummary
} from '../types';
import { DEFAULT_INVENTORY_ITEMS } from '../data/inventorySeed';

const STORAGE_KEY_URL = 'iraya_supabase_url';
const STORAGE_KEY_KEY = 'iraya_supabase_anon_key';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

const DEFAULT_SUPABASE_URL = 'https://kbxmxldrwanyupvtcawi.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_-wM1KtzEzYAaNGbbE2y1cQ_UKdy2faI';

// Get credentials from env or local storage or default
export function getSupabaseCredentials(): SupabaseConfig {
  const metaEnv = (import.meta as any)?.env || {};
  const envUrl = (metaEnv.VITE_SUPABASE_URL as string) || '';
  const envKey = (metaEnv.VITE_SUPABASE_ANON_KEY as string) || '';
  
  const localUrl = localStorage.getItem(STORAGE_KEY_URL);
  const localKey = localStorage.getItem(STORAGE_KEY_KEY);

  const url = (localUrl !== null ? localUrl : (envUrl || DEFAULT_SUPABASE_URL)).trim();
  const anonKey = (localKey !== null ? localKey : (envKey || DEFAULT_SUPABASE_ANON_KEY)).trim();

  return {
    url,
    anonKey
  };
}

export function saveSupabaseCredentials(url: string, anonKey: string): void {
  if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
  else localStorage.removeItem(STORAGE_KEY_URL);

  if (anonKey) localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  else localStorage.removeItem(STORAGE_KEY_KEY);

  // Reset client instance
  cachedClient = null;
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const { url, anonKey } = getSupabaseCredentials();
  if (!url || !anonKey) return null;

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export function isSupabaseConnected(): boolean {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(url && anonKey && url.startsWith('http'));
}

// ============================================================================
// DATA FETCHING & MAPPING
// ============================================================================

export interface TableTestResult {
  tableName: string;
  status: 'SUCCESS' | 'ERROR';
  rowCount: number;
  latencyMs: number;
  sampleData?: any[];
  errorMessage?: string;
}

export async function testQueryAllTables(): Promise<{
  allPassed: boolean;
  totalTables: number;
  successCount: number;
  results: TableTestResult[];
}> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client is not initialized. Please verify credentials.');
  }

  const tableList = [
    'staff_users',
    'guests',
    'leads',
    'bookings',
    'tasks',
    'issues',
    'activities',
    'area_checklists',
    'checklist_items',
    'inventory_items',
    'inventory_daily_logs',
    'v_monthly_inventory_summary'
  ];

  const results: TableTestResult[] = [];

  for (const table of tableList) {
    const startTime = performance.now();
    try {
      const { data, count, error } = await client
        .from(table)
        .select('*', { count: 'exact' })
        .limit(3);

      const latencyMs = Math.round(performance.now() - startTime);

      if (error) {
        results.push({
          tableName: table,
          status: 'ERROR',
          rowCount: 0,
          latencyMs,
          errorMessage: error.message
        });
      } else {
        results.push({
          tableName: table,
          status: 'SUCCESS',
          rowCount: count !== null ? count : (data?.length || 0),
          latencyMs,
          sampleData: data || []
        });
      }
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      results.push({
        tableName: table,
        status: 'ERROR',
        rowCount: 0,
        latencyMs,
        errorMessage: err.message || 'Unexpected network exception'
      });
    }
  }

  const successCount = results.filter(r => r.status === 'SUCCESS').length;

  return {
    allPassed: successCount === tableList.length,
    totalTables: tableList.length,
    successCount,
    results
  };
}

export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; tableCount?: number }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase URL and Anon Key are missing or incomplete.' };
  }

  try {
    const { data, error } = await client.from('staff_users').select('id').limit(1);
    if (error) {
      return { success: false, message: `Connected to endpoint, but table query returned: ${error.message}` };
    }
    return { success: true, message: 'Successfully connected and authenticated with Supabase!', tableCount: data?.length || 0 };
  } catch (err: any) {
    return { success: false, message: err.message || 'Connection failed' };
  }
}

// Fetch all 9 tables from Supabase
export async function fetchAllFromSupabase(): Promise<{
  staff?: StaffUser[];
  guests?: Guest[];
  leads?: Lead[];
  bookings?: Booking[];
  tasks?: Task[];
  issues?: Issue[];
  activities?: Activity[];
  checklists?: AreaChecklist[];
} | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const [
      staffRes,
      guestsRes,
      leadsRes,
      bookingsRes,
      tasksRes,
      issuesRes,
      activitiesRes,
      areasRes,
      itemsRes
    ] = await Promise.all([
      client.from('staff_users').select('*'),
      client.from('guests').select('*'),
      client.from('leads').select('*'),
      client.from('bookings').select('*'),
      client.from('tasks').select('*'),
      client.from('issues').select('*'),
      client.from('activities').select('*').order('timestamp', { ascending: false }),
      client.from('area_checklists').select('*'),
      client.from('checklist_items').select('*')
    ]);

    // Map staff
    const staff: StaffUser[] = (staffRes.data || []).map(row => ({
      id: row.id,
      name: row.name,
      role: row.role,
      email: row.email,
      phone: row.phone,
      avatar: row.avatar,
      active: row.active ?? true,
      pin: row.pin || '1234',
      department: row.department || 'Operations'
    }));

    // Map guests
    const guests: Guest[] = (guestsRes.data || []).map(row => ({
      id: row.id,
      name: row.name,
      phone: row.phone,
      email: row.email,
      city: row.city,
      totalStays: row.total_stays || 0,
      lifetimeValue: Number(row.lifetime_value) || 0,
      preferences: Array.isArray(row.preferences) ? row.preferences : [],
      serviceNotes: row.service_notes || '',
      firstStayDate: row.first_stay_date,
      lastStayDate: row.last_stay_date,
      bookingIds: row.booking_ids || [],
      vipStatus: row.vip_status || false,
      createdAt: row.created_at
    }));

    // Map leads
    const leads: Lead[] = (leadsRes.data || []).map(row => ({
      id: row.id,
      name: row.name,
      phone: row.phone,
      email: row.email,
      source: row.source,
      checkInDate: row.check_in_date,
      checkOutDate: row.check_out_date,
      guestCount: row.guest_count || 2,
      stayPurpose: row.stay_purpose,
      status: row.status,
      assignedStaffId: row.assigned_staff_id,
      scheduledFollowUp: row.scheduled_follow_up,
      quoteAmount: Number(row.quote_amount) || undefined,
      notes: row.notes,
      lostReason: row.lost_reason,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    // Map bookings
    const bookings: Booking[] = (bookingsRes.data || []).map(row => ({
      id: row.id,
      leadId: row.lead_id,
      guestId: row.guest_id,
      guestName: row.guest_name,
      guestPhone: row.guest_phone,
      checkInDate: row.check_in_date,
      checkOutDate: row.check_out_date,
      guestCount: row.guest_count || 4,
      stayPurpose: row.stay_purpose,
      status: row.status,
      totalQuote: Number(row.total_quote) || 0,
      advanceDepositPaid: Number(row.advance_deposit_paid) || 0,
      balanceDue: Number(row.balance_due) || 0,
      securityDepositAmount: Number(row.security_deposit_amount) || 0,
      securityDepositRefunded: row.security_deposit_refunded || false,
      preArrivalInspectionDone: row.pre_arrival_inspection_done || false,
      postCheckoutInspectionDone: row.post_checkout_inspection_done || false,
      specialRequests: row.special_requests,
      notes: row.notes,
      assignedHostId: row.assigned_host_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    // Map tasks
    const tasks: Task[] = (tasksRes.data || []).map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      priority: row.priority,
      status: row.status,
      category: row.category,
      assignedStaffId: row.assigned_staff_id,
      dueDate: row.due_date,
      linkedBookingId: row.linked_booking_id,
      linkedAreaId: row.linked_area_id,
      completedAt: row.completed_at,
      completedByStaffId: row.completed_by_staff_id,
      createdAt: row.created_at
    }));

    // Map issues
    const issues: Issue[] = (issuesRes.data || []).map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      propertyAreaId: row.property_area_id,
      severity: row.severity,
      status: row.status,
      reportedByStaffId: row.reported_by_staff_id,
      assignedToStaffOrVendor: row.assigned_to_staff_or_vendor,
      linkedBookingId: row.linked_booking_id,
      impactsUpcomingStay: row.impacts_upcoming_stay || false,
      reportedAt: row.reported_at,
      resolvedAt: row.resolved_at,
      resolutionNotes: row.resolution_notes,
      estimatedCost: Number(row.estimated_cost) || 0
    }));

    // Map activities
    const activities: Activity[] = (activitiesRes.data || []).map(row => ({
      id: row.id,
      type: row.type,
      title: row.title,
      description: row.description,
      timestamp: row.timestamp,
      staffId: row.staff_id,
      staffName: row.staff_name,
      relatedLeadId: row.related_lead_id,
      relatedBookingId: row.related_booking_id,
      relatedGuestId: row.related_guest_id,
      relatedIssueId: row.related_issue_id,
      outcome: row.outcome
    }));

    // Map checklists & items
    const rawItems = itemsRes.data || [];
    const checklists: AreaChecklist[] = (areasRes.data || []).map(area => {
      const areaItems: ChecklistItem[] = rawItems
        .filter(item => item.area_id === area.area_id)
        .map(item => ({
          id: item.id,
          label: item.label,
          description: item.description,
          completed: item.completed || false,
          checkedBy: item.checked_by,
          checkedAt: item.checked_at,
          notes: item.notes,
          isFailed: item.is_failed || false
        }));

      return {
        areaId: area.area_id,
        areaName: area.area_name,
        areaSubtitle: area.area_subtitle,
        iconName: area.icon_name,
        status: area.status,
        lastInspectedAt: area.last_inspected_at,
        lastInspectedBy: area.last_inspected_by,
        items: areaItems
      };
    });

    return {
      staff,
      guests,
      leads,
      bookings,
      tasks,
      issues,
      activities,
      checklists
    };
  } catch (err) {
    console.error('Error fetching data from Supabase:', err);
    return null;
  }
}

// ============================================================================
// MUTATIONS (UPSERTS & DELETES)
// ============================================================================

export async function dbUpsertLead(lead: Lead): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  const { error } = await client.from('leads').upsert({
    id: lead.id,
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    source: lead.source,
    check_in_date: lead.checkInDate,
    check_out_date: lead.checkOutDate,
    guest_count: lead.guestCount,
    stay_purpose: lead.stayPurpose,
    status: lead.status,
    assigned_staff_id: lead.assignedStaffId || null,
    scheduled_follow_up: lead.scheduledFollowUp || null,
    quote_amount: lead.quoteAmount || null,
    notes: lead.notes || null,
    lost_reason: lead.lostReason || null,
    updated_at: new Date().toISOString()
  });
  if (error) throw new Error(`[leads table]: ${error.message}`);
}

export async function dbDeleteLead(id: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.from('leads').delete().eq('id', id);
  if (error) throw new Error(`[leads delete]: ${error.message}`);
}

export async function dbUpsertBooking(booking: Booking): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  const { error } = await client.from('bookings').upsert({
    id: booking.id,
    lead_id: booking.leadId || null,
    guest_id: booking.guestId,
    guest_name: booking.guestName,
    guest_phone: booking.guestPhone,
    check_in_date: booking.checkInDate,
    check_out_date: booking.checkOutDate,
    guest_count: booking.guestCount,
    stay_purpose: booking.stayPurpose,
    status: booking.status,
    total_quote: booking.totalQuote,
    advance_deposit_paid: booking.advanceDepositPaid,
    balance_due: booking.balanceDue,
    security_deposit_amount: booking.securityDepositAmount,
    security_deposit_refunded: booking.securityDepositRefunded,
    pre_arrival_inspection_done: booking.preArrivalInspectionDone,
    post_checkout_inspection_done: booking.postCheckoutInspectionDone,
    special_requests: booking.specialRequests || null,
    notes: booking.notes || null,
    assigned_host_id: booking.assignedHostId || null,
    updated_at: new Date().toISOString()
  });
  if (error) throw new Error(`[bookings table]: ${error.message}`);
}

export async function dbDeleteBooking(id: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.from('bookings').delete().eq('id', id);
  if (error) throw new Error(`[bookings delete]: ${error.message}`);
}

export async function dbUpsertGuest(guest: Guest): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  const { error } = await client.from('guests').upsert({
    id: guest.id,
    name: guest.name,
    phone: guest.phone,
    email: guest.email || null,
    city: guest.city || null,
    total_stays: guest.totalStays,
    lifetime_value: guest.lifetimeValue,
    preferences: guest.preferences || [],
    service_notes: guest.serviceNotes || null,
    first_stay_date: guest.firstStayDate || null,
    last_stay_date: guest.lastStayDate || null,
    booking_ids: guest.bookingIds || [],
    vip_status: guest.vipStatus || false,
    updated_at: new Date().toISOString()
  });
  if (error) throw new Error(`[guests table]: ${error.message}`);
}

export async function dbUpsertTask(task: Task): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  const { error } = await client.from('tasks').upsert({
    id: task.id,
    title: task.title,
    description: task.description || null,
    priority: task.priority,
    status: task.status,
    category: task.category,
    assigned_staff_id: task.assignedStaffId,
    due_date: task.dueDate,
    linked_booking_id: task.linkedBookingId || null,
    linked_area_id: task.linkedAreaId || null,
    completed_at: task.completedAt || null,
    completed_by_staff_id: task.completedByStaffId || null,
    updated_at: new Date().toISOString()
  });
  if (error) throw new Error(`[tasks table]: ${error.message}`);
}

export async function dbDeleteTask(id: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.from('tasks').delete().eq('id', id);
  if (error) throw new Error(`[tasks delete]: ${error.message}`);
}

export async function dbUpsertIssue(issue: Issue): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  const { error } = await client.from('issues').upsert({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    category: issue.category,
    property_area_id: issue.propertyAreaId,
    severity: issue.severity,
    status: issue.status,
    reported_by_staff_id: issue.reportedByStaffId,
    assigned_to_staff_or_vendor: issue.assignedToStaffOrVendor,
    linked_booking_id: issue.linkedBookingId || null,
    impacts_upcoming_stay: issue.impactsUpcomingStay,
    reported_at: issue.reportedAt,
    resolved_at: issue.resolvedAt || null,
    resolution_notes: issue.resolutionNotes || null,
    estimated_cost: issue.estimatedCost || 0,
    updated_at: new Date().toISOString()
  });
  if (error) throw new Error(`[issues table]: ${error.message}`);
}

export async function dbUpsertActivity(activity: Activity): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  const { error } = await client.from('activities').upsert({
    id: activity.id,
    type: activity.type,
    title: activity.title,
    description: activity.description,
    timestamp: activity.timestamp,
    staff_id: activity.staffId,
    staff_name: activity.staffName,
    related_lead_id: activity.relatedLeadId || null,
    related_booking_id: activity.relatedBookingId || null,
    related_guest_id: activity.relatedGuestId || null,
    related_issue_id: activity.relatedIssueId || null,
    outcome: activity.outcome || null
  });
  if (error) throw new Error(`[activities table]: ${error.message}`);
}

export async function dbUpsertChecklistItem(areaId: string, item: ChecklistItem): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  const { error } = await client.from('checklist_items').upsert({
    id: item.id,
    area_id: areaId,
    label: item.label,
    description: item.description || null,
    completed: item.completed,
    checked_by: item.checkedBy || null,
    checked_at: item.checkedAt || null,
    notes: item.notes || null,
    is_failed: item.isFailed || false,
    updated_at: new Date().toISOString()
  });
  if (error) throw new Error(`[checklist_items table]: ${error.message}`);
}

export async function dbUpsertAreaChecklist(area: AreaChecklist): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  const { error } = await client.from('area_checklists').upsert({
    area_id: area.areaId,
    area_name: area.areaName,
    area_subtitle: area.areaSubtitle || null,
    icon_name: area.iconName,
    status: area.status,
    last_inspected_at: area.lastInspectedAt || null,
    last_inspected_by: area.lastInspectedBy || null,
    updated_at: new Date().toISOString()
  });
  if (error) throw new Error(`[area_checklists table]: ${error.message}`);
}

export async function dbUpsertStaff(staff: StaffUser): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  const { error } = await client.from('staff_users').upsert({
    id: staff.id,
    name: staff.name,
    role: staff.role,
    email: staff.email,
    phone: staff.phone,
    avatar: staff.avatar || null,
    active: staff.active,
    pin: staff.pin || '1234',
    department: staff.department || 'Operations',
    updated_at: new Date().toISOString()
  });
  if (error) throw new Error(`[staff_users table]: ${error.message}`);
}

// ============================================================================
// REALTIME SUBSCRIPTION
// ============================================================================

export function subscribeToSupabaseRealtime(
  onTableChange: (tableName: string, eventType: string, newRow: any, oldRow: any) => void
): RealtimeChannel | null {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const channel = client
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => {
          onTableChange(payload.table, payload.eventType, payload.new, payload.old);
        }
      )
      .subscribe();

    return channel;
  } catch (err) {
    console.error('Failed to subscribe to Supabase Realtime channel:', err);
    return null;
  }
}

// ============================================================================
// INVENTORY & CONSUMABLES DATABASE METHODS
// ============================================================================

export async function fetchInventoryItemsFromDb(): Promise<InventoryItem[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('inventory_items')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.warn('Could not fetch inventory_items from Supabase:', error.message);
      return null;
    }

    if (!data || data.length === 0) return null;

    return data.map(row => ({
      id: row.id,
      name: row.name,
      unit: row.unit,
      category: (row.category || (
        row.name.toLowerCase().includes('cleaner') ? 'Cleaning Supplies' :
        row.name.toLowerCase().includes('kit') || row.name.toLowerCase().includes('shampoo') || row.name.toLowerCase().includes('wash') ? 'Toiletries' :
        'Linen & Bedding'
      )),
      safetyThreshold: row.safety_threshold || 10,
      createdAt: row.created_at
    }));
  } catch (err) {
    console.warn('Error querying inventory_items table:', err);
    return null;
  }
}

export async function fetchDailyLogsForDateFromDb(dateStr: string): Promise<InventoryDailyLog[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('inventory_daily_logs')
      .select('*')
      .eq('log_date', dateStr);

    if (error) {
      console.warn(`Error fetching daily logs for ${dateStr}:`, error.message);
      return null;
    }

    if (!data) return null;

    return data.map(row => ({
      id: row.id,
      itemId: row.item_id,
      logDate: row.log_date,
      openingStock: row.opening_stock ?? 0,
      usedCount: row.used_count ?? 0,
      addedStock: row.added_stock ?? 0,
      remainingStock: row.remaining_stock ?? 0,
      loggedBy: row.logged_by || undefined,
      notes: row.notes || '',
      createdAt: row.created_at
    }));
  } catch (err) {
    console.warn(`Exception querying daily logs for ${dateStr}:`, err);
    return null;
  }
}

/**
 * Pre-population Logic:
 * Queries the backend for the previous day's remaining_stock (or latest log prior to dateStr)
 * to automatically pre-fill today's opening_stock for each item.
 */
export async function fetchPreviousDayStockFromDb(dateStr: string): Promise<Record<string, number> | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    // Look up latest logs strictly prior to dateStr
    const { data, error } = await client
      .from('inventory_daily_logs')
      .select('item_id, remaining_stock, log_date')
      .lt('log_date', dateStr)
      .order('log_date', { ascending: false });

    if (error || !data) {
      console.warn(`Could not query previous day logs before ${dateStr}:`, error?.message);
      return null;
    }

    const previousStockMap: Record<string, number> = {};
    for (const row of data) {
      if (previousStockMap[row.item_id] === undefined) {
        previousStockMap[row.item_id] = Number(row.remaining_stock) || 0;
      }
    }

    return previousStockMap;
  } catch (err) {
    console.warn(`Exception calculating previous day stock before ${dateStr}:`, err);
    return null;
  }
}

/**
 * Batch upsert API request to Supabase on submit so staff can re-submit
 * or update entries for the day without duplicating rows.
 */
export async function batchUpsertDailyLogsToDb(
  logs: InventoryDailyLog[]
): Promise<{ success: boolean; count: number; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, count: 0, error: 'Supabase client not connected' };
  }

  try {
    // 1. Proactively ensure the 9 master items exist in inventory_items to satisfy foreign key constraints
    try {
      const defaultItemRows = DEFAULT_INVENTORY_ITEMS.map(i => ({
        id: i.id,
        name: i.name,
        unit: i.unit
      }));
      await client
        .from('inventory_items')
        .upsert(defaultItemRows, { onConflict: 'id', ignoreDuplicates: true });
    } catch (itemSeedErr) {
      console.warn('Inventory items master pre-seed notice:', itemSeedErr);
    }

    // 2. Prepare daily log rows.
    // NOTE: PostgreSQL column `id` is UUID. If a client ID is not a valid 36-character UUID
    // (e.g. LOG-xxx), we omit `id` so PostgreSQL generates `gen_random_uuid()` on insert,
    // and updates existing rows by the unique constraint (item_id, log_date).
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    const payload = logs.map(log => {
      const opening = Math.max(0, Number(log.openingStock) || 0);
      const used = Math.max(0, Number(log.usedCount) || 0);
      const added = Math.max(0, Number(log.addedStock) || 0);
      const remaining = Math.max(0, opening + added - used);

      const row: Record<string, any> = {
        item_id: log.itemId,
        log_date: log.logDate,
        opening_stock: opening,
        used_count: used,
        added_stock: added,
        remaining_stock: remaining,
        notes: log.notes ? log.notes.trim() : null
      };

      if (log.id && uuidRegex.test(log.id)) {
        row.id = log.id;
      }

      return row;
    });

    const { data, error } = await client
      .from('inventory_daily_logs')
      .upsert(payload, { onConflict: 'item_id,log_date' })
      .select();

    if (error) {
      console.error('Batch upsert to inventory_daily_logs failed:', error);
      return { success: false, count: 0, error: error.message };
    }

    return { success: true, count: data ? data.length : payload.length };
  } catch (err: any) {
    console.error('Batch upsert exception:', err);
    return { success: false, count: 0, error: err.message || 'Network exception' };
  }
}

/**
 * Monthly Summary Data Fetching:
 * Queries the v_monthly_inventory_summary database view using Supabase client library
 * based on the selected month (YYYY-MM).
 */
export async function fetchMonthlySummaryFromView(
  summaryMonth: string // YYYY-MM
): Promise<MonthlyInventorySummary[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('v_monthly_inventory_summary')
      .select('*')
      .eq('summary_month', summaryMonth);

    if (error) {
      console.warn(`Could not query v_monthly_inventory_summary for ${summaryMonth}:`, error.message);
      return null;
    }

    if (!data || data.length === 0) return null;

    return data.map(row => ({
      itemId: row.item_id,
      itemName: row.item_name,
      unit: row.unit,
      summaryMonth: row.summary_month,
      totalUsed: Number(row.total_used) || 0,
      totalAdded: Number(row.total_added) || 0,
      monthOpeningStock: Number(row.month_opening_stock) || 0,
      monthClosingStock: Number(row.month_closing_stock) || 0
    }));
  } catch (err) {
    console.warn(`Exception reading v_monthly_inventory_summary:`, err);
    return null;
  }
}

