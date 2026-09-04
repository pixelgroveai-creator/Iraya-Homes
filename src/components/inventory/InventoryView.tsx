import React, { useState } from 'react';
import { 
  Package, 
  ClipboardList, 
  BarChart3, 
  Sparkles, 
  Database, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Layers
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { InventoryDailyEntry } from './InventoryDailyEntry';
import { InventoryMonthlySummaryView } from './InventoryMonthlySummary';

export const InventoryView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'daily' | 'monthly'>('daily');
  const { isSupabaseLive, currentUserRole } = useCRM();

  return (
    <div className="space-y-6" id="inventory-module-root">
      
      {/* Top Header & Navigation Banner */}
      <div className="bg-white p-5 rounded-2xl border border-[#e4d8cf] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#721828] text-white">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#2d1217]">
                Linen & Inventory Management
              </h1>
              <p className="text-xs text-[#7f6b6f] mt-0.5">
                Daily consumables consumption log for housekeeping staff & monthly summary ledger for management.
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Switcher Pill */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <div className="inline-flex p-1 bg-[#f7efe9] rounded-xl border border-[#e4d8cf] w-full sm:w-auto">
            <button
              type="button"
              id="subtab-daily-entry"
              onClick={() => setActiveSubTab('daily')}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-serif font-semibold transition-all cursor-pointer ${
                activeSubTab === 'daily'
                  ? 'bg-[#721828] text-white shadow-xs'
                  : 'text-[#7f6b6f] hover:text-[#2d1217]'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              Staff Daily Entry
            </button>

            <button
              type="button"
              id="subtab-monthly-summary"
              onClick={() => setActiveSubTab('monthly')}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-serif font-semibold transition-all cursor-pointer ${
                activeSubTab === 'monthly'
                  ? 'bg-[#721828] text-white shadow-xs'
                  : 'text-[#7f6b6f] hover:text-[#2d1217]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Management Monthly Summary
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeSubTab === 'daily' ? (
        <InventoryDailyEntry />
      ) : (
        <InventoryMonthlySummaryView />
      )}

    </div>
  );
};
