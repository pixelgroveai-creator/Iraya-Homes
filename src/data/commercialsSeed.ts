import { 
  Expense, 
  MonthlyBalance, 
  ExpenseCategoryItem, 
  PredefinedExpenseCategory,
  PaymentMethod 
} from '../types';

export const PREDEFINED_CATEGORIES: ExpenseCategoryItem[] = [
  {
    id: 'cat-marketing',
    name: 'Marketing & Ads',
    isPredefined: true,
    color: '#c29342', // Warm Gold
    description: 'Social media ads, influencer stays, local promotions, photography & SEO'
  },
  {
    id: 'cat-software',
    name: 'Software & Tools',
    isPredefined: true,
    color: '#0284c7', // Slate Cyan
    description: 'Property management software, CRM, Google Workspace, billing & Wi-Fi gateway'
  },
  {
    id: 'cat-supplies',
    name: 'Office Supplies',
    isPredefined: true,
    color: '#64748b', // Cool Slate
    description: 'Guest registers, key tags, stationery, printing, bills & envelopes'
  },
  {
    id: 'cat-travel',
    name: 'Travel & Transport',
    isPredefined: true,
    color: '#7c3aed', // Purple Violet
    description: 'Airport guest transfers, staff local runs, fuel & vehicle parking'
  },
  {
    id: 'cat-food',
    name: 'Food & Beverages',
    isPredefined: true,
    color: '#d97706', // Amber
    description: 'Breakfast ingredients, fresh local vegetables, artisanal coffee, spices & tea'
  },
  {
    id: 'cat-utilities',
    name: 'Utilities (Electricity, Internet, etc.)',
    isPredefined: true,
    color: '#721828', // Iraya Royal Maroon
    description: 'Commercial electricity for heated pool and HVAC, high-speed fiber internet, water'
  },
  {
    id: 'cat-salaries',
    name: 'Salaries & Wages',
    isPredefined: true,
    color: '#2d5a43', // Forest Emerald
    description: 'Villa host stipends, head chef compensation, housekeeping & maintenance payroll'
  },
  {
    id: 'cat-misc',
    name: 'Miscellaneous',
    isPredefined: true,
    color: '#8b5cf6', // Indigo
    description: 'Emergency hardware repairs, floral lobby arrangements, guest welcome gifts'
  }
];

export const INITIAL_MONTHLY_BALANCES: Record<string, MonthlyBalance> = {
  '2026-08': {
    id: 'bal-2026-08',
    month: '2026-08',
    openingBalance: 320000, // ₹3,20,000 opening
    closingBalance: 147500, // Calculated dynamically
    autoCarryForward: true,
    notes: 'August 2026 operations closing balance carried forward to September',
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-31T23:59:59Z'
  },
  '2026-09': {
    id: 'bal-2026-09',
    month: '2026-09',
    openingBalance: 147500, // Carried forward from August closing
    closingBalance: 82100, // Calculated dynamically
    autoCarryForward: true,
    notes: 'September 2026 active operating pool for Iraya Homes',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-08T00:00:00Z'
  }
};

