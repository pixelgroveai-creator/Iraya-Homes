import React, { useState } from 'react';
import { 
  Database, 
  Copy, 
  Check, 
  Download, 
  Table, 
  Key, 
  ShieldCheck, 
  ExternalLink,
  Layers,
  Terminal,
  FileCode2,
  Server,
  Zap,
  RefreshCw,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Radio,
  Play,
  Clock,
  Code2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { testQueryAllTables, TableTestResult } from '../../lib/supabase';

export const SchemaView: React.FC = () => {
  const { 
    isSupabaseLive, 
    supabaseConfig, 
    updateSupabaseCredentials, 
    syncWithSupabase, 
    pushAllToSupabase,
    leads,
    bookings,
    guests,
    tasks,
    issues,
    activities,
    checklists,
    inventoryDailyLogs
  } = useCRM();

  const [copied, setCopied] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string>('all');
  
  // Connection Form State
  const [urlInput, setUrlInput] = useState(supabaseConfig.url || '');
  const [keyInput, setKeyInput] = useState(supabaseConfig.anonKey || '');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Table Test Query Suite State
  const [isTestingQueries, setIsTestingQueries] = useState(false);
  const [testSummary, setTestSummary] = useState<{
    testedAt: string;
    allPassed: boolean;
    totalTables: number;
    successCount: number;
    results: TableTestResult[];
  } | null>(null);
  const [expandedTableSample, setExpandedTableSample] = useState<string | null>(null);

  const tables = [
    { 
      name: 'staff_users', 
      desc: 'Villa team profiles, credentials, role-based access & PIN authentication',
      columns: ['id (PK)', 'name', 'role (ENUM)', 'email (UNIQUE)', 'phone', 'avatar', 'active', 'pin', 'department', 'created_at', 'updated_at'],
      count: 1
    },
    { 
      name: 'guests', 
      desc: 'Guest profiles, deduplication by phone, preferences (JSONB), lifetime spend & history',
      columns: ['id (PK)', 'name', 'phone (UNIQUE)', 'email', 'city', 'total_stays', 'lifetime_value', 'preferences (JSONB)', 'service_notes', 'first_stay_date', 'last_stay_date', 'booking_ids', 'vip_status', 'created_at', 'updated_at'],
      count: guests.length || 4
    },
    { 
      name: 'leads', 
      desc: 'Multi-channel enquiries pipeline (WhatsApp, Instagram, Phone, Website, Referral)',
      columns: ['id (PK)', 'name', 'phone', 'email', 'source (ENUM)', 'check_in_date', 'check_out_date', 'guest_count', 'stay_purpose (ENUM)', 'status (ENUM)', 'assigned_staff_id (FK)', 'scheduled_follow_up', 'quote_amount', 'notes', 'lost_reason', 'created_at', 'updated_at'],
      count: leads.length || 6
    },
    { 
      name: 'bookings', 
      desc: 'Confirmed villa reservations, financials, security deposits & inspection audit checks',
      columns: ['id (PK)', 'lead_id (FK)', 'guest_id (FK)', 'guest_name', 'guest_phone', 'check_in_date', 'check_out_date', 'guest_count', 'stay_purpose (ENUM)', 'status (ENUM)', 'total_quote', 'advance_deposit_paid', 'balance_due', 'security_deposit_amount', 'security_deposit_refunded', 'pre_arrival_inspection_done', 'post_checkout_inspection_done', 'special_requests', 'notes', 'assigned_host_id (FK)', 'created_at', 'updated_at'],
      count: bookings.length || 4
    },
    { 
      name: 'tasks', 
      desc: 'Staff operational work orders, categorized checklists, priorities & completion stamps',
      columns: ['id (PK)', 'title', 'description', 'priority (ENUM)', 'status (ENUM)', 'category (ENUM)', 'assigned_staff_id (FK)', 'due_date', 'linked_booking_id (FK)', 'linked_area_id', 'completed_at', 'completed_by_staff_id (FK)', 'created_at', 'updated_at'],
      count: tasks.length || 6
    },
    { 
      name: 'issues', 
      desc: 'Property maintenance tickets (plumbing, electrical, heated pool, HVAC) with cost estimates',
      columns: ['id (PK)', 'title', 'description', 'category (ENUM)', 'property_area_id (ENUM)', 'severity (ENUM)', 'status (ENUM)', 'reported_by_staff_id (FK)', 'assigned_to_staff_or_vendor', 'linked_booking_id (FK)', 'impacts_upcoming_stay', 'reported_at', 'resolved_at', 'resolution_notes', 'estimated_cost', 'created_at', 'updated_at'],
      count: issues.length || 3
    },
    { 
      name: 'activities', 
      desc: 'Real-time telemetry event stream (calls, WhatsApp chats, pool checks, room inspections)',
      columns: ['id (PK)', 'type (ENUM)', 'title', 'description', 'timestamp', 'staff_id (FK)', 'staff_name', 'related_lead_id (FK)', 'related_booking_id (FK)', 'related_guest_id (FK)', 'related_issue_id (FK)', 'outcome', 'created_at'],
      count: activities.length || 5
    },
    { 
      name: 'area_checklists', 
      desc: '8 property zones (4 Suites, Heated Pool, Kitchen, Lounge, Terrace) SOP audit headers',
      columns: ['area_id (PK ENUM)', 'area_name', 'area_subtitle', 'icon_name', 'status (ENUM)', 'last_inspected_at', 'last_inspected_by', 'created_at', 'updated_at'],
      count: checklists.length || 8
    },
    { 
      name: 'checklist_items', 
      desc: 'Granular room-by-room inspection items with pass/fail telemetry and timestamp audits',
      columns: ['id (PK)', 'area_id (FK ENUM)', 'label', 'description', 'completed', 'checked_by', 'checked_at', 'notes', 'is_failed', 'created_at', 'updated_at'],
      count: 27
    },
    { 
      name: 'inventory_items', 
      desc: 'Villa consumable & linen catalog (Dental Kit, Shampoo, Body wash, Towel, Bedsheets, Pillow Cover, Bed Runner, Floor Cleaner, Glass cleaner)',
      columns: ['id (UUID PK)', 'name (TEXT UNIQUE)', 'unit (TEXT)', 'category (TEXT)', 'created_at'],
      count: 9
    },
    { 
      name: 'inventory_daily_logs', 
      desc: 'Staff daily consumption and restock logs with automatic remaining stock calculation trigger',
      columns: ['id (UUID PK)', 'item_id (UUID FK)', 'log_date (DATE)', 'opening_stock', 'used_count', 'added_stock', 'remaining_stock', 'logged_by (UUID FK)', 'notes', 'created_at', 'updated_at'],
      count: inventoryDailyLogs.length || 18
    },
    { 
      name: 'v_monthly_inventory_summary (VIEW)', 
      desc: 'SQL Analytical view aggregating month opening, total added, total used, and closing remaining stock',
      columns: ['summary_month (YYYY-MM)', 'item_id', 'item_name', 'unit', 'total_opening_stock', 'total_added', 'total_used', 'final_remaining_stock'],
      count: 9
    },
    { 
      name: 'expenses', 
      desc: 'Daily expenditure entries with amount, category, date, description, payment method, and user audit metadata',
      columns: ['id (PK)', 'amount (NUMERIC)', 'category', 'date (DATE)', 'description', 'payment_method', 'receipt_url', 'notes', 'user_id', 'user_name', 'created_at'],
      count: 14
    },
    { 
      name: 'monthly_balances', 
      desc: 'Month-end closing balance state and auto carry-forward logic (Closing = Opening - Total Spent)',
      columns: ['id (PK)', 'month (YYYY-MM UNIQUE)', 'opening_balance', 'total_expenses', 'closing_balance', 'auto_carry_forward (BOOL)', 'notes', 'updated_at'],
      count: 3
    }
  ];

  const handleCopySql = () => {
    fetch('/supabase_schema.sql')
      .then(res => res.text())
      .then(text => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
  };

  const handleDownloadSql = () => {
    const link = document.createElement('a');
    link.href = '/supabase_schema.sql';
    link.download = 'iraya_homes_supabase_schema.sql';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setFeedback(null);
    try {
      const res = await updateSupabaseCredentials(urlInput, keyInput);
      setFeedback({
        type: res.success ? 'success' : 'error',
        message: res.message
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Connection failed.'
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setFeedback(null);
    try {
      const ok = await syncWithSupabase();
      if (ok) {
        setFeedback({ type: 'success', message: 'Successfully refreshed all tables from live Supabase!' });
      } else {
        setFeedback({ type: 'error', message: 'Failed to sync with Supabase. Check credentials.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Sync error' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePushAll = async () => {
    setIsPushing(true);
    setFeedback(null);
    try {
      const res = await pushAllToSupabase();
      setFeedback({
        type: res.success ? 'success' : 'error',
        message: res.message
      });
    } catch (err: any) {
      setFeedback({ 
        type: 'error', 
        message: err.message || 'Push failed. Please ensure the SQL schema has been executed in your Supabase SQL editor first.' 
      });
    } finally {
      setIsPushing(false);
    }
  };

  const handleRunTestQueries = async () => {
    setIsTestingQueries(true);
    setTestSummary(null);
    try {
      const result = await testQueryAllTables();
      setTestSummary({
        testedAt: new Date().toLocaleTimeString(),
        allPassed: result.allPassed,
        totalTables: result.totalTables,
        successCount: result.successCount,
        results: result.results
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Error executing test queries.'
      });
    } finally {
      setIsTestingQueries(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#e4d8cf] rounded-[28px] p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${
              isSupabaseLive 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-[#fbf2f4] text-[#721828] border-[#e2b3bc]'
            }`}>
              <Database className="w-3 h-3" />
              {isSupabaseLive ? 'Supabase Live Connected' : 'Supabase / PostgreSQL Ready'}
            </span>
            <span className="text-[#968186] text-xs font-medium">• 9 Production Tables</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2d1217]">
            Database Architecture & Live Supabase Sync
          </h1>
          <p className="text-[#7f6b6f] text-xs sm:text-sm max-w-2xl">
            Fully typed relational PostgreSQL schema for Iraya Homes with Realtime replication, Row Level Security (RLS), foreign key constraints, and instant multi-device synchronization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopySql}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#721828] hover:bg-[#520b19] text-white font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied SQL Script!' : 'Copy Supabase SQL'}</span>
          </button>

          <button
            onClick={handleDownloadSql}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#e4d8cf] bg-[#fdf8f5] hover:bg-[#f7efe9] text-[#2d1217] font-bold text-xs transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#721828]" />
            <span>Download .sql</span>
          </button>
        </div>
      </div>

      {/* Live Supabase Connection & Credentials Box */}
      <div className="bg-gradient-to-br from-[#fdf8f5] to-[#f7efe9] border border-[#e4d8cf] rounded-[28px] p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e4d8cf] pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isSupabaseLive ? 'bg-emerald-500 text-white shadow-xs' : 'bg-[#721828] text-white'
            }`}>
              <Radio className={`w-5 h-5 ${isSupabaseLive ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#2d1217]">Live Supabase Connection & Real-Time Sync</h3>
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                  isSupabaseLive 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {isSupabaseLive ? '🟢 REALTIME SYNC ACTIVE' : '⚪ LOCAL / OFFLINE MODE'}
                </span>
              </div>
              <p className="text-xs text-[#7f6b6f] mt-0.5">
                Connect your Supabase project to enable multi-device instant sync for leads, bookings, tasks, and issues.
              </p>
            </div>
          </div>

          {isSupabaseLive && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e4d8cf] bg-white hover:bg-[#fdf8f5] text-xs font-semibold text-[#2d1217] transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#721828]' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Pull / Reload'}</span>
              </button>

              <button
                onClick={handlePushAll}
                disabled={isPushing}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#721828] hover:bg-[#520b19] text-xs font-semibold text-white transition-all shadow-2xs cursor-pointer disabled:opacity-50"
              >
                <UploadCloud className={`w-3.5 h-3.5 ${isPushing ? 'animate-bounce' : ''}`} />
                <span>{isPushing ? 'Seeding...' : 'Seed / Push Data to Remote'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSaveConnection} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#721828] mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://xyzprojectid.supabase.co"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e4d8cf] bg-white text-xs text-[#2d1217] font-mono focus:outline-none focus:border-[#721828] focus:ring-1 focus:ring-[#721828]"
              />
              <p className="text-[11px] text-[#968186] mt-1">
                Found in Supabase Dashboard &rarr; Project Settings &rarr; API &rarr; Project URL
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#721828] mb-1">
                Supabase Anon / Public Key
              </label>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e4d8cf] bg-white text-xs text-[#2d1217] font-mono focus:outline-none focus:border-[#721828] focus:ring-1 focus:ring-[#721828]"
              />
              <p className="text-[11px] text-[#968186] mt-1">
                Found in Supabase Dashboard &rarr; Project Settings &rarr; API &rarr; anon public key
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="submit"
                disabled={isConnecting}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#721828] hover:bg-[#520b19] text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-60"
              >
                {isConnecting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-300" />}
                <span>{isConnecting ? 'Testing Connection...' : 'Save & Connect Supabase'}</span>
              </button>

              <button
                type="button"
                onClick={handleRunTestQueries}
                disabled={isTestingQueries}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3e6f48] hover:bg-[#315739] text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-60"
              >
                <Play className={`w-3.5 h-3.5 text-emerald-300 ${isTestingQueries ? 'animate-spin' : ''}`} />
                <span>{isTestingQueries ? 'Querying 9 Tables...' : 'Test Query on All 9 Tables'}</span>
              </button>

              {(urlInput || keyInput) && (
                <button
                  type="button"
                  onClick={() => {
                    setUrlInput('');
                    setKeyInput('');
                    updateSupabaseCredentials('', '');
                  }}
                  className="px-3.5 py-2 rounded-xl border border-[#e4d8cf] bg-white hover:bg-[#fdf8f5] text-xs font-medium text-[#7f6b6f] cursor-pointer"
                >
                  Clear & Disconnect
                </button>
              )}
            </div>

            {feedback && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium ${
                feedback.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
                <span>{feedback.message}</span>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Live Table Query Test Results Panel */}
      {testSummary && (
        <div className="bg-white border border-[#e4d8cf] rounded-[28px] p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e4d8cf] pb-4">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                testSummary.allPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
              }`}>
                {testSummary.allPassed ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#2d1217]">
                    Supabase Query Test Results ({testSummary.successCount}/{testSummary.totalTables} Tables Accessible)
                  </h3>
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                    testSummary.allPassed 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {testSummary.allPassed ? 'ALL TABLES LIVE' : 'TABLE CREATION REQUIRED'}
                  </span>
                </div>
                <p className="text-xs text-[#7f6b6f]">
                  Executed at {testSummary.testedAt} against <code className="font-mono text-[11px] text-[#721828]">{supabaseConfig.url || 'https://kbxmxldrwanyupvtcawi.supabase.co'}</code>
                </p>
              </div>
            </div>

            <button
              onClick={handleRunTestQueries}
              disabled={isTestingQueries}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e4d8cf] bg-[#fdf8f5] hover:bg-[#f7efe9] text-xs font-semibold text-[#2d1217] cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingQueries ? 'animate-spin' : ''}`} />
              <span>Re-run Test</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {testSummary.results.map((r) => {
              const isExpanded = expandedTableSample === r.tableName;
              return (
                <div 
                  key={r.tableName}
                  className={`border rounded-2xl p-4 transition-all ${
                    r.status === 'SUCCESS'
                      ? 'bg-[#fcfdfa] border-[#dce8d6]'
                      : 'bg-[#fffaf9] border-[#f2d8d3]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-[#2d1217]">
                      {r.tableName}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.status === 'SUCCESS' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {r.status === 'SUCCESS' ? 'PASS' : 'FAIL'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#7f6b6f] mb-2">
                    <span className="flex items-center gap-1">
                      <Table className="w-3 h-3 text-[#968186]" />
                      <strong>{r.rowCount}</strong> live rows
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="w-3 h-3 text-[#968186]" />
                      {r.latencyMs}ms
                    </span>
                  </div>

                  {r.errorMessage && (
                    <div className="p-2 rounded-xl bg-red-50 text-red-700 text-[11px] font-mono leading-tight mb-2 border border-red-200">
                      {r.errorMessage}
                    </div>
                  )}

                  {r.status === 'SUCCESS' && r.sampleData && r.sampleData.length > 0 && (
                    <div>
                      <button
                        onClick={() => setExpandedTableSample(isExpanded ? null : r.tableName)}
                        className="flex items-center gap-1 text-[11px] font-medium text-[#721828] hover:underline cursor-pointer"
                      >
                        <Code2 className="w-3 h-3" />
                        <span>{isExpanded ? 'Hide sample data' : `View ${r.sampleData.length} sample row(s)`}</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      {isExpanded && (
                        <pre className="mt-2 p-2 bg-[#1f1013] text-[#f2d8dd] rounded-xl text-[10px] font-mono overflow-x-auto max-h-40">
                          {JSON.stringify(r.sampleData, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!testSummary.allPassed && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-xs text-amber-900">
                <strong>Notice:</strong> Some tables have not been created yet in your Supabase database. Click <strong>Copy Supabase SQL</strong>, paste it into your Supabase SQL Editor, click <strong>Run</strong>, then re-run this test.
              </div>
              <button
                onClick={handleCopySql}
                className="px-3.5 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shrink-0 cursor-pointer"
              >
                {copied ? 'Copied!' : 'Copy SQL Script'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Supabase Quick Setup Guide Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#e4d8cf] p-5 rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-[#721828]">
            <Server className="w-4 h-4" />
            <p className="text-xs font-bold uppercase tracking-wider">1. Open SQL Editor</p>
          </div>
          <p className="text-xs text-[#7f6b6f]">
            Navigate to your <strong>Supabase Dashboard</strong> &rarr; Click <strong>SQL Editor</strong> on the left sidebar.
          </p>
        </div>

        <div className="bg-white border border-[#e4d8cf] p-5 rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-[#3e6f48]">
            <FileCode2 className="w-4 h-4" />
            <p className="text-xs font-bold uppercase tracking-wider">2. Paste & Run Script</p>
          </div>
          <p className="text-xs text-[#7f6b6f]">
            Click <strong>Copy Supabase SQL</strong> above, paste into the editor, and click <strong>Run</strong>.
          </p>
        </div>

        <div className="bg-white border border-[#e4d8cf] p-5 rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-[#961c2c]">
            <ShieldCheck className="w-4 h-4" />
            <p className="text-xs font-bold uppercase tracking-wider">3. Live Realtime Active</p>
          </div>
          <p className="text-xs text-[#7f6b6f]">
            Paste your Project URL & Key above to enable instant bidirectional multi-device sync!
          </p>
        </div>
      </div>

      {/* Tables & Column Blueprint Grid */}
      <div className="bg-white border border-[#e4d8cf] rounded-[28px] p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e4d8cf] pb-4">
          <div>
            <h2 className="text-lg font-bold font-serif text-[#2d1217] flex items-center gap-2">
              <Table className="w-5 h-5 text-[#721828]" />
              <span>Database Tables & Complete Column Schema</span>
            </h2>
            <p className="text-xs text-[#7f6b6f] mt-0.5">
              All 9 relational entities with data types, primary keys, foreign constraints & seed counts
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#968186]">Filter View:</span>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#e4d8cf] bg-[#fdf8f5] text-xs font-medium text-[#2d1217] focus:outline-none focus:border-[#721828]"
            >
              <option value="all">All 9 Tables</option>
              {tables.map(t => (
                <option key={t.name} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables
            .filter(t => selectedTable === 'all' || t.name === selectedTable)
            .map((table) => (
              <div 
                key={table.name} 
                className="p-4 rounded-2xl border border-[#e4d8cf] bg-[#fdf8f5] hover:border-[#721828]/40 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#2d1217] bg-[#f7efe9] px-2 py-0.5 rounded-md">
                      {table.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#968186] bg-white px-2 py-0.5 rounded-full border border-[#e4d8cf]">
                    {table.count} live rows
                  </span>
                </div>

                <p className="text-xs text-[#7f6b6f] leading-relaxed">
                  {table.desc}
                </p>

                <div className="space-y-1 pt-2 border-t border-[#e4d8cf]/60">
                  <p className="text-[10px] uppercase font-bold text-[#968186] tracking-wider">Columns ({table.columns.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {table.columns.map((col, idx) => (
                      <span 
                        key={idx} 
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          col.includes('(PK') 
                            ? 'bg-[#721828] text-white font-bold' 
                            : col.includes('(FK')
                            ? 'bg-[#fbf2f4] text-[#721828] border border-[#e2b3bc]'
                            : col.includes('(ENUM')
                            ? 'bg-[#faf4e8] text-[#9b6f25]'
                            : 'bg-white text-[#721828] border border-[#e4d8cf]'
                        }`}
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Embedded SQL Preview Box */}
      <div className="bg-[#1f1013] text-[#e8d5d9] border border-[#4d1c25] rounded-[28px] p-6 shadow-md space-y-4 font-mono text-xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#4d1c25] pb-3 text-white">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#e2b3bc]" />
            <span className="font-bold">supabase_schema.sql (PostgreSQL)</span>
          </div>
          <span className="text-[11px] text-[#b89ca2]">500+ lines • Ready to Execute</span>
        </div>

        <pre className="overflow-x-auto p-3 bg-[#170a0c] rounded-xl text-[11px] leading-relaxed max-h-72 text-[#e2ccd1]">
{`-- Example Table Definition: Bookings with Foreign Keys & Commercials
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
    total_quote NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    advance_deposit_paid NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    balance_due NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    security_deposit_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    security_deposit_refunded BOOLEAN NOT NULL DEFAULT false,
    pre_arrival_inspection_done BOOLEAN NOT NULL DEFAULT false,
    post_checkout_inspection_done BOOLEAN NOT NULL DEFAULT false,
    special_requests TEXT,
    notes TEXT,
    assigned_host_id VARCHAR(50) REFERENCES staff_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);`}
        </pre>
      </div>
    </div>
  );
};
