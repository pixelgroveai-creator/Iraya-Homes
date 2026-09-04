import React from 'react';
import { 
  Users, 
  CalendarCheck, 
  CheckSquare, 
  AlertTriangle, 
  Activity as ActivityIcon, 
  PhoneCall, 
  ArrowRight, 
  Plus, 
  Clock, 
  Waves, 
  Sparkles, 
  BedDouble, 
  Trophy, 
  Sun, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Bot,
  ShieldCheck
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { NavTab } from '../layout/Navbar';

interface DashboardViewProps {
  setActiveTab: (tab: NavTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab }) => {
  const { 
    kpis, 
    leads, 
    bookings, 
    tasks, 
    issues, 
    activities, 
    checklists, 
    openQuickAction, 
    setIsMorningBriefingOpen, 
    toggleTaskStatus,
    advanceLeadStatus,
    askIrayaBuddy,
    toggleIrayaBuddy
  } = useCRM();

  const todayStr = '2026-09-01';

  // Leads needing urgent follow-up today
  const urgentLeads = leads
    .filter(l => l.status !== 'WON' && l.status !== 'LOST')
    .slice(0, 4);

  // In-house and upcoming stays
  const activeStays = bookings
    .filter(b => b.status === 'Checked-in' || b.status === 'Confirmed' || b.status === 'Hold')
    .slice(0, 3);

  // Priority tasks
  const pendingTasks = tasks
    .filter(t => t.status !== 'Done')
    .slice(0, 4);

  // Unresolved issues
  const openIssues = issues
    .filter(i => i.status !== 'Resolved')
    .slice(0, 3);

  return (
    <div className="space-y-6">
      
      {/* Villa Welcome Banner & Quick Action Bar */}
      <div className="bg-white border border-[#e4d8cf] rounded-[28px] p-6 sm:p-7 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded-full bg-[#fbf2f4] text-[#721828] border border-[#e2b3bc]">
              Villa Operations Command Center
            </span>
            <span className="text-[#968186] text-xs font-medium">• Gomti Nagar, Lucknow</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2d1217] mt-2 tracking-tight">
            IRAYA <span className="font-normal italic">HOMES</span> Operations Dashboard
          </h1>
          <p className="text-[#7f6b6f] text-xs sm:text-sm mt-1 max-w-2xl font-normal leading-relaxed">
            4 BHK Luxury Suites, Private Indoor Heated Pool, Tournament Pool Table & Scenic Balconies
          </p>
        </div>

        {/* Single-Click Quick Action Hub */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => openQuickAction('lead')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#721828] hover:bg-[#520b19] text-white text-xs font-semibold transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>+ Add Lead</span>
          </button>
          <button
            onClick={() => openQuickAction('booking')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#f7efe9] hover:bg-[#efe5dd] text-[#721828] border border-[#e4d8cf] text-xs font-semibold transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>+ Add Booking</span>
          </button>
          <button
            onClick={() => openQuickAction('activity')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#faf4e8] hover:bg-[#f4ebd6] text-[#9b6f25] border border-[#eedab4] text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            <ActivityIcon className="w-3.5 h-3.5" />
            <span>+ Log Activity (&lt;60s)</span>
          </button>
          <button
            onClick={() => openQuickAction('task')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#f7efe9] hover:bg-[#efe5dd] text-[#45373a] border border-[#e4d8cf] text-xs font-semibold transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>+ Task</span>
          </button>
          <button
            onClick={() => openQuickAction('issue')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#fdf0f2] hover:bg-[#fae2e6] text-[#961c2c] border border-[#f5ccd2] text-xs font-semibold transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>+ Issue</span>
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#2d1217] hover:bg-[#4a131e] text-white border border-[#4a131e] text-xs font-semibold transition-all shadow-2xs active:scale-95 cursor-pointer"
            title="Open Admin Panel to view all backend data"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            <span>Admin Data</span>
          </button>
          <button
            id="dashboard-btn-ask-buddy"
            onClick={toggleIrayaBuddy}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#2d1217] to-[#721828] text-white border border-[#e2b3bc] text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer hover:brightness-110"
          >
            <Bot className="w-3.5 h-3.5 text-amber-300" />
            <span>Ask Iraya Buddy</span>
            <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
          </button>
        </div>
      </div>

      {/* Iraya Buddy AI Personal Assistant Spotlight Banner */}
      <div className="bg-gradient-to-r from-[#fbf2f4] via-[#f7efe9] to-[#fdfaf8] border border-[#e2b3bc] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#721828] text-white flex items-center justify-center shadow-xs shrink-0">
            <Bot className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-serif font-bold text-[#2d1217]">
                Iraya Buddy — Your 24/7 AI Personal Assistant
              </h3>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                Online
              </span>
            </div>
            <p className="text-xs text-[#7f6b6f] mt-0.5">
              Ask any question about villa amenities, check-in policies, Lucknow food spots, staff SOPs, or draft guest messages.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => askIrayaBuddy('Tell me about Iraya Homes villa, 4 suites, and pool amenities')}
            className="text-[11px] font-medium bg-white hover:bg-[#fbf2f4] text-[#721828] px-3 py-1.5 rounded-xl border border-[#e4d8cf] hover:border-[#721828] transition-colors cursor-pointer shadow-2xs"
          >
            🏡 Villa & Amenities
          </button>
          <button
            onClick={() => askIrayaBuddy('What are the check-in and check-out timings, and house rules?')}
            className="text-[11px] font-medium bg-white hover:bg-[#fbf2f4] text-[#721828] px-3 py-1.5 rounded-xl border border-[#e4d8cf] hover:border-[#721828] transition-colors cursor-pointer shadow-2xs"
          >
            🕒 Policies & Timings
          </button>
          <button
            onClick={() => askIrayaBuddy('What are the best places to eat Awadhi kebabs & biryani in Lucknow?')}
            className="text-[11px] font-medium bg-white hover:bg-[#fbf2f4] text-[#721828] px-3 py-1.5 rounded-xl border border-[#e4d8cf] hover:border-[#721828] transition-colors cursor-pointer shadow-2xs"
          >
            🍲 Lucknow Food Guide
          </button>
          <button
            onClick={() => askIrayaBuddy('Draft a warm WhatsApp welcome message for an arriving guest')}
            className="text-[11px] font-medium bg-[#721828] hover:bg-[#881d30] text-white px-3 py-1.5 rounded-xl transition-colors cursor-pointer shadow-2xs flex items-center gap-1 font-semibold"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Open Chat</span>
          </button>
        </div>
      </div>

      {/* Daily Snapshot KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Arrivals Today */}
        <div 
          onClick={() => setActiveTab('bookings')}
          className="bg-white border border-[#e4d8cf] hover:border-[#721828] rounded-[24px] p-6 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-[#968186] font-bold">
              Today's Arrivals
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#fbf2f4] text-[#721828] flex items-center justify-center border border-[#e2b3bc] group-hover:scale-105 transition-transform">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-serif font-bold text-[#2d1217]">{kpis.arrivalsToday}</span>
            <span className="text-xs text-[#721828] font-medium">Guest party</span>
          </div>
          <div className="mt-2 text-xs text-[#721828] font-medium">Pre-arrival checks in progress</div>
        </div>

        {/* Departures Today */}
        <div 
          onClick={() => setActiveTab('bookings')}
          className="bg-white border border-[#e4d8cf] hover:border-[#721828] rounded-[24px] p-6 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-[#968186] font-bold">
              Today's Departures
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#faf4e8] text-[#9b6f25] flex items-center justify-center border border-[#eedab4] group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-serif font-bold text-[#2d1217]">{kpis.departuresToday}</span>
            <span className="text-xs text-[#9b6f25] font-medium">Scheduled checkout</span>
          </div>
          <div className="mt-2 text-xs text-[#968186] font-medium">Post-checkout inspection ready</div>
        </div>

        {/* Current In-House Guests */}
        <div 
          onClick={() => setActiveTab('bookings')}
          className="bg-white border border-[#e4d8cf] hover:border-[#721828] rounded-[24px] p-6 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-[#968186] font-bold">
              In-House Occupancy
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#f7efe9] text-[#721828] flex items-center justify-center border border-[#e4d8cf] group-hover:scale-105 transition-transform">
              <BedDouble className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-serif font-bold text-[#2d1217]">{kpis.inHouseGuests}</span>
            <span className="text-xs text-[#721828] font-medium">Guests in villa</span>
          </div>
          <div className="mt-2 text-xs text-[#7f6b6f] font-medium">
            {kpis.inHouseParties > 0 ? 'Full Villa Occupied' : 'Villa Available for Booking'}
          </div>
        </div>

        {/* Overdue Tasks & Urgent Alerts */}
        <div 
          onClick={() => setActiveTab('tasks')}
          className="bg-white border border-[#e4d8cf] hover:border-[#961c2c] rounded-[24px] p-6 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-[#968186] font-bold">
              Overdue Alerts
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-105 ${
              kpis.overdueTasks > 0 
                ? 'bg-[#fdf0f2] text-[#961c2c] border-[#f5ccd2]' 
                : 'bg-[#f7efe9] text-[#968186] border-[#e4d8cf]'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl sm:text-4xl font-serif font-bold ${kpis.overdueTasks > 0 ? 'text-[#961c2c]' : 'text-[#2d1217]'}`}>
              {kpis.overdueTasks}
            </span>
            <span className="text-xs text-[#961c2c] font-medium">Overdue tasks</span>
          </div>
          <div className="mt-2 text-xs text-[#968186] font-medium">{kpis.tasksDueToday} tasks due today</div>
        </div>
      </div>

      {/* Main Grid: Leads Pipeline Widget vs Operations & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Lead Pipeline & Property Readiness */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Lead Pipeline Widget */}
          <div className="bg-white border border-[#e4d8cf] rounded-[28px] p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#f7efe9] pb-4">
              <div>
                <h2 className="text-lg font-serif font-bold text-[#2d1217] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#721828]" />
                  <span>Enquiry & Lead Pipeline</span>
                </h2>
                <p className="text-xs text-[#968186] mt-0.5">
                  {kpis.urgentFollowUpsToday} leads require immediate contact today • Pipeline Value: ₹{(kpis.pipelineValue ?? 0).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('leads')}
                className="text-xs text-[#721828] hover:text-[#2d1217] font-semibold underline underline-offset-4 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>View all leads</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {urgentLeads.map(lead => {
                const isFollowUpDue = lead.scheduledFollowUp && lead.scheduledFollowUp.startsWith(todayStr);
                return (
                  <div 
                    key={lead.id}
                    className="p-4 bg-[#fdf8f5] hover:bg-[#f7efe9] rounded-2xl border border-[#e4d8cf] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#2d1217] text-sm">{lead.name}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#f7efe9] text-[#721828] border border-[#e4d8cf]">
                          {lead.source}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          lead.status === 'NEW' ? 'bg-[#faf4e8] text-[#9b6f25] border border-[#eedab4]' :
                          lead.status === 'QUALIFIED' ? 'bg-[#fbf2f4] text-[#721828] border border-[#e2b3bc]' :
                          'bg-[#f7efe9] text-[#721828] border border-[#e4d8cf]'
                        }`}>
                          {lead.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#7f6b6f]">
                        {lead.phone} • {lead.guestCount} Guests ({lead.stayPurpose}) • Stay: {lead.checkInDate} to {lead.checkOutDate}
                      </p>
                      {lead.notes && (
                        <p className="text-xs text-[#45373a] line-clamp-1 italic font-serif">
                          "{lead.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {isFollowUpDue && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#961c2c] bg-[#fdf0f2] px-2.5 py-1 rounded-full border border-[#f5ccd2]">
                          <Clock className="w-3 h-3" />
                          <span>Follow-up Today</span>
                        </span>
                      )}
                      <button
                        onClick={() => openQuickAction('activity', { defaultLeadId: lead.id })}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#fbf2f4] text-[#721828] border border-[#e4d8cf] text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                        title="Log Interaction"
                      >
                        <PhoneCall className="w-3 h-3 text-[#721828]" />
                        <span>Log Call</span>
                      </button>
                      <button
                        onClick={() => advanceLeadStatus(lead.id, lead.status === 'NEW' ? 'CONTACTED' : lead.status === 'CONTACTED' ? 'QUALIFIED' : 'BOOKING PENDING')}
                        className="px-3 py-1.5 rounded-xl bg-[#721828] hover:bg-[#520b19] text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                        title="Advance Lead Stage"
                      >
                        Advance →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Area Readiness Snapshot */}
          <div className="bg-white border border-[#e4d8cf] rounded-[28px] p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#f7efe9] pb-4">
              <div>
                <h2 className="text-lg font-serif font-bold text-[#2d1217] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#721828]" />
                  <span>Villa Property Readiness & Checklists</span>
                </h2>
                <p className="text-xs text-[#968186] mt-0.5">
                  4 Bedroom Suites, Heated Indoor Pool, Kitchen, Pool Table Lounge, Terrace
                </p>
              </div>
              <button
                onClick={() => setActiveTab('property-ops')}
                className="text-xs text-[#721828] hover:text-[#2d1217] font-semibold underline underline-offset-4 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Open Ops Checklists</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {checklists.map(chk => {
                const isReady = chk.status === 'Ready';
                const needsAttention = chk.status === 'Needs Attention';
                return (
                  <div 
                    key={chk.areaId}
                    onClick={() => setActiveTab('property-ops')}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      needsAttention 
                        ? 'bg-[#fdf0f2] border-[#f5ccd2] hover:bg-[#fae2e6]' 
                        : isReady 
                        ? 'bg-[#fdf8f5] border-[#e4d8cf] hover:border-[#721828]' 
                        : 'bg-[#fdf8f5] border-[#e4d8cf] hover:border-[#9b6f25]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-[#2d1217] truncate">{chk.areaName.split('—')[0]}</span>
                      <span className={`w-2 h-2 rounded-full ${
                        needsAttention ? 'bg-[#961c2c]' : isReady ? 'bg-[#3e6f48]' : 'bg-[#9b6f25]'
                      }`} />
                    </div>
                    <p className="text-[10px] text-[#968186] truncate">{chk.areaSubtitle}</p>
                    <div className="mt-2.5 flex items-center justify-between text-[10px]">
                      <span className="text-[#968186] font-mono">
                        {chk.items.filter(i => i.completed).length}/{chk.items.length} checks
                      </span>
                      <span className={`font-semibold ${
                        needsAttention ? 'text-[#961c2c]' : isReady ? 'text-[#3e6f48]' : 'text-[#9b6f25]'
                      }`}>
                        {chk.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Operational Tasks & Maintenance Tickets */}
        <div className="space-y-6">
          
          {/* Operational Tasks Widget */}
          <div className="bg-white border border-[#e4d8cf] rounded-[28px] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#f7efe9] pb-3">
              <div>
                <h2 className="text-base font-serif font-bold text-[#2d1217] flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-[#721828]" />
                  <span>Today's Tasks</span>
                </h2>
                <p className="text-xs text-[#968186]">Assigned housekeeping & maintenance</p>
              </div>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs text-[#721828] hover:text-[#2d1217] font-semibold underline underline-offset-4 flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {pendingTasks.map(t => {
                const isOverdue = t.dueDate < todayStr;
                return (
                  <div
                    key={t.id}
                    className="p-3 bg-[#fdf8f5] rounded-xl border border-[#e4d8cf] hover:bg-[#f7efe9] transition-colors flex items-start gap-2.5"
                  >
                    <button
                      onClick={() => toggleTaskStatus(t.id)}
                      className="mt-0.5 w-4 h-4 rounded border border-[#e4d8cf] hover:border-[#721828] flex items-center justify-center transition-colors shrink-0 cursor-pointer bg-white"
                    >
                      {t.status === 'Done' && <CheckCircle2 className="w-4 h-4 text-[#3e6f48]" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#2d1217] truncate">{t.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px]">
                        <span className={`font-bold uppercase ${
                          t.priority === 'Urgent' ? 'text-[#961c2c]' :
                          t.priority === 'High' ? 'text-[#9b6f25]' : 'text-[#968186]'
                        }`}>
                          {t.priority}
                        </span>
                        <span className="text-[#e4d8cf]">•</span>
                        <span className="text-[#7f6b6f]">{t.category}</span>
                        {isOverdue && (
                          <span className="text-[#961c2c] font-bold bg-[#fdf0f2] px-1.5 py-0.2 rounded border border-[#f5ccd2]">
                            Overdue
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Property Issues & Maintenance Tickets Widget */}
          <div className="bg-white border border-[#e4d8cf] rounded-[28px] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#f7efe9] pb-3">
              <div>
                <h2 className="text-base font-serif font-bold text-[#2d1217] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#961c2c]" />
                  <span>Open Maintenance Issues</span>
                </h2>
                <p className="text-xs text-[#968186]">{kpis.urgentIssuesCount} urgent / stay-impacting tickets</p>
              </div>
              <button
                onClick={() => setActiveTab('issues')}
                className="text-xs text-[#961c2c] hover:text-[#721828] font-semibold underline underline-offset-4 flex items-center gap-1 cursor-pointer"
              >
                <span>Manage</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {openIssues.map(issue => (
                <div
                  key={issue.id}
                  className="p-3 bg-[#fdf8f5] rounded-xl border border-[#e4d8cf] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2d1217] truncate">{issue.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      issue.severity === 'High' || issue.severity === 'Urgent'
                        ? 'bg-[#fdf0f2] text-[#961c2c] border border-[#f5ccd2]'
                        : 'bg-[#faf4e8] text-[#9b6f25] border border-[#eedab4]'
                    }`}>
                      {issue.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7f6b6f] line-clamp-1">{issue.description}</p>
                  <div className="flex items-center justify-between pt-1.5 border-t border-[#f7efe9] text-[10px] text-[#968186]">
                    <span>Area: {issue.propertyAreaId}</span>
                    <span className="text-[#721828] font-medium">Assigned: {issue.assignedToStaffOrVendor.split('(')[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Log Stream Mini */}
          <div className="bg-white border border-[#e4d8cf] rounded-[28px] p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#f7efe9] pb-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#968186] flex items-center gap-1.5">
                <ActivityIcon className="w-3.5 h-3.5 text-[#721828]" />
                <span>Live Activity Stream</span>
              </h2>
              <button
                onClick={() => setActiveTab('activities')}
                className="text-xs text-[#721828] hover:text-[#2d1217] font-semibold underline underline-offset-4"
              >
                All Logs →
              </button>
            </div>
            <div className="space-y-2.5">
              {activities.slice(0, 3).map(act => (
                <div key={act.id} className="text-xs text-[#45373a] pb-2 border-b border-[#f7efe9] last:border-none">
                  <div className="flex items-center justify-between font-medium text-[#2d1217]">
                    <span>{act.title}</span>
                    <span className="text-[10px] text-[#968186] font-mono">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[#7f6b6f] line-clamp-1 mt-0.5 text-[11px]">{act.description}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
