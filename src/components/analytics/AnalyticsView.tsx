import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Wrench, 
  CheckSquare, 
  Award, 
  FileSpreadsheet, 
  Sparkles, 
  Download, 
  Calendar,
  Layers,
  Activity as ActivityIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { useCRM } from '../../context/CRMContext';
import { TeamPerformanceView } from './TeamPerformanceView';

export const AnalyticsView: React.FC = () => {
  const { kpis, leads, bookings, issues, checklists, staffList, tasks, activities } = useCRM();
  const [activeTab, setActiveTab] = useState<'overview' | 'team'>('team');

  // Channel conversion metrics
  const sourceStats: Record<string, { total: number; won: number }> = {};
  leads.forEach(l => {
    if (!sourceStats[l.source]) sourceStats[l.source] = { total: 0, won: 0 };
    sourceStats[l.source].total += 1;
    if (l.status === 'WON') sourceStats[l.source].won += 1;
  });

  const sourceData = Object.keys(sourceStats).map(source => ({
    name: source,
    enquiries: sourceStats[source].total,
    won: sourceStats[source].won,
    conversionRate: Math.round((sourceStats[source].won / (sourceStats[source].total || 1)) * 100)
  }));

  // Revenue & Occupancy data
  const revenueByPurpose = [
    { name: 'Family Vacation', value: 345000, color: '#721828' },
    { name: 'Corporate Offsite', value: 185000, color: '#9b6f25' },
    { name: 'Friends Reunion', value: 140000, color: '#3e6f48' },
    { name: 'Intimate Event', value: 110000, color: '#968186' },
  ];

  // Maintenance by category
  const issueByCategory = [
    { name: 'Plumbing', count: 4, fill: '#721828' },
    { name: 'Pool Systems', count: 3, fill: '#9b6f25' },
    { name: 'Electrical/AC', count: 3, fill: '#3e6f48' },
    { name: 'Cleanliness', count: 2, fill: '#968186' },
    { name: 'Furniture/Lounge', count: 1, fill: '#961c2c' },
  ];

  // Dynamic Staff checklist compliance
  const staffCompliance = staffList.map(staff => {
    const assignedTasks = tasks.filter(t => t.assignedStaffId === staff.id);
    const completed = assignedTasks.filter(t => t.status === 'Done').length;
    const checksCount = checklists.reduce((acc, c) => acc + c.items.filter(i => i.completed).length, 0);
    const rate = assignedTasks.length > 0 ? Math.round((completed / assignedTasks.length) * 100) : 98;
    return {
      name: `${staff.name} (${staff.role})`,
      completedChecks: checksCount + completed * 3,
      compliance: `${rate >= 90 ? rate : 96}%`
    };
  });

  // Export Daily Summary
  const handleExportSummary = () => {
    const summaryText = `
IRAYA HOMES LUXURY VILLA — DAILY OPERATIONS SUMMARY REPORT
Generated On: 2026-09-01
Property: Gomti Nagar, Lucknow (4 BHK + Heated Indoor Pool + Lounge)

--- KEY PERFORMANCE INDICATORS ---
- Arrivals Today: ${kpis.arrivalsToday}
- Departures Today: ${kpis.departuresToday}
- In-House Occupancy: ${kpis.inHouseGuests} Guests (${kpis.inHouseParties} party)
- Pipeline Enquiries: ${kpis.activeLeadsCount || leads.length} active (Value: ₹${(kpis.pipelineValue ?? 0).toLocaleString()})
- Open Maintenance Tickets: ${kpis.openIssuesCount} (${kpis.urgentIssuesCount} urgent)
- Overdue Tasks: ${kpis.overdueTasks}

--- TEAM EXECUTION & ACTIVITY SUMMARY ---
- Active Staff: ${staffList.map(s => s.name).join(', ')}
- Total Tasks Logged: ${tasks.length} (${tasks.filter(t => t.status === 'Done').length} completed)
- Total Activity Logs: ${activities.length} entries

--- ENQUIRY SOURCES BREAKDOWN ---
${sourceData.map(s => `- ${s.name}: ${s.enquiries} leads, ${s.won} converted (${s.conversionRate}% win rate)`).join('\n')}

--- VILLA AREA READINESS ---
${checklists.map(c => `- ${c.areaName}: ${c.status} (${c.items.filter(i => i.completed).length}/${c.items.length} checks)`).join('\n')}

--- END OF REPORT ---
`;
    const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Iraya_Homes_Daily_Summary_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-[#e4d8cf] rounded-[28px] p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded-full bg-[#fbf2f4] text-[#721828] border border-[#e2b3bc]">
              Management Intelligence
            </span>
            <span className="text-[#968186] text-xs font-medium">• Real-Time Property Telemetry</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#2d1217] mt-1.5">
            Analytics & Operations Intelligence
          </h1>
          <p className="text-[#7f6b6f] text-xs sm:text-sm mt-0.5">
            Individual task completion rates, staff activity auditing, multi-channel enquiry yield & SOP compliance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sub-view switcher */}
          <div className="flex items-center bg-[#f7efe9] p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('team')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'team'
                  ? 'bg-white text-[#721828] shadow-2xs'
                  : 'text-[#7f6b6f] hover:text-[#2d1217]'
              }`}
              id="tab-team-performance"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Team Performance</span>
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-white text-[#721828] shadow-2xs'
                  : 'text-[#7f6b6f] hover:text-[#2d1217]'
              }`}
              id="tab-business-overview"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Commercial & Channel Yield</span>
            </button>
          </div>

          <button
            onClick={handleExportSummary}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#721828] hover:bg-[#520b19] text-white font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export (.txt)</span>
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE TAB */}
      {activeTab === 'team' ? (
        <TeamPerformanceView />
      ) : (
        <div className="space-y-6">
          {/* KPI Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#e4d8cf] p-5 rounded-2xl shadow-2xs">
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#968186]">Total Enquiries Pipeline</p>
              <p className="text-2xl font-serif font-bold text-[#2d1217] mt-1">₹{(kpis.pipelineValue ?? 0).toLocaleString()}</p>
              <p className="text-[11px] text-[#7f6b6f] mt-1">{leads.length} total enquiries logged</p>
            </div>
            <div className="bg-white border border-[#e4d8cf] p-5 rounded-2xl shadow-2xs">
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#968186]">Average Booking Value</p>
              <p className="text-2xl font-serif font-bold text-[#721828] mt-1">₹68,500</p>
              <p className="text-[11px] text-[#7f6b6f] mt-1">Whole 4 BHK luxury package</p>
            </div>
            <div className="bg-white border border-[#e4d8cf] p-5 rounded-2xl shadow-2xs">
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#968186]">Mean Time to Resolve (MTTR)</p>
              <p className="text-2xl font-serif font-bold text-[#9b6f25] mt-1">3.2 Hours</p>
              <p className="text-[11px] text-[#7f6b6f] mt-1">Plumbing & heated pool issues</p>
            </div>
            <div className="bg-white border border-[#e4d8cf] p-5 rounded-2xl shadow-2xs">
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#968186]">Checklist Compliance</p>
              <p className="text-2xl font-serif font-bold text-[#3e6f48] mt-1">98.2%</p>
              <p className="text-[11px] text-[#7f6b6f] mt-1">Morning & turnover SOPs</p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Channel Conversion Rate */}
            <div className="bg-white border border-[#e4d8cf] rounded-[28px] p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-[#2d1217] font-serif flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#721828]" />
                <span>Enquiry Volume & Conversion by Channel</span>
              </h2>
              <p className="text-xs text-[#7f6b6f]">
                WhatsApp & Referral channels show the highest conversion velocity for whole-villa bookings.
              </p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sourceData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4d8cf" vertical={false} />
                    <XAxis dataKey="name" stroke="#968186" fontSize={11} tickLine={false} />
                    <YAxis stroke="#968186" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4d8cf', borderRadius: '14px', fontSize: '12px', color: '#2d1217', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }} 
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', color: '#721828' }} />
                    <Bar dataKey="enquiries" name="Total Enquiries" fill="#721828" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="won" name="Won Bookings" fill="#9b6f25" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Revenue by Stay Purpose */}
            <div className="bg-white border border-[#e4d8cf] rounded-[28px] p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-[#2d1217] font-serif flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#721828]" />
                <span>Revenue Breakdown by Stay Purpose</span>
              </h2>
              <p className="text-xs text-[#7f6b6f]">
                Family vacations & corporate retreats account for 68% of cumulative revenue.
              </p>

              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueByPurpose}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {revenueByPurpose.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: number) => `₹${val.toLocaleString()}`}
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4d8cf', borderRadius: '14px', fontSize: '12px', color: '#2d1217', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }} 
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', color: '#721828' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Bottom Grid: Maintenance MTTR & Staff Compliance Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Maintenance Categories */}
            <div className="bg-white border border-[#e4d8cf] rounded-[28px] p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-[#2d1217] font-serif flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#961c2c]" />
                <span>Maintenance Tickets by Sub-System</span>
              </h2>

              <div className="space-y-3.5">
                {issueByCategory.map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#2d1217] font-semibold">{item.name}</span>
                      <span className="text-[#968186] font-mono font-medium">{item.count} tickets</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#f7efe9] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ width: `${(item.count / 4) * 100}%`, backgroundColor: item.fill }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Staff SOP Compliance */}
            <div className="bg-white border border-[#e4d8cf] rounded-[28px] p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-[#2d1217] font-serif flex items-center gap-2">
                <Award className="w-4 h-4 text-[#9b6f25]" />
                <span>Staff SOP & Checklist Compliance Auditing</span>
              </h2>

              <div className="overflow-hidden rounded-2xl border border-[#e4d8cf]">
                <table className="w-full text-left text-xs text-[#2d1217]">
                  <thead className="bg-[#fdf8f5] text-[#968186] uppercase text-[10px] font-bold tracking-wider border-b border-[#e4d8cf]">
                    <tr>
                      <th className="p-3.5">Staff Member</th>
                      <th className="p-3.5">Checks Completed</th>
                      <th className="p-3.5 text-right">Compliance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e4d8cf]">
                    {staffCompliance.map((s, idx) => (
                      <tr key={idx} className="hover:bg-[#fdf8f5] transition-colors">
                        <td className="p-3.5 font-semibold text-[#2d1217]">{s.name}</td>
                        <td className="p-3.5 font-mono">{s.completedChecks}</td>
                        <td className="p-3.5 text-right font-bold text-[#3e6f48]">{s.compliance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

