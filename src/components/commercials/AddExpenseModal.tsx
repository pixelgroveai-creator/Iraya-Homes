import React, { useState, useEffect } from 'react';
import { 
  X, 
  Receipt, 
  IndianRupee, 
  Calendar, 
  Tag, 
  CreditCard, 
  FileText, 
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useCommercials } from '../../context/CommercialsContext';
import { useCRM } from '../../context/CRMContext';
import { PaymentMethod, PredefinedExpenseCategory } from '../../types';

export const AddExpenseModal: React.FC = () => {
  const { 
    isAddExpenseModalOpen, 
    setIsAddExpenseModalOpen, 
    editingExpense, 
    setEditingExpense,
    categories,
    addExpense,
    updateExpense
  } = useCommercials();

  const { currentStaff } = useCRM();

  // Form State
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('Food & Beverages');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Populate when editing
  useEffect(() => {
    if (editingExpense) {
      setAmount(editingExpense.amount.toString());
      setCategory(editingExpense.category);
      setDate(editingExpense.date);
      setPaymentMethod(editingExpense.paymentMethod);
      setDescription(editingExpense.description || '');
      setErrorMessage(null);
    } else {
      setAmount('');
      setCategory(categories[0]?.name || 'Food & Beverages');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('UPI');
      setDescription('');
      setErrorMessage(null);
    }
  }, [editingExpense, isAddExpenseModalOpen, categories]);

  if (!isAddExpenseModalOpen) return null;

  const handleClose = () => {
    setIsAddExpenseModalOpen(false);
    setEditingExpense(null);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const parsedAmount = parseFloat(amount);

    // Validation 1: Amount must be > 0
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Amount must be a positive number greater than 0.');
      return;
    }

    // Validation 2: Category must be selected
    if (!category.trim()) {
      setErrorMessage('Please select a valid expense category.');
      return;
    }

    // Validation 3: Date cannot be in the future
    if (date > todayStr) {
      setErrorMessage('Expense date cannot be in the future.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, {
          amount: parsedAmount,
          category,
          date,
          paymentMethod,
          description: description.trim()
        });
      } else {
        await addExpense({
          amount: parsedAmount,
          category,
          date,
          paymentMethod,
          description: description.trim(),
          userId: currentStaff.id,
          userName: `${currentStaff.name} (${currentStaff.role})`
        });
      }
      handleClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save expense record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentMethods: { id: PaymentMethod; label: string }[] = [
    { id: 'UPI', label: 'UPI / QR Code' },
    { id: 'Cash', label: 'Cash Petty' },
    { id: 'Card', label: 'Corporate Card' },
    { id: 'Bank Transfer', label: 'Bank Transfer / NEFT' },
    { id: 'Other', label: 'Other' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white border border-[#e4d8cf] rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-expense-title"
      >
        {/* Header with Iraya Maroon Accent */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#fbf5f1] border-b border-[#e4d8cf]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#f2dde1] text-[#721828] border border-[#e2b3bc]">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 id="modal-expense-title" className="font-serif font-bold text-base text-[#2d1217]">
                {editingExpense ? 'Edit Commercial Expense' : 'Log Daily Expense'}
              </h3>
              <p className="text-[11px] text-[#7f6b6f]">
                {editingExpense ? 'Modify financial voucher details' : 'Iraya Homes operational expenditure ledger'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl hover:bg-[#f7efe9] text-[#968186] hover:text-[#45373a] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#fdf0f2] border border-[#f5ccd2] text-[#961c2c] text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Amount Field */}
          <div>
            <label className="block text-xs font-semibold text-[#45373a] mb-1.5">
              Expense Amount (INR ₹) <span className="text-[#961c2c]">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#721828] font-bold text-sm">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#fdf8f5] border border-[#e4d8cf] focus:border-[#721828] focus:bg-white focus:ring-1 focus:ring-[#721828] rounded-xl text-sm font-semibold text-[#2d1217] transition-all outline-none"
                autoFocus
              />
            </div>
            <p className="text-[11px] text-[#968186] mt-1">
              Specify exact cost incurred for this transaction.
            </p>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-[#45373a] mb-1.5">
              Category <span className="text-[#961c2c]">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#968186]">
                <Tag className="w-4 h-4" />
              </span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full pl-9 pr-8 py-2.5 bg-[#fdf8f5] border border-[#e4d8cf] focus:border-[#721828] focus:bg-white focus:ring-1 focus:ring-[#721828] rounded-xl text-xs font-medium text-[#2d1217] transition-all outline-none cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name} {cat.isPredefined ? '' : '(Custom)'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Payment Method 2-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date Picker */}
            <div>
              <label className="block text-xs font-semibold text-[#45373a] mb-1.5">
                Expense Date <span className="text-[#961c2c]">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#968186]">
                  <Calendar className="w-4 h-4" />
                </span>
                <input
                  type="date"
                  max={todayStr}
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#fdf8f5] border border-[#e4d8cf] focus:border-[#721828] focus:bg-white focus:ring-1 focus:ring-[#721828] rounded-xl text-xs font-medium text-[#2d1217] transition-all outline-none"
                />
              </div>
              <p className="text-[10px] text-[#968186] mt-0.5">Cannot be in the future.</p>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-[#45373a] mb-1.5">
                Payment Method <span className="text-[#961c2c]">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#968186]">
                  <CreditCard className="w-4 h-4" />
                </span>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  required
                  className="w-full pl-9 pr-8 py-2.5 bg-[#fdf8f5] border border-[#e4d8cf] focus:border-[#721828] focus:bg-white focus:ring-1 focus:ring-[#721828] rounded-xl text-xs font-medium text-[#2d1217] transition-all outline-none cursor-pointer"
                >
                  {paymentMethods.map((pm) => (
                    <option key={pm.id} value={pm.id}>
                      {pm.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Description / Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#45373a] mb-1.5">
              Description / Notes <span className="text-[11px] font-normal text-[#968186]">(Optional)</span>
            </label>
            <div className="relative">
              <textarea
                rows={2}
                placeholder="e.g., Jio commercial fiber bill, fresh breakfast bakery items, heated pool water testing kits..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-[#fdf8f5] border border-[#e4d8cf] focus:border-[#721828] focus:bg-white focus:ring-1 focus:ring-[#721828] rounded-xl text-xs text-[#2d1217] transition-all outline-none resize-none"
              />
            </div>
          </div>

          {/* Auditor Metadata */}
          <div className="p-3 bg-[#f7efe9] rounded-xl border border-[#e4d8cf] flex items-center justify-between text-[11px] text-[#7f6b6f]">
            <span>Logged By Staff:</span>
            <span className="font-semibold text-[#2d1217]">{currentStaff.name} ({currentStaff.role})</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-medium text-[#7f6b6f] hover:text-[#2d1217] hover:bg-[#f7efe9] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#721828] hover:bg-[#520b19] disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingExpense ? 'Update Expense' : 'Save Expense'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