export const INITIAL_EXPENSES: Expense[] = [
  // --- September 2026 (Current Month) ---
  {
    id: 'exp-2026-09-01',
    userId: 'staff-001',
    userName: 'Kunal Singh (Manager)',
    amount: 14500,
    category: 'Utilities (Electricity, Internet, etc.)',
    date: '2026-09-01',
    description: 'Jio Fiber Commercial 1 Gbps internet lease for villa mesh network & heated pool controller',
    paymentMethod: 'Bank Transfer',
    createdAt: '2026-09-01T10:30:00Z'
  },
  {
    id: 'exp-2026-09-02',
    userId: 'staff-002',
    userName: 'Rohit Verma (Host)',
    amount: 6800,
    category: 'Food & Beverages',
    date: '2026-09-02',
    description: 'Fresh local dairy, organic eggs, artisan bakery supplies for weekend VIP group breakfast',
    paymentMethod: 'UPI',
    createdAt: '2026-09-02T11:15:00Z'
  },
  {
    id: 'exp-2026-09-03',
    userId: 'staff-001',
    userName: 'Kunal Singh (Manager)',
    amount: 8500,
    category: 'Marketing & Ads',
    date: '2026-09-03',
    description: 'Meta Ads & Instagram campaign targeting Delhi-NCR luxury weekend staycation bookings',
    paymentMethod: 'Card',
    createdAt: '2026-09-03T15:45:00Z'
  },
  {
    id: 'exp-2026-09-04',
    userId: 'staff-003',
    userName: 'Pooja Tiwari (Ops)',
    amount: 2400,
    category: 'Office Supplies',
    date: '2026-09-04',
    description: 'Custom embossed Iraya keycard holders, villa guest register books & premium pens',
    paymentMethod: 'Cash',
    createdAt: '2026-09-04T12:00:00Z'
  },
  {
    id: 'exp-2026-09-05',
    userId: 'staff-001',
    userName: 'Kunal Singh (Manager)',
    amount: 12000,
    category: 'Software & Tools',
    date: '2026-09-05',
    description: 'Cloud PMS subscription, channel manager connection & accounting software monthly renewal',
    paymentMethod: 'Card',
    createdAt: '2026-09-05T09:00:00Z'
  },
  {
    id: 'exp-2026-09-06',
    userId: 'staff-002',
    userName: 'Rohit Verma (Host)',
    amount: 3200,
    category: 'Travel & Transport',
    date: '2026-09-06',
    description: 'Chauffeur airport transfer fuel and toll charges for Sharma family arrival from Lucknow Airport',
    paymentMethod: 'UPI',
    createdAt: '2026-09-06T16:30:00Z'
  },
  {
    id: 'exp-2026-09-07',
    userId: 'staff-003',
    userName: 'Pooja Tiwari (Ops)',
    amount: 4500,
    category: 'Food & Beverages',
    date: '2026-09-07',
    description: 'Awadhi spices, basmati rice, saffron, and fresh meats from Chowk market for dinner catering',
    paymentMethod: 'UPI',
    createdAt: '2026-09-07T14:10:00Z'
  },
  {
    id: 'exp-2026-09-07-2',
    userId: 'staff-001',
    userName: 'Kunal Singh (Manager)',
    amount: 13500,
    category: 'Utilities (Electricity, Internet, etc.)',
    date: '2026-09-07',
    description: 'UPPCL Commercial power bill advance deposit for heated indoor pool heat pump and HVAC load',
    paymentMethod: 'Bank Transfer',
    createdAt: '2026-09-07T17:45:00Z'
  },

  // --- August 2026 (Previous Month History) ---
  {
    id: 'exp-2026-08-01',
    userId: 'staff-001',
    userName: 'Kunal Singh (Manager)',
    amount: 14500,
    category: 'Utilities (Electricity, Internet, etc.)',
    date: '2026-08-01',
    description: 'Commercial broadband & telephone service for villa reception and security cameras',
    paymentMethod: 'Bank Transfer',
    createdAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'exp-2026-08-05',
    userId: 'staff-001',
    userName: 'Kunal Singh (Manager)',
    amount: 65000,
    category: 'Salaries & Wages',
    date: '2026-08-05',
    description: 'Monthly payroll disbursement for housekeeping team, pool technician & host assistant',
    paymentMethod: 'Bank Transfer',
    createdAt: '2026-08-05T11:00:00Z'
  },
  {
    id: 'exp-2026-08-08',
    userId: 'staff-002',
    userName: 'Rohit Verma (Host)',
    amount: 18500,
    category: 'Food & Beverages',
    date: '2026-08-08',
    description: 'Full pantry stocking for Independence Day long weekend private villa buyout catering',
    paymentMethod: 'Card',
    createdAt: '2026-08-08T15:20:00Z'
  },
  {
    id: 'exp-2026-08-12',
    userId: 'staff-001',
    userName: 'Kunal Singh (Manager)',
    amount: 22000,
    category: 'Marketing & Ads',
    date: '2026-08-12',
    description: 'High-end architectural video drone shoot and photo licensing for website and Google Business',
    paymentMethod: 'Bank Transfer',
    createdAt: '2026-08-12T13:45:00Z'
  },
  {
    id: 'exp-2026-08-15',
    userId: 'staff-003',
    userName: 'Pooja Tiwari (Ops)',
    amount: 16500,
    category: 'Utilities (Electricity, Internet, etc.)',
    date: '2026-08-15',
    description: 'UPPCL electricity bi-monthly settlement for whole-house central air conditioning',
    paymentMethod: 'Bank Transfer',
    createdAt: '2026-08-15T09:30:00Z'
  },
  {
    id: 'exp-2026-08-20',
    userId: 'staff-001',
    userName: 'Kunal Singh (Manager)',
    amount: 12000,
    category: 'Software & Tools',
    date: '2026-08-20',
    description: 'Annual domain renewal, SSL certificates, and Google Workspace business starter licenses',
    paymentMethod: 'Card',
    createdAt: '2026-08-20T14:15:00Z'
  },
  {
    id: 'exp-2026-08-24',
    userId: 'staff-002',
    userName: 'Rohit Verma (Host)',
    amount: 9500,
    category: 'Travel & Transport',
    date: '2026-08-24',
    description: 'Luxury Innova Crysta transfers for guest family heritage tour (Bara Imambara, Rumi Darwaza)',
    paymentMethod: 'UPI',
    createdAt: '2026-08-24T18:00:00Z'
  },
  {
    id: 'exp-2026-08-27',
    userId: 'staff-003',
    userName: 'Pooja Tiwari (Ops)',
    amount: 4500,
    category: 'Office Supplies',
    date: '2026-08-27',
    description: 'Restock of guest welcome stationery, branded folders, luggage tags & waterproof envelopes',
    paymentMethod: 'Cash',
    createdAt: '2026-08-27T16:20:00Z'
  },
  {
    id: 'exp-2026-08-30',
    userId: 'staff-001',
    userName: 'Kunal Singh (Manager)',
    amount: 10000,
    category: 'Miscellaneous',
    date: '2026-08-30',
    description: 'Pool water filtration maintenance, UV lamp replacement and acoustic dampener servicing',
    paymentMethod: 'Bank Transfer',
    createdAt: '2026-08-30T11:45:00Z'
  }
];

