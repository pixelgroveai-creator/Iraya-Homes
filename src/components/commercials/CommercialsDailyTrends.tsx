import React from 'react';
import { 
  TrendingUp, 
  AlertCircle, 
  CreditCard, 
  Flame, 
  Calendar,
  Sparkles,
  Zap
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useCommercials } from '../../context/CommercialsContext';

export const CommercialsDailyTrends: React.FC = () => {
  const { stats, selectedMonth } = useCommercials();
  const { dailySpendTrends, avgDailySpend, paymentMethodBreakdown, topExpenses } = stats;

  const [yearStr, monthStr] = selectedMonth.split('-');
  const monthName = new Date(Number(yearStr), Number(monthStr) - 1, 1).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  });

  const outliers = dailySpendTrends.filter(d => d.isOutlier && d.amount > 0);

  const CustomTrendTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-xl border border-[#e4d8cf] shadow-xl text-xs space-y-1">
          <p className="font-bold text-[#2d1217]">
            {data.date} (Day {data.day})
          </p>
          <p className="text-sm font-serif font-bold text-[#721828]">
            ₹{data.amount.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#7f6b6f]">
            {data.count} {data.count === 1 ? 'transaction' : 'transactions'}
          </p>
          {data.isOutlier && (
            <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold bg-[#fdf0f2] text-[#961c2c] border border-[#f5ccd2] rounded-md mt-1">
              Outlier Spike (≥ 2× Avg)
            </span>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Daily Spend Trend Area Chart (8 cols) */}
      <div className="lg:col-span-8 bg-white rounded-2xl border border-[#e4d8cf] p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-[#f7efe9]">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base text-[#2d1217]">
                  Daily Spending Curve
                </h3>
                {outliers.length > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-[#fdf0f2] text-[#961c2c] border border-[#f5ccd2] rounded-full flex items-center gap-1">
                    <Flame className="w-3 h-3 text-[#961c2c]" />
                    {outliers.length} Outlier Spike{outliers.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#7f6b6f]">
                Daily outlay progression for {monthName} • Daily Avg: ₹{avgDailySpend.toLocaleString('en-IN')}
              </p>
            </div>

            {/* Threshold Legend */}
            <div className="flex items-center gap-3 text-[11px] text-[#7f6b6f]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-[#721828] rounded-full" />
                <span>Daily Spend</span>
              </div>
            </div>
          </div>

          {/* Area Chart */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dailySpendTrends}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="maroonGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#721828" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#721828" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 10, fill: '#7f6b6f' }} 
                  axisLine={{ stroke: '#e4d8cf' }}
                  tickLine={false}
                  tickFormatter={(val) => `D${val}`}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#7f6b6f' }} 
                  axisLine={{ stroke: '#e4d8cf' }}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip content={<CustomTrendTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#721828" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#maroonGradient)" 
                  activeDot={{ r: 5, fill: '#721828', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Footer info: Peak day highlight */}
        {outliers.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#f7efe9] flex items-center justify-between text-xs text-[#7f6b6f]">
            <div className="flex items-center gap-1.5 text-[#961c2c]">
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="font-semibold">Detected high-spending days:</span>
              <span>{outliers.map(o => `Day ${o.day} (₹${o.amount.toLocaleString('en-IN')})`).join(', ')}</span>
            </div>
            <span className="text-[11px] text-[#968186]">Threshold: 2× Average Daily Run Rate</span>
          </div>
        )}
      </div>

      {/* Side Column: Outliers and Payment Method distribution (4 cols) */}
      <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
        {/* Payment Methods Breakdown Card */}
        <div className="bg-white rounded-2xl border border-[#e4d8cf] p-5 shadow-xs flex-1">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#f7efe9]">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#721828]" />
              <h4 className="font-serif font-bold text-sm text-[#2d1217]">
                Payment Methods
              </h4>
            </div>
            <span className="text-[10px] text-[#968186] font-medium">By Outlay</span>
          </div>

          {paymentMethodBreakdown.length === 0 ? (
            <p className="text-xs text-[#968186] py-4 text-center">No transactions recorded.</p>
          ) : (
            <div className="space-y-2.5">
              {paymentMethodBreakdown.map((pm) => (
                <div key={pm.method} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#2d1217]">{pm.method}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[#7f6b6f] text-[11px]">
                        ₹{pm.amount.toLocaleString('en-IN')}
                      </span>
                      <span className="font-bold text-[#721828] text-[11px] min-w-[32px] text-right">
                        {pm.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-[#f7efe9] rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-[#721828] h-full rounded-full" 
                      style={{ width: `${pm.percentage}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top 3 Spends in Month */}
        <div className="bg-white rounded-2xl border border-[#e4d8cf] p-5 shadow-xs flex-1">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#f7efe9]">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#c29342]" />
              <h4 className="font-serif font-bold text-sm text-[#2d1217]">
                Major Expenditures
              </h4>
            </div>
            <span className="text-[10px] text-[#968186]">Top items</span>
          </div>

          {topExpenses.length === 0 ? (
            <p className="text-xs text-[#968186] py-4 text-center">No expenditures yet.</p>
          ) : (
            <div className="space-y-2.5">
              {topExpenses.slice(0, 3).map((exp) => (
                <div key={exp.id} className="p-2.5 rounded-xl bg-[#fdf8f5] border border-[#e4d8cf] flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#2d1217] truncate">
                      {exp.description || exp.category}
                    </p>
                    <p className="text-[10px] text-[#7f6b6f]">
                      {exp.date} • {exp.category}
                    </p>
                  </div>
                  <span className="font-serif font-bold text-xs text-[#721828] shrink-0">
                    ₹{exp.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
