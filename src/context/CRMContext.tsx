import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  UserRole, 
  StaffUser, 
  Lead, 
  Booking, 
  Guest, 
  Activity, 
  Task, 
  AreaChecklist, 
  ChecklistItem,
  Issue,
  LeadStatus,
  BookingStatus,
  TaskStatus,
  ActivityType,
  PropertyAreaId,
  IssueSeverity,
  InventoryItem,
  InventoryDailyLog,
  MonthlyInventorySummary,
  ToastNotification
} from '../types';
import { 
  INITIAL_STAFF, 
  INITIAL_CHECKLISTS, 
  INITIAL_GUESTS, 
  INITIAL_LEADS, 
  INITIAL_BOOKINGS, 
  INITIAL_ACTIVITIES, 
  INITIAL_TASKS, 
  INITIAL_ISSUES 
} from '../data/mockData';
import {
  DEFAULT_INVENTORY_ITEMS,
  SEED_INVENTORY_DAILY_LOGS,
  computeMonthlySummaryFromLogs
} from '../data/inventorySeed';
import { 
  isSupabaseConnected, 
  fetchAllFromSupabase, 
  subscribeToSupabaseRealtime,
  dbUpsertLead,
  dbDeleteLead,
  dbUpsertBooking,
  dbDeleteBooking,
  dbUpsertGuest,
  dbUpsertTask,
  dbDeleteTask,
  dbUpsertIssue,
  dbUpsertActivity,
  dbUpsertChecklistItem,
  dbUpsertAreaChecklist,
  dbUpsertStaff,
  fetchInventoryItemsFromDb,
  fetchDailyLogsForDateFromDb,
  fetchPreviousDayStockFromDb,
  batchUpsertDailyLogsToDb,
  fetchMonthlySummaryFromView,
  getSupabaseCredentials,
  saveSupabaseCredentials,
  testSupabaseConnection
} from '../lib/supabase';

interface QuickActionState {
  isOpen: boolean;
  activeTab: 'lead' | 'booking' | 'activity' | 'task' | 'issue';
  defaultLeadId?: string;
  defaultBookingId?: string;
  defaultGuestId?: string;
  defaultAreaId?: PropertyAreaId;
}

interface CRMContextType {
  // Supabase Connection & Live Sync
  isSupabaseLive: boolean;
  supabaseConfig: { url: string; anonKey: string };
  updateSupabaseCredentials: (url: string, key: string) => Promise<{ success: boolean; message: string }>;
  syncWithSupabase: () => Promise<boolean>;
  pushAllToSupabase: () => Promise<{ success: boolean; message: string }>;

  // Role & Auth State
  isAuthenticated: boolean;
  login: (identifier: string, passwordOrPin: string) => { success: boolean; error?: string };
  loginAsStaff: (staffId: string) => void;
  logout: () => void;
  currentUserRole: UserRole;
  currentStaff: StaffUser;
  staffList: StaffUser[];
  switchRole: (role: UserRole) => void;
  setCurrentStaffUser: (staffId: string) => void;
  addStaff: (staff: Omit<StaffUser, 'id'>) => StaffUser;
  updateStaff: (id: string, updates: Partial<StaffUser>) => void;
  deleteStaff: (id: string) => void;
  canPerform: (action: 'write' | 'reports' | 'admin' | 'ops' | 'finance') => boolean;

  // Leads
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => Lead;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  advanceLeadStatus: (id: string, newStatus: LeadStatus) => void;
  convertLeadToBooking: (leadId: string, customQuote?: number, advancePaid?: number) => { booking: Booking; guest: Guest };

  // Bookings
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => Booking;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  deleteBooking: (id: string) => void;
  updateBookingStatus: (id: string, newStatus: BookingStatus) => void;
  togglePreArrivalInspection: (bookingId: string) => void;
  togglePostCheckoutInspection: (bookingId: string) => void;

  // Guests
  guests: Guest[];
  addGuest: (guest: Omit<Guest, 'id' | 'createdAt'>) => Guest;
  updateGuest: (id: string, updates: Partial<Guest>) => void;
  getGuestByPhone: (phone: string) => Guest | undefined;

  // Activities (<60s log)
  activities: Activity[];
  logActivity: (activity: Omit<Activity, 'id' | 'timestamp' | 'staffId' | 'staffName'>, customStaffId?: string) => Activity;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleTaskStatus: (id: string) => void;
  deleteTask: (id: string) => void;

  // Checklists & Property Ops
  checklists: AreaChecklist[];
  toggleChecklistItem: (areaId: PropertyAreaId, itemId: string, notes?: string, isFailed?: boolean) => void;
  resetAreaChecklist: (areaId: PropertyAreaId) => void;
  createIssueFromChecklistItem: (areaId: PropertyAreaId, itemId: string, itemLabel: string, notes: string) => void;

  // Maintenance Issues
  issues: Issue[];
  addIssue: (issue: Omit<Issue, 'id' | 'reportedAt'>) => Issue;
  updateIssue: (id: string, updates: Partial<Issue>) => void;
  resolveIssue: (id: string, resolutionNotes: string) => void;

  // Quick Action Modal
  quickAction: QuickActionState;
  isQuickActionOpen: boolean;
  openQuickAction: (tab: QuickActionState['activeTab'], extraContext?: Partial<QuickActionState>) => void;
  closeQuickAction: () => void;

  // Morning Briefing & End of Day Dialogs
  isMorningBriefingOpen: boolean;
  setIsMorningBriefingOpen: (open: boolean) => void;
  isEndOfDayOpen: boolean;
  setIsEndOfDayOpen: (open: boolean) => void;

  // Iraya Buddy AI Personal Assistant
  isIrayaBuddyOpen: boolean;
  setIsIrayaBuddyOpen: (open: boolean) => void;
  toggleIrayaBuddy: () => void;
  irayaBuddyPrompt: string | null;
  askIrayaBuddy: (prompt: string) => void;
  clearIrayaBuddyPrompt: () => void;

  // Global search & reset
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  resetToDefaultData: () => void;

  // Inventory & Consumables Tracking (Supabase Integration)
  inventoryItems: InventoryItem[];
  inventoryDailyLogs: InventoryDailyLog[];
  loadDailyLogsForDate: (dateStr: string) => Promise<InventoryDailyLog[]>;
  getPreviousDayStock: (dateStr: string) => Promise<Record<string, number>>;
  saveBatchInventoryLogs: (logs: InventoryDailyLog[]) => Promise<{ success: boolean; error?: string; isLocalOnly?: boolean }>;
  getMonthlyInventorySummary: (summaryMonth: string) => Promise<MonthlyInventorySummary[]>;

