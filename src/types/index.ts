export type UserRole = 
  | 'Senior Social Media Manager'
  | 'Admin / Owner' 
  | 'Manager' 
  | 'Front Desk / Host' 
  | 'Housekeeping / Ops' 
  | 'Read-Only / Finance';

export interface StaffUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  avatar: string;
  active: boolean;
  pin?: string;
  department?: string;
}

export type LeadSource = 
  | 'Phone' 
  | 'WhatsApp' 
  | 'Instagram' 
  | 'Website' 
  | 'Referral' 
  | 'Direct Walk-in';

export type LeadStatus = 
  | 'NEW' 
  | 'CONTACTED' 
  | 'FOLLOW-UP' 
  | 'QUALIFIED' 
  | 'BOOKING PENDING' 
  | 'WON' 
  | 'LOST';

export type StayPurpose = 
  | 'Family' 
  | 'Friends' 
  | 'Group' 
  | 'Event';

export interface Lead {
  id: string; // e.g. LD-10024
  name: string;
  phone: string; // primary key
  email?: string;
  source: LeadSource;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  stayPurpose: StayPurpose;
  status: LeadStatus;
  assignedStaffId: string;
  scheduledFollowUp?: string; // ISO datetime
  quoteAmount?: number;
  notes?: string;
  lostReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = 
  | 'Enquiry' 
  | 'Hold' 
  | 'Confirmed' 
  | 'Checked-in' 
  | 'Checked-out' 
  | 'Cancelled';

export interface Booking {
  id: string; // e.g. BK-2024-081
  leadId?: string;
  guestId: string;
  guestName: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  stayPurpose: StayPurpose;
  status: BookingStatus;
  
  // Commercials
  totalQuote: number;
  advanceDepositPaid: number;
  balanceDue: number;
  securityDepositAmount: number;
  securityDepositRefunded: boolean;
  
  // Property readiness & inspection flags
  preArrivalInspectionDone: boolean;
  postCheckoutInspectionDone: boolean;
  
  specialRequests?: string;
  notes?: string;
  assignedHostId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GuestPreference {
  category: 'Dietary' | 'Room Setup' | 'Pool & Recreation' | 'Timing' | 'Other';
  note: string;
}

export interface Guest {
  id: string; // e.g. GST-3091
  name: string;
  phone: string; // Deduplication Key
  email?: string;
  city?: string;
  totalStays: number;
  lifetimeValue: number;
  preferences: GuestPreference[];
  serviceNotes: string;
  firstStayDate?: string;
  lastStayDate?: string;
  bookingIds: string[];
  vipStatus?: boolean;
  createdAt: string;
}

export type ActivityType = 
  | 'Call' 
  | 'WhatsApp' 
  | 'Pool Check' 
  | 'Room Inspection' 
  | 'Payment' 
  | 'Guest Request' 
  | 'Status Change' 
  | 'Task Completed'
  | 'Note';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  staffId: string;
  staffName: string;
  relatedLeadId?: string;
  relatedBookingId?: string;
  relatedGuestId?: string;
  relatedIssueId?: string;
  outcome?: string;
}

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskStatus = 'To Do' | 'In Progress' | 'Blocked' | 'Done';
export type TaskCategory = 
  | 'Housekeeping' 
  | 'Maintenance' 
  | 'Front Desk' 
  | 'Guest Request' 
  | 'Follow-up' 
  | 'Inspection';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  category: TaskCategory;
  assignedStaffId: string;
  dueDate: string; // YYYY-MM-DD or ISO
  linkedBookingId?: string;
  linkedAreaId?: string;
  completedAt?: string;
  completedByStaffId?: string;
  createdAt: string;
}

export type PropertyAreaId = 
  | 'suite-1' 
  | 'suite-2' 
  | 'suite-3' 
  | 'suite-4' 
  | 'pool' 
  | 'kitchen' 
  | 'lounge-pool-table' 
  | 'terrace-balcony';

export interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  completed: boolean;
  checkedBy?: string;
  checkedAt?: string;
  notes?: string;
  isFailed?: boolean;
}

export interface AreaChecklist {
  areaId: PropertyAreaId;
  areaName: string;
  areaSubtitle: string;
  iconName: string;
  items: ChecklistItem[];
  lastInspectedAt?: string;
  lastInspectedBy?: string;
  status: 'Ready' | 'In Progress' | 'Needs Attention' | 'Pending Reset';
}

