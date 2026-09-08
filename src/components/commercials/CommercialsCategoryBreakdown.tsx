import React, { useState } from 'react';
import { 
  PieChart as PieIcon, 
  BarChart2, 
  Layers, 
  Percent, 
  ArrowUpRight,
  TrendingUp,
  SlidersHorizontal
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis 
} from 'recharts';
import { useCommercials } from '../../context/CommercialsContext';

export const CommercialsCategoryBreakdown: React.FC = () => {
  const { stats, selectedMonth } = useCommercials();
  const [chartType, setChartType] = useState<'donut' | 'bar'>('donut');

  const { categoryBreakdown, totalSpent } = stats;

  const [yearStr, monthStr] = selectedMonth.split('-');
  const monthName = new Date(Number(yearStr), Number(monthStr) - 1, 1).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  });

  const chartData = categoryBreakdown.map(c => ({
    name: c.category,
    value: c.totalAmount,
    percentage: c.percentage,
    color: c.color
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-xl border border-[#e4d8cf] shadow-xl text-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            <span className="font-bold text-[#2d1217]">{data.name}</span>
          </div>
          <p className="text-sm font-serif font-bold text-[#721828]">
            ₹{data.value.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#7f6b6f]">
            {data.percentage}% of monthly spend
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e4d8cf] p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#f7efe9]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif font-bold text-base text-[#2d1217]">
              Spending by Category
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#fbf5f1] text-[#721828] border border-[#e2b3bc] rounded-full">
              {categoryBreakdown.length} Categories
            </span>
          </div>
          <p className="text-xs text-[#7f6b6f]">
            Categorical allocation & percentage breakdown for {monthName}
          </p>
        </div>

        {/* View Switcher: Donut vs Bar */}
        <div className="flex items-center bg-[#fdf8f5] p-1 rounded-xl border border-[#e4d8cf] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setChartType('donut')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              chartType === 'donut'
                ? 'bg-white text-[#721828] shadow-2xs border border-[#e4d8cf]'
                : 'text-[#7f6b6f] hover:text-[#2d1217]'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Donut</span>
          </button>
          <button
            type="button"
            onClick={() => setChartType('bar')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              chartType === 'bar'
                ? 'bg-white text-[#721828] shadow-2xs border border-[#e4d8cf]'
                : 'text-[#7f6b6f] hover:text-[#2d1217]'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Bar Chart</span>
          </button>
        </div>
      </div>

      {categoryBreakdown.length === 0 ? (
        <div className="py-12 text-center text-xs text-[#968186]">
          No expense records logged for this month. Click "Add Expense" to start tracking.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Chart Section (5 cols) */}
          <div className="lg:col-span-5 h-64 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'donut' ? (
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              ) : (
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={100} 
                    tick={{ fontSize: 10, fill: '#7f6b6f' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`bar-cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>

            {/* Centered Total for Donut */}
            {chartType === 'donut' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase tracking-wider text-[#968186] font-bold">
                  Total Spent
                </span>
                <span className="font-serif font-bold text-sm sm:text-base text-[#2d1217]">
                  ₹{totalSpent > 100000 ? `${(totalSpent / 100000).toFixed(1)}L` : totalSpent.toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>

          {/* Breakdown Table Section (7 cols) */}
          <div className="lg:col-span-7 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#f7efe9] text-[10px] uppercase tracking-wider text-[#968186] font-bold">
                  <th className="py-2 pl-2">Category</th>
                  <th className="py-2 text-right">Total Amount</th>
                  <th className="py-2 text-right pr-2">% of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#fdf8f5]">
                {categoryBreakdown.map((cat) => (
                  <tr key={cat.category} className="hover:bg-[#fdf8f5] transition-colors">
                    <td className="py-2.5 pl-2">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: cat.color }} 
                        />
                        <div>
                          <span className="font-semibold text-[#2d1217] block truncate max-w-[150px] sm:max-w-xs">
                            {cat.category}
                          </span>
                          <span className="text-[10px] text-[#968186]">
                            {cat.count} {cat.count === 1 ? 'transaction' : 'transactions'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 text-right font-serif font-bold text-[#2d1217]">
                      ₹{cat.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 text-right pr-2">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 sm:w-20 bg-[#f7efe9] rounded-full h-1.5 overflow-hidden hidden sm:block">
                          <div 
                            className="h-full rounded-full" 
                            style={{ 
                              width: `${cat.percentage}%`,
                              backgroundColor: cat.color 
                            }} 
                          />
                        </div>
                        <span className="font-bold text-[#721828] text-right min-w-[38px]">
                          {cat.percentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
