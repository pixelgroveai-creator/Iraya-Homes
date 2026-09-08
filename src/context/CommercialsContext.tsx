import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Expense, 
  MonthlyBalance, 
  ExpenseCategoryItem, 
  CommercialsDashboardStats, 
  PaymentMethod 
} from '../types';
import { 
  INITIAL_EXPENSES, 
  INITIAL_MONTHLY_BALANCES, 
  PREDEFINED_CATEGORIES, 
  calculateCommercialsStats 
} from '../data/commercialsSeed';
import { useCRM } from './CRMContext';
import { 
  isSupabaseConnected, 
  getSupabaseClient 
} from '../lib/supabase';

interface CommercialsContextType {
  expenses: Expense[];
  categories: ExpenseCategoryItem[];
  monthlyBalances: Record<string, MonthlyBalance>;
  selectedMonth: string; // YYYY-MM
  setSelectedMonth: (month: string) => void;
  
  // Modals state
  isAddExpenseModalOpen: boolean;
  setIsAddExpenseModalOpen: (open: boolean) => void;
  editingExpense: Expense | null;
  setEditingExpense: (expense: Expense | null) => void;
  isCategoriesModalOpen: boolean;
  setIsCategoriesModalOpen: (open: boolean) => void;
  isSetBalanceModalOpen: boolean;
  setIsSetBalanceModalOpen: (open: boolean) => void;