// Helper to calculate summary statistics for a given month YYYY-MM
export function calculateCommercialsStats(
  month: string,
  expenses: Expense[],
  monthlyBalances: Record<string, MonthlyBalance>,
  categories: ExpenseCategoryItem[]
) {
  // Filter expenses strictly for the specified month
  const monthExpenses = expenses.filter(e => e.date.startsWith(month));
  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Retrieve or compute opening balance
  const monthBal = monthlyBalances[month];
  let openingBalance = 0;
  if (monthBal !== undefined) {
    openingBalance = monthBal.openingBalance;
  } else {
    // If not set, try checking previous month's closing balance
    const [y, m] = month.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    const prevBal = monthlyBalances[prevMonth];
    if (prevBal && prevBal.autoCarryForward !== false) {
      openingBalance = prevBal.closingBalance;
    }
  }

  // Formula: Closing Balance = Opening Balance - sum(All Expenses in Month)
  const closingBalance = openingBalance - totalSpent;

  // Category breakdown calculation
  const categoryMap = new Map<string, { total: number; count: number }>();
  for (const exp of monthExpenses) {
    const existing = categoryMap.get(exp.category) || { total: 0, count: 0 };
    existing.total += exp.amount;
    existing.count += 1;
    categoryMap.set(exp.category, existing);
  }

  const categoryBreakdown = Array.from(categoryMap.entries()).map(([catName, data]) => {
    const catDef = categories.find(c => c.name.toLowerCase() === catName.toLowerCase());
    const color = catDef ? catDef.color || '#721828' : '#721828';
    return {
      category: catName,
      totalAmount: data.total,
      percentage: totalSpent > 0 ? Math.round((data.total / totalSpent) * 1000) / 10 : 0,
      count: data.count,
      color
    };
  }).sort((a, b) => b.totalAmount - a.totalAmount);

  // Daily spend trends over days of the month
  const daysInMonth = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0).getDate();
  const dailyMap = new Map<number, { amount: number; count: number }>();
  for (let d = 1; d <= daysInMonth; d++) {
    dailyMap.set(d, { amount: 0, count: 0 });
  }

  for (const exp of monthExpenses) {
    const day = parseInt(exp.date.split('-')[2], 10);
    if (dailyMap.has(day)) {
      const cur = dailyMap.get(day)!;
      cur.amount += exp.amount;
      cur.count += 1;
    }
  }

  // Calculate average daily spend across active days with spend, or elapsed days
  const activeSpendDays = Array.from(dailyMap.values()).filter(d => d.amount > 0);
  const avgDailySpend = activeSpendDays.length > 0 
    ? Math.round(totalSpent / activeSpendDays.length) 
    : 0;

  // Outlier detection: day spend > 2x average spend
  const dailySpendTrends = Array.from(dailyMap.entries()).map(([day, data]) => {
    const dateStr = `${month}-${String(day).padStart(2, '0')}`;
    const isOutlier = avgDailySpend > 0 && data.amount >= avgDailySpend * 2;
    return {
      date: dateStr,
      day,
      amount: data.amount,
      count: data.count,
      isOutlier
    };
  });

  // Top expenses
  const topExpenses = [...monthExpenses].sort((a, b) => b.amount - a.amount).slice(0, 5);

  // Payment method breakdown
  const paymentMethodMap = new Map<PaymentMethod, { amount: number; count: number }>();
  for (const exp of monthExpenses) {
    const existing = paymentMethodMap.get(exp.paymentMethod) || { amount: 0, count: 0 };
    existing.amount += exp.amount;
    existing.count += 1;
    paymentMethodMap.set(exp.paymentMethod, existing);
  }

  const paymentMethodBreakdown = Array.from(paymentMethodMap.entries()).map(([method, data]) => ({
    method,
    amount: data.amount,
    percentage: totalSpent > 0 ? Math.round((data.amount / totalSpent) * 1000) / 10 : 0,
    count: data.count
  })).sort((a, b) => b.amount - a.amount);

  return {
    month,
    totalSpent,
    openingBalance,
    closingBalance,
    avgDailySpend,
    expenseCount: monthExpenses.length,
    isDeficit: closingBalance < 0,
    categoryBreakdown,
    dailySpendTrends,
    topExpenses,
    paymentMethodBreakdown
  };
}

export const INITIAL_COMMERCIALS_EXPENSES = INITIAL_EXPENSES;
export const INITIAL_CATEGORIES = PREDEFINED_CATEGORIES;