export type IssueCategory = 
  | 'Electrical' 
  | 'Plumbing' 
  | 'Pool' 
  | 'Cleanliness' 
  | 'Amenities' 
  | 'HVAC/AC' 
  | 'Furniture';

export type IssueSeverity = 'Low' | 'Medium' | 'High' | 'Urgent';
export type IssueStatus = 'Open' | 'In Progress' | 'Awaiting Parts' | 'Resolved';

export interface Issue {
  id: string; // e.g. ISS-401
  title: string;
  description: string;
  category: IssueCategory;
  propertyAreaId: PropertyAreaId;
  severity: IssueSeverity;
  status: IssueStatus;
  reportedByStaffId: string;
  assignedToStaffOrVendor: string;
  linkedBookingId?: string;
  impactsUpcomingStay: boolean;
  reportedAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  estimatedCost?: number;
}

// ============================================================================
// INVENTORY & CONSUMABLES TRACKING (SUPABASE SCHEMA)
// ============================================================================

export type InventoryCategory = 'Toiletries' | 'Linen & Bedding' | 'Cleaning Supplies';

export interface InventoryItem {
  id: string; // UUID primary key
  name: string; // Unique item name
  unit: string; // e.g. Kits, Bottles, Pcs, Sets, Litres
  category: InventoryCategory;
  safetyThreshold: number; // Minimum recommended stock before alert
  createdAt?: string;
}

export interface InventoryDailyLog {
  id: string; // UUID
  itemId: string; // FK to inventory_items.id
  logDate: string; // YYYY-MM-DD
  openingStock: number;
  usedCount: number;
  addedStock: number;
  remainingStock: number; // openingStock + addedStock - usedCount
  loggedBy?: string; // FK to auth.users or staff_users
  notes?: string;
  createdAt?: string;
}

export interface MonthlyInventorySummary {
  itemId: string;
  itemName: string;
  unit: string;
  summaryMonth: string; // YYYY-MM
  totalUsed: number;
  totalAdded: number;
  monthOpeningStock: number;
  monthClosingStock: number;
}

// ============================================================================
// SYSTEM TOAST NOTIFICATIONS & STATUS
// ============================================================================

export interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  source?: 'supabase' | 'local' | 'inventory' | 'booking' | 'lead' | 'commercials';
  timestamp: number;
}

// ============================================================================
// COMMERCIALS & EXPENSE TRACKING MODULE (PIXELGROVE SPECIFICATION)
// ============================================================================

export type PredefinedExpenseCategory =
  | 'Marketing & Ads'
  | 'Software & Tools'
  | 'Office Supplies'
  | 'Travel & Transport'
  | 'Food & Beverages'
  | 'Utilities (Electricity, Internet, etc.)'
  | 'Salaries & Wages'
  | 'Miscellaneous';

export type PaymentMethod = 
  | 'Cash' 
  | 'Card' 
  | 'UPI' 
  | 'Bank Transfer' 
  | 'Other';

export interface Expense {
  id: string; // UUID primary key
  userId?: string; // references auth.users / staff
  userName?: string;
  amount: number; // positive number > 0
  category: string; // Predefined or custom category
  date: string; // YYYY-MM-DD (cannot be in future)
  description?: string;
  paymentMethod: PaymentMethod;
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MonthlyBalance {
  id: string; // UUID primary key
  userId?: string;
  month: string; // YYYY-MM (or YYYY-MM-01)
  openingBalance: number;
  totalExpenses?: number;
  closingBalance: number; // computed: openingBalance - totalSpent
  autoCarryForward?: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt: string;
}

export interface ExpenseCategoryItem {
  id: string;
  name: string;
  isPredefined: boolean;
  color?: string;
  icon?: string;
  description?: string;
  createdAt?: string;
}

export type ExpenseCategory = ExpenseCategoryItem;

export interface CategorySpendSummary {
  category: string;
  totalAmount: number;
  percentage: number;
  count: number;
  color: string;
}

export interface DailySpendTrend {
  date: string;
  day: number;
  amount: number;
  count: number;
  isOutlier?: boolean;
}

export interface CommercialsDashboardStats {
  month: string; // YYYY-MM
  totalSpent: number;
  openingBalance: number;
  closingBalance: number;
  avgDailySpend: number;
  expenseCount: number;
  isDeficit: boolean;
  categoryBreakdown: CategorySpendSummary[];
  dailySpendTrends: DailySpendTrend[];
  topExpenses: Expense[];
  paymentMethodBreakdown: { method: PaymentMethod; amount: number; percentage: number; count: number }[];
}