  // Actions
  addExpense: (data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Expense>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  setMonthlyOpeningBalance: (month: string, openingBalance: number, autoCarryForward?: boolean, notes?: string) => Promise<void>;
  addCustomCategory: (name: string, description?: string, color?: string) => Promise<boolean>;
  deleteCustomCategory: (id: string) => Promise<boolean>;
  exportToCSV: (month?: string) => void;
  resetCommercialsData: () => void;
  
  // Dashboard Analytics
  stats: CommercialsDashboardStats;
}

const CommercialsContext = createContext<CommercialsContextType | undefined>(undefined);

const STORAGE_EXPENSES = 'iraya_commercials_expenses_v1';
const STORAGE_BALANCES = 'iraya_commercials_balances_v1';
const STORAGE_CATEGORIES = 'iraya_commercials_categories_v1';

export const CommercialsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentStaff, addToast, isSupabaseLive } = useCRM();

  // Current default month (e.g. 2026-09)
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    // Default to September 2026 if current year is 2026, or current ISO month
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });

  // Modal states
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isSetBalanceModalOpen, setIsSetBalanceModalOpen] = useState(false);

  // Expenses State with LocalStorage persistence
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_EXPENSES);
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.warn('Failed reading expenses from storage', e);
    }
    return INITIAL_EXPENSES;
  });

  // Monthly Balances State
  const [monthlyBalances, setMonthlyBalances] = useState<Record<string, MonthlyBalance>>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_BALANCES);
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.warn('Failed reading monthly balances from storage', e);
    }
    return INITIAL_MONTHLY_BALANCES;
  });

  // Categories State
  const [categories, setCategories] = useState<ExpenseCategoryItem[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_CATEGORIES);
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.warn('Failed reading categories from storage', e);
    }
    return PREDEFINED_CATEGORIES;
  });

  // Save to LocalStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_EXPENSES, JSON.stringify(expenses));
    } catch (e) {
      console.error('Error storing expenses', e);
    }
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_BALANCES, JSON.stringify(monthlyBalances));
    } catch (e) {
      console.error('Error storing balances', e);
    }
  }, [monthlyBalances]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Error storing categories', e);
    }
  }, [categories]);

  // Compute live dashboard stats
  const stats = useMemo(() => {
    return calculateCommercialsStats(selectedMonth, expenses, monthlyBalances, categories);
  }, [selectedMonth, expenses, monthlyBalances, categories]);

  // Add Expense
  const addExpense = useCallback(async (data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> => {
    // Validation
    if (!data.amount || data.amount <= 0) {
      throw new Error('Amount must be a positive number greater than 0');
    }
    if (!data.category) {
      throw new Error('Please select an expense category');
    }
    if (!data.date) {
      throw new Error('Please choose an expense date');
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (data.date > todayStr) {
      throw new Error('Expense date cannot be in the future');
    }

    const id = `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const newExpense: Expense = {
      ...data,
      id,
      userId: data.userId || currentStaff.id,
      userName: data.userName || currentStaff.name,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    setExpenses(prev => [newExpense, ...prev]);

    // If auto-carry forward is enabled, update current month's closing balance
    const expMonth = data.date.slice(0, 7);
    setMonthlyBalances(prev => {
      const existing = prev[expMonth] || {
        id: `bal-${expMonth}`,
        month: expMonth,
        openingBalance: 0,
        closingBalance: 0,
        autoCarryForward: true,
        createdAt: nowIso,
        updatedAt: nowIso
      };

      const updatedMonthExpenses = [newExpense, ...expenses.filter(e => e.date.startsWith(expMonth))];
      const monthTotalSpent = updatedMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

      return {
        ...prev,
        [expMonth]: {
          ...existing,
          closingBalance: existing.openingBalance - monthTotalSpent,
          updatedAt: nowIso
        }
      };
    });

    addToast({
      id: `toast-exp-${Date.now()}`,
      type: 'success',
      title: 'Expense Logged',
      message: `₹${newExpense.amount.toLocaleString('en-IN')} for ${newExpense.category} recorded successfully.`,
      source: 'commercials',
      timestamp: Date.now()
    });

    // Sync to Supabase in background if live
    if (isSupabaseConnected()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          await client.from('expenses').upsert([{
            id: newExpense.id,
            user_id: newExpense.userId,
            amount: newExpense.amount,
            category: newExpense.category,
            date: newExpense.date,
            description: newExpense.description || '',
            payment_method: newExpense.paymentMethod,
            created_at: newExpense.createdAt
          }]);
        } catch (err) {
          console.warn('Supabase expense sync deferred', err);
        }
      }
    }

    return newExpense;
  }, [currentStaff, expenses, addToast]);

  // Update Expense
  const updateExpense = useCallback(async (id: string, updates: Partial<Expense>): Promise<void> => {
    const nowIso = new Date().toISOString();
    setExpenses(prev => prev.map(exp => {
      if (exp.id === id) {
        return {
          ...exp,
          ...updates,
          updatedAt: nowIso
        };
      }
      return exp;
    }));

    addToast({
      id: `toast-exp-up-${Date.now()}`,
      type: 'info',
      title: 'Expense Updated',
      message: `Expense record has been updated.`,
      source: 'commercials',
      timestamp: Date.now()
    });

    if (isSupabaseConnected()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          await client.from('expenses').update({
            amount: updates.amount,
            category: updates.category,
            date: updates.date,
            description: updates.description,
            payment_method: updates.paymentMethod
          }).eq('id', id);
        } catch (err) {
          console.warn('Supabase expense update error', err);
        }
      }
    }
  }, [addToast]);

  // Delete Expense
  const deleteExpense = useCallback(async (id: string): Promise<void> => {
    const target = expenses.find(e => e.id === id);
    setExpenses(prev => prev.filter(e => e.id !== id));

    addToast({
      id: `toast-exp-del-${Date.now()}`,
      type: 'warning',
      title: 'Expense Deleted',
      message: target ? `Removed expense of ₹${target.amount.toLocaleString('en-IN')}.` : 'Expense removed.',
      source: 'commercials',
      timestamp: Date.now()
    });

    if (isSupabaseConnected()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          await client.from('expenses').delete().eq('id', id);
        } catch (err) {
          console.warn('Supabase expense delete error', err);
        }
      }
    }
  }, [expenses, addToast]);

  // Set Monthly Opening Balance
  const setMonthlyOpeningBalance = useCallback(async (
    month: string, 
    openingBalance: number, 
    autoCarryForward: boolean = true,
    notes?: string
  ): Promise<void> => {
    const nowIso = new Date().toISOString();
    const monthExpenses = expenses.filter(e => e.date.startsWith(month));
    const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const closingBalance = openingBalance - totalSpent;

    const newBal: MonthlyBalance = {
      id: `bal-${month}`,
      month,
      openingBalance,
      closingBalance,
      autoCarryForward,
      notes: notes || `Opening balance for ${month}`,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    setMonthlyBalances(prev => ({
      ...prev,
      [month]: newBal
    }));

    addToast({
      id: `toast-bal-${Date.now()}`,
      type: 'success',
      title: 'Balance Configured',
      message: `Opening balance for ${month} set to ₹${openingBalance.toLocaleString('en-IN')}.`,
      source: 'commercials',
      timestamp: Date.now()
    });

    if (isSupabaseConnected()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          await client.from('monthly_balances').upsert([{
            id: newBal.id,
            month: `${month}-01`,
            opening_balance: newBal.openingBalance,
            closing_balance: newBal.closingBalance,
            created_at: newBal.createdAt,
            updated_at: newBal.updatedAt
          }]);
        } catch (err) {
          console.warn('Supabase balance sync error', err);
        }
      }
    }
  }, [expenses, addToast]);

  // Add Custom Category
  const addCustomCategory = useCallback(async (name: string, description?: string, color?: string): Promise<boolean> => {
    const trimmed = name.trim();
    if (!trimmed) {
      addToast({
        id: `toast-cat-err-${Date.now()}`,
        type: 'error',
        title: 'Invalid Category Name',
        message: 'Category name cannot be empty.',
        source: 'commercials',
        timestamp: Date.now()
      });
      return false;
    }

    if (categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      addToast({
        id: `toast-cat-exists-${Date.now()}`,
        type: 'warning',
        title: 'Category Exists',
        message: `Category "${trimmed}" already exists.`,
        source: 'commercials',
        timestamp: Date.now()
      });
      return false;
    }

    // Palette generator for custom categories
    const customColors = ['#059669', '#2563eb', '#9333ea', '#db2777', '#ea580c', '#0891b2', '#4f46e5'];
    const assignedColor = color || customColors[Math.floor(Math.random() * customColors.length)];

    const newCat: ExpenseCategoryItem = {
      id: `cat-${Date.now()}`,
      name: trimmed,
      isPredefined: false,
      color: assignedColor,
      description: description || 'Custom expense category',
      createdAt: new Date().toISOString()
    };

    setCategories(prev => [...prev, newCat]);

    addToast({
      id: `toast-cat-ok-${Date.now()}`,
      type: 'success',
      title: 'Category Created',
      message: `Custom category "${trimmed}" added successfully.`,
      source: 'commercials',
      timestamp: Date.now()
    });

    return true;
  }, [categories, addToast]);

  // Delete Custom Category
  const deleteCustomCategory = useCallback(async (id: string): Promise<boolean> => {
    const target = categories.find(c => c.id === id);
    if (!target) return false;

    if (target.isPredefined) {
      addToast({
        id: `toast-cat-locked-${Date.now()}`,
        type: 'error',
        title: 'Action Restricted',
        message: `Predefined system categories cannot be deleted.`,
        source: 'commercials',
        timestamp: Date.now()
      });
      return false;
    }

    setCategories(prev => prev.filter(c => c.id !== id));

    addToast({
      id: `toast-cat-del-${Date.now()}`,
      type: 'info',
      title: 'Category Removed',
      message: `Category "${target.name}" has been deleted.`,
      source: 'commercials',
      timestamp: Date.now()
    });

    return true;
  }, [categories, addToast]);

  // Export to CSV
  const exportToCSV = useCallback((month?: string) => {
    const targetMonth = month || selectedMonth;
    const filtered = expenses.filter(e => e.date.startsWith(targetMonth));

    if (filtered.length === 0) {
      addToast({
        id: `toast-csv-empty-${Date.now()}`,
        type: 'info',
        title: 'No Records to Export',
        message: `No expenses found for month ${targetMonth}.`,
        source: 'commercials',
        timestamp: Date.now()
      });
      return;
    }

    const headers = ['ID', 'Date', 'Category', 'Amount (INR)', 'Payment Method', 'Description', 'Logged By', 'Created At'];
    const rows = filtered.map(e => [
      `"${e.id}"`,
      `"${e.date}"`,
      `"${e.category}"`,
      e.amount,
      `"${e.paymentMethod}"`,
      `"${(e.description || '').replace(/"/g, '""')}"`,
      `"${e.userName || 'Staff'}"`,
      `"${e.createdAt}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `iraya-homes-commercials-${targetMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast({
      id: `toast-csv-done-${Date.now()}`,
      type: 'success',
      title: 'CSV Exported',
      message: `Exported ${filtered.length} expense rows for ${targetMonth}.`,
      source: 'commercials',
      timestamp: Date.now()
    });
  }, [expenses, selectedMonth, addToast]);

  // Reset to default seed
  const resetCommercialsData = useCallback(() => {
    setExpenses(INITIAL_EXPENSES);
    setMonthlyBalances(INITIAL_MONTHLY_BALANCES);
    setCategories(PREDEFINED_CATEGORIES);
    localStorage.removeItem(STORAGE_EXPENSES);
    localStorage.removeItem(STORAGE_BALANCES);
    localStorage.removeItem(STORAGE_CATEGORIES);

    addToast({
      id: `toast-reset-${Date.now()}`,
      type: 'info',
      title: 'Data Reset',
      message: 'Commercials records reset to default luxury villa seed values.',
      source: 'commercials',
      timestamp: Date.now()
    });
  }, [addToast]);

  return (
    <CommercialsContext.Provider value={{
      expenses,
      categories,
      monthlyBalances,
      selectedMonth,
      setSelectedMonth,
      isAddExpenseModalOpen,
      setIsAddExpenseModalOpen,
      editingExpense,
      setEditingExpense,
      isCategoriesModalOpen,
      setIsCategoriesModalOpen,
      isSetBalanceModalOpen,
      setIsSetBalanceModalOpen,
      addExpense,
      updateExpense,
      deleteExpense,
      setMonthlyOpeningBalance,
      addCustomCategory,
      deleteCustomCategory,
      exportToCSV,
      resetCommercialsData,
      stats
    }}>
      {children}
    </CommercialsContext.Provider>
  );
};

export const useCommercials = () => {
  const context = useContext(CommercialsContext);
  if (!context) {
    throw new Error('useCommercials must be used within a CommercialsProvider');
  }
  return context;
};
