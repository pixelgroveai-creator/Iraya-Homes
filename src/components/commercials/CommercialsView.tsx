import React from 'react';
import { 
  Receipt, 
  Plus, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  Wallet, 
  FileSpreadsheet, 
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Info
} from 'lucide-react';
import { useCommercials } from '../../context/CommercialsContext';
import { useCRM } from '../../context/CRMContext';
import { CommercialsSummaryCards } from './CommercialsSummaryCards';
import { CommercialsCategoryBreakdown } from './CommercialsCategoryBreakdown';
import { CommercialsDailyTrends } from './CommercialsDailyTrends';
import { CommercialsExpenseTable } from './CommercialsExpenseTable';
import { AddExpenseModal } from './AddExpenseModal';
import { ManageCategoriesModal } from './ManageCategoriesModal';
import { SetBalanceModal } from './SetBalanceModal';

export const CommercialsView: React.FC = () => {
  const { 
    selectedMonth, 
    setSelectedMonth, 
    setIsAddExpenseModalOpen, 
    setEditingExpense,
    setIsCategoriesModalOpen,
    setIsSetBalanceModalOpen,
    exportToCSV,
    resetCommercialsData,
    stats
  } = useCommercials();

  const { currentUserRole, isSupabaseLive } = useCRM();

  // Parse Year and Month for Navigator
  const [yearStr, monthStr] = selectedMonth.split('-');
  const currentYear = Number(yearStr);
  const currentMonthNum = Number(monthStr);

  const formattedMonthTitle = new Date(currentYear, currentMonthNum - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const handlePrevMonth = () => {
    const prev = new Date(currentYear, currentMonthNum - 2, 1);
    const newMonth = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonth);
  };

  const handleNextMonth = () => {
    const next = new Date(currentYear, currentMonthNum, 1);
    const newMonth = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonth);
  };

  // Month select options
  const monthOptions = [
    { value: '2026-07', label: 'July 2026' },
    { value: '2026-08', label: 'August 2026' },
    { value: '2026-09', label: 'September 2026 (Active)' },
    { value: '2026-10', label: 'October 2026' },
    { value: '2026-11', label: 'November 2026' },
    { value: '2026-12', label: 'December 2026' },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Module Header & Period Controls */}
      <div className="bg-[#fbf5f1] rounded-2xl border border-[#e4d8cf] p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Title & Description */}
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-[#721828] text-white rounded-2xl shadow-xs shrink-0">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-bold text-xl sm:text-2xl text-[#2d1217] tracking-tight">
                  Commercials & Expenses
                </h1>
                <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-bold bg-[#fbf2f4] text-[#721828] border border-[#e2b3bc] rounded-full uppercase tracking-wider">
                  Operational Ledger
                </span>
                {isSupabaseLive && (
                  <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-[#f0f7f3] text-[#2d5a43] border border-[#c7e3d2] rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2d5a43] animate-pulse" />
                    Supabase Live
                  </span>
                )}
              </div>
              <p className="text-xs text-[#7f6b6f] mt-0.5 max-w-2xl">
                Daily expenditure logging, categorical classification, budget variance analytics, and automatic month-end closing balance calculations for Iraya Homes.
              </p>
            </div>
          </div>

          {/* Month Selector Bar & Action Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            
            {/* Month Navigator Pill */}
            <div className="flex items-center bg-white rounded-xl border border-[#e4d8cf] p-1 shadow-2xs">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-[#7f6b6f] hover:text-[#2d1217] hover:bg-[#f7efe9] transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="relative px-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent text-xs font-bold text-[#2d1217] pr-3 py-1 outline-none cursor-pointer appearance-none text-center"
                >
                  {monthOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-[#7f6b6f] hover:text-[#2d1217] hover:bg-[#f7efe9] transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Set Opening Balance */}
            <button
              type="button"
              onClick={() => setIsSetBalanceModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#fdf8f5] text-xs font-semibold text-[#45373a] border border-[#e4d8cf] rounded-xl transition-all shadow-2xs cursor-pointer"
              title="Configure month opening balance and carry-forward"
            >
              <Wallet className="w-3.5 h-3.5 text-[#c29342]" />
              <span className="hidden sm:inline">Set Balance</span>
            </button>

            {/* Manage Categories */}
            <button
              type="button"
              onClick={() => setIsCategoriesModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#fdf8f5] text-xs font-semibold text-[#45373a] border border-[#e4d8cf] rounded-xl transition-all shadow-2xs cursor-pointer"
              title="Configure predefined and custom categories"
            >
              <Layers className="w-3.5 h-3.5 text-[#721828]" />
              <span className="hidden sm:inline">Categories</span>
            </button>

            {/* Export CSV */}
            <button
              type="button"
              onClick={() => exportToCSV(selectedMonth)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#fdf8f5] text-xs font-semibold text-[#45373a] border border-[#e4d8cf] rounded-xl transition-all shadow-2xs cursor-pointer"
              title="Download CSV export"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#2d5a43]" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Primary Action Button: Add Expense */}
            <button
              type="button"
              onClick={() => {
                setEditingExpense(null);
                setIsAddExpenseModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#721828] hover:bg-[#520b19] text-white font-semibold text-xs rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
              id="btn-add-expense-primary"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Expense</span>
            </button>

          </div>
        </div>
      </div>

      {/* 1. Summary Cards Row */}
      <CommercialsSummaryCards />

      {/* 2. Spending by Category (Breakdown) */}
      <CommercialsCategoryBreakdown />

      {/* 3. Daily Spending Trends & Outliers */}
      <CommercialsDailyTrends />

      {/* 4. Filterable Daily Expense Log */}
      <CommercialsExpenseTable />

      {/* Interactive Modals */}
      <AddExpenseModal />
      <ManageCategoriesModal />
      <SetBalanceModal />
    </div>
  );
};
