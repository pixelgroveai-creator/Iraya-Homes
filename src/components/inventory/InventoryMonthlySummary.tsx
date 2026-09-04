import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  BarChart2, 
  Download, 
  TrendingDown, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Package, 
  Sparkles,
  RefreshCw,
  Database
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  Legend 
} from 'recharts';
import { useCRM } from '../../context/CRMContext';
import { MonthlyInventorySummary } from '../../types';

export const InventoryMonthlySummaryView: React.FC = () => {
  const { 
    getMonthlyInventorySummary, 
    inventoryDailyLogs, 
    inventoryItems,
    isSupabaseLive 
  } = useCRM();

  // Anchored to September 2026 (matching system timeline) with selector
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  const [summaryData, setSummaryData] = useState<MonthlyInventorySummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeChartView, setActiveChartView] = useState<'bar' | 'trend'>('bar');

  // Load summary for selected month
  const loadSummary = async (monthStr: string) => {
    setIsLoading(true);
    try {
      const data = await getMonthlyInventorySummary(monthStr);
      setSummaryData(data);
    } catch (err) {
      console.error('Failed loading monthly summary:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSummary(selectedMonth);
  }, [selectedMonth, inventoryDailyLogs, inventoryItems]);

  // Navigate months
  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(year, month - 2, 1);
    const newMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonthStr);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const nextDate = new Date(year, month, 1);
    const newMonthStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonthStr);
  };

  // Month formatted title
  const monthTitle = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [selectedMonth]);

  // Derived high-level KPIs
  const totalMonthUsed = summaryData.reduce((sum, item) => sum + item.totalUsed, 0);
  const totalMonthAdded = summaryData.reduce((sum, item) => sum + item.totalAdded, 0);
  const lowStockItems = summaryData.filter(item => item.finalRemainingStock <= 15);
  const highestUsedItem = useMemo(() => {
    if (summaryData.length === 0) return null;
    return [...summaryData].sort((a, b) => b.totalUsed - a.totalUsed)[0];
  }, [summaryData]);

  // Prepare chart data for BarChart (usage by item)
  const barChartData = useMemo(() => {
    return summaryData.map(item => ({
      name: item.itemName,
      Used: item.totalUsed,
      Restocked: item.totalAdded,
      Remaining: item.finalRemainingStock
    }));
  }, [summaryData]);

  // Prepare daily trend line data for the selected month
  const trendLineData = useMemo(() => {
    // Filter logs for selected month
    const monthLogs = inventoryDailyLogs.filter(l => l.logDate.startsWith(selectedMonth));
    const dates = Array.from(new Set<string>(monthLogs.map(l => l.logDate))).sort();

    return dates.map((dateStr: string) => {
      const dayLogs = monthLogs.filter(l => l.logDate === dateStr);
      const dayObj: Record<string, any> = {
        date: dateStr.split('-')[2] + ' ' + new Date(dateStr).toLocaleDateString('en-US', { month: 'short' }),
      };

      dayLogs.forEach(log => {
        dayObj[log.itemName] = log.usedCount;
      });

      return dayObj;
    });
  }, [inventoryDailyLogs, selectedMonth]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Month', 'Item Name', 'Unit', 'Opening Stock', 'Total Added', 'Total Used', 'Closing Remaining Stock'];
    const rows = summaryData.map(s => [
      s.summaryMonth,
      `"${s.itemName}"`,
      s.unit,
      s.totalOpeningStock,
      s.totalAdded,
      s.totalUsed,
      s.finalRemainingStock
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `iraya_homes_inventory_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" id="inventory-monthly-summary-panel">

      {/* Month Selector Bar */}
      <div className="bg-[#f7efe9] p-5 rounded-2xl border border-[#e4d8cf] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2d1217]">
              Month-End Inventory & Usage Analytics
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-100 text-emerald-800 border border-emerald-200">
              Supabase View: v_monthly_inventory_summary
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#7f6b6f] mt-1">
            Reconciliation of monthly linen turnarounds, consumable burn rates, and inventory closing balances for villa management.
          </p>
        </div>

        {/* Month Picker Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="inline-flex items-center bg-white rounded-xl border border-[#e4d8cf] shadow-xs p-1">
            <button
              type="button"
              id="prev-month-btn"
              onClick={handlePrevMonth}
              className="p-1.5 text-[#7f6b6f] hover:text-[#721828] hover:bg-[#f7efe9] rounded-lg transition-colors"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 py-1 font-serif font-bold text-xs sm:text-sm text-[#2d1217] min-w-32 text-center">
              {monthTitle}
            </div>
            <button
              type="button"
              id="next-month-btn"
              onClick={handleNextMonth}
              className="p-1.5 text-[#7f6b6f] hover:text-[#721828] hover:bg-[#f7efe9] rounded-lg transition-colors"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            id="export-csv-btn"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-[#721828] hover:bg-[#ebdcd3] border border-[#e4d8cf] rounded-xl text-xs font-semibold transition-colors shadow-xs"
            title="Download CSV report"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#e4d8cf] shadow-xs">
          <span className="text-[11px] font-medium text-[#7f6b6f] uppercase tracking-wider block">
            Total Month Consumption
          </span>
          <span className="font-serif text-2xl font-bold text-[#721828]">
            {totalMonthUsed} units
          </span>
          <span className="text-[11px] text-[#7f6b6f] block mt-0.5">
            Across 9 core items
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e4d8cf] shadow-xs">
          <span className="text-[11px] font-medium text-[#7f6b6f] uppercase tracking-wider block">
            Total Stock Replenished
          </span>
          <span className="font-serif text-2xl font-bold text-emerald-700">
            +{totalMonthAdded} units
          </span>
          <span className="text-[11px] text-[#7f6b6f] block mt-0.5">
            Vendor delivery batches
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e4d8cf] shadow-xs">
          <span className="text-[11px] font-medium text-[#7f6b6f] uppercase tracking-wider block">
            Highest Velocity Item
          </span>
          <span className="font-serif text-lg font-bold text-[#2d1217] truncate block">
            {highestUsedItem ? highestUsedItem.itemName : 'N/A'}
          </span>
          <span className="text-[11px] text-[#721828] font-medium block mt-0.5">
            {highestUsedItem ? `${highestUsedItem.totalUsed} ${highestUsedItem.unit} used` : 'No logs yet'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e4d8cf] shadow-xs">
          <span className="text-[11px] font-medium text-[#7f6b6f] uppercase tracking-wider block">
            Low Stock Status
          </span>
          <span className={`font-serif text-2xl font-bold ${lowStockItems.length > 0 ? 'text-amber-600' : 'text-emerald-700'}`}>
            {lowStockItems.length}
          </span>
          <span className="text-[11px] text-[#7f6b6f] block mt-0.5">
            {lowStockItems.length > 0 ? 'Items below 15 threshold' : 'All items optimal'}
          </span>
        </div>
      </div>

      {/* Monthly Summary Table */}
      <div className="bg-white rounded-2xl border border-[#e4d8cf] shadow-sm overflow-hidden">
        <div className="p-4 bg-[#f7efe9] border-b border-[#e4d8cf] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif font-bold text-sm text-[#2d1217]">
              Monthly Stock Ledger — {monthTitle}
            </h3>
            <p className="text-[11px] text-[#7f6b6f]">
              Auto-aggregated from daily staff entries. Values correspond directly to the Supabase analytical view.
            </p>
          </div>

          <div className="text-[11px] text-[#968186] font-mono flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#721828]" />
            Month Key: {selectedMonth}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-[#faf6f3] text-[#7f6b6f] border-b border-[#e4d8cf] uppercase text-[11px] font-semibold tracking-wider">
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Unit</th>
                <th className="py-3 px-4 text-center">Month Opening Stock</th>
                <th className="py-3 px-4 text-center">Total Added (+)</th>
                <th className="py-3 px-4 text-center">Total Used (-)</th>
                <th className="py-3 px-4 text-center">Closing / Remaining Stock</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2e9e4]">
              {summaryData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-xs text-[#968186]">
                    No inventory records found for {monthTitle}. Staff can add entries in the Daily Log view.
                  </td>
                </tr>
              ) : (
                summaryData.map((row, idx) => {
                  const isLow = row.finalRemainingStock <= 15;
                  const isCritical = row.finalRemainingStock <= 5;

                  return (
                    <tr 
                      key={row.itemId}
                      className={`hover:bg-[#fdf8f5] transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-[#faf6f3]'}`}
                    >
                      <td className="py-3 px-4 font-semibold text-[#2d1217]">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-[#721828]/10 text-[#721828] flex items-center justify-center text-[10px] font-bold font-serif">
                            {row.itemName.slice(0, 2).toUpperCase()}
                          </div>
                          {row.itemName}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#7f6b6f] font-mono text-xs">
                        {row.unit}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-medium text-[#45373a]">
                        {row.totalOpeningStock}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-semibold text-emerald-700">
                        +{row.totalAdded}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-semibold text-[#721828]">
                        -{row.totalUsed}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-[#2d1217] text-sm">
                        {row.finalRemainingStock}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${
                          isCritical 
                            ? 'bg-rose-100 text-rose-800' 
                            : isLow 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isCritical ? (
                            <>
                              <AlertCircle className="w-3 h-3" /> Reorder Now
                            </>
                          ) : isLow ? (
                            <>
                              <AlertCircle className="w-3 h-3" /> Low Stock
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3 h-3" /> Optimal
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="bg-white p-5 rounded-2xl border border-[#e4d8cf] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f2e9e4]">
          <div>
            <h3 className="font-serif font-bold text-sm text-[#2d1217] flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#721828]" />
              Consumable Usage & Restock Visualizer ({monthTitle})
            </h3>
            <p className="text-[11px] text-[#7f6b6f]">
              Compare total units consumed vs replenished, or examine day-by-day trends across the month.
            </p>
          </div>

          <div className="inline-flex p-0.5 rounded-xl bg-[#f7efe9] border border-[#e4d8cf] text-xs">
            <button
              type="button"
              id="chart-view-bar"
              onClick={() => setActiveChartView('bar')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeChartView === 'bar' ? 'bg-white text-[#721828] shadow-xs' : 'text-[#7f6b6f] hover:text-[#2d1217]'
              }`}
            >
              Item Comparison Bar
            </button>
            <button
              type="button"
              id="chart-view-trend"
              onClick={() => setActiveChartView('trend')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeChartView === 'trend' ? 'bg-white text-[#721828] shadow-xs' : 'text-[#7f6b6f] hover:text-[#2d1217]'
              }`}
            >
              Daily Trend Line
            </button>
          </div>
        </div>

        {/* Chart View */}
        <div className="w-full h-72 sm:h-80 pt-2">
          {activeChartView === 'bar' ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{ top: 10, right: 20, left: -10, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e6df" />
                <XAxis 
                  dataKey="name" 
                  angle={-30} 
                  textAnchor="end" 
                  interval={0}
                  tick={{ fontSize: 11, fill: '#7f6b6f' }} 
                />
                <YAxis tick={{ fontSize: 11, fill: '#7f6b6f' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#2d1217', 
                    borderRadius: '12px', 
                    color: '#fff', 
                    border: 'none',
                    fontSize: '12px' 
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Used" fill="#721828" radius={[4, 4, 0, 0]} name="Used (Consumed)" />
                <Bar dataKey="Restocked" fill="#2d6a4f" radius={[4, 4, 0, 0]} name="Restocked (Added)" />
                <Bar dataKey="Remaining" fill="#b08968" radius={[4, 4, 0, 0]} name="Current Stock" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendLineData}
                margin={{ top: 10, right: 20, left: -10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e6df" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#7f6b6f' }} />
                <YAxis tick={{ fontSize: 11, fill: '#7f6b6f' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#2d1217', 
                    borderRadius: '12px', 
                    color: '#fff', 
                    border: 'none',
                    fontSize: '12px' 
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="Dental Kit" stroke="#721828" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Shampoo" stroke="#d4af37" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Body wash" stroke="#2d6a4f" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Towel" stroke="#1d3557" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>

    </div>
  );
};
