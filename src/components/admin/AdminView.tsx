import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Database, 
  Table, 
  Search, 
  Download, 
  Copy, 
  Check, 
  RefreshCw, 
  Server, 
  Layers, 
  FileText, 
  Code2, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  ArrowUpDown, 
  Eye, 
  X, 
  ExternalLink, 
  Users, 
  CalendarCheck, 
  UserCheck, 
  Package, 
  CheckSquare, 
  AlertTriangle, 
  Activity as ActivityIcon, 
  Sparkles, 
  HardDrive,
  Cpu,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Terminal,
  RotateCcw,
  Lock,
  KeyRound,
  ShieldAlert,
  Receipt,
  Wallet,
  DollarSign
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useCommercials } from '../../context/CommercialsContext';
import { AdminLockScreen } from './AdminLockScreen';
import { AdminSecurityPanel } from './AdminSecurityPanel';
import { 
  Lead, 
  Booking, 
  Guest, 
  Task, 
  Issue, 
  Activity, 
  AreaChecklist, 
  InventoryItem, 
  InventoryDailyLog, 
  StaffUser 
} from '../../types';

type BackendTableKey = 
  | 'leads'
  | 'bookings'
  | 'guests'
  | 'expenses'
  | 'monthly_balances'
  | 'expense_categories'
  | 'inventory_items'
  | 'inventory_daily_logs'
  | 'tasks'
  | 'issues'
  | 'activities'
  | 'checklists'
  | 'staff_users';

interface TableMeta {
  key: BackendTableKey;
  label: string;
  tableName: string;
  description: string;
  icon: React.ElementType;
  primaryKey: string;
  category: 'Commercial' | 'Operations' | 'Inventory' | 'System';
}

const TABLE_METAS: TableMeta[] = [
  {
    key: 'leads',
    label: 'Guest Leads',
    tableName: 'crm_leads',
    description: 'Inbound inquiries from WhatsApp, Airbnb, Direct Calls & Instagram with pipeline states.',
    icon: Users,
    primaryKey: 'id',
    category: 'Commercial'
  },
  {
    key: 'bookings',
    label: 'Bookings & Stays',
    tableName: 'crm_bookings',
    description: 'Confirmed reservations, guest counts, payment status, advance deposits, and stay dates.',
    icon: CalendarCheck,
    primaryKey: 'id',
    category: 'Commercial'
  },
  {
    key: 'guests',
    label: 'Guest Master CRM',
    tableName: 'crm_guests',
    description: 'Master guest profiles with phone deduplication, VIP flags, preferences, and lifetime value.',
    icon: UserCheck,
    primaryKey: 'id',
    category: 'Commercial'
  },
  {
    key: 'expenses',
    label: 'Expenses Ledger',
    tableName: 'expenses',
    description: 'Daily operational expenditure records with amount, category, payment method, vendor and staff audit.',
    icon: Receipt,
    primaryKey: 'id',
    category: 'Commercial'
  },
  {
    key: 'monthly_balances',
    label: 'Monthly Balances',
    tableName: 'monthly_balances',
    description: 'Monthly capital allocation, closing funds, and automatic rollover carry-forward balances.',
    icon: Wallet,
    primaryKey: 'month',
    category: 'Commercial'
  },
  {
    key: 'expense_categories',
    label: 'Expense Categories',
    tableName: 'expense_categories',
    description: 'Commercial expense taxonomy, color tags, and predefined vs custom classification labels.',
    icon: DollarSign,
    primaryKey: 'id',
    category: 'Commercial'
  },
  {
    key: 'inventory_items',
    label: 'Inventory Catalog',
    tableName: 'inventory_items',
    description: 'Stocked items, units, categories (Toiletries, Linen, Cleaning), and safety thresholds.',
    icon: Package,
    primaryKey: 'id',
    category: 'Inventory'
  },
  {
    key: 'inventory_daily_logs',
    label: 'Daily Stock Logs',
    tableName: 'inventory_daily_logs',
    description: 'Daily stock logs tracking opening count, added supplies, guest usage, and balance remaining.',
    icon: Layers,
    primaryKey: 'id',
    category: 'Inventory'
  },
  {
    key: 'tasks',
    label: 'Staff Tasks',
    tableName: 'crm_tasks',
    description: 'Operational jobs for Housekeeping, Front Desk, Maintenance, and Guest Request handling.',
    icon: CheckSquare,
    primaryKey: 'id',
    category: 'Operations'
  },
  {
    key: 'issues',
    label: 'Property Issues',
    tableName: 'crm_issues',
    description: 'Maintenance tickets, severity, estimated costs, and resolution history.',
    icon: AlertTriangle,
    primaryKey: 'id',
    category: 'Operations'
  },
  {
    key: 'checklists',
    label: 'Villa Inspections',
    tableName: 'property_checklists',
    description: 'Room & amenity readiness checklists across all 4 luxury suites, pool deck, and lounge.',
    icon: Sparkles,
    primaryKey: 'areaId',
    category: 'Operations'
  },
  {
    key: 'activities',
    label: 'Audit Activities',
    tableName: 'crm_activities',
    description: 'Immutable system audit trail logging calls, payments, status adjustments, and user actions.',
    icon: ActivityIcon,
    primaryKey: 'id',
    category: 'System'
  },
  {
    key: 'staff_users',
    label: 'Staff Accounts',
    tableName: 'staff_users',
    description: 'Registered team members, RBAC roles, contact details, departments, and active statuses.',
    icon: ShieldCheck,
    primaryKey: 'id',
    category: 'System'
  }
];

