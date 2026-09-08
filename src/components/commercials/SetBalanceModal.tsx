import React, { useState, useEffect } from 'react';
import { 
  X, 
  Wallet, 
  IndianRupee, 
  ArrowRight, 
  RefreshCw, 
  CheckCircle2, 
  Info,
  Calendar
} from 'lucide-react';
import { useCommercials } from '../../context/CommercialsContext';

export const SetBalanceModal: React.FC = () => {
  const { 
    isSetBalanceModalOpen, 
    setIsSetBalanceModalOpen, 
    selectedMonth, 
    monthlyBalances, 
    stats,
    setMonthlyOpeningBalance 
  } = useCommercials();

  const currentMonthBal = monthlyBalances[selectedMonth];
  const [openingBalanceInput, setOpeningBalanceInput] = useState<string>('');
  const [autoCarryForward, setAutoCarryForward] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Compute previous month key for carry forward reference
  const [yearStr, monthStr] = selectedMonth.split('-');
  const prevDate = new Date(Number(yearStr), Number(monthStr) - 2, 1);
  const prevMonthKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
  const prevMonthBal = monthlyBalances[prevMonthKey];

  useEffect(() => {
    if (isSetBalanceModalOpen) {
      if (currentMonthBal) {
        setOpeningBalanceInput(currentMonthBal.openingBalance.toString());
        setAutoCarryForward(currentMonthBal.autoCarryForward !== false);
        setNotes(currentMonthBal.notes || '');
      } else if (prevMonthBal) {
        // Default to previous month's closing balance if available
        setOpeningBalanceInput(prevMonthBal.closingBalance.toString());
        setAutoCarryForward(true);
        setNotes(`Carried forward from ${prevMonthKey} closing balance`);
      } else {
        setOpeningBalanceInput('150000');
        setAutoCarryForward(true);
        setNotes('');
      }
    }
  }, [isSetBalanceModalOpen, currentMonthBal, prevMonthBal, prevMonthKey]);

  if (!isSetBalanceModalOpen) return null;

  const parsedOpening = parseFloat(openingBalanceInput) || 0;
  const projectedClosing = parsedOpening - stats.totalSpent;

  const handleUsePrevMonth = () => {
    if (prevMonthBal) {
      setOpeningBalanceInput(prevMonthBal.closingBalance.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await setMonthlyOpeningBalance(selectedMonth, parsedOpening, autoCarryForward, notes.trim());
      setIsSetBalanceModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Month label
  const monthName = new Date(Number(yearStr), Number(monthStr) - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white border border-[#e4d8cf] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-balance-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#fbf5f1] border-b border-[#e4d8cf]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#f2dde1] text-[#721828] border border-[#e2b3bc]">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 id="modal-balance-title" className="font-serif font-bold text-base text-[#2d1217]">
                Set Opening Balance
              </h3>
              <p className="text-[11px] text-[#7f6b6f]">
                {monthName} Financial Configuration
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSetBalanceModalOpen(false)}
            className="p-1.5 rounded-xl hover:bg-[#f7efe9] text-[#968186] hover:text-[#45373a] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Quick info if previous month closing is available */}
          {prevMonthBal && (
            <div className="p-3 bg-[#fdf8f5] rounded-xl border border-[#e4d8cf] flex items-center justify-between text-xs">
              <div>
                <p className="text-[#7f6b6f] font-medium text-[11px]">Previous Month ({prevMonthKey}) Closing:</p>
                <p className="font-bold text-[#2d1217]">₹{prevMonthBal.closingBalance.toLocaleString('en-IN')}</p>
              </div>
              <button
                type="button"
                onClick={handleUsePrevMonth}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#721828] hover:text-[#520b19] bg-white px-2.5 py-1 rounded-lg border border-[#e2b3bc] shadow-2xs hover:bg-[#fbf2f4] transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Use Carry-over</span>
              </button>
            </div>
          )}

          {/* Opening Balance Input */}
          <div>
            <label className="block text-xs font-semibold text-[#45373a] mb-1.5">
              Opening Balance for {monthName} (INR ₹) <span className="text-[#961c2c]">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#721828] font-bold text-sm">
                ₹
              </span>
              <input
                type="number"
                step="1"
                min="0"
                required
                value={openingBalanceInput}
                onChange={(e) => setOpeningBalanceInput(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#fdf8f5] border border-[#e4d8cf] focus:border-[#721828] focus:bg-white focus:ring-1 focus:ring-[#721828] rounded-xl text-sm font-bold text-[#2d1217] transition-all outline-none"
                placeholder="150000"
                autoFocus
              />
            </div>
            <p className="text-[11px] text-[#968186] mt-1">
              The operating funds allocated or carried into the villa account for this month.
            </p>
          </div>

          {/* Auto Carry-Forward Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-white border border-[#e4d8cf] rounded-xl">
            <div>
              <p className="text-xs font-semibold text-[#2d1217]">Auto Carry-Forward</p>
              <p className="text-[11px] text-[#7f6b6f]">
                Automatically roll this month's closing balance as next month's opening
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoCarryForward}
                onChange={(e) => setAutoCarryForward(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-[#e4d8cf] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#e4d8cf] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#721828]"></div>
            </label>
          </div>

          {/* Formula Live Computation Preview */}
          <div className="p-4 bg-[#f7efe9] rounded-xl border border-[#e4d8cf] space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#721828] uppercase tracking-wider">
              <Info className="w-3.5 h-3.5" />
              <span>Closing Balance Calculation Preview</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-[#7f6b6f]">
                <span>Opening Balance:</span>
                <span className="font-semibold text-[#2d1217]">₹{parsedOpening.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#7f6b6f]">
                <span>Total Spent ({monthName}):</span>
                <span className="font-semibold text-[#961c2c]">- ₹{stats.totalSpent.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-[#e4d8cf] pt-1.5 flex justify-between font-bold text-sm">
                <span className="text-[#2d1217]">Projected Closing:</span>
                <span className={projectedClosing >= 0 ? 'text-[#2d5a43]' : 'text-[#961c2c]'}>
                  ₹{projectedClosing.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#45373a] mb-1">
              Audit Notes <span className="text-[11px] font-normal text-[#968186]">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Owner capital injection or monthly budgeted float"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-[#fdf8f5] border border-[#e4d8cf] focus:border-[#721828] focus:bg-white rounded-xl text-xs text-[#2d1217] outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsSetBalanceModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-[#7f6b6f] hover:text-[#2d1217] hover:bg-[#f7efe9] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#721828] hover:bg-[#520b19] disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Balance</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
