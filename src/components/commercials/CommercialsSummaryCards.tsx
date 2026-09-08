import React from 'react';
import { 
  TrendingDown, 
  Wallet, 
  Scale, 
  CalendarClock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Edit3,
  Sparkles,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useCommercials } from '../../context/CommercialsContext';

export const CommercialsSummaryCards: React.FC = () => {
  const { stats, selectedMonth, setIsSetBalanceModalOpen } = useCommercials();

  const [yearStr, monthStr] = selectedMonth.split('-');
  const monthName = new Date(Number(yearStr), Number(monthStr) - 1, 1).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  });

  const cards = [
    {
      id: 'total-spent',
      title: 'Total Spent',
      subtitle: `${stats.expenseCount} vouchers recorded in ${monthName}`,
      amount: `₹${stats.totalSpent.toLocaleString('en-IN')}`,
      icon: TrendingDown,
      color: 'text-[#961c2c]',
      bgColor: 'bg-[#fdf0f2]',
      borderColor: 'border-[#f5ccd2]',
      badge: 'Month-to-Date'
    },
    {
      id: 'opening-balance',
      title: 'Opening Balance',
      subtitle: 'Starting pool or carried forward',
      amount: `₹${stats.openingBalance.toLocaleString('en-IN')}`,
      icon: Wallet,
      color: 'text-[#c29342]',
      bgColor: 'bg-[#faf5ec]',
      borderColor: 'border-[#ebdcc3]',
      badge: 'Operational Pool',
      action: {
        label: 'Set Balance',
        onClick: () => setIsSetBalanceModalOpen(true)
      }
    },
    {
      id: 'closing-balance',
      title: 'Closing Balance',
      subtitle: 'Formula: Opening – Total Spent',
      amount: `₹${stats.closingBalance.toLocaleString('en-IN')}`,
      icon: Scale,
      color: stats.closingBalance >= 0 ? 'text-[#2d5a43]' : 'text-[#961c2c]',
      bgColor: stats.closingBalance >= 0 ? 'bg-[#f0f7f3]' : 'bg-[#fdf0f2]',
      borderColor: stats.closingBalance >= 0 ? 'border-[#c7e3d2]' : 'border-[#f5ccd2]',
      badge: stats.closingBalance >= 0 ? 'Surplus' : 'Deficit',
      isWarning: stats.closingBalance < 0
    },
    {
      id: 'avg-daily-spend',
      title: 'Average Daily Spend',
      subtitle: 'Based on active expenditure days',
      amount: `₹${stats.avgDailySpend.toLocaleString('en-IN')}`,
      icon: CalendarClock,
      color: 'text-[#721828]',
      bgColor: 'bg-[#fbf2f4]',
      borderColor: 'border-[#e2b3bc]',
      badge: 'Daily Run Rate'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            id={`card-${card.id}`}
            className="bg-white rounded-2xl border border-[#e4d8cf] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
          >
            {/* Top Row: Title, Badge, and Icon */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7f6b6f]">
                  {card.title}
                </span>
                <div className="flex items-center gap-1.5">
                  {card.badge && (
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${card.bgColor} ${card.color} ${card.borderColor}`}>
                      {card.badge}
                    </span>
                  )}
                  <div className={`p-2 rounded-xl ${card.bgColor} ${card.color} border ${card.borderColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Main Number */}
              <div className="mb-1 flex items-baseline justify-between">
                <h3 className={`font-serif font-bold text-2xl sm:text-3xl tracking-tight ${card.color}`}>
                  {card.amount}
                </h3>
              </div>

              {/* Subtitle */}
              <p className="text-xs text-[#7f6b6f]">
                {card.subtitle}
              </p>
            </div>

            {/* Bottom Action or Status row */}
            {card.action ? (
              <div className="pt-3 mt-3 border-t border-[#f7efe9] flex items-center justify-between">
                <span className="text-[10px] text-[#968186]">Configurable per month</span>
                <button
                  type="button"
                  onClick={card.action.onClick}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#721828] hover:text-[#520b19] bg-[#fbf2f4] hover:bg-[#f2dde1] px-2.5 py-1 rounded-lg border border-[#e2b3bc] transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{card.action.label}</span>
                </button>
              </div>
            ) : card.isWarning ? (
              <div className="pt-3 mt-3 border-t border-[#fdf0f2] flex items-center gap-1.5 text-[11px] font-semibold text-[#961c2c]">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Operating budget deficit detected</span>
              </div>
            ) : (
              <div className="pt-3 mt-3 border-t border-[#f7efe9] flex items-center justify-between text-[11px] text-[#968186]">
                <span>Status: Normal</span>
                <span className="text-[#2d5a43] font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Balanced
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