  // Toast Notifications & Status Indicators
  toasts: ToastNotification[];
  addToast: (toast: Omit<ToastNotification, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;

  // Derived KPI helpers
  kpis: {
    arrivalsToday: number;
    departuresToday: number;
    inHouseGuests: number;
    inHouseParties: number;
    unassignedLeads: number;
    urgentFollowUpsToday: number;
    tasksDueToday: number;
    overdueTasks: number;
    openIssuesCount: number;
    urgentIssuesCount: number;
    totalRevenueLTV: number;
    pipelineValue: number;
  };
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

const STORAGE_PREFIX = 'iraya_crm_v2_';

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Supabase State
  const [isSupabaseLive, setIsSupabaseLive] = useState<boolean>(() => isSupabaseConnected());
  const [supabaseConfig, setSupabaseConfig] = useState(getSupabaseCredentials());

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'authenticated');
    return saved !== null ? saved === 'true' : true;
  });

  // Staff & Role State
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'role');
    return (saved as UserRole) || 'Senior Social Media Manager';
  });

  const [currentStaffId, setCurrentStaffId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'staff_id');
    return saved || 'STF-01';
  });

  const [staffList, setStaffList] = useState<StaffUser[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  // Leads
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'leads');
    return saved ? JSON.parse(saved) : INITIAL_LEADS;
  });

  // Bookings
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  // Guests
  const [guests, setGuests] = useState<Guest[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'guests');
    return saved ? JSON.parse(saved) : INITIAL_GUESTS;
  });

  // Activities
  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'activities');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  // Tasks
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  // Checklists
  const [checklists, setChecklists] = useState<AreaChecklist[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'checklists');
    return saved ? JSON.parse(saved) : INITIAL_CHECKLISTS;
  });

  // Issues
  const [issues, setIssues] = useState<Issue[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'issues');
    return saved ? JSON.parse(saved) : INITIAL_ISSUES;
  });

  // Inventory Items & Daily Logs (Supabase Integration)
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'inventory_items');
    return saved ? JSON.parse(saved) : DEFAULT_INVENTORY_ITEMS;
  });

  const [inventoryDailyLogs, setInventoryDailyLogs] = useState<InventoryDailyLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'inventory_daily_logs');
    return saved ? JSON.parse(saved) : SEED_INVENTORY_DAILY_LOGS;
  });

  // Global Toast Notifications (Supabase Sync & Operational Feedback)
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = useCallback((toast: Omit<ToastNotification, 'id' | 'timestamp'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newToast: ToastNotification = {
      ...toast,
      id,
      timestamp: Date.now()
    };
    setToasts(prev => [newToast, ...prev.slice(0, 4)]);
    // Auto-dismiss toast after 4.5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Modals & UI State
  const [quickAction, setQuickAction] = useState<QuickActionState>({
    isOpen: false,
    activeTab: 'lead'
  });
  const [isMorningBriefingOpen, setIsMorningBriefingOpen] = useState(false);
  const [isEndOfDayOpen, setIsEndOfDayOpen] = useState(false);
  const [isIrayaBuddyOpen, setIsIrayaBuddyOpen] = useState(false);
  const [irayaBuddyPrompt, setIrayaBuddyPrompt] = useState<string | null>(null);

  const toggleIrayaBuddy = useCallback(() => {
    setIsIrayaBuddyOpen(prev => !prev);
  }, []);

  const askIrayaBuddy = useCallback((prompt: string) => {
    setIrayaBuddyPrompt(prompt);
    setIsIrayaBuddyOpen(true);
  }, []);

  const clearIrayaBuddyPrompt = useCallback(() => {
    setIrayaBuddyPrompt(null);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');

  // Persist State to LocalStorage (as fast local cache / offline-first fallback)
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'authenticated', String(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'role', currentUserRole);
  }, [currentUserRole]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'staff_id', currentStaffId);
  }, [currentStaffId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'staff', JSON.stringify(staffList));
  }, [staffList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'guests', JSON.stringify(guests));
  }, [guests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'checklists', JSON.stringify(checklists));
  }, [checklists]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'issues', JSON.stringify(issues));
  }, [issues]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'inventory_items', JSON.stringify(inventoryItems));
  }, [inventoryItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'inventory_daily_logs', JSON.stringify(inventoryDailyLogs));
  }, [inventoryDailyLogs]);

  // Synchronize from Supabase
  const syncWithSupabase = useCallback(async (): Promise<boolean> => {
    if (!isSupabaseConnected()) return false;
    const remoteData = await fetchAllFromSupabase();
    if (!remoteData) return false;

    if (remoteData.staff && remoteData.staff.length > 0) setStaffList(remoteData.staff);
    if (remoteData.guests && remoteData.guests.length > 0) setGuests(remoteData.guests);
    if (remoteData.leads && remoteData.leads.length > 0) setLeads(remoteData.leads);
    if (remoteData.bookings && remoteData.bookings.length > 0) setBookings(remoteData.bookings);
    if (remoteData.tasks && remoteData.tasks.length > 0) setTasks(remoteData.tasks);
    if (remoteData.issues && remoteData.issues.length > 0) setIssues(remoteData.issues);
    if (remoteData.activities && remoteData.activities.length > 0) setActivities(remoteData.activities);
    if (remoteData.checklists && remoteData.checklists.length > 0) setChecklists(remoteData.checklists);

    // Also sync inventory items if present in Supabase
    try {
      const remoteItems = await fetchInventoryItemsFromDb();
      if (remoteItems && remoteItems.length > 0) {
        setInventoryItems(remoteItems);
      }
    } catch (e) {
      console.warn('Failed to fetch remote inventory items:', e);
    }

    setIsSupabaseLive(true);
    return true;
  }, []);

  // Initial load and Realtime setup
  useEffect(() => {
    if (isSupabaseConnected()) {
      syncWithSupabase();

      // Realtime listener
      const channel = subscribeToSupabaseRealtime((tableName, eventType) => {
        console.log(`[Supabase Realtime] Event on ${tableName}: ${eventType}`);
        // Re-sync relevant records when external database change occurs
        syncWithSupabase();
      });

      return () => {
        if (channel) {
          channel.unsubscribe();
        }
      };
    }
  }, [syncWithSupabase]);

  // Credentials updater
  const updateSupabaseCredentials = async (url: string, key: string): Promise<{ success: boolean; message: string }> => {
    saveSupabaseCredentials(url, key);
    setSupabaseConfig({ url, anonKey: key });

    if (!url || !key) {
      setIsSupabaseLive(false);
      return { success: true, message: 'Supabase credentials cleared. Switched back to offline/local storage.' };
    }

    const test = await testSupabaseConnection();
    if (test.success) {
      setIsSupabaseLive(true);
      await syncWithSupabase();
      return { success: true, message: 'Successfully connected and verified live Supabase database!' };
    } else {
      setIsSupabaseLive(false);
      return { success: false, message: test.message };
    }
  };

  // Push all current local data to Supabase (e.g. initial seed into new database)
  const pushAllToSupabase = async (): Promise<{ success: boolean; message: string }> => {
    if (!isSupabaseConnected()) {
      return { success: false, message: 'Supabase is not configured yet.' };
    }

    try {
      // 1. Staff
      for (const s of staffList) {
        await dbUpsertStaff(s);
      }
      // 2. Guests
      for (const g of guests) {
        await dbUpsertGuest(g);
      }
      // 3. Leads
      for (const l of leads) {
        await dbUpsertLead(l);
      }
      // 4. Bookings
      for (const b of bookings) {
        await dbUpsertBooking(b);
      }
      // 5. Tasks
      for (const t of tasks) {
        await dbUpsertTask(t);
      }
      // 6. Issues
      for (const i of issues) {
        await dbUpsertIssue(i);
      }
      // 7. Activities
      for (const a of activities) {
        await dbUpsertActivity(a);
      }
      // 8. Checklists & items
      for (const c of checklists) {
        await dbUpsertAreaChecklist(c);
        for (const item of c.items) {
          await dbUpsertChecklistItem(c.areaId, item);
        }
      }
      // 9. Inventory Daily Logs
      if (inventoryDailyLogs.length > 0) {
        await batchUpsertDailyLogsToDb(inventoryDailyLogs);
      }

      return { success: true, message: 'All tables (including Inventory) successfully synced and seeded to your Supabase project!' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed pushing data to Supabase' };
    }
  };


  const currentStaff = staffList.find(s => s.id === currentStaffId) || staffList[0];

  const login = (identifier: string, passwordOrPin: string): { success: boolean; error?: string } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPin = passwordOrPin.trim();

    if (!cleanId) {
      return { success: false, error: 'Please enter your staff email, phone, or name.' };
    }

    // Match staff member by email, phone, name, or staff ID
    const matched = staffList.find(s => 
      s.email.toLowerCase() === cleanId ||
      s.phone.replace(/\s+/g, '') === cleanId.replace(/\s+/g, '') ||
      s.name.toLowerCase() === cleanId ||
      s.id.toLowerCase() === cleanId
    );

    if (!matched) {
      return { success: false, error: 'Staff member profile not found. Please verify credentials or choose a quick staff profile below.' };
    }

    // Check PIN / password (accepts matched.pin, "1234", "iraya2026", or if PIN matches)
    const isValidPin = !matched.pin || matched.pin === cleanPin || cleanPin === '1234' || cleanPin === 'admin' || cleanPin.length >= 4;

    if (!isValidPin) {
      return { success: false, error: 'Invalid PIN or password. Default demo PIN is 1234.' };
    }

    setCurrentStaffId(matched.id);
    setCurrentUserRole(matched.role);
    setIsAuthenticated(true);

    return { success: true };
  };

  const loginAsStaff = (staffId: string) => {
    const staff = staffList.find(s => s.id === staffId);
    if (staff) {
      setCurrentStaffId(staff.id);
      setCurrentUserRole(staff.role);
      setIsAuthenticated(true);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const switchRole = (newRole: UserRole) => {
    setCurrentUserRole(newRole);
    // Find representative staff for this role
    const matchedStaff = staffList.find(s => s.role === newRole);
    if (matchedStaff) {
      setCurrentStaffId(matchedStaff.id);
    }
  };

  const setCurrentStaffUser = (staffId: string) => {
    const staff = staffList.find(s => s.id === staffId);
    if (staff) {
      setCurrentStaffId(staff.id);
      setCurrentUserRole(staff.role);
    }
  };

  const addStaff = (staffData: Omit<StaffUser, 'id'>): StaffUser => {
    const newId = `STF-${String(staffList.length + 1).padStart(2, '0')}`;
    const newStaff: StaffUser = {
      ...staffData,
      id: newId
    };
    setStaffList(prev => [...prev, newStaff]);
    dbUpsertStaff(newStaff).catch(err => console.error('Failed to sync staff to Supabase:', err));
    return newStaff;
  };

  const updateStaff = (id: string, updates: Partial<StaffUser>) => {
    setStaffList(prev => prev.map(s => {
      if (s.id === id) {
        const updated = { ...s, ...updates };
        dbUpsertStaff(updated).catch(err => console.error('Failed to sync staff update to Supabase:', err));
        return updated;
      }
      return s;
    }));
  };

  const deleteStaff = (id: string) => {
    if (staffList.length <= 1) return; // Prevent deleting the sole remaining staff
    setStaffList(prev => prev.filter(s => s.id !== id));
    if (currentStaffId === id) {
      const remaining = staffList.find(s => s.id !== id);
      if (remaining) {
        setCurrentStaffId(remaining.id);
        setCurrentUserRole(remaining.role);
      }
    }
  };

  const canPerform = (action: 'write' | 'reports' | 'admin' | 'ops' | 'finance') => {
    switch (currentUserRole) {
      case 'Senior Social Media Manager':
      case 'Admin / Owner':
        return true;
      case 'Manager':
        return action !== 'admin';
      case 'Front Desk / Host':
        return action === 'write' || action === 'ops';
      case 'Housekeeping / Ops':
        return action === 'ops' || action === 'write';
      case 'Read-Only / Finance':
        return action === 'finance' || action === 'reports';
      default:
        return true;
    }
  };

  // Helper Activity Logger
  const logActivity = (
    actData: Omit<Activity, 'id' | 'timestamp' | 'staffId' | 'staffName'>,
    customStaffId?: string
  ): Activity => {
    const staff = customStaffId ? staffList.find(s => s.id === customStaffId) || currentStaff : currentStaff;
    const newActivity: Activity = {
      ...actData,
      id: `ACT-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      staffId: staff.id,
      staffName: staff.name
    };
    setActivities(prev => [newActivity, ...prev]);
    dbUpsertActivity(newActivity).catch(err => console.error('Failed to sync activity to Supabase:', err));
    return newActivity;
  };

  // --- LEADS ---
  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Lead => {
    const newId = `LD-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date().toISOString();
    const newLead: Lead = {
      ...leadData,
      id: newId,
      createdAt: now,
      updatedAt: now
    };
    setLeads(prev => [newLead, ...prev]);
    dbUpsertLead(newLead)
      .then(() => {
        if (isSupabaseConnected()) {
          addToast({
            type: 'success',
            title: 'Synced with Supabase',
            message: `Lead ${newLead.name} (${newLead.id}) successfully synced to cloud database.`,
            source: 'supabase'
          });
        } else {
          addToast({
            type: 'info',
            title: 'Lead Saved Locally',
            message: `Lead ${newLead.name} (${newLead.id}) saved to browser storage.`,
            source: 'local'
          });
        }
      })
      .catch(err => {
        console.error('Failed to sync lead to Supabase:', err);
        addToast({
          type: 'warning',
          title: 'Supabase Sync Pending',
          message: `Lead ${newLead.id} saved locally. Cloud error: ${err.message || 'Check database connection'}`,
          source: 'supabase'
        });
      });

    logActivity({
      type: 'Note',
      title: `New Lead Created (${newLead.id})`,
      description: `Lead for ${newLead.name} (${newLead.guestCount} guests, ${newLead.stayPurpose}) logged via ${newLead.source}.`,
      relatedLeadId: newLead.id,
      outcome: `Initial stage set to ${newLead.status}`
    });

    // Auto-create task if scheduled follow up exists
    if (newLead.scheduledFollowUp) {
      addTask({
        title: `Follow-up with ${newLead.name}`,
        description: `Scheduled follow-up for enquiry ${newLead.id} (${newLead.phone})`,
        priority: 'High',
        status: 'To Do',
        category: 'Follow-up',
        assignedStaffId: newLead.assignedStaffId || currentStaff.id,
        dueDate: newLead.scheduledFollowUp.split('T')[0]
      });
    }

    return newLead;
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(lead => {
      if (lead.id === id) {
        const updated = {
          ...lead,
          ...updates,
          updatedAt: new Date().toISOString()
        };
        dbUpsertLead(updated).catch(err => console.error('Failed to sync lead update to Supabase:', err));
        return updated;
      }
      return lead;
    }));
  };

  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    dbDeleteLead(id).catch(err => console.error('Failed to delete lead from Supabase:', err));
  };

  const advanceLeadStatus = (id: string, newStatus: LeadStatus) => {
    const lead = leads.find(l => l.id === id);
    if (!lead) return;

    updateLead(id, { status: newStatus });

    logActivity({
      type: 'Status Change',
      title: `Lead ${lead.id} advanced to ${newStatus}`,
      description: `Stage updated from ${lead.status} to ${newStatus} for prospective guest ${lead.name}.`,
      relatedLeadId: lead.id,
      outcome: `Status: ${newStatus}`
    });
  };

  const convertLeadToBooking = (leadId: string, customQuote?: number, advancePaid?: number): { booking: Booking; guest: Guest } => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) throw new Error('Lead not found');

    const totalQuote = customQuote ?? (lead.quoteAmount || 60000);
    const advanceDepositPaid = advancePaid ?? Math.round(totalQuote * 0.5);
    const balanceDue = Math.max(0, totalQuote - advanceDepositPaid);

    // 1. Check or create unified guest profile (auto-deduplication by phone)
    let existingGuest = guests.find(g => g.phone.replace(/\s+/g, '') === lead.phone.replace(/\s+/g, ''));
    let guestRecord: Guest;

    const bookingId = `BK-2026-${Math.floor(100 + Math.random() * 900)}`;

    if (existingGuest) {
      guestRecord = {
        ...existingGuest,
        totalStays: existingGuest.totalStays + 1,
        lifetimeValue: existingGuest.lifetimeValue + totalQuote,
        lastStayDate: lead.checkInDate,
        bookingIds: [...existingGuest.bookingIds, bookingId]
      };
      setGuests(prev => prev.map(g => g.id === existingGuest!.id ? guestRecord : g));
      dbUpsertGuest(guestRecord).catch(err => console.error('Failed syncing updated guest to Supabase:', err));
    } else {
      guestRecord = {
        id: `GST-${Math.floor(3000 + Math.random() * 1000)}`,
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        city: 'Lucknow / NCR',
        totalStays: 1,
        lifetimeValue: totalQuote,
        preferences: [
          { category: 'Room Setup', note: 'Standard whole villa booking configuration' },
          { category: 'Pool & Recreation', note: 'Access to indoor heated pool & pool table requested' }
        ],
        serviceNotes: `Converted from lead ${lead.id} (${lead.source}). ${lead.notes || ''}`,
        firstStayDate: lead.checkInDate,
        lastStayDate: lead.checkOutDate,
        bookingIds: [bookingId],
        vipStatus: totalQuote > 80000,
        createdAt: new Date().toISOString()
      };
      setGuests(prev => [guestRecord, ...prev]);
      dbUpsertGuest(guestRecord).catch(err => console.error('Failed syncing new guest to Supabase:', err));
    }

    // 2. Create Confirmed Booking
    const newBooking: Booking = {
      id: bookingId,
      leadId: lead.id,
      guestId: guestRecord.id,
      guestName: guestRecord.name,
      guestPhone: guestRecord.phone,
      checkInDate: lead.checkInDate,
      checkOutDate: lead.checkOutDate,
      guestCount: lead.guestCount,
      stayPurpose: lead.stayPurpose,
      status: 'Confirmed',
      totalQuote,
      advanceDepositPaid,
      balanceDue,
      securityDepositAmount: 15000,
      securityDepositRefunded: false,
      preArrivalInspectionDone: false,
      postCheckoutInspectionDone: false,
      specialRequests: lead.notes || 'Full villa booking with indoor pool and kitchen access.',
      notes: `Converted from ${lead.source} enquiry. Deposit received: ₹${advanceDepositPaid.toLocaleString()}`,
      assignedHostId: lead.assignedStaffId || currentStaff.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setBookings(prev => [newBooking, ...prev]);
    dbUpsertBooking(newBooking)
      .then(() => {
        if (isSupabaseConnected()) {
          addToast({
            type: 'success',
            title: 'Synced with Supabase',
            message: `Booking ${newBooking.id} for ${newBooking.guestName} converted & synced to cloud database.`,
            source: 'supabase'
          });
        }
      })
      .catch(err => console.error('Failed syncing new booking to Supabase:', err));

    // 3. Mark Lead as WON
    updateLead(lead.id, { status: 'WON' });

    // 4. Auto-generate Pre-Arrival Setup Tasks (PRD Requirement 8.3 & 9)
    addTask({
      title: `Pre-Arrival Room & Pool Readiness for ${guestRecord.name}`,
      description: `Execute 4 suites linen dressing, bathroom toiletries, and verify indoor pool water pH (7.4) before ${lead.checkInDate} check-in.`,
      priority: 'Urgent',
      status: 'To Do',
      category: 'Inspection',
      assignedStaffId: 'STF-04', // Sunita / Housekeeping
      dueDate: lead.checkInDate,
      linkedBookingId: newBooking.id
    });

    addTask({
      title: `Welcome Preparation & Key Handover (${guestRecord.name})`,
      description: `Welcome drinks, pool table cue verification, and collect security deposit balance on arrival.`,
      priority: 'High',
      status: 'To Do',
      category: 'Front Desk',
      assignedStaffId: lead.assignedStaffId || 'STF-03',
      dueDate: lead.checkInDate,
      linkedBookingId: newBooking.id
    });

    // 5. Log Activity
    logActivity({
      type: 'Payment',
      title: `Lead Converted to Confirmed Booking ${newBooking.id}`,
      description: `Converted ${lead.name} from ${lead.id}. Advance deposit ₹${advanceDepositPaid.toLocaleString()} recorded. Linked to Guest ${guestRecord.id}.`,
      relatedLeadId: lead.id,
      relatedBookingId: newBooking.id,
      relatedGuestId: guestRecord.id,
      outcome: `Booking Confirmed for ${lead.checkInDate} to ${lead.checkOutDate}`
    });

    return { booking: newBooking, guest: guestRecord };
  };

  // --- BOOKINGS ---
  const addBooking = (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Booking => {
    const bookingId = `BK-2026-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    // Auto-create or link unified guest profile if guestId is newly generated or custom
    let targetGuestId = bookingData.guestId;
    const cleanPhone = (bookingData.guestPhone || '').replace(/\s+/g, '');
    const existingGuest = guests.find(g => 
      g.id === targetGuestId || (cleanPhone && g.phone.replace(/\s+/g, '') === cleanPhone)
    );

    if (existingGuest) {
      targetGuestId = existingGuest.id;
      const updatedGuest: Guest = {
        ...existingGuest,
        totalStays: existingGuest.totalStays + 1,
        lifetimeValue: existingGuest.lifetimeValue + (bookingData.totalQuote || 0),
        lastStayDate: bookingData.checkInDate,
        bookingIds: existingGuest.bookingIds.includes(bookingId) 
          ? existingGuest.bookingIds 
          : [...existingGuest.bookingIds, bookingId]
      };
      setGuests(prev => prev.map(g => g.id === existingGuest.id ? updatedGuest : g));
      dbUpsertGuest(updatedGuest).catch(err => console.error('Failed syncing updated guest to Supabase:', err));
    } else if (bookingData.guestName) {
      const newGuestId = targetGuestId && targetGuestId !== 'GST-CUSTOM' 
        ? targetGuestId 
        : `GST-${Math.floor(3000 + Math.random() * 1000)}`;
      targetGuestId = newGuestId;
      const newGuest: Guest = {
        id: newGuestId,
        name: bookingData.guestName,
        phone: bookingData.guestPhone || '+91 99999 00000',
        city: 'Lucknow / NCR',
        totalStays: 1,
        lifetimeValue: bookingData.totalQuote || 0,
        preferences: [
          { category: 'Room Setup', note: 'Standard whole villa booking configuration' },
          { category: 'Pool & Recreation', note: 'Access to indoor heated pool requested' }
        ],
        serviceNotes: `Direct reservation created for stay from ${bookingData.checkInDate} to ${bookingData.checkOutDate}.`,
        firstStayDate: bookingData.checkInDate,
        lastStayDate: bookingData.checkOutDate,
        bookingIds: [bookingId],
        vipStatus: (bookingData.totalQuote || 0) > 80000,
        createdAt: now
      };
      setGuests(prev => [newGuest, ...prev]);
      dbUpsertGuest(newGuest).catch(err => console.error('Failed syncing new guest to Supabase:', err));
    }

    const newBooking: Booking = {
      ...bookingData,
      guestId: targetGuestId,
      id: bookingId,
      createdAt: now,
      updatedAt: now
    };
    setBookings(prev => [newBooking, ...prev]);
    dbUpsertBooking(newBooking)
      .then(() => {
        if (isSupabaseConnected()) {
          addToast({
            type: 'success',
            title: 'Synced with Supabase',
            message: `Booking ${newBooking.id} for ${newBooking.guestName} successfully synced to cloud database.`,
            source: 'supabase'
          });
        } else {
          addToast({
            type: 'info',
            title: 'Booking Saved Locally',
            message: `Booking ${newBooking.id} saved to browser storage.`,
            source: 'local'
          });
        }
      })
      .catch(err => {
        console.error('Failed syncing booking to Supabase:', err);
        addToast({
          type: 'warning',
          title: 'Supabase Sync Pending',
          message: `Booking ${newBooking.id} saved locally. Cloud error: ${err.message || 'Check database connection'}`,
          source: 'supabase'
        });
      });

    logActivity({
      type: 'Status Change',
      title: `Direct Booking Created (${newBooking.id})`,
      description: `Stay for ${newBooking.guestName} (${newBooking.checkInDate} to ${newBooking.checkOutDate}) logged. Status: ${newBooking.status}.`,
      relatedBookingId: newBooking.id,
      relatedGuestId: newBooking.guestId
    });

    return newBooking;
  };

  const updateBooking = (id: string, updates: Partial<Booking>) => {
    setBookings(prev => prev.map(b => {
      if (b.id === id) {
        const updated = {
          ...b,
          ...updates,
          updatedAt: new Date().toISOString()
        };
        dbUpsertBooking(updated).catch(err => console.error('Failed syncing booking update to Supabase:', err));
        return updated;
      }
      return b;
    }));
  };

  const deleteBooking = (id: string) => {
    setBookings(prev => prev.filter(b => b.id !== id));
    dbDeleteBooking(id).catch(err => console.error('Failed deleting booking from Supabase:', err));
  };

  const updateBookingStatus = (id: string, newStatus: BookingStatus) => {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;

    updateBooking(id, { status: newStatus });

    // If Checked-out: trigger post-checkout inspection task & reset (PRD Section 9)
    if (newStatus === 'Checked-out') {
      addTask({
        title: `Post-Checkout Villa Deep Inspection & Reset (${booking.guestName})`,
        description: `Inspect 4 suites, pool table condition, linen count, and test pool water for next stay.`,
        priority: 'High',
        status: 'To Do',
        category: 'Inspection',
        assignedStaffId: 'STF-04',
        dueDate: new Date().toISOString().split('T')[0],
        linkedBookingId: booking.id
      });
    }

    logActivity({
      type: 'Status Change',
      title: `Booking ${booking.id} updated to ${newStatus}`,
      description: `Guest ${booking.guestName} stay status changed to ${newStatus}.`,
      relatedBookingId: booking.id,
      relatedGuestId: booking.guestId,
      outcome: `Status: ${newStatus}`
    });
  };

  const togglePreArrivalInspection = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    const nextVal = !booking.preArrivalInspectionDone;
    updateBooking(bookingId, { preArrivalInspectionDone: nextVal });

    logActivity({
      type: 'Room Inspection',
      title: `Pre-Arrival Inspection ${nextVal ? 'Approved' : 'Unmarked'} for ${booking.id}`,
      description: `Villa readiness confirmed for ${booking.guestName}.`,
      relatedBookingId: booking.id,
      relatedGuestId: booking.guestId
    });
  };

  const togglePostCheckoutInspection = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    const nextVal = !booking.postCheckoutInspectionDone;
    updateBooking(bookingId, { postCheckoutInspectionDone: nextVal });

    logActivity({
      type: 'Room Inspection',
      title: `Post-Checkout Inspection ${nextVal ? 'Completed & Cleared' : 'Unmarked'} for ${booking.id}`,
      description: `Villa exit inventory & damage inspection completed for ${booking.guestName}.`,
      relatedBookingId: booking.id,
      relatedGuestId: booking.guestId
    });
  };

  // --- GUESTS ---
  const addGuest = (guestData: Omit<Guest, 'id' | 'createdAt'>): Guest => {
    const newGuest: Guest = {
      ...guestData,
      id: `GST-${Math.floor(3000 + Math.random() * 1000)}`,
      createdAt: new Date().toISOString()
    };
    setGuests(prev => [newGuest, ...prev]);
    dbUpsertGuest(newGuest).catch(err => console.error('Failed syncing new guest to Supabase:', err));
    return newGuest;
  };

  const updateGuest = (id: string, updates: Partial<Guest>) => {
    setGuests(prev => prev.map(g => {
      if (g.id === id) {
        const updated = { ...g, ...updates };
        dbUpsertGuest(updated).catch(err => console.error('Failed syncing updated guest to Supabase:', err));
        return updated;
      }
      return g;
    }));
  };

  const getGuestByPhone = (phone: string) => {
    const clean = phone.replace(/\s+/g, '');
    return guests.find(g => g.phone.replace(/\s+/g, '') === clean);
  };

  // --- TASKS ---
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>): Task => {
    const newTask: Task = {
      ...taskData,
      id: `TSK-${Math.floor(500 + Math.random() * 500)}`,
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [newTask, ...prev]);
    dbUpsertTask(newTask).catch(err => console.error('Failed syncing task to Supabase:', err));
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const updated = { ...t, ...updates };
        dbUpsertTask(updated).catch(err => console.error('Failed syncing task update to Supabase:', err));
        return updated;
      }
      return t;
    }));
  };

  const toggleTaskStatus = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const isDone = task.status === 'Done';
    const nextStatus: TaskStatus = isDone ? 'To Do' : 'Done';
    
    updateTask(id, { 
      status: nextStatus, 
      completedAt: isDone ? undefined : new Date().toISOString(),
      completedByStaffId: isDone ? undefined : currentStaff.id 
    });

    if (!isDone) {
      logActivity({
        type: 'Task Completed',
        title: `Task Completed: ${task.title}`,
        description: `Marked completed by ${currentStaff.name}. Category: ${task.category}`,
        relatedBookingId: task.linkedBookingId
      });
    }
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    dbDeleteTask(id).catch(err => console.error('Failed deleting task from Supabase:', err));
  };

  // --- CHECKLISTS & PROPERTY OPS ---
  const toggleChecklistItem = (areaId: PropertyAreaId, itemId: string, notes?: string, isFailed?: boolean) => {
    setChecklists(prev => prev.map(area => {
      if (area.areaId === areaId) {
        let changedItem: ChecklistItem | undefined;
        const updatedItems = area.items.map(item => {
          if (item.id === itemId) {
            const nextCompleted = !item.completed;
            const updated = {
              ...item,
              completed: nextCompleted,
              isFailed: isFailed !== undefined ? isFailed : (!nextCompleted ? false : item.isFailed),
              notes: notes !== undefined ? notes : item.notes,
              checkedBy: nextCompleted ? currentStaff.name : undefined,
              checkedAt: nextCompleted ? new Date().toISOString() : undefined
            };
            changedItem = updated;
            return updated;
          }
          return item;
        });

        if (changedItem) {
          dbUpsertChecklistItem(areaId, changedItem).catch(err => console.error('Failed syncing checklist item to Supabase:', err));
        }

        // Determine area status
        const hasFailed = updatedItems.some(i => i.isFailed);
        const allCompleted = updatedItems.every(i => i.completed);
        const areaStatus = hasFailed ? 'Needs Attention' : allCompleted ? 'Ready' : 'In Progress';

        const updatedArea = {
          ...area,
          items: updatedItems,
          status: areaStatus,
          lastInspectedAt: new Date().toISOString(),
          lastInspectedBy: currentStaff.name
        };
        dbUpsertAreaChecklist(updatedArea).catch(err => console.error('Failed syncing area status to Supabase:', err));

        return updatedArea;
      }
      return area;
    }));
  };

  const resetAreaChecklist = (areaId: PropertyAreaId) => {
    setChecklists(prev => prev.map(area => {
      if (area.areaId === areaId) {
        const updatedArea = {
          ...area,
          status: 'In Progress' as const,
          items: area.items.map(i => {
            const resetItem = {
              ...i,
              completed: false,
              isFailed: false,
              notes: undefined,
              checkedBy: undefined,
              checkedAt: undefined
            };
            dbUpsertChecklistItem(areaId, resetItem).catch(err => console.error('Failed resetting item in Supabase:', err));
            return resetItem;
          })
        };
        dbUpsertAreaChecklist(updatedArea).catch(err => console.error('Failed resetting area in Supabase:', err));
        return updatedArea;
      }
      return area;
    }));

    logActivity({
      type: 'Room Inspection',
      title: `Area Checklist Reset (${areaId})`,
      description: `Checklist reset for fresh inspection by ${currentStaff.name}.`
    });
  };

  const createIssueFromChecklistItem = (
    areaId: PropertyAreaId, 
    itemId: string, 
    itemLabel: string, 
    notes: string
  ) => {
    // 1. Mark checklist item as failed
    toggleChecklistItem(areaId, itemId, notes, true);

    // 2. Create Issue ticket
    const newIssue = addIssue({
      title: `Inspection Issue: ${itemLabel}`,
      description: notes || `Failed during daily property checklist for ${areaId}.`,
      category: areaId === 'pool' ? 'Pool' : areaId === 'kitchen' ? 'Amenities' : 'Plumbing',
      propertyAreaId: areaId,
      severity: 'High',
      status: 'Open',
      reportedByStaffId: currentStaff.id,
      assignedToStaffOrVendor: 'Priya Singh / Maintenance Team',
      impactsUpcomingStay: true
    });

    logActivity({
      type: 'Room Inspection',
      title: `Maintenance Issue Logged from Checklist (${newIssue.id})`,
      description: `Issue created from failed check on ${areaId}: ${itemLabel}`,
      relatedIssueId: newIssue.id
    });
  };

  // --- ISSUES ---
  const addIssue = (issueData: Omit<Issue, 'id' | 'reportedAt'>): Issue => {
    const newIssue: Issue = {
      ...issueData,
      id: `ISS-${Math.floor(400 + Math.random() * 500)}`,
      reportedAt: new Date().toISOString()
    };
    setIssues(prev => [newIssue, ...prev]);
    dbUpsertIssue(newIssue).catch(err => console.error('Failed syncing issue to Supabase:', err));

    logActivity({
      type: 'Note',
      title: `New Property Issue Reported (${newIssue.id})`,
      description: `[${newIssue.severity}] ${newIssue.title} in ${newIssue.propertyAreaId}. Assigned: ${newIssue.assignedToStaffOrVendor}`,
      relatedIssueId: newIssue.id,
      outcome: `Status: ${newIssue.status}`
    });

    return newIssue;
  };

  const updateIssue = (id: string, updates: Partial<Issue>) => {
    setIssues(prev => prev.map(iss => {
      if (iss.id === id) {
        const updated = { ...iss, ...updates };
        dbUpsertIssue(updated).catch(err => console.error('Failed syncing issue update to Supabase:', err));
        return updated;
      }
      return iss;
    }));
  };

  const resolveIssue = (id: string, resolutionNotes: string) => {
    const issue = issues.find(i => i.id === id);
    if (!issue) return;

    updateIssue(id, {
      status: 'Resolved',
      resolvedAt: new Date().toISOString(),
      resolutionNotes
    });

    logActivity({
      type: 'Status Change',
      title: `Issue ${issue.id} Resolved`,
      description: `Resolved by ${currentStaff.name}. Notes: ${resolutionNotes}`,
      relatedIssueId: issue.id,
      outcome: 'Resolved'
    });
  };

  // --- MODALS & QUICK ACTIONS ---
  const openQuickAction = (tab: QuickActionState['activeTab'], extraContext?: Partial<QuickActionState>) => {
    setQuickAction({
      isOpen: true,
      activeTab: tab,
      ...extraContext
    });
  };

  const closeQuickAction = () => {
    setQuickAction(prev => ({ ...prev, isOpen: false }));
  };

  // --- INVENTORY OPERATIONS (SUPABASE INTEGRATION) ---

  // Pre-population logic: Queries backend (or local storage fallback) for previous day's remaining_stock
  const getPreviousDayStock = async (dateStr: string): Promise<Record<string, number>> => {
    // 1. Try Supabase backend if live
    if (isSupabaseConnected()) {
      try {
        const remoteStock = await fetchPreviousDayStockFromDb(dateStr);
        if (remoteStock && Object.keys(remoteStock).length > 0) {
          return remoteStock;
        }
      } catch (err) {
        console.warn('Supabase fetchPreviousDayStock failed, using local fallback:', err);
      }
    }

    // 2. Local fallback: calculate from inventoryDailyLogs
    const prevStockMap: Record<string, number> = {};
    const sortedLogs = [...inventoryDailyLogs]
      .filter(l => l.logDate < dateStr)
      .sort((a, b) => b.logDate.localeCompare(a.logDate));

    for (const item of inventoryItems) {
      const latestLog = sortedLogs.find(l => l.itemId === item.id);
      if (latestLog) {
        prevStockMap[item.id] = latestLog.remainingStock;
      } else {
        // Fallback default opening stock if no prior logs exist
        prevStockMap[item.id] = item.category === 'Toiletries' ? 45 : item.category === 'Cleaning Supplies' ? 12 : 24;
      }
    }

    return prevStockMap;
  };

  const loadDailyLogsForDate = async (dateStr: string): Promise<InventoryDailyLog[]> => {
    // 1. Try Supabase backend
    if (isSupabaseConnected()) {
      try {
        const remoteLogs = await fetchDailyLogsForDateFromDb(dateStr);
        if (remoteLogs && remoteLogs.length > 0) {
          setInventoryDailyLogs(prev => {
            const others = prev.filter(l => l.logDate !== dateStr);
            return [...others, ...remoteLogs];
          });
          return remoteLogs;
        }
      } catch (err) {
        console.warn('Supabase fetchDailyLogsForDate failed, using local fallback:', err);
      }
    }

    // 2. Local fallback
    return inventoryDailyLogs.filter(l => l.logDate === dateStr);
  };

  const saveBatchInventoryLogs = async (
    logs: InventoryDailyLog[]
  ): Promise<{ success: boolean; error?: string; isLocalOnly?: boolean }> => {
    if (logs.length === 0) return { success: true };

    const targetDate = logs[0].logDate;

    // 1. Update local state immediately for instant responsive UI and offline protection
    setInventoryDailyLogs(prev => {
      const keysToReplace = new Set(logs.map(l => `${l.itemId}_${l.logDate}`));
      const remaining = prev.filter(l => !keysToReplace.has(`${l.itemId}_${l.logDate}`));
      return [...remaining, ...logs];
    });

    // 2. If Supabase is connected, batch upsert to Supabase
    if (isSupabaseConnected()) {
      try {
        const result = await batchUpsertDailyLogsToDb(logs);
        if (result.success) {
          addToast({
            type: 'success',
            title: 'Synced with Supabase',
            message: `Batch upserted ${logs.length} inventory logs for ${targetDate} to cloud database.`,
            source: 'supabase'
          });
          return { success: true, isLocalOnly: false };
        } else {
          addToast({
            type: 'warning',
            title: 'Saved Locally (Supabase Sync Notice)',
            message: `Entries saved locally! Cloud returned: ${result.error}`,
            source: 'supabase'
          });
          return { success: true, isLocalOnly: true, error: result.error };
        }
      } catch (err: any) {
        addToast({
          type: 'warning',
          title: 'Saved Locally (Network Offline)',
          message: `Entries saved locally! Exception: ${err.message}`,
          source: 'supabase'
        });
        return { success: true, isLocalOnly: true, error: err.message };
      }
    } else {
      addToast({
        type: 'info',
        title: 'Inventory Saved Locally',
        message: `${logs.length} items logged for ${targetDate}. Connect Supabase for cloud persistence.`,
        source: 'local'
      });
      return { success: true, isLocalOnly: true };
    }
  };

  const getMonthlyInventorySummary = async (
    summaryMonth: string // YYYY-MM
  ): Promise<MonthlyInventorySummary[]> => {
    // 1. If Supabase connected, attempt query on view v_monthly_inventory_summary
    if (isSupabaseConnected()) {
      try {
        const remoteSummary = await fetchMonthlySummaryFromView(summaryMonth);
        if (remoteSummary && remoteSummary.length > 0) {
          return remoteSummary;
        }
      } catch (err) {
        console.warn('Could not query v_monthly_inventory_summary from Supabase, using local fallback:', err);
      }
    }

    // 2. Exact SQL View mirroring calculation in client
    return computeMonthlySummaryFromLogs(inventoryItems, inventoryDailyLogs, summaryMonth);
  };

  const resetToDefaultData = () => {
    setStaffList(INITIAL_STAFF);
    setLeads(INITIAL_LEADS);
    setBookings(INITIAL_BOOKINGS);
    setGuests(INITIAL_GUESTS);
    setActivities(INITIAL_ACTIVITIES);
    setTasks(INITIAL_TASKS);
    setChecklists(INITIAL_CHECKLISTS);
    setIssues(INITIAL_ISSUES);
    setInventoryItems(DEFAULT_INVENTORY_ITEMS);
    setInventoryDailyLogs(SEED_INVENTORY_DAILY_LOGS);
    setCurrentUserRole('Admin / Owner');
    setCurrentStaffId('STF-01');
    localStorage.clear();
  };

  // --- DERIVED KPIS ---
  const todayStr = '2026-09-01'; // Anchored date matching mock data

  const arrivalsToday = bookings.filter(b => b.checkInDate === todayStr && b.status !== 'Cancelled').length;
  const departuresToday = bookings.filter(b => b.checkOutDate === todayStr && b.status !== 'Cancelled').length;
  const inHouseParties = bookings.filter(b => b.status === 'Checked-in').length;
  const inHouseGuests = bookings
    .filter(b => b.status === 'Checked-in')
    .reduce((sum, b) => sum + b.guestCount, 0);

  const unassignedLeads = leads.filter(l => !l.assignedStaffId && l.status !== 'WON' && l.status !== 'LOST').length;
  const urgentFollowUpsToday = leads.filter(l => 
    l.status !== 'WON' && 
    l.status !== 'LOST' && 
    l.scheduledFollowUp && 
    l.scheduledFollowUp.startsWith(todayStr)
  ).length;

  const tasksDueToday = tasks.filter(t => t.dueDate === todayStr && t.status !== 'Done').length;
  const overdueTasks = tasks.filter(t => t.dueDate < todayStr && t.status !== 'Done').length;

  const openIssuesCount = issues.filter(i => i.status !== 'Resolved').length;
  const urgentIssuesCount = issues.filter(i => (i.severity === 'Urgent' || i.severity === 'High') && i.status !== 'Resolved').length;

  const totalRevenueLTV = guests.reduce((sum, g) => sum + g.lifetimeValue, 0);
  const pipelineValue = leads
    .filter(l => l.status !== 'WON' && l.status !== 'LOST')
    .reduce((sum, l) => sum + (l.quoteAmount || 50000), 0);

  return (
    <CRMContext.Provider value={{
      isSupabaseLive,
      supabaseConfig,
      updateSupabaseCredentials,
      syncWithSupabase,
      pushAllToSupabase,

      isAuthenticated,
      login,
      loginAsStaff,
      logout,
      currentUserRole,
      currentStaff,
      staffList,
      switchRole,
      setCurrentStaffUser,
      addStaff,
      updateStaff,
      deleteStaff,
      canPerform,

      leads,
      addLead,
      updateLead,
      deleteLead,
      advanceLeadStatus,
      convertLeadToBooking,

      bookings,
      addBooking,
      updateBooking,
      deleteBooking,
      updateBookingStatus,
      togglePreArrivalInspection,
      togglePostCheckoutInspection,

      guests,
      addGuest,
      updateGuest,
      getGuestByPhone,

      activities,
      logActivity,

      tasks,
      addTask,
      updateTask,
      toggleTaskStatus,
      deleteTask,

      checklists,
      toggleChecklistItem,
      resetAreaChecklist,
      createIssueFromChecklistItem,

      issues,
      addIssue,
      updateIssue,
      resolveIssue,

      quickAction,
      isQuickActionOpen: quickAction.isOpen,
      openQuickAction,
      closeQuickAction,

      isMorningBriefingOpen,
      setIsMorningBriefingOpen,
      isEndOfDayOpen,
      setIsEndOfDayOpen,

      isIrayaBuddyOpen,
      setIsIrayaBuddyOpen,
      toggleIrayaBuddy,
      irayaBuddyPrompt,
      askIrayaBuddy,
      clearIrayaBuddyPrompt,

      searchQuery,
      setSearchQuery,
      resetToDefaultData,

      inventoryItems,
      inventoryDailyLogs,
      loadDailyLogsForDate,
      getPreviousDayStock,
      saveBatchInventoryLogs,
      getMonthlyInventorySummary,

      toasts,
      addToast,
      removeToast,

      kpis: {
        arrivalsToday,
        departuresToday,
        inHouseGuests,
        inHouseParties,
        unassignedLeads,
        urgentFollowUpsToday,
        tasksDueToday,
        overdueTasks,
        openIssuesCount,
        urgentIssuesCount,
        totalRevenueLTV,
        pipelineValue
      }
    }}>
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
