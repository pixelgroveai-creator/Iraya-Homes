import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Phone, 
  MessageSquare, 
  Calendar, 
  Clock, 
  DollarSign, 
  User, 
  Filter, 
  LayoutGrid, 
  List, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Search, 
  Flame,
  PhoneCall
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Lead, LeadStatus, LeadSource } from '../../types';
import { LeadConvertModal } from '../modals/LeadConvertModal';

const STAGES: LeadStatus[] = [
  'NEW',
  'CONTACTED',
  'FOLLOW-UP',
  'QUALIFIED',
  'BOOKING PENDING',
  'WON',
  'LOST'
];

export const LeadsView: React.FC = () => {
  const { 
    leads, 
    staffList, 
    advanceLeadStatus, 
    openQuickAction, 
    searchQuery 
  } = useCRM();

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [selectedLeadForConvert, setSelectedLeadForConvert] = useState<Lead | null>(null);
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<Lead | null>(null);

  const todayStr = '2026-09-01';

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    if (sourceFilter !== 'all' && lead.source !== sourceFilter) return false;
    if (ownerFilter !== 'all' && lead.assignedStaffId !== ownerFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = 
        lead.name.toLowerCase().includes(q) ||
        lead.phone.includes(q) ||
        lead.id.toLowerCase().includes(q) ||
        (lead.notes && lead.notes.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#e4d8cf] rounded-[28px] p-6 sm:p-7 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded-full bg-[#fbf2f4] text-[#721828] border border-[#e2b3bc]">
              Enquiry Pipeline
            </span>
            <span className="text-[#968186] text-xs font-medium">• {filteredLeads.length} Total Enquiries</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#2d1217] mt-1.5">
            Lead & Enquiry Management
          </h1>
          <p className="text-[#7f6b6f] text-xs sm:text-sm mt-0.5">
            Multi-channel intake (WhatsApp, Instagram, Calls) with scheduled follow-ups & 1-click conversion
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="bg-[#f7efe9] p-1 rounded-xl border border-[#e4d8cf] flex items-center gap-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                viewMode === 'kanban' ? 'bg-white text-[#721828] shadow-2xs' : 'text-[#7f6b6f] hover:text-[#2d1217]'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Pipeline</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                viewMode === 'table' ? 'bg-white text-[#721828] shadow-2xs' : 'text-[#7f6b6f] hover:text-[#2d1217]'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          {/* Add Lead Action */}
          <button
            onClick={() => openQuickAction('lead')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#721828] hover:bg-[#520b19] text-white font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Log New Lead</span>
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white border border-[#e4d8cf] p-4 rounded-2xl text-xs shadow-xs">
        <div className="flex items-center gap-1.5 text-[#968186] font-bold text-[10px] uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-[#721828]" />
          <span>Filters:</span>
        </div>

        {/* Source Filter */}
        <select
          value={sourceFilter}
          onChange={e => setSourceFilter(e.target.value)}
          className="bg-[#f7efe9] border border-[#e4d8cf] text-[#2d1217] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#721828]"
        >
          <option value="all">All Sources (WhatsApp, Insta, Calls...)</option>
          <option value="WhatsApp">WhatsApp</option>
          <option value="Instagram">Instagram</option>
          <option value="Phone">Phone Calls</option>
          <option value="Website">Website</option>
          <option value="Referral">Referral</option>
          <option value="Direct Walk-in">Direct Walk-in</option>
        </select>

        {/* Owner Filter */}
        <select
          value={ownerFilter}
          onChange={e => setOwnerFilter(e.target.value)}
          className="bg-[#f7efe9] border border-[#e4d8cf] text-[#2d1217] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#721828]"
        >
          <option value="all">All Staff Assignees</option>
          {staffList.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        {(sourceFilter !== 'all' || ownerFilter !== 'all') && (
          <button
            onClick={() => { setSourceFilter('all'); setOwnerFilter('all'); }}
            className="text-[#721828] hover:underline text-xs font-semibold"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* VIEW MODE 1: KANBAN PIPELINE BOARD */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3.5 overflow-x-auto pb-4">
          {STAGES.map(stage => {
            const stageLeads = filteredLeads.filter(l => l.status === stage);
            return (
              <div key={stage} className="bg-white border border-[#e4d8cf] rounded-[24px] flex flex-col min-w-[240px] max-h-[75vh] shadow-xs">
                {/* Column Header */}
                <div className="p-3.5 border-b border-[#e4d8cf] bg-[#fdf8f5] rounded-t-[24px] flex items-center justify-between">
                  <span className={`text-[10px] font-bold tracking-wider uppercase ${
                    stage === 'NEW' ? 'text-[#968186]' :
                    stage === 'CONTACTED' ? 'text-[#721828]' :
                    stage === 'FOLLOW-UP' ? 'text-[#9b6f25]' :
                    stage === 'QUALIFIED' ? 'text-[#721828]' :
                    stage === 'BOOKING PENDING' ? 'text-[#9b6f25]' :
                    stage === 'WON' ? 'text-[#3e6f48]' : 'text-[#968186]'
                  }`}>
                    {stage}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f7efe9] text-[#721828] border border-[#e4d8cf]">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="p-3 space-y-3 overflow-y-auto flex-1">
                  {stageLeads.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[#968186] italic">
                      No leads in {stage}
                    </div>
                  ) : (
                    stageLeads.map(lead => {
                      const staff = staffList.find(s => s.id === lead.assignedStaffId);
                      const isOverdueFollowUp = lead.scheduledFollowUp && lead.scheduledFollowUp.startsWith(todayStr);

                      return (
                        <div
                          key={lead.id}
                          className="bg-[#fdf8f5] hover:bg-[#f7efe9] border border-[#e4d8cf] hover:border-[#721828] rounded-2xl p-3.5 shadow-2xs transition-all space-y-2.5 group"
                        >
                          {/* Top Row: Name & Source */}
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-bold text-[#2d1217] text-xs group-hover:text-[#721828] transition-colors">
                              {lead.name}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#f7efe9] text-[#721828] border border-[#e4d8cf] shrink-0">
                              {lead.source}
                            </span>
                          </div>

                          {/* Contact & Dates */}
                          <div className="space-y-1 text-[11px] text-[#7f6b6f]">
                            <p className="text-[#2d1217] font-mono text-[10px]">{lead.phone}</p>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[#968186]" />
                              <span>{lead.checkInDate} → {lead.checkOutDate}</span>
                            </div>
                            <p className="text-[#7f6b6f]">
                              {lead.guestCount} Guests • {lead.stayPurpose}
                            </p>
                          </div>

                          {/* Quote Amount */}
                          {lead.quoteAmount && (
                            <div className="text-[11px] font-bold text-[#2d1217] bg-[#f7efe9] px-2.5 py-1 rounded-xl border border-[#e4d8cf] flex items-center justify-between">
                              <span className="text-[#968186] font-normal">Quote:</span>
                              <span className="font-serif">₹{lead.quoteAmount.toLocaleString()}</span>
                            </div>
                          )}

                          {/* Scheduled Follow up Alert */}
                          {lead.scheduledFollowUp && (
                            <div className={`text-[10px] font-semibold flex items-center gap-1 px-2.5 py-1 rounded-full ${
                              isOverdueFollowUp ? 'bg-[#fdf0f2] text-[#961c2c] border border-[#f5ccd2]' : 'text-[#7f6b6f] bg-[#f7efe9]'
                            }`}>
                              <Clock className="w-3 h-3" />
                              <span>Follow-up: {lead.scheduledFollowUp.split('T')[0]}</span>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="pt-2.5 border-t border-[#e4d8cf] flex items-center justify-between gap-1">
                            <button
                              onClick={() => openQuickAction('activity', { defaultLeadId: lead.id })}
                              className="px-2.5 py-1 rounded-xl bg-white hover:bg-[#fbf2f4] text-[#721828] border border-[#e4d8cf] text-[10px] font-semibold flex items-center gap-1 cursor-pointer shadow-2xs"
                              title="Log Call / Note"
                            >
                              <PhoneCall className="w-3 h-3 text-[#721828]" />
                              <span>Log</span>
                            </button>

                            {stage !== 'WON' && stage !== 'LOST' && (
                              <button
                                onClick={() => setSelectedLeadForConvert(lead)}
                                className="px-2.5 py-1 rounded-xl bg-[#fbf2f4] hover:bg-[#f5e3e7] text-[#721828] border border-[#e2b3bc] text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                                title="Convert to Confirmed Stay & Unified Guest"
                              >
                                <span>Convert</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: TABULAR VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white border border-[#e4d8cf] rounded-[28px] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#2d1217]">
              <thead className="bg-[#fdf8f5] text-[#968186] uppercase text-[10px] tracking-widest font-bold border-b border-[#e4d8cf]">
                <tr>
                  <th className="px-6 py-4">Lead ID / Guest</th>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4">Stay Dates</th>
                  <th className="px-6 py-4">Party & Purpose</th>
                  <th className="px-6 py-4">Quote (₹)</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Follow-Up</th>
                  <th className="px-6 py-4">Owner</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f7efe9]">
                {filteredLeads.map(lead => {
                  const staff = staffList.find(s => s.id === lead.assignedStaffId);
                  return (
                    <tr key={lead.id} className="hover:bg-[#fdf8f5] transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-[#2d1217]">{lead.name}</p>
                        <p className="text-[11px] text-[#968186] font-mono">{lead.phone} • {lead.id}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#f7efe9] text-[#721828] border border-[#e4d8cf]">
                          {lead.source}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px]">
                        {lead.checkInDate} → {lead.checkOutDate}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[#2d1217]">{lead.guestCount} Guests</p>
                        <p className="text-[10px] text-[#968186]">{lead.stayPurpose}</p>
                      </td>
                      <td className="px-6 py-4 font-bold text-[#2d1217] font-serif">
                        ₹{lead.quoteAmount ? lead.quoteAmount.toLocaleString() : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          lead.status === 'NEW' ? 'bg-[#f7efe9] text-[#721828] border border-[#e4d8cf]' :
                          lead.status === 'QUALIFIED' ? 'bg-[#fbf2f4] text-[#721828] border border-[#e2b3bc]' :
                          lead.status === 'WON' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                          lead.status === 'LOST' ? 'bg-[#fdf0f2] text-[#961c2c] border border-[#f5ccd2]' :
                          'bg-[#f7efe9] text-[#721828] border border-[#e4d8cf]'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[11px] text-[#7f6b6f]">
                        {lead.scheduledFollowUp ? lead.scheduledFollowUp.split('T')[0] : '—'}
                      </td>
                      <td className="px-6 py-4 text-[#2d1217]">
                        {staff?.name || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => openQuickAction('activity', { defaultLeadId: lead.id })}
                          className="px-3 py-1 bg-white hover:bg-[#fbf2f4] text-[#721828] border border-[#e4d8cf] rounded-xl text-xs font-semibold shadow-2xs cursor-pointer"
                        >
                          Log
                        </button>
                        {lead.status !== 'WON' && lead.status !== 'LOST' && (
                          <button
                            onClick={() => setSelectedLeadForConvert(lead)}
                            className="px-3 py-1 bg-[#721828] hover:bg-[#520b19] text-white rounded-xl text-xs font-semibold shadow-2xs cursor-pointer"
                          >
                            Convert
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Convert Lead Modal */}
      {selectedLeadForConvert && (
        <LeadConvertModal
          lead={selectedLeadForConvert}
          onClose={() => setSelectedLeadForConvert(null)}
          onSuccess={() => setSelectedLeadForConvert(null)}
        />
      )}

    </div>
  );
};
