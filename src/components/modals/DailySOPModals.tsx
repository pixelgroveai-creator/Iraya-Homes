import React, { useState } from 'react';
import { 
  X, 
  Sun, 
  Moon, 
  CalendarCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Users, 
  ArrowRight, 
  FileCheck2 
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const MorningBriefingModal: React.FC = () => {
  const { 
    isMorningBriefingOpen, 
    setIsMorningBriefingOpen, 
    bookings, 
    tasks, 
    issues, 
    leads, 
    currentStaff,
    logActivity 
  } = useCRM();

  const [briefingNotes, setBriefingNotes] = useState('All 4 suites readiness verified. Pool temperature target set to 28°C for morning swim. Manoj assigned pool filter inspection.');

  if (!isMorningBriefingOpen) return null;

  const todayStr = '2026-09-01';
  const arrivalsToday = bookings.filter(b => b.checkInDate === todayStr);
  const departuresToday = bookings.filter(b => b.checkOutDate === todayStr);
  const urgentTasks = tasks.filter(t => t.status !== 'Done' && (t.priority === 'Urgent' || t.dueDate <= todayStr));
  const openIssues = issues.filter(i => i.status !== 'Resolved');

  const handleCompleteBriefing = () => {
    logActivity({
      type: 'Note',
      title: 'Morning Operations Briefing Completed',
      description: `Morning walkthrough conducted by ${currentStaff.name}. Notes: ${briefingNotes}`,
      outcome: `Briefing logged. ${arrivalsToday.length} arrivals, ${departuresToday.length} departures planned.`
    });
    setIsMorningBriefingOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3d3d2e]/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-[#e2ddd6] rounded-[28px] shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#fcfaf7] px-6 py-5 border-b border-[#e2ddd6] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f5f2eb] text-[#b0743b] flex items-center justify-center border border-[#e4dcce] shadow-2xs">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#3d3d2e] font-serif">Daily Morning Briefing & Dispatch</h2>
              <p className="text-[11px] text-[#7a7a6a]">Standard Operating Procedure: Villa Inspections, Arrivals & Task Alignment</p>
            </div>
          </div>
          <button 
            onClick={() => setIsMorningBriefingOpen(false)}
            className="p-1.5 rounded-xl text-[#8c8c7a] hover:text-[#3d3d2e] hover:bg-[#f1ede8] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-[#5a5a40] text-xs">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#fcfaf7] p-3.5 rounded-2xl border border-[#e2ddd6]">
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#8c8c7a]">Arrivals Today</p>
              <p className="text-2xl font-serif font-bold text-[#5a7a40] mt-0.5">{arrivalsToday.length}</p>
              <p className="text-[10px] text-[#8c8c7a]">Target Check-ins</p>
            </div>
            <div className="bg-[#fcfaf7] p-3.5 rounded-2xl border border-[#e2ddd6]">
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#8c8c7a]">Departures Today</p>
              <p className="text-2xl font-serif font-bold text-[#b0743b] mt-0.5">{departuresToday.length}</p>
              <p className="text-[10px] text-[#8c8c7a]">Pending Check-outs</p>
            </div>
            <div className="bg-[#fcfaf7] p-3.5 rounded-2xl border border-[#e2ddd6]">
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#8c8c7a]">Urgent Tasks</p>
              <p className="text-2xl font-serif font-bold text-[#96422b] mt-0.5">{urgentTasks.length}</p>
              <p className="text-[10px] text-[#8c8c7a]">Due today/overdue</p>
            </div>
            <div className="bg-[#fcfaf7] p-3.5 rounded-2xl border border-[#e2ddd6]">
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#8c8c7a]">Open Tickets</p>
              <p className="text-2xl font-serif font-bold text-[#5a5a40] mt-0.5">{openIssues.length}</p>
              <p className="text-[10px] text-[#8c8c7a]">Maintenance items</p>
            </div>
          </div>

          {/* Arrivals List */}
          <div className="bg-[#fcfaf7] p-4 rounded-2xl border border-[#e2ddd6] space-y-2.5">
            <h3 className="font-bold text-[#3d3d2e] font-serif flex items-center gap-1.5">
              <CalendarCheck className="w-4 h-4 text-[#5a7a40]" />
              <span>Today's Arrivals & Readiness Status</span>
            </h3>
            {arrivalsToday.length > 0 ? (
              arrivalsToday.map(b => (
                <div key={b.id} className="p-3 bg-white rounded-xl border border-[#e2ddd6] flex items-center justify-between shadow-2xs">
                  <div>
                    <p className="font-bold text-[#3d3d2e]">{b.guestName} ({b.guestCount} Guests)</p>
                    <p className="text-[11px] text-[#7a7a6a]">Stay: {b.checkInDate} → {b.checkOutDate} • {b.stayPurpose}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    b.preArrivalInspectionDone ? 'bg-[#f1f4e8] text-[#5a7a40] border border-[#d8e2c8]' : 'bg-[#f5f2eb] text-[#b0743b] border border-[#e4dcce]'
                  }`}>
                    {b.preArrivalInspectionDone ? '✓ Villa Inspected' : '⏳ Inspection Pending'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-[#8c8c7a] italic">No new check-ins scheduled for today.</p>
            )}
          </div>

          {/* Urgent Tasks for Team */}
          <div className="bg-[#fcfaf7] p-4 rounded-2xl border border-[#e2ddd6] space-y-2.5">
            <h3 className="font-bold text-[#3d3d2e] font-serif flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-[#96422b]" />
              <span>High-Priority Team Dispatch Items</span>
            </h3>
            <div className="space-y-1.5">
              {urgentTasks.slice(0, 3).map(t => (
                <div key={t.id} className="p-2.5 bg-white rounded-xl border border-[#e2ddd6] flex items-center justify-between text-[11px] shadow-2xs">
                  <span className="text-[#3d3d2e] font-medium">{t.title}</span>
                  <span className="text-[#96422b] font-bold uppercase tracking-wider">{t.priority}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Manager Briefing Note */}
          <div>
            <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Morning Dispatch Remarks</label>
            <textarea
              rows={2}
              value={briefingNotes}
              onChange={e => setBriefingNotes(e.target.value)}
              className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a7a40] focus:outline-none"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-3 border-t border-[#e2ddd6]">
            <button
              onClick={() => setIsMorningBriefingOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#f1ede8] hover:bg-[#eae6e0] text-[#5a5a40] font-bold text-xs cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleCompleteBriefing}
              className="px-5 py-2 rounded-xl bg-[#5a5a40] hover:bg-[#484832] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Sign-Off Morning Briefing</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const EndOfDayModal: React.FC = () => {
  const { 
    isEndOfDayOpen, 
    setIsEndOfDayOpen, 
    activities, 
    tasks, 
    issues, 
    leads, 
    currentStaff,
    logActivity 
  } = useCRM();

  const [auditRemarks, setAuditRemarks] = useState('All daily logs audited. In-house guests comfortable with heated pool and amenities. Follow-up discipline on track.');

  if (!isEndOfDayOpen) return null;

  const todayStr = '2026-09-01';
  const completedTodayTasks = tasks.filter(t => t.status === 'Done');
  const pendingTasks = tasks.filter(t => t.status !== 'Done');
  const unresolvedIssues = issues.filter(i => i.status !== 'Resolved');
  const todayActivities = activities.filter(a => a.timestamp.startsWith(todayStr));

  const handleCompleteAudit = () => {
    logActivity({
      type: 'Note',
      title: 'End of Day Operational Audit Completed',
      description: `Daily close-out verified by ${currentStaff.name}. Completed tasks: ${completedTodayTasks.length}, Pending: ${pendingTasks.length}. Notes: ${auditRemarks}`,
      outcome: 'EOD Audit Approved'
    });
    setIsEndOfDayOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3d3d2e]/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-[#e2ddd6] rounded-[28px] shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#fcfaf7] px-6 py-5 border-b border-[#e2ddd6] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f1ede8] text-[#5a5a40] flex items-center justify-center border border-[#d8d2c8] shadow-2xs">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#3d3d2e] font-serif">End of Day Operational Close-Out</h2>
              <p className="text-[11px] text-[#7a7a6a]">Standard Operating Procedure: Audit Logs, Follow-Up Discipline & Night Readiness</p>
            </div>
          </div>
          <button 
            onClick={() => setIsEndOfDayOpen(false)}
            className="p-1.5 rounded-xl text-[#8c8c7a] hover:text-[#3d3d2e] hover:bg-[#f1ede8] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-[#5a5a40] text-xs">
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#fcfaf7] p-3.5 rounded-2xl border border-[#e2ddd6]">
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#8c8c7a]">Activities Logged</p>
              <p className="text-2xl font-serif font-bold text-[#5a5a40] mt-0.5">{todayActivities.length}</p>
              <p className="text-[10px] text-[#8c8c7a]">Calls, checks, msgs</p>
            </div>
            <div className="bg-[#fcfaf7] p-3.5 rounded-2xl border border-[#e2ddd6]">
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#8c8c7a]">Tasks Completed</p>
              <p className="text-2xl font-serif font-bold text-[#5a7a40] mt-0.5">{completedTodayTasks.length}</p>
              <p className="text-[10px] text-[#8c8c7a]">Operations executed</p>
            </div>
            <div className="bg-[#fcfaf7] p-3.5 rounded-2xl border border-[#e2ddd6]">
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#8c8c7a]">Pending Tasks</p>
              <p className="text-2xl font-serif font-bold text-[#b0743b] mt-0.5">{pendingTasks.length}</p>
              <p className="text-[10px] text-[#8c8c7a]">Carried to tomorrow</p>
            </div>
            <div className="bg-[#fcfaf7] p-3.5 rounded-2xl border border-[#e2ddd6]">
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#8c8c7a]">Open Tickets</p>
              <p className="text-2xl font-serif font-bold text-[#96422b] mt-0.5">{unresolvedIssues.length}</p>
              <p className="text-[10px] text-[#8c8c7a]">Awaiting parts/fix</p>
            </div>
          </div>

          <div className="p-4 bg-[#fcfaf7] rounded-2xl border border-[#e2ddd6] space-y-2">
            <p className="font-bold text-[#3d3d2e] font-serif flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#5a5a40]" />
              <span>Compliance Checklist for Close-Out</span>
            </p>
            <div className="space-y-1.5 text-[#5a5a40]">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-[#5a5a40] bg-white border-[#d8d2c8] focus:ring-[#5a5a40]" />
                <span>Indoor pool filter pump timer and pool safety illumination verified.</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-[#5a5a40] bg-white border-[#d8d2c8] focus:ring-[#5a5a40]" />
                <span>All scheduled enquiry follow-up timestamps completed or updated with notes.</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-[#5a5a40] bg-white border-[#d8d2c8] focus:ring-[#5a5a40]" />
                <span>Commercial deposits & balance collection status reconciled.</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Night Shift Handover & Manager Remarks</label>
            <textarea
              rows={2}
              value={auditRemarks}
              onChange={e => setAuditRemarks(e.target.value)}
              className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#e2ddd6]">
            <button
              onClick={() => setIsEndOfDayOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#f1ede8] hover:bg-[#eae6e0] text-[#5a5a40] font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleCompleteAudit}
              className="px-5 py-2 rounded-xl bg-[#5a5a40] hover:bg-[#484832] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit & Lock EOD Audit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