interface ServerStats {
  status: string;
  timestamp: string;
  uptimeSeconds: number;
  nodeVersion: string;
  platform: string;
  memoryUsageMb: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
  env: {
    NODE_ENV: string;
    port: number;
    geminiConfigured: boolean;
  };
}

export interface AdminViewProps {
  onReturnToDashboard?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onReturnToDashboard, onNavigateTab }) => {
  const {
    isAdminUnlocked,
    lockAdmin,
    credentials
  } = useAdminAuth();

  const {
    leads,
    bookings,
    guests,
    inventoryItems,
    inventoryDailyLogs,
    tasks,
    issues,
    activities,
    checklists,
    staffList,
    currentStaff,
    currentUserRole,
    switchRole,
    isSupabaseLive,
    supabaseConfig,
    syncWithSupabase,
    pushAllToSupabase,
    resetToDefaultData
  } = useCRM();

  const {
    expenses,
    monthlyBalance,
    categories,
    selectedMonth,
    stats: commercialsStats
  } = useCommercials();

  const [activeTableKey, setActiveTableKey] = useState<BackendTableKey>('leads');
  const [activeViewMode, setActiveViewMode] = useState<'table' | 'json' | 'sql' | 'system' | 'security'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [copiedState, setCopiedState] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Server live statistics
  const [serverStats, setServerStats] = useState<ServerStats | null>(null);
  const [isServerLoading, setIsServerLoading] = useState(false);

  // Fetch server stats
  const fetchServerStats = async () => {
    setIsServerLoading(true);
    try {
      const res = await fetch('/api/admin/system');
      if (res.ok) {
        const data = await res.json();
        setServerStats(data);
      }
    } catch (e) {
      console.warn('Could not fetch server stats:', e);
    } finally {
      setIsServerLoading(false);
    }
  };

  useEffect(() => {
    fetchServerStats();
  }, []);

  // Map backend table keys to their current in-memory datasets
  const tableDataMap = useMemo(() => {
    return {
      leads: leads,
      bookings: bookings,
      guests: guests,
      expenses: expenses,
      monthly_balances: monthlyBalance ? [{
        id: monthlyBalance.id,
        month: monthlyBalance.month,
        openingBalance: monthlyBalance.openingBalance,
        totalExpenses: commercialsStats.totalSpent,
        closingBalance: commercialsStats.closingBalance,
        autoCarryForward: monthlyBalance.autoCarryForward ?? true,
        notes: monthlyBalance.notes || 'Normal Operations',
        updatedAt: monthlyBalance.updatedAt
      }] : [],
      expense_categories: categories,
      inventory_items: inventoryItems,
      inventory_daily_logs: inventoryDailyLogs,
      tasks: tasks,
      issues: issues,
      activities: activities,
      checklists: checklists.map(c => ({
        areaId: c.areaId,
        areaName: c.areaName,
        areaSubtitle: c.areaSubtitle,
        status: c.status,
        lastInspectedAt: c.lastInspectedAt || 'Pending Inspection',
        lastInspectedBy: c.lastInspectedBy || 'Unassigned',
        totalItemsCount: c.items.length,
        passedItemsCount: c.items.filter(i => i.completed && !i.isFailed).length,
        failedItemsCount: c.items.filter(i => i.isFailed).length,
        itemsSummary: c.items.map(i => `${i.label} (${i.completed ? 'Pass' : 'Pending'})`).join('; ')
      })),
      staff_users: staffList
    };
  }, [leads, bookings, guests, expenses, monthlyBalance, commercialsStats, categories, inventoryItems, inventoryDailyLogs, tasks, issues, activities, checklists, staffList]);

  // Current raw data for selected table
  const currentRawData = useMemo(() => {
    return tableDataMap[activeTableKey] || [];
  }, [tableDataMap, activeTableKey]);

  // Summary counts across all tables
  const totalRecordCount = useMemo(() => {
    return (
      leads.length +
      bookings.length +
      guests.length +
      expenses.length +
      (monthlyBalance ? 1 : 0) +
      categories.length +
      inventoryItems.length +
      inventoryDailyLogs.length +
      tasks.length +
      issues.length +
      activities.length +
      checklists.length +
      staffList.length
    );
  }, [leads, bookings, guests, expenses, monthlyBalance, categories, inventoryItems, inventoryDailyLogs, tasks, issues, activities, checklists, staffList]);

  // Derive columns from the first few records
  const tableColumns = useMemo(() => {
    if (!currentRawData || currentRawData.length === 0) return [];
    const keysSet = new Set<string>();
    currentRawData.slice(0, 10).forEach(item => {
      Object.keys(item).forEach(key => keysSet.add(key));
    });
    return Array.from(keysSet);
  }, [currentRawData]);

  // Filter and sort the current table data
  const filteredAndSortedData = useMemo(() => {
    let result = [...currentRawData];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(row => {
        return Object.values(row).some(val => {
          if (val === null || val === undefined) return false;
          if (typeof val === 'object') return JSON.stringify(val).toLowerCase().includes(q);
          return String(val).toLowerCase().includes(q);
        });
      });
    }

    // Sort by field
    if (sortField) {
      result.sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];

        if (valA === valB) return 0;
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        let comp = 0;
        if (typeof valA === 'number' && typeof valB === 'number') {
          comp = valA - valB;
        } else {
          comp = String(valA).localeCompare(String(valB));
        }

        return sortDirection === 'asc' ? comp : -comp;
      });
    }

    return result;
  }, [currentRawData, searchQuery, sortField, sortDirection]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedData.length / (pageSize || 1)));
  const paginatedData = useMemo(() => {
    if (pageSize === 0) return filteredAndSortedData; // All
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedData.slice(start, start + pageSize);
  }, [filteredAndSortedData, currentPage, pageSize]);

  // Reset page when switching tables or searching
  useEffect(() => {
    setCurrentPage(1);
    setSelectedRecord(null);
  }, [activeTableKey, searchQuery, pageSize]);

  const handleSort = (colKey: string) => {
    if (sortField === colKey) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortField('');
        setSortDirection('asc');
      }
    } else {
      setSortField(colKey);
      setSortDirection('asc');
    }
  };

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedState(keyName);
    setTimeout(() => setCopiedState(null), 2000);
  };

  // Export current table as CSV
  const exportCurrentTableCSV = () => {
    if (filteredAndSortedData.length === 0) return;
    const cols = tableColumns;
    const header = cols.join(',');
    const rows = filteredAndSortedData.map(row => {
      return cols.map(c => {
        let val = row[c];
        if (val === null || val === undefined) return '""';
        if (typeof val === 'object') {
          return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        }
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [header, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `iraya_${activeTableKey}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export current table as JSON
  const exportCurrentTableJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredAndSortedData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `iraya_${activeTableKey}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export entire database (All tables) as single JSON backup
  const exportFullDatabaseJSON = () => {
    const fullBackup = {
      meta: {
        system: 'Iraya Homes Villa CRM',
        exportedAt: new Date().toISOString(),
        totalTables: Object.keys(tableDataMap).length,
        totalRecords: totalRecordCount,
        environment: 'Cloud Run / Vite + Express'
      },
      database: tableDataMap
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `iraya_full_database_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCloudSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await pushAllToSupabase();
      setSyncFeedback(res.message);
    } catch (e: any) {
      setSyncFeedback('Error syncing: ' + e.message);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 4000);
    }
  };

  // Format cell display
  const renderCellContent = (value: any, key: string) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">null</span>;
    }
    if (typeof value === 'boolean') {
      return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
          value ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
        }`}>
          {value ? 'TRUE' : 'FALSE'}
        </span>
      );
    }
    if (typeof value === 'number') {
      if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('quote') || key.toLowerCase().includes('deposit') || key.toLowerCase().includes('due') || key.toLowerCase().includes('cost') || key.toLowerCase().includes('value')) {
        return <span className="font-mono font-semibold text-[#2d1217]">₹{value.toLocaleString('en-IN')}</span>;
      }
      return <span className="font-mono">{value}</span>;
    }
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return (
          <span className="bg-[#f0e6e0] text-[#721828] text-[11px] px-1.5 py-0.5 rounded font-mono">
            [{value.length} items]
          </span>
        );
      }
      return (
        <span className="bg-[#f0e6e0] text-[#721828] text-[11px] px-1.5 py-0.5 rounded font-mono truncate max-w-[140px] inline-block">
          {JSON.stringify(value)}
        </span>
      );
    }

    const strVal = String(value);

    // Badges for specific status values
    if (['WON', 'Confirmed', 'Ready', 'Done', 'Resolved'].includes(strVal)) {
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800">{strVal}</span>;
    }
    if (['NEW', 'Enquiry', 'Open', 'To Do', 'Low'].includes(strVal)) {
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-800">{strVal}</span>;
    }
    if (['FOLLOW-UP', 'Hold', 'In Progress', 'Medium'].includes(strVal)) {
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800">{strVal}</span>;
    }
    if (['LOST', 'Cancelled', 'Urgent', 'High', 'Needs Attention'].includes(strVal)) {
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-100 text-rose-800">{strVal}</span>;
    }

    return <span className="truncate max-w-[220px] inline-block" title={strVal}>{strVal}</span>;
  };

  const currentMeta = TABLE_METAS.find(t => t.key === activeTableKey)!;

  // Security Access Guard: Unlocked master credentials required to view backend data
  if (!isAdminUnlocked) {
    return <AdminLockScreen onReturnToDashboard={onReturnToDashboard || (() => {})} />;
  }

  return (
    <div className="space-y-6">
      
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-[#2d1217] via-[#5c1320] to-[#721828] text-white rounded-2xl p-6 sm:p-7 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="bg-white/15 text-amber-200 border border-white/20 text-xs font-mono px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>Administrative Access Mode</span>
              </span>
              <span className="bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 text-xs font-mono px-2.5 py-1 rounded-full flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Admin Session Active ({credentials.username})</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
              Backend Data & System Administration
            </h1>
            <p className="text-sm text-[#e8d5ce] mt-1.5 max-w-3xl leading-relaxed">
              Real-time inspection panel providing unrestricted visibility into all relational tables, audit trails, operational checklists, inventory movements, and system logs for Iraya Homes.
            </p>
          </div>

          {/* Quick Action Buttons & Lock Button */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('commercials')}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
                title="Navigate directly to the Commercials & Expenses Workspace"
              >
                <Receipt className="w-4 h-4 text-emerald-300" />
                <span>Commercials Workspace</span>
              </button>
            )}
            <button
              onClick={lockAdmin}
              className="flex items-center gap-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-100 hover:text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
              title="Immediately lock the administrator session"
            >
              <Lock className="w-4 h-4 text-rose-300" />
              <span>Lock Admin Session</span>
            </button>
            <button
              onClick={exportFullDatabaseJSON}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
              title="Download snapshot of all tables as JSON"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>Full Database JSON</span>
            </button>
            <button
              onClick={handleCloudSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 bg-[#c29342] hover:bg-[#d6a54f] text-[#2d1217] px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
              title="Push local data to Supabase Cloud"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync with Supabase'}</span>
            </button>
          </div>
        </div>

        {/* Sync Feedback Alert */}
        {syncFeedback && (
          <div className="mt-4 bg-white/10 border border-white/20 text-white rounded-xl p-3 text-xs flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{syncFeedback}</span>
            </div>
            <button onClick={() => setSyncFeedback(null)} className="text-white/70 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Overview Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-[#e4d8cf] rounded-xl p-3.5 shadow-2xs">
          <span className="text-[11px] uppercase tracking-wider text-[#7f6b6f] font-semibold flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-[#721828]" />
            Total Records
          </span>
          <p className="text-xl font-serif font-bold text-[#2d1217] mt-1">
            {totalRecordCount.toLocaleString()}
          </p>
          <span className="text-[10px] text-[#968186]">Across {TABLE_METAS.length} primary tables</span>
        </div>

        <div className="bg-white border border-[#e4d8cf] rounded-xl p-3.5 shadow-2xs">
          <span className="text-[11px] uppercase tracking-wider text-[#7f6b6f] font-semibold flex items-center gap-1">
            <Receipt className="w-3.5 h-3.5 text-[#721828]" />
            Commercials Spend
          </span>
          <p className="text-xl font-serif font-bold text-[#721828] mt-1">
            ₹{commercialsStats.totalSpent.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-[#968186]">{expenses.length} logs • ₹{commercialsStats.closingBalance.toLocaleString('en-IN')} closing</span>
        </div>

        <div className="bg-white border border-[#e4d8cf] rounded-xl p-3.5 shadow-2xs">
          <span className="text-[11px] uppercase tracking-wider text-[#7f6b6f] font-semibold flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-blue-700" />
            Leads & Guests
          </span>
          <p className="text-xl font-serif font-bold text-[#2d1217] mt-1">
            {(leads.length + guests.length).toLocaleString()}
          </p>
          <span className="text-[10px] text-[#968186]">{leads.length} leads • {guests.length} guests</span>
        </div>

        <div className="bg-white border border-[#e4d8cf] rounded-xl p-3.5 shadow-2xs">
          <span className="text-[11px] uppercase tracking-wider text-[#7f6b6f] font-semibold flex items-center gap-1">
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-700" />
            Bookings
          </span>
          <p className="text-xl font-serif font-bold text-[#2d1217] mt-1">
            {bookings.length}
          </p>
          <span className="text-[10px] text-[#968186]">Active villa reservations</span>
        </div>

        <div className="bg-white border border-[#e4d8cf] rounded-xl p-3.5 shadow-2xs">
          <span className="text-[11px] uppercase tracking-wider text-[#7f6b6f] font-semibold flex items-center gap-1">
            <Package className="w-3.5 h-3.5 text-amber-700" />
            Inventory Records
          </span>
          <p className="text-xl font-serif font-bold text-[#2d1217] mt-1">
            {(inventoryItems.length + inventoryDailyLogs.length).toLocaleString()}
          </p>
          <span className="text-[10px] text-[#968186]">{inventoryItems.length} items • {inventoryDailyLogs.length} logs</span>
        </div>

        <div className="bg-white border border-[#e4d8cf] rounded-xl p-3.5 shadow-2xs">
          <span className="text-[11px] uppercase tracking-wider text-[#7f6b6f] font-semibold flex items-center gap-1">
            <Server className="w-3.5 h-3.5 text-purple-700" />
            Sync Status
          </span>
          <p className="text-sm font-bold text-[#2d1217] mt-1.5 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isSupabaseLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
            {isSupabaseLive ? 'Live Cloud' : 'Local State'}
          </p>
          <span className="text-[10px] text-[#968186]">Supabase PostgreSQL</span>
        </div>
      </div>

      {/* Main Admin Data Container */}
      <div className="bg-white border border-[#e4d8cf] rounded-2xl shadow-xs overflow-hidden">
        
        {/* Table Selector Pills */}
        <div className="border-b border-[#e4d8cf] bg-[#fbf5f1] p-3 sm:p-4">
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7f6b6f] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#721828]" />
              Select Backend Entity / Database Table:
            </span>

            {/* Current Staff Role Indicator */}
            <div className="flex items-center gap-2 text-xs text-[#7f6b6f]">
              <span>Viewing as: <strong className="text-[#2d1217]">{currentStaff.name} ({currentUserRole})</strong></span>
              {currentUserRole !== 'Admin / Owner' && (
                <button
                  onClick={() => switchRole('Admin / Owner')}
                  className="text-[11px] text-[#721828] font-bold hover:underline cursor-pointer"
                >
                  Switch to Admin
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {TABLE_METAS.map((tbl) => {
              const Icon = tbl.icon;
              const count = tableDataMap[tbl.key]?.length || 0;
              const isActive = activeTableKey === tbl.key;

              return (
                <button
                  key={tbl.key}
                  onClick={() => {
                    setActiveTableKey(tbl.key);
                    if (activeViewMode === 'system') setActiveViewMode('table');
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-[#721828] text-white border-[#721828] shadow-xs'
                      : 'bg-white hover:bg-[#f7efe9] text-[#554347] border-[#e4d8cf] hover:text-[#2d1217]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-[#721828]'}`} />
                  <span>{tbl.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#f0e6e0] text-[#721828]'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}

            {/* System Server Info Tab */}
            <button
              onClick={() => setActiveViewMode('system')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                activeViewMode === 'system'
                  ? 'bg-[#2d1217] text-white border-[#2d1217] shadow-xs'
                  : 'bg-white hover:bg-[#f7efe9] text-[#554347] border-[#e4d8cf]'
              }`}
            >
              <Server className="w-3.5 h-3.5 text-purple-600" />
              <span>Server & Health</span>
            </button>

            {/* Security & Admin Passkey Management Tab */}
            <button
              onClick={() => setActiveViewMode('security')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                activeViewMode === 'security'
                  ? 'bg-[#2d1217] text-white border-[#2d1217] shadow-xs'
                  : 'bg-white hover:bg-[#f7efe9] text-[#554347] border-[#e4d8cf]'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-500" />
              <span>Security & Passkey</span>
            </button>
          </div>
        </div>

        {activeViewMode === 'security' ? (
          <AdminSecurityPanel />
        ) : activeViewMode !== 'system' ? (
          <>
            {/* Table Meta Bar & Controls */}
            <div className="p-4 border-b border-[#e4d8cf] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-serif font-bold text-[#2d1217]">
                    {currentMeta.label}
                  </h2>
                  <code className="text-xs bg-[#f4ece7] text-[#721828] px-2 py-0.5 rounded font-mono">
                    {currentMeta.tableName}
                  </code>
                  <span className="text-xs text-[#7f6b6f]">
                    ({filteredAndSortedData.length} of {currentRawData.length} records)
                  </span>
                </div>
                <p className="text-xs text-[#7f6b6f] mt-0.5">
                  {currentMeta.description}
                </p>
              </div>

              {/* View Mode Switcher + Export Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Mode Switcher */}
                <div className="flex items-center bg-[#f4ece7] p-1 rounded-xl border border-[#e4d8cf]">
                  <button
                    onClick={() => setActiveViewMode('table')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      activeViewMode === 'table'
                        ? 'bg-white text-[#721828] shadow-2xs'
                        : 'text-[#7f6b6f] hover:text-[#2d1217]'
                    }`}
                  >
                    <Table className="w-3.5 h-3.5" />
                    <span>Table</span>
                  </button>
                  <button
                    onClick={() => setActiveViewMode('json')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      activeViewMode === 'json'
                        ? 'bg-white text-[#721828] shadow-2xs'
                        : 'text-[#7f6b6f] hover:text-[#2d1217]'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Raw JSON</span>
                  </button>
                  <button
                    onClick={() => setActiveViewMode('sql')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      activeViewMode === 'sql'
                        ? 'bg-white text-[#721828] shadow-2xs'
                        : 'text-[#7f6b6f] hover:text-[#2d1217]'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>SQL Query</span>
                  </button>
                </div>

                {/* Export CSV & JSON */}
                <button
                  onClick={exportCurrentTableCSV}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-[#f7efe9] border border-[#e4d8cf] text-[#2d1217] rounded-xl text-xs font-medium transition-colors cursor-pointer shadow-2xs"
                  title="Export current table data as CSV spreadsheet"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={exportCurrentTableJSON}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-[#f7efe9] border border-[#e4d8cf] text-[#2d1217] rounded-xl text-xs font-medium transition-colors cursor-pointer shadow-2xs"
                  title="Export current table data as JSON file"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>JSON</span>
                </button>
              </div>
            </div>

            {/* Search & Filter Bar */}
            {activeViewMode === 'table' && (
              <div className="p-3 bg-[#fdfaf8] border-b border-[#e4d8cf] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#968186]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search across all fields in ${currentMeta.label}...`}
                    className="w-full bg-white text-[#2d1217] text-xs rounded-xl pl-9 pr-8 py-2 border border-[#e4d8cf] focus:outline-none focus:border-[#721828] focus:ring-1 focus:ring-[#721828] placeholder-[#968186] shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#968186] hover:text-[#2d1217]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Page Size Selector */}
                <div className="flex items-center gap-2 text-xs text-[#7f6b6f] self-end sm:self-auto">
                  <span>Rows per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="bg-white border border-[#e4d8cf] rounded-lg px-2 py-1 text-xs text-[#2d1217] focus:outline-none focus:border-[#721828]"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={0}>All</option>
                  </select>
                </div>
              </div>
            )}

            {/* TABULAR VIEW */}
            {activeViewMode === 'table' && (
              <div className="relative overflow-x-auto min-h-[360px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#f7efe9] text-[#45373a] uppercase font-mono tracking-wider text-[11px] sticky top-0 border-b border-[#e4d8cf] select-none z-10">
                    <tr>
                      <th className="px-3 py-3 w-10 text-center font-bold text-[#721828]">#</th>
                      <th className="px-3 py-3 w-20 text-center font-bold text-[#721828]">Inspect</th>
                      {tableColumns.map((colKey) => (
                        <th
                          key={colKey}
                          onClick={() => handleSort(colKey)}
                          className="px-4 py-3 cursor-pointer hover:bg-[#efe4dc] transition-colors whitespace-nowrap"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>{colKey}</span>
                            {sortField === colKey ? (
                              sortDirection === 'asc' ? (
                                <ChevronUp className="w-3.5 h-3.5 text-[#721828]" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-[#721828]" />
                              )
                            ) : (
                              <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-50" />
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f2e6de] font-sans">
                    {paginatedData.length > 0 ? (
                      paginatedData.map((row, rowIdx) => {
                        const actualIndex = pageSize > 0 ? (currentPage - 1) * pageSize + rowIdx + 1 : rowIdx + 1;
                        return (
                          <tr
                            key={rowIdx}
                            className="hover:bg-[#fbf7f4] transition-colors cursor-pointer"
                            onClick={() => setSelectedRecord(row)}
                          >
                            <td className="px-3 py-3 text-center font-mono text-[#968186]">
                              {actualIndex}
                            </td>
                            <td className="px-3 py-3 text-center" onClick={(e) => { e.stopPropagation(); setSelectedRecord(row); }}>
                              <button
                                className="p-1 hover:bg-[#f2e6de] text-[#721828] rounded-md transition-colors"
                                title="Inspect Record Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                            {tableColumns.map((colKey) => (
                              <td key={colKey} className="px-4 py-3 whitespace-nowrap text-[#45373a]">
                                {renderCellContent(row[colKey], colKey)}
                              </td>
                            ))}
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={tableColumns.length + 2}
                          className="px-6 py-16 text-center text-[#7f6b6f]"
                        >
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Search className="w-8 h-8 text-[#d8c8c2]" />
                            <p className="font-serif text-sm font-bold text-[#2d1217]">
                              No records found
                            </p>
                            <p className="text-xs text-[#968186]">
                              No data matching &ldquo;{searchQuery}&rdquo; in table {currentMeta.tableName}.
                            </p>
                            {searchQuery && (
                              <button
                                onClick={() => setSearchQuery('')}
                                className="mt-2 text-xs font-semibold text-[#721828] hover:underline"
                              >
                                Clear search query
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* RAW JSON VIEW */}
            {activeViewMode === 'json' && (
              <div className="p-4 bg-[#1e1e1e] text-emerald-300 font-mono text-xs rounded-b-2xl overflow-x-auto min-h-[450px] relative">
                <div className="absolute right-6 top-6 flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(currentRawData, null, 2), 'raw_json')}
                    className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer"
                  >
                    {copiedState === 'raw_json' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="text-gray-400 text-[11px] mb-3 pb-2 border-b border-gray-800">
                  // Full serialized JSON for table `{currentMeta.tableName}` ({currentRawData.length} records)
                </div>
                <pre className="whitespace-pre overflow-x-auto leading-relaxed">
                  {JSON.stringify(currentRawData, null, 2)}
                </pre>
              </div>
            )}

            {/* SQL QUERY VIEW */}
            {activeViewMode === 'sql' && (
              <div className="p-5 bg-[#181920] text-gray-200 font-mono text-xs rounded-b-2xl min-h-[450px]">
                <div className="space-y-6">
                  <div>
                    <div className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-amber-300" />
                      Standard Query Syntax for {currentMeta.tableName}
                    </div>
                    <div className="bg-[#21232d] p-4 rounded-xl border border-gray-800 text-emerald-300 text-xs leading-loose">
                      <span className="text-purple-400">SELECT</span> * <br />
                      <span className="text-purple-400">FROM</span> <span className="text-amber-200 font-bold">{currentMeta.tableName}</span> <br />
                      <span className="text-purple-400">ORDER BY</span> {currentMeta.primaryKey} <span className="text-purple-400">DESC</span> <br />
                      <span className="text-purple-400">LIMIT</span> 50;
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
                      Table Schema Definition & Keys
                    </div>
                    <div className="bg-[#21232d] p-4 rounded-xl border border-gray-800 text-gray-300 text-xs space-y-1.5">
                      <p><span className="text-blue-400">Entity:</span> {currentMeta.label}</p>
                      <p><span className="text-blue-400">Primary Key:</span> <code className="text-amber-300 font-bold">{currentMeta.primaryKey}</code></p>
                      <p><span className="text-blue-400">Current Row Count:</span> {currentRawData.length}</p>
                      <p><span className="text-blue-400">Available Attributes:</span> {tableColumns.join(', ')}</p>
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
                      Direct Export Query
                    </div>
                    <div className="bg-[#21232d] p-4 rounded-xl border border-gray-800 text-xs text-gray-400">
                      <span className="text-purple-400">COPY</span> (SELECT * FROM {currentMeta.tableName}) <span className="text-purple-400">TO STDOUT WITH CSV HEADER;</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            {activeViewMode === 'table' && pageSize > 0 && totalPages > 1 && (
              <div className="p-3 bg-[#fdfaf8] border-t border-[#e4d8cf] flex items-center justify-between text-xs text-[#7f6b6f]">
                <div>
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredAndSortedData.length)} of {filteredAndSortedData.length} records
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1 rounded-lg border border-[#e4d8cf] bg-white hover:bg-[#f7efe9] disabled:opacity-40 disabled:cursor-not-allowed text-[#2d1217] font-semibold transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-2 font-mono text-[#2d1217]">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-2.5 py-1 rounded-lg border border-[#e4d8cf] bg-white hover:bg-[#f7efe9] disabled:opacity-40 disabled:cursor-not-allowed text-[#2d1217] font-semibold transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* SYSTEM & SERVER HEALTH VIEW */
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#2d1217] flex items-center gap-2">
                  <Server className="w-5 h-5 text-purple-700" />
                  Backend Runtime & Environment Diagnostics
                </h3>
                <p className="text-xs text-[#7f6b6f] mt-0.5">
                  Live metrics from Express server and browser client runtime.
                </p>
              </div>
              <button
                onClick={fetchServerStats}
                disabled={isServerLoading}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-[#e4d8cf] hover:bg-[#f7efe9] rounded-xl text-xs font-semibold text-[#2d1217] transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isServerLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Stats</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#fbf5f1] border border-[#e4d8cf] rounded-xl p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7f6b6f] flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-[#721828]" />
                  Node Runtime
                </span>
                <p className="text-xl font-bold font-mono text-[#2d1217] mt-1">
                  {serverStats?.nodeVersion || 'v20.x'}
                </p>
                <span className="text-[11px] text-[#968186]">Platform: {serverStats?.platform || 'linux'}</span>
              </div>

              <div className="bg-[#fbf5f1] border border-[#e4d8cf] rounded-xl p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7f6b6f] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-700" />
                  Server Uptime
                </span>
                <p className="text-xl font-bold font-mono text-[#2d1217] mt-1">
                  {serverStats ? `${Math.floor(serverStats.uptimeSeconds / 60)}m ${serverStats.uptimeSeconds % 60}s` : 'Active'}
                </p>
                <span className="text-[11px] text-[#968186]">Port: 3000 • Dev Server</span>
              </div>

              <div className="bg-[#fbf5f1] border border-[#e4d8cf] rounded-xl p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7f6b6f] flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-emerald-700" />
                  Memory Heap Used
                </span>
                <p className="text-xl font-bold font-mono text-[#2d1217] mt-1">
                  {serverStats?.memoryUsageMb?.heapUsed ? `${serverStats.memoryUsageMb.heapUsed} MB` : '~32 MB'}
                </p>
                <span className="text-[11px] text-[#968186]">RSS: {serverStats?.memoryUsageMb?.rss || 64} MB</span>
              </div>

              <div className="bg-[#fbf5f1] border border-[#e4d8cf] rounded-xl p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7f6b6f] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Gemini API State
                </span>
                <p className="text-base font-bold text-[#2d1217] mt-1 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${serverStats?.env?.geminiConfigured ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                  {serverStats?.env?.geminiConfigured ? 'Live Configured' : 'Knowledge Fallback Active'}
                </p>
                <span className="text-[11px] text-[#968186]">Model: gemini-3.8-flash</span>
              </div>
            </div>

            {/* Supabase Connection State Card */}
            <div className="bg-[#fdfaf8] border border-[#e4d8cf] rounded-2xl p-5">
              <h4 className="text-sm font-serif font-bold text-[#2d1217] mb-2 flex items-center gap-2">
                <Database className="w-4 h-4 text-[#721828]" />
                Supabase PostgreSQL Cloud Connection
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-[#e4d8cf]">
                  <span className="text-[#7f6b6f]">Connection Status:</span>
                  <p className="font-bold text-[#2d1217] mt-0.5 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isSupabaseLive ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                    {isSupabaseLive ? 'Connected & Realtime Sync' : 'Local Mock / Disconnected'}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-[#e4d8cf]">
                  <span className="text-[#7f6b6f]">Configured URL:</span>
                  <p className="font-mono text-[#2d1217] mt-0.5 truncate">
                    {supabaseConfig.url || 'Not configured (Local mode)'}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-[#e4d8cf]">
                  <span className="text-[#7f6b6f]">Anon API Key:</span>
                  <p className="font-mono text-[#2d1217] mt-0.5 truncate">
                    {supabaseConfig.anonKey ? '••••••••' + supabaseConfig.anonKey.slice(-6) : 'None'}
                  </p>
                </div>
              </div>
            </div>

            {/* Reset / Reseed Demo Data */}
            <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-serif font-bold text-rose-900 flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-rose-700" />
                  Reset Demo Database State
                </h4>
                <p className="text-xs text-rose-700/80 mt-0.5 max-w-xl">
                  Resets in-memory and local storage data to the authentic Iraya Homes seed dataset (fresh leads, bookings, inventory stock, and inspection checklists).
                </p>
              </div>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to reset all data to default Iraya Homes demo data?')) {
                    resetToDefaultData();
                  }
                }}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs whitespace-nowrap"
              >
                Reset to Seed Data
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RECORD INSPECTOR MODAL / DRAWER */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e4d8cf] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#2d1217] via-[#5c1320] to-[#721828] text-white p-4.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-300">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-white">
                    Record Inspector: {currentMeta.label}
                  </h3>
                  <p className="text-[11px] text-[#e8d5ce] font-mono">
                    ID: {selectedRecord[currentMeta.primaryKey] || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => copyToClipboard(JSON.stringify(selectedRecord, null, 2), 'single_record')}
                  className="flex items-center gap-1 text-[11px] font-mono bg-white/15 hover:bg-white/25 text-white px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  title="Copy record JSON"
                >
                  {copiedState === 'single_record' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedState === 'single_record' ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-1 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body - Key-Value Pairs */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4 bg-[#fdfaf8]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(selectedRecord).map(([key, val]) => (
                  <div key={key} className="bg-white p-3 rounded-xl border border-[#e4d8cf] shadow-2xs">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#7f6b6f] font-semibold block">
                      {key}
                    </span>
                    <div className="mt-1 text-xs text-[#2d1217] break-words">
                      {typeof val === 'object' ? (
                        <pre className="text-[11px] font-mono bg-[#f7efe9] p-2 rounded-lg overflow-x-auto text-[#721828]">
                          {JSON.stringify(val, null, 2)}
                        </pre>
                      ) : (
                        renderCellContent(val, key)
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Raw JSON Accordion inside Inspector */}
              <div className="mt-4 pt-3 border-t border-[#e4d8cf]">
                <span className="text-[11px] font-bold text-[#7f6b6f] uppercase font-mono block mb-1.5">
                  Raw Record Payload
                </span>
                <pre className="bg-[#1e1e1e] text-emerald-300 p-3 rounded-xl font-mono text-xs overflow-x-auto">
                  {JSON.stringify(selectedRecord, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-[#f7efe9] border-t border-[#e4d8cf] flex items-center justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-1.5 bg-[#721828] hover:bg-[#881d30] text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
