import React, { useState } from 'react';
import { 
  Activity as ActivityIcon, 
  Plus, 
  PhoneCall, 
  MessageSquare, 
  Waves, 
  Sparkles, 
  CreditCard, 
  FileText, 
  User, 
  Calendar, 
  Filter, 
  Search, 
  Clock, 
  Tag,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { ActivityType } from '../../types';

export const ActivitiesView: React.FC = () => {
  const { activities, openQuickAction, searchQuery, staffList } = useCRM();
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [staffFilter, setStaffFilter] = useState<string>('all');

  // Filter activities
  const filteredActivities = activities.filter(act => {
    if (typeFilter !== 'all' && act.type !== typeFilter) return false;
    if (staffFilter !== 'all' && act.staffId !== staffFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = 
        act.title.toLowerCase().includes(q) ||
        act.description.toLowerCase().includes(q) ||
        (act.outcome && act.outcome.toLowerCase().includes(q)) ||
        act.staffName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'Call': return <PhoneCall className="w-4 h-4 text-sky-400" />;
      case 'WhatsApp': return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case 'Pool Check': return <Waves className="w-4 h-4 text-cyan-400" />;
      case 'Room Inspection': return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'Payment': return <CreditCard className="w-4 h-4 text-amber-400" />;
      case 'Task Completed': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'Status Change': return <Clock className="w-4 h-4 text-indigo-400" />;
      default: return <FileText className="w-4 h-4 text-stone-400" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-[#e4d8cf] rounded-[28px] p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded-full bg-[#fbf2f4] text-[#721828] border border-[#e2b3bc]">
              Operational Traceability
            </span>
            <span className="text-[#968186] text-xs font-medium">• {filteredActivities.length} Activity Events</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#2d1217] mt-1.5">
            Daily Activity & Interaction Logging
          </h1>
          <p className="text-[#7f6b6f] text-xs sm:text-sm mt-0.5">
            Sub-60s fast logging for phone calls, WhatsApp inquiries, water pH tests, inspections & payments
          </p>
        </div>

        <button
          onClick={() => openQuickAction('activity')}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#721828] hover:bg-[#520b19] text-white font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>+ Log Activity (&lt;60s)</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-[#fdf8f5] border border-[#e4d8cf] p-4 rounded-2xl text-xs">
        <div className="flex items-center gap-1.5 text-[#721828] font-bold">
          <Filter className="w-3.5 h-3.5 text-[#721828]" />
          <span>Filter Stream:</span>
        </div>

        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="bg-[#f7efe9] border border-[#e4d8cf] text-[#2d1217] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#721828]"
        >
          <option value="all">All Interaction Types</option>
          <option value="Call">Phone Calls</option>
          <option value="WhatsApp">WhatsApp Logs</option>
          <option value="Pool Check">Pool Checks (pH/Filtration)</option>
          <option value="Room Inspection">Room Inspections</option>
          <option value="Payment">Payments & Deposits</option>
          <option value="Task Completed">Task Completions</option>
          <option value="Status Change">Status Changes</option>
          <option value="Note">General Notes</option>
        </select>

        <select
          value={staffFilter}
          onChange={e => setStaffFilter(e.target.value)}
          className="bg-[#f7efe9] border border-[#e4d8cf] text-[#2d1217] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#721828]"
        >
          <option value="all">All Staff Members</option>
          {staffList.map(s => (
            <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
          ))}
        </select>

        {(typeFilter !== 'all' || staffFilter !== 'all') && (
          <button
            onClick={() => { setTypeFilter('all'); setStaffFilter('all'); }}
            className="text-[#721828] hover:underline text-[11px] font-bold cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Activity Timeline Stream */}
      <div className="bg-white border border-[#e4d8cf] rounded-[28px] p-6 sm:p-7 shadow-xs space-y-6">
        <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-[#e4d8cf]">
          {filteredActivities.length === 0 ? (
            <div className="p-8 text-center text-[#968186] text-xs">
              No activity logs match the selected criteria.
            </div>
          ) : (
            filteredActivities.map((act) => (
              <div key={act.id} className="relative flex items-start gap-4 group">
                
                {/* Timeline Icon Node */}
                <div className="w-8 h-8 rounded-full bg-white border-2 border-[#721828] flex items-center justify-center shrink-0 z-10 shadow-2xs">
                  {getActivityIcon(act.type)}
                </div>

                {/* Card Body */}
                <div className="flex-1 bg-[#fdf8f5] border border-[#e4d8cf] hover:border-[#721828] rounded-2xl p-4.5 transition-all space-y-2 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#2d1217] text-xs sm:text-sm">{act.title}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#f7efe9] text-[#721828] border border-[#e4d8cf]">
                        {act.type}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#968186] font-mono">
                      {new Date(act.timestamp).toLocaleDateString()} at {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-[#7f6b6f] leading-relaxed">{act.description}</p>

                  {/* Outcome / Result Pill */}
                  {act.outcome && (
                    <div className="p-2.5 bg-white rounded-xl border border-[#e4d8cf] text-[11px] text-[#2d1217] flex items-center gap-1.5">
                      <span className="font-bold text-[#9b6f25]">Outcome:</span>
                      <span>{act.outcome}</span>
                    </div>
                  )}

                  {/* Footer Attribution & Linkages */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#e4d8cf] text-[10px] text-[#968186]">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[#721828]" />
                      <span>Logged by <span className="text-[#2d1217] font-semibold">{act.staffName}</span></span>
                    </div>

                    <div className="flex items-center gap-3 font-mono font-medium text-[#7f6b6f]">
                      {act.relatedLeadId && <span>Lead: {act.relatedLeadId}</span>}
                      {act.relatedBookingId && <span>Booking: {act.relatedBookingId}</span>}
                      {act.relatedGuestId && <span>Guest: {act.relatedGuestId}</span>}
                      {act.relatedIssueId && <span>Issue: {act.relatedIssueId}</span>}
                    </div>
                  </div>

                </div>

              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
