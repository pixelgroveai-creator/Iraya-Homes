import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Edit3, 
  Trash2, 
  Calendar, 
  Tag, 
  CreditCard, 
  Receipt, 
  ArrowUpDown, 
  ChevronDown, 
  Plus,
  FileSpreadsheet
} from 'lucide-react';
import { useCommercials } from '../../context/CommercialsContext';
import { Expense, PaymentMethod } from '../../types';

export const CommercialsExpenseTable: React.FC = () => {
  const { 
    expenses, 
    selectedMonth, 
    categories, 
    deleteExpense, 
    setEditingExpense, 
    setIsAddExpenseModalOpen,
    exportToCSV 
  } = useCommercials();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter expenses strictly by selected month + search & dropdown filters
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        // Month match
        if (!exp.date.startsWith(selectedMonth)) return false;

        // Search query match
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchDesc = (exp.description || '').toLowerCase().includes(q);
          const matchCat = exp.category.toLowerCase().includes(q);
          const matchUser = (exp.userName || '').toLowerCase().includes(q);
          const matchMethod = exp.paymentMethod.toLowerCase().includes(q);
          const matchAmount = exp.amount.toString().includes(q);
          if (!matchDesc && !matchCat && !matchUser && !matchMethod && !matchAmount) {
            return false;
          }
        }

        // Category filter
        if (selectedCategoryFilter !== 'all' && exp.category !== selectedCategoryFilter) {
          return false;
        }

        // Payment method filter
        if (selectedPaymentFilter !== 'all' && exp.paymentMethod !== selectedPaymentFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
        }
        if (sortBy === 'date-asc') {
          return a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt);
        }
        if (sortBy === 'amount-desc') {
          return b.amount - a.amount;
        }
        if (sortBy === 'amount-asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [expenses, selectedMonth, searchQuery, selectedCategoryFilter, selectedPaymentFilter, sortBy]);

  const totalFilteredAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleEdit = (exp: Expense) => {
    setEditingExpense(exp);
    setIsAddExpenseModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteExpense(id);
    setDeleteConfirmId(null);
  };

  const paymentMethods: PaymentMethod[] = ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Other'];

  return (
    <div className="bg-white rounded-2xl border border-[#e4d8cf] overflow-hidden shadow-xs">
      {/* Top Filter Bar */}
      <div className="p-4 sm:p-5 border-b border-[#f7efe9] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif font-bold text-base text-[#2d1217]">
              Daily Expense Ledger
            </h3>
            <p className="text-xs text-[#7f6b6f]">
              Showing {filteredExpenses.length} entries for {selectedMonth} (Total: ₹{totalFilteredAmount.toLocaleString('en-IN')})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => exportToCSV(selectedMonth)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#fdf8f5] hover:bg-[#f7efe9] border border-[#e4d8cf] text-xs font-semibold text-[#45373a] rounded-xl transition-all cursor-pointer shadow-2xs"
              title="Download ledger as CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#2d5a43]" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingExpense(null);
                setIsAddExpenseModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#721828] hover:bg-[#520b19] text-white font-semibold text-xs rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#968186]" />
            <input
              type="text"
              placeholder="Search description, staff, ₹..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-3 py-2 bg-[#fdf8f5] border border-[#e4d8cf] focus:border-[#721828] focus:bg-white rounded-xl text-xs text-[#2d1217] outline-none transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#fdf8f5] border border-[#e4d8cf] focus:border-[#721828] focus:bg-white rounded-xl text-xs text-[#2d1217] outline-none transition-colors cursor-pointer appearance-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#968186]" />
          </div>

          {/* Payment Method Filter */}
          <div className="relative">
            <select
              value={selectedPaymentFilter}
              onChange={(e) => setSelectedPaymentFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#fdf8f5] border border-[#e4d8cf] focus:border-[#721828] focus:bg-white rounded-xl text-xs text-[#2d1217] outline-none transition-colors cursor-pointer appearance-none"
            >
              <option value="all">All Payment Methods</option>
              {paymentMethods.map((pm) => (
                <option key={pm} value={pm}>{pm}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#968186]" />
          </div>

          {/* Sorting */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-[#fdf8f5] border border-[#e4d8cf] focus:border-[#721828] focus:bg-white rounded-xl text-xs text-[#2d1217] outline-none transition-colors cursor-pointer appearance-none"
            >
              <option value="date-desc">Date: Newest First</option>
              <option value="date-asc">Date: Oldest First</option>
              <option value="amount-desc">Amount: Highest First</option>
              <option value="amount-asc">Amount: Lowest First</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#968186]" />
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-10 h-10 text-[#e4d8cf] mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#45373a]">No expenses found</p>
            <p className="text-xs text-[#968186] mt-1 max-w-sm mx-auto">
              No expenditure matching your filter criteria exists for {selectedMonth}.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategoryFilter('all');
                setSelectedPaymentFilter('all');
              }}
              className="mt-3 px-3 py-1.5 bg-[#fdf8f5] hover:bg-[#f7efe9] text-xs font-semibold text-[#721828] rounded-xl border border-[#e2b3bc] transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#fbf5f1] border-b border-[#e4d8cf] text-[10px] font-bold uppercase tracking-wider text-[#7f6b6f]">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Logged By</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f7efe9]">
              {filteredExpenses.map((exp) => {
                const catDef = categories.find(c => c.name.toLowerCase() === exp.category.toLowerCase());
                const catColor = catDef?.color || '#721828';
                const isConfirmingDelete = deleteConfirmId === exp.id;

                return (
                  <tr 
                    key={exp.id} 
                    className="hover:bg-[#fdf8f5] transition-colors group"
                  >
                    {/* Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-[#2d1217]">
                      {exp.date}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span 
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border"
                        style={{
                          backgroundColor: `${catColor}15`,
                          borderColor: `${catColor}40`,
                          color: catColor
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor }} />
                        {exp.category}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 text-[#45373a] max-w-xs sm:max-w-md">
                      <p className="line-clamp-2 leading-relaxed font-normal">
                        {exp.description || <span className="text-[#968186] italic">No description provided</span>}
                      </p>
                    </td>

                    {/* Payment Method */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#f7efe9] text-[#7f6b6f] border border-[#e4d8cf]">
                        <CreditCard className="w-3 h-3" />
                        {exp.paymentMethod}
                      </span>
                    </td>

                    {/* Logged By */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-[#7f6b6f] text-[11px]">
                      {exp.userName || 'Staff'}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right font-serif font-bold text-sm text-[#721828]">
                      ₹{exp.amount.toLocaleString('en-IN')}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-center">
                      {isConfirmingDelete ? (
                        <div className="inline-flex items-center gap-1 bg-[#fdf0f2] p-1 rounded-lg border border-[#f5ccd2]">
                          <button
                            type="button"
                            onClick={() => handleDelete(exp.id)}
                            className="px-2 py-0.5 text-[10px] font-bold bg-[#961c2c] text-white rounded cursor-pointer hover:bg-[#721828]"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-1.5 py-0.5 text-[10px] text-[#7f6b6f] hover:text-[#2d1217] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleEdit(exp)}
                            className="p-1.5 rounded-lg text-[#7f6b6f] hover:text-[#721828] hover:bg-[#fbf2f4] transition-colors cursor-pointer"
                            title="Edit expense"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(exp.id)}
                            className="p-1.5 rounded-lg text-[#7f6b6f] hover:text-[#961c2c] hover:bg-[#fdf0f2] transition-colors cursor-pointer"
                            title="Delete expense"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Table Footer with Summary */}
      <div className="p-4 bg-[#fbf5f1] border-t border-[#e4d8cf] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#7f6b6f]">
        <span>
          Showing {filteredExpenses.length} of {expenses.filter(e => e.date.startsWith(selectedMonth)).length} transactions this month
        </span>
        <div className="flex items-center gap-4">
          <span>Subtotal: <strong className="text-[#2d1217] font-serif font-bold text-sm">₹{totalFilteredAmount.toLocaleString('en-IN')}</strong></span>
        </div>
      </div>
    </div>
  );
};
