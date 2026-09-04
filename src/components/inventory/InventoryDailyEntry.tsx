import React, { useState, useEffect, useTransition } from 'react';
import { 
  Calendar, 
  Save, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Package, 
  Sparkles, 
  Plus, 
  Minus, 
  ArrowRight,
  Database,
  History,
  Info
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { InventoryDailyLog } from '../../types';
import { ActiveSearchBanner } from '../common/ActiveSearchBanner';

interface ItemFormState {
  itemId: string;
  itemName: string;
  category: string;
  unit: string;
  openingStock: number;
  addedStock: number;
  usedCount: number;
  notes: string;
  isExistingLog: boolean;
}

export const InventoryDailyEntry: React.FC = () => {
  const { 
    inventoryItems, 
    loadDailyLogsForDate, 
    getPreviousDayStock, 
    saveBatchInventoryLogs, 
    currentStaff,
    isSupabaseLive,
    searchQuery
  } = useCRM();

  // Anchored default date matching the luxury CRM system timeline (Sept 1, 2026 or current today)
  const defaultDate = '2026-09-01';
  const [selectedDate, setSelectedDate] = useState<string>(defaultDate);
  const [itemsState, setItemsState] = useState<ItemFormState[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [saveWarningMessage, setSaveWarningMessage] = useState<string | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const [autoPopulatedFrom, setAutoPopulatedFrom] = useState<string | null>(null);
  const [allowManualOpeningStock, setAllowManualOpeningStock] = useState(false);

  // Helper to generate RFC-4122 compliant UUIDs for daily logs
  const generateUUID = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      try {
        return crypto.randomUUID();
      } catch (_) {}
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  // Load daily logs or auto-populate opening stock for the chosen date
  const loadDateData = async (dateStr: string) => {
    setIsLoading(true);
    setSaveSuccessMessage(null);
    setSaveWarningMessage(null);
    setSaveErrorMessage(null);

    try {
      // 1. Check if logs already exist for this date
      const existingLogs = await loadDailyLogsForDate(dateStr);
      const existingLogsMap = new Map<string, InventoryDailyLog>();
      existingLogs.forEach(l => existingLogsMap.set(l.itemId, l));

      // 2. Fetch previous day remaining stock for auto-population
      const prevStockMap = await getPreviousDayStock(dateStr);
      
      // Calculate previous date string for label
      const d = new Date(dateStr);
      d.setDate(d.getDate() - 1);
      const prevDateStr = d.toISOString().split('T')[0];
      setAutoPopulatedFrom(prevDateStr);

      // 3. Build form state for all 9 inventory items
      const newState: ItemFormState[] = inventoryItems.map(item => {
        const existing = existingLogsMap.get(item.id);
        if (existing) {
          return {
            itemId: item.id,
            itemName: item.name,
            category: item.category || 'General',
            unit: item.unit,
            openingStock: existing.openingStock,
            addedStock: existing.addedStock,
            usedCount: existing.usedCount,
            notes: existing.notes || '',
            isExistingLog: true
          };
        } else {
          // Auto-populate opening stock from previous day's remaining stock!
          const autoOpening = prevStockMap[item.id] ?? 25;
          return {
            itemId: item.id,
            itemName: item.name,
            category: item.category || 'General',
            unit: item.unit,
            openingStock: autoOpening,
            addedStock: 0,
            usedCount: 0,
            notes: '',
            isExistingLog: false
          };
        }
      });

      setItemsState(newState);
    } catch (err) {
      console.error('Failed loading daily inventory data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDateData(selectedDate);
  }, [selectedDate, inventoryItems]);

  const updateItemField = (itemId: string, field: keyof ItemFormState, value: any) => {
    setItemsState(prev => prev.map(item => {
      if (item.itemId === itemId) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Quick increment/decrement helpers
  const adjustValue = (itemId: string, field: 'usedCount' | 'addedStock', delta: number) => {
    setItemsState(prev => prev.map(item => {
      if (item.itemId === itemId) {
        const currentVal = Number(item[field]) || 0;
        const newVal = Math.max(0, currentVal + delta);
        return { ...item, [field]: newVal };
      }
      return item;
    }));
  };

  // Calculate totals
  const totalUsedToday = itemsState.reduce((sum, i) => sum + (Number(i.usedCount) || 0), 0);
  const totalAddedToday = itemsState.reduce((sum, i) => sum + (Number(i.addedStock) || 0), 0);
  const lowStockCount = itemsState.filter(i => {
    const remaining = (Number(i.openingStock) || 0) + (Number(i.addedStock) || 0) - (Number(i.usedCount) || 0);
    return remaining <= 10;
  }).length;

  // Handle batch submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSaveSuccessMessage(null);
    setSaveWarningMessage(null);
    setSaveErrorMessage(null);

    // Validation: check for negative stock (usedCount > openingStock + addedStock)
    const invalidItems = itemsState.filter(item => {
      const opening = Number(item.openingStock) || 0;
      const added = Number(item.addedStock) || 0;
      const used = Number(item.usedCount) || 0;
      return used > (opening + added);
    });

    if (invalidItems.length > 0) {
      setSaveErrorMessage(
        `Cannot submit: Used count exceeds available stock for: ${invalidItems.map(i => i.itemName).join(', ')}. Remaining stock cannot be negative.`
      );
      setIsSubmitting(false);
      return;
    }

    const now = new Date().toISOString();
    const batchLogs: InventoryDailyLog[] = itemsState.map(item => {
      const opening = Number(item.openingStock) || 0;
      const added = Number(item.addedStock) || 0;
      const used = Number(item.usedCount) || 0;
      const remaining = Math.max(0, opening + added - used);

      return {
        id: generateUUID(),
        itemId: item.itemId,
        itemName: item.itemName,
        unit: item.unit,
        category: item.category as any,
        logDate: selectedDate,
        openingStock: opening,
        usedCount: used,
        addedStock: added,
        remainingStock: remaining,
        loggedBy: currentStaff.id,
        loggedByName: currentStaff.name,
        notes: item.notes.trim() || undefined,
        createdAt: now,
        updatedAt: now
      };
    });

    try {
      const result = await saveBatchInventoryLogs(batchLogs);
      setIsSubmitting(false);

      if (result.success) {
        if (result.isLocalOnly) {
          setSaveWarningMessage(
            `Saved ${itemsState.length} items locally for ${selectedDate}. Cloud sync notice: ${result.error || 'table not found'}. Run the inventory SQL in Settings > Schema to enable cloud persistence.`
          );
        } else {
          setSaveSuccessMessage(
            `Successfully recorded daily inventory log for all ${itemsState.length} items on ${selectedDate} and synced to Supabase.`
          );
        }
        // Update form state flag to existing
        setItemsState(prev => prev.map(i => ({ ...i, isExistingLog: true })));
      } else {
        setSaveErrorMessage(result.error || 'Failed to record daily inventory log.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setSaveErrorMessage(err.message || 'An unexpected error occurred while saving.');
    }
  };

  const displayedItems = itemsState.filter(item => {
    if (!searchQuery || !searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      item.itemName.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.unit.toLowerCase().includes(q) ||
      (item.notes && item.notes.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6" id="inventory-daily-entry-panel">
      
      <ActiveSearchBanner currentModule="Inventory Consumables" resultCount={displayedItems.length} />

      {/* Header Controls & Summary Bar */}
      <div className="bg-[#f7efe9] p-5 rounded-2xl border border-[#e4d8cf] shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2d1217]">
              Staff Daily Consumables & Linen Entry
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#721828]/10 text-[#721828] border border-[#721828]/20">
              9 Mandatory Items
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#7f6b6f] mt-1">
            Log guest linen changes, toiletry replenishings, and villa cleaning supplies used today. Opening stock is automatically drawn from yesterday's closing count.
          </p>
        </div>

        {/* Date Selector and Auto-pop Indicator */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-[#e4d8cf] shadow-xs">
            <Calendar className="w-4 h-4 text-[#721828]" />
            <label htmlFor="inventory-date-input" className="text-xs font-semibold text-[#45373a]">
              Log Date:
            </label>
            <input
              id="inventory-date-input"
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="text-xs font-mono font-medium text-[#2d1217] bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          <button
            type="button"
            id="refresh-stock-btn"
            onClick={() => loadDateData(selectedDate)}
            disabled={isLoading}
            className="p-2 text-[#721828] bg-white hover:bg-[#ebdcd3] border border-[#e4d8cf] rounded-xl transition-colors shadow-xs"
            title="Reload from database"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metric Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#e4d8cf] shadow-xs">
          <span className="text-[11px] font-medium text-[#7f6b6f] uppercase tracking-wider block">
            Items Tracked
          </span>
          <span className="font-serif text-2xl font-bold text-[#2d1217]">
            {itemsState.length} / 9
          </span>
          <span className="text-[11px] text-emerald-700 block mt-0.5">
            Full Villa Protocol
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e4d8cf] shadow-xs">
          <span className="text-[11px] font-medium text-[#7f6b6f] uppercase tracking-wider block">
            Consumed Today
          </span>
          <span className="font-serif text-2xl font-bold text-[#721828]">
            {totalUsedToday}
          </span>
          <span className="text-[11px] text-[#7f6b6f] block mt-0.5">
            Guest usage & changeover
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e4d8cf] shadow-xs">
          <span className="text-[11px] font-medium text-[#7f6b6f] uppercase tracking-wider block">
            Restocked Today
          </span>
          <span className="font-serif text-2xl font-bold text-emerald-700">
            +{totalAddedToday}
          </span>
          <span className="text-[11px] text-[#7f6b6f] block mt-0.5">
            Vendor deliveries
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e4d8cf] shadow-xs">
          <span className="text-[11px] font-medium text-[#7f6b6f] uppercase tracking-wider block">
            Low Stock Alerts
          </span>
          <span className={`font-serif text-2xl font-bold ${lowStockCount > 0 ? 'text-amber-600' : 'text-emerald-700'}`}>
            {lowStockCount}
          </span>
          <span className="text-[11px] text-[#7f6b6f] block mt-0.5">
            {lowStockCount > 0 ? 'Reorder recommended' : 'Healthy inventory levels'}
          </span>
        </div>
      </div>

      {/* Auto-Population Notice Banner */}
      <div className="bg-[#ebdcd3]/60 border border-[#d8c2b5] px-4 py-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-[#45373a]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#721828] shrink-0" />
          <span>
            <strong>Auto-population Active:</strong> Opening stock is initialized from {autoPopulatedFrom || 'the previous day'}&apos;s remaining stock.
          </span>
        </div>
        <button
          type="button"
          id="toggle-manual-opening-stock"
          onClick={() => setAllowManualOpeningStock(prev => !prev)}
          className="text-xs text-[#721828] hover:underline font-medium cursor-pointer"
        >
          {allowManualOpeningStock ? 'Lock Opening Stock (Auto)' : 'Override Opening Stock (Physical Audit)'}
        </button>
      </div>

      {/* Save Success Alert */}
      {saveSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
          {isSupabaseLive && (
            <span className="inline-flex items-center gap-1 text-xs font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
              <Database className="w-3 h-3" /> Live Supabase Synced
            </span>
          )}
        </div>
      )}

      {/* Save Warning Alert (Local Saved, Cloud Sync Issue) */}
      {saveWarningMessage && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl flex items-start justify-between gap-3 text-sm">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-950">Local Log Saved Successfully</p>
              <p className="text-xs text-amber-800 mt-0.5">{saveWarningMessage}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded shrink-0">
            Local Session
          </span>
        </div>
      )}

      {/* Save Error Alert */}
      {saveErrorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-900 p-4 rounded-xl flex items-start gap-2.5 text-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-950">Submission Error</p>
            <p className="text-xs text-rose-800 mt-0.5">{saveErrorMessage}</p>
          </div>
        </div>
      )}

      {/* Daily Entry Form / Table */}
      <form onSubmit={handleSubmit} className="space-y-4" id="daily-inventory-form">
        <div className="bg-white rounded-2xl border border-[#e4d8cf] shadow-sm overflow-hidden">
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-[#f7efe9] text-[#7f6b6f] border-b border-[#e4d8cf] uppercase text-[11px] font-semibold tracking-wider">
                  <th className="py-3.5 px-4">Item & Specification</th>
                  <th className="py-3.5 px-4 text-center">Opening Stock</th>
                  <th className="py-3.5 px-4 text-center">Used / Consumed</th>
                  <th className="py-3.5 px-4 text-center">Restocked (+)</th>
                  <th className="py-3.5 px-4 text-center">Remaining Stock</th>
                  <th className="py-3.5 px-4">Staff Shift Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2e9e4]">
                {displayedItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-[#7f6b6f]">
                      No inventory items found matching &ldquo;{searchQuery}&rdquo;.
                    </td>
                  </tr>
                ) : (
                  displayedItems.map((item, idx) => {
                  const opening = Number(item.openingStock) || 0;
                  const added = Number(item.addedStock) || 0;
                  const used = Number(item.usedCount) || 0;
                  // Dynamic calculation: remaining_stock = opening_stock + added_stock - used_count
                  const remaining = opening + added - used;

                  const isLow = remaining <= 10;
                  const isCritical = remaining <= 4;

                  return (
                    <tr 
                      key={item.itemId} 
                      className={`hover:bg-[#fdf8f5] transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-[#faf6f3]'}`}
                      id={`inventory-row-${item.itemId}`}
                    >
                      {/* Item Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#721828]/10 flex items-center justify-center text-[#721828] shrink-0 font-serif font-bold text-xs">
                            {item.itemName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-[#2d1217] flex items-center gap-1.5">
                              {item.itemName}
                              {item.isExistingLog && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded font-sans font-normal">
                                  Logged
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#968186]">
                              {item.category} • <span className="font-mono text-[#721828]">{item.unit}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Opening Stock (Auto-populated with optional override) */}
                      <td className="py-3 px-4 text-center">
                        {allowManualOpeningStock ? (
                          <input
                            type="number"
                            min="0"
                            id={`opening-stock-${item.itemId}`}
                            value={item.openingStock}
                            onChange={e => updateItemField(item.itemId, 'openingStock', Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-18 text-center text-xs font-mono font-semibold py-1.5 px-2 bg-amber-50/50 border border-amber-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#721828]"
                          />
                        ) : (
                          <div className="inline-flex flex-col items-center">
                            <span className="font-mono text-sm font-semibold text-[#2d1217]">
                              {opening}
                            </span>
                            <span className="text-[10px] text-[#968186] flex items-center gap-0.5">
                              <History className="w-2.5 h-2.5" /> Prev close
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Used Count with Stepper */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1 bg-white border border-[#e4d8cf] rounded-lg p-0.5 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => adjustValue(item.itemId, 'usedCount', -1)}
                            className="p-1 text-[#7f6b6f] hover:text-[#721828] hover:bg-[#f7efe9] rounded transition-colors"
                            title="Decrease used count"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            id={`used-count-${item.itemId}`}
                            value={item.usedCount}
                            onChange={e => updateItemField(item.itemId, 'usedCount', Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-12 text-center text-xs font-mono font-bold text-[#721828] bg-transparent focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => adjustValue(item.itemId, 'usedCount', 1)}
                            className="p-1 text-[#7f6b6f] hover:text-[#721828] hover:bg-[#f7efe9] rounded transition-colors"
                            title="Increase used count"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Added Stock (Restock) with Stepper */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1 bg-white border border-[#e4d8cf] rounded-lg p-0.5 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => adjustValue(item.itemId, 'addedStock', -5)}
                            className="p-1 text-[#7f6b6f] hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                            title="Decrease restock count (-5)"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            id={`added-stock-${item.itemId}`}
                            value={item.addedStock}
                            onChange={e => updateItemField(item.itemId, 'addedStock', Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-12 text-center text-xs font-mono font-bold text-emerald-800 bg-transparent focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => adjustValue(item.itemId, 'addedStock', 5)}
                            className="p-1 text-[#7f6b6f] hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                            title="Increase restock count (+5)"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Dynamic Remaining Stock Calculation */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`font-mono text-base font-bold ${
                            isCritical ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-emerald-700'
                          }`}>
                            {remaining}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                            isCritical 
                              ? 'bg-rose-100 text-rose-800' 
                              : isLow 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isCritical ? 'Critical' : isLow ? 'Low Stock' : 'Adequate'}
                          </span>
                        </div>
                      </td>

                      {/* Staff Notes per item */}
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          id={`notes-${item.itemId}`}
                          placeholder="e.g. Master suite refresh, laundry delivery..."
                          value={item.notes}
                          onChange={e => updateItemField(item.itemId, 'notes', e.target.value)}
                          className="w-full text-xs py-1.5 px-2.5 bg-white border border-[#e4d8cf] rounded-lg text-[#45373a] placeholder:text-[#b49e9e] focus:outline-none focus:border-[#721828]"
                        />
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>

          {/* Table Bottom Action Bar */}
          <div className="bg-[#f7efe9] p-4 border-t border-[#e4d8cf] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#7f6b6f] flex items-center gap-2">
              <span className="font-medium text-[#2d1217]">Logged By:</span>
              <span className="font-mono bg-white px-2 py-1 rounded border border-[#e4d8cf] text-[#721828]">
                {currentStaff.name} ({currentStaff.role})
              </span>
              <span>• Date: {selectedDate}</span>
            </div>

            <button
              type="submit"
              id="submit-daily-inventory-btn"
              disabled={isSubmitting || isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#721828] text-white hover:bg-[#5b1320] font-serif font-semibold text-xs sm:text-sm rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Syncing to Supabase...' : `Submit Daily Log (${selectedDate})`}
            </button>
          </div>

        </div>
      </form>

    </div>
  );
};
