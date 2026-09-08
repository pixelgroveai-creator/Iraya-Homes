import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  CalendarCheck, 
  Activity as ActivityIcon, 
  CheckSquare, 
  AlertTriangle, 
  Phone, 
  MessageCircle, 
  Waves, 
  Sparkles, 
  CreditCard, 
  Clock, 
  Check, 
  DollarSign,
  Receipt
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useCommercials } from '../../context/CommercialsContext';
import { 
  LeadSource, 
  StayPurpose, 
  LeadStatus, 
  BookingStatus, 
  TaskPriority, 
  TaskCategory, 
  PropertyAreaId, 
  IssueCategory, 
  IssueSeverity, 
  ActivityType 
} from '../../types';

export const QuickActionModal: React.FC = () => {
  const { 
    quickAction, 
    closeQuickAction, 
    openQuickAction, 
    addLead, 
    addBooking, 
    logActivity, 
    addTask, 
    addIssue, 
    staffList, 
    currentStaff,
    guests,
    leads,
    bookings,
    checklists
  } = useCRM();

  const [activeTab, setActiveTab] = useState(quickAction.activeTab);

  useEffect(() => {
    setActiveTab(quickAction.activeTab);
  }, [quickAction.activeTab]);

  if (!quickAction.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3d3d2e]/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-[#e2ddd6] rounded-[28px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header with Quick Switch Tabs */}
        <div className="bg-[#fcfaf7] px-6 py-4 border-b border-[#e2ddd6] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5a7a40] animate-pulse" />
            <h2 className="text-base font-bold text-[#3d3d2e] font-serif tracking-wide">
              Quick Action Hub
            </h2>
          </div>
          <button 
            onClick={closeQuickAction}
            className="p-1.5 rounded-xl text-[#8c8c7a] hover:text-[#3d3d2e] hover:bg-[#f1ede8] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#e2ddd6] bg-white px-4 py-2.5 gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: 'lead', label: '+ Add Lead', icon: Users, color: 'text-[#5a5a40]' },
            { id: 'booking', label: '+ Add Booking', icon: CalendarCheck, color: 'text-[#5a7a40]' },
            { id: 'expense', label: '+ Record Expense', icon: Receipt, color: 'text-[#721828]' },
            { id: 'activity', label: '+ Log Activity (<60s)', icon: ActivityIcon, color: 'text-[#b0743b]' },
            { id: 'task', label: '+ Create Task', icon: CheckSquare, color: 'text-[#5a5a40]' },
            { id: 'issue', label: '+ Report Issue', icon: AlertTriangle, color: 'text-[#96422b]' },
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-[#5a5a40] text-white shadow-xs' 
                    : 'text-[#7a7a6a] hover:text-[#3d3d2e] hover:bg-[#f1ede8]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : tab.color}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body Form Panels */}
        <div className="p-6 overflow-y-auto space-y-4 text-[#5a5a40] text-xs flex-1">
          {activeTab === 'lead' && <AddLeadForm onClose={closeQuickAction} />}
          {activeTab === 'booking' && <AddBookingForm onClose={closeQuickAction} />}
          {activeTab === 'expense' && <RecordExpenseForm onClose={closeQuickAction} />}
          {activeTab === 'activity' && <LogActivityForm onClose={closeQuickAction} />}
          {activeTab === 'task' && <CreateTaskForm onClose={closeQuickAction} />}
          {activeTab === 'issue' && <ReportIssueForm onClose={closeQuickAction} />}
        </div>
      </div>
    </div>
  );
};

// 1. ADD LEAD FORM
const AddLeadForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addLead, currentStaff } = useCRM();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    source: 'WhatsApp' as LeadSource,
    checkInDate: '2026-09-15',
    checkOutDate: '2026-09-17',
    guestCount: 8,
    stayPurpose: 'Family' as StayPurpose,
    status: 'NEW' as LeadStatus,
    assignedStaffId: currentStaff.id,
    scheduledFollowUp: '2026-09-01T15:00',
    quoteAmount: 65000,
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    addLead({
      ...formData,
      scheduledFollowUp: formData.scheduledFollowUp ? `${formData.scheduledFollowUp}:00Z` : undefined
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Guest Full Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Sameer Kapoor"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Phone Number (Primary Key) *</label>
          <input
            type="tel"
            required
            placeholder="e.g. +91 98711 22334"
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
            className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Enquiry Source</label>
          <select
            value={formData.source}
            onChange={e => setFormData({ ...formData, source: e.target.value as LeadSource })}
            className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
          >
            <option value="WhatsApp">WhatsApp</option>
            <option value="Instagram">Instagram</option>
            <option value="Phone">Phone Call</option>
            <option value="Website">Website Form</option>
            <option value="Referral">Referral</option>
            <option value="Direct Walk-in">Direct Walk-in</option>
          </select>
        </div>
        <div>
          <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Guest Count</label>
          <input
            type="number"
            min="1"
            max="20"
            value={formData.guestCount}
            onChange={e => setFormData({ ...formData, guestCount: parseInt(e.target.value) || 1 })}
            className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Stay Purpose</label>
          <select
            value={formData.stayPurpose}
            onChange={e => setFormData({ ...formData, stayPurpose: e.target.value as StayPurpose })}
            className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
          >
            <option value="Family">Family Vacation</option>
            <option value="Friends">Friends Getaway</option>
            <option value="Group">Corporate / Group</option>
            <option value="Event">Intimate Celebration / Event</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Check-In Target Date</label>
          <input
            type="date"
            value={formData.checkInDate}
            onChange={e => setFormData({ ...formData, checkInDate: e.target.value })}
            className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Check-Out Target Date</label>
          <input
            type="date"
            value={formData.checkOutDate}
            onChange={e => setFormData({ ...formData, checkOutDate: e.target.value })}
            className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Initial Custom Quote (₹)</label>
          <input
            type="number"
            step="1000"
            value={formData.quoteAmount}
            onChange={e => setFormData({ ...formData, quoteAmount: parseInt(e.target.value) || 0 })}
            className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Assigned Staff Owner</label>
          <input
            type="text"
            readOnly
            value={currentStaff.name}
            className="w-full bg-[#f1ede8] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#7a7a6a] cursor-not-allowed"
          />
        </div>
      </div>

      <div>
        <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Scheduled Follow-up Date & Time</label>
        <input
          type="datetime-local"
          value={formData.scheduledFollowUp}
          onChange={e => setFormData({ ...formData, scheduledFollowUp: e.target.value })}
          className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Enquiry Notes & Special Requests</label>
        <textarea
          rows={2}
          placeholder="Details about specific requirements, pool access, barbecue requests..."
          value={formData.notes}
          onChange={e => setFormData({ ...formData, notes: e.target.value })}
          className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
        />
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-[#e2ddd6]">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-[#f1ede8] hover:bg-[#eae6e0] text-[#5a5a40] font-bold text-xs cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 rounded-xl bg-[#5a5a40] hover:bg-[#484832] text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
        >
          Save Lead & Schedule Follow-up
        </button>
      </div>
    </form>
  );
};

// 2. ADD BOOKING FORM
const AddBookingForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addBooking, guests, currentStaff } = useCRM();
  const [selectedGuestId, setSelectedGuestId] = useState(guests[0]?.id || '');
  const [guestName, setGuestName] = useState(guests[0]?.name || '');
  const [guestPhone, setGuestPhone] = useState(guests[0]?.phone || '');
  const [checkInDate, setCheckInDate] = useState('2026-09-20');
  const [checkOutDate, setCheckOutDate] = useState('2026-09-22');
  const [guestCount, setGuestCount] = useState(8);
  const [stayPurpose, setStayPurpose] = useState<StayPurpose>('Family');
  const [status, setStatus] = useState<BookingStatus>('Confirmed');
  const [totalQuote, setTotalQuote] = useState(70000);
  const [advancePaid, setAdvancePaid] = useState(35000);
  const [securityDeposit, setSecurityDeposit] = useState(15000);
  const [specialRequests, setSpecialRequests] = useState('Indoor pool heating & pool table readiness');

  const handleGuestSelect = (id: string) => {
    setSelectedGuestId(id);
    const g = guests.find(guest => guest.id === id);
    if (g) {
      setGuestName(g.name);
      setGuestPhone(g.phone);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBooking({
      guestId: selectedGuestId || 'GST-CUSTOM',
      guestName: guestName || 'Direct Guest',
      guestPhone: guestPhone || '+91 99999 00000',
      checkInDate,
      checkOutDate,
      guestCount,
      stayPurpose,
      status,
      totalQuote,
      advanceDepositPaid: advancePaid,
      balanceDue: Math.max(0, totalQuote - advancePaid),
      securityDepositAmount: securityDeposit,
      securityDepositRefunded: false,
      preArrivalInspectionDone: false,
      postCheckoutInspectionDone: false,
      specialRequests,
      assignedHostId: currentStaff.id
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-[#fcfaf7] p-3.5 rounded-2xl border border-[#e2ddd6]">
        <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Link Existing Unified Guest Profile</label>
        <select
          value={selectedGuestId}
          onChange={e => handleGuestSelect(e.target.value)}
          className="w-full bg-white border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
        >
          {guests.map(g => (
            <option key={g.id} value={g.id}>{g.name} ({g.phone}) — {g.totalStays} past stays</option>
          ))}
          <option value="new">+ Enter New Guest Details</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Guest Name</label>
          <input
            type="text"
            required
            value={guestName}
            onChange={e => setGuestName(e.target.value)}
            className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Contact Phone</label>
          <input
            type="tel"
            required
            value={guestPhone}
            onChange={e => setGuestPhone(e.target.value)}
            className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Check-In Date</label>
          <input
            type="date"
            value={checkInDate}
            onChange={e => setCheckInDate(e.target.value)}
            className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Check-Out Date</label>
          <input
            type="date"
            value={checkOutDate}
            onChange={e => setCheckOutDate(e.target.value)}
            className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Stay Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as BookingStatus)}
            className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
          >
            <option value="Hold">Hold</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Checked-in">Checked-in (In-House)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Total Villa Quote (₹)</label>
          <input
            type="number"
            value={totalQuote}
            onChange={e => setTotalQuote(parseInt(e.target.value) || 0)}
            className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Advance Paid (₹)</label>
          <input
            type="number"
            value={advancePaid}
            onChange={e => setAdvancePaid(parseInt(e.target.value) || 0)}
            className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Security Deposit (₹)</label>
          <input
            type="number"
            value={securityDeposit}
            onChange={e => setSecurityDeposit(parseInt(e.target.value) || 0)}
            className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Stay Requests & Villa Setup Notes</label>
        <textarea
          rows={2}
          value={specialRequests}
          onChange={e => setSpecialRequests(e.target.value)}
          className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
        />
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-[#e2ddd6]">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-[#f1ede8] hover:bg-[#eae6e0] text-[#5a5a40] font-bold text-xs cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 rounded-xl bg-[#5a7a40] hover:bg-[#486632] text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
        >
          Create Booking
        </button>
      </div>
    </form>
  );
};

// 3. LOG ACTIVITY (<60s SPEED LOGGER)
const LogActivityForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { logActivity, leads, bookings, guests } = useCRM();
  const [type, setType] = useState<ActivityType>('Call');
  const [title, setTitle] = useState('Follow-up call with guest');
  const [description, setDescription] = useState('');
  const [relatedType, setRelatedType] = useState<'none' | 'lead' | 'booking' | 'guest'>('lead');
  const [relatedId, setRelatedId] = useState(leads[0]?.id || '');
  const [outcome, setOutcome] = useState('Guest satisfied, follow-up scheduled');

  const presetChips = [
    { label: '📞 Phone Call Summary', type: 'Call' as ActivityType, title: 'Prospective Guest Call Summary', desc: 'Discussed villa dates, pool heating availability, and catering tariff.' },
    { label: '💬 WhatsApp Chat Log', type: 'WhatsApp' as ActivityType, title: 'WhatsApp Enquiry Response', desc: 'Sent photo catalogue, terrace photos and tariff quotation.' },
    { label: '🏊 Pool pH Test (7.4)', type: 'Pool Check' as ActivityType, title: 'Daily Pool Water & Filtration Log', desc: 'Tested water pH at 7.4. Chlorine 1.5ppm. Pump running normally.' },
    { label: '🛏️ 4-Suites Inspection', type: 'Room Inspection' as ActivityType, title: '4 Bedroom Suites Cleanliness Check', desc: 'Fresh linen dressed in all 4 suites. AC cooling optimal.' },
    { label: '💳 Payment Received', type: 'Payment' as ActivityType, title: 'Advance Deposit Received', desc: 'Bank transfer received and recorded against reservation.' }
  ];

  const handleApplyPreset = (p: typeof presetChips[0]) => {
    setType(p.type);
    setTitle(p.title);
    setDescription(p.desc);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logActivity({
      type,
      title,
      description: description || title,
      relatedLeadId: relatedType === 'lead' ? relatedId : undefined,
      relatedBookingId: relatedType === 'booking' ? relatedId : undefined,
      relatedGuestId: relatedType === 'guest' ? relatedId : undefined,
      outcome
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 60s Speed Presets */}
      <div>
        <label className="block text-[#5a5a40] mb-2 font-bold text-xs">⚡ Speed Presets (&lt; 60 seconds)</label>
        <div className="flex flex-wrap gap-2">
          {presetChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(chip)}
              className="px-3 py-1.5 rounded-xl bg-[#fcfaf7] hover:bg-[#f1ede8] hover:text-[#3d3d2e] text-[#5a5a40] border border-[#d8d2c8] text-xs font-medium transition-all cursor-pointer shadow-2xs"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Interaction Type</label>
          <select
            value={type}
            onChange={e => setType(e.target.value as ActivityType)}
            className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
          >
            <option value="Call">Phone Call</option>
            <option value="WhatsApp">WhatsApp Message</option>
            <option value="Pool Check">Pool Check</option>
            <option value="Room Inspection">Room Inspection</option>
            <option value="Payment">Payment / Commercials</option>
            <option value="Guest Request">Guest Request</option>
            <option value="Note">General Note</option>
          </select>
        </div>
        <div>
          <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Activity Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Detailed Interaction / Log Description</label>
        <textarea
          rows={3}
          required
          placeholder="Capture call notes, agreed dates, inspection remarks..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Link Record</label>
          <select
            value={relatedType}
            onChange={e => setRelatedType(e.target.value as any)}
            className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
          >
            <option value="none">None (General)</option>
            <option value="lead">Link to Lead</option>
            <option value="booking">Link to Booking</option>
            <option value="guest">Link to Guest Profile</option>
          </select>
        </div>

        {relatedType === 'lead' && (
          <div>
            <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Select Lead</label>
            <select
              value={relatedId}
              onChange={e => setRelatedId(e.target.value)}
              className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
            >
              {leads.map(l => (
                <option key={l.id} value={l.id}>{l.name} ({l.id} - {l.source})</option>
              ))}
            </select>
          </div>
        )}

        {relatedType === 'booking' && (
          <div>
            <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Select Booking</label>
            <select
              value={relatedId}
              onChange={e => setRelatedId(e.target.value)}
              className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
            >
              {bookings.map(b => (
                <option key={b.id} value={b.id}>{b.guestName} ({b.id} - {b.status})</option>
              ))}
            </select>
          </div>
        )}

        {relatedType === 'guest' && (
          <div>
            <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Select Guest</label>
            <select
              value={relatedId}
              onChange={e => setRelatedId(e.target.value)}
              className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
            >
              {guests.map(g => (
                <option key={g.id} value={g.id}>{g.name} ({g.phone})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div>
        <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Outcome / Next Step</label>
        <input
          type="text"
          value={outcome}
          onChange={e => setOutcome(e.target.value)}
          placeholder="e.g. Sent quotation on WhatsApp, awaiting advance payment"
          className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
        />
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-[#e2ddd6]">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-[#f1ede8] hover:bg-[#eae6e0] text-[#5a5a40] font-bold text-xs cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 rounded-xl bg-[#5a5a40] hover:bg-[#484832] text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
        >
          Log Activity Stream
        </button>
      </div>
    </form>
  );
};

// 4. CREATE TASK FORM
const CreateTaskForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addTask, staffList, currentStaff } = useCRM();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('High');
  const [category, setCategory] = useState<TaskCategory>('Housekeeping');
  const [assignedStaffId, setAssignedStaffId] = useState(staffList[3]?.id || currentStaff.id);
  const [dueDate, setDueDate] = useState('2026-09-01');
  const [linkedAreaId, setLinkedAreaId] = useState<PropertyAreaId>('pool');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    addTask({
      title,
      description,
      priority,
      status: 'To Do',
      category,
      assignedStaffId,
      dueDate,
      linkedAreaId
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Task Title *</label>
        <input
          type="text"
          required
          placeholder="e.g. Inspect Terrace Seating & Wipe Balcony Railing"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Priority</label>
          <select
            value={priority}
            onChange={e => setPriority(e.target.value as TaskPriority)}
            className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
          >
            <option value="Urgent">Urgent (Overdue Alert)</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div>
          <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Category</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value as TaskCategory)}
            className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
          >
            <option value="Housekeeping">Housekeeping</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Front Desk">Front Desk</option>
            <option value="Guest Request">Guest Request</option>
            <option value="Inspection">Inspection Checklist</option>
            <option value="Follow-up">Lead Follow-up</option>
          </select>
        </div>
        <div>
          <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Assignee</label>
          <select
            value={assignedStaffId}
            onChange={e => setAssignedStaffId(e.target.value)}
            className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
          >
            {staffList.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Linked Villa Area</label>
          <select
            value={linkedAreaId}
            onChange={e => setLinkedAreaId(e.target.value as PropertyAreaId)}
            className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
          >
            <option value="suite-1">Suite 1 — Royal Parkview</option>
            <option value="suite-2">Suite 2 — Garden Haven</option>
            <option value="suite-3">Suite 3 — Terrace Suite</option>
            <option value="suite-4">Suite 4 — Courtyard Suite</option>
            <option value="pool">Indoor Heated Pool</option>
            <option value="kitchen">Fully Equipped Kitchen</option>
            <option value="lounge-pool-table">Pool Table & Lounge</option>
            <option value="terrace-balcony">Private Terrace & Balcony</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Description & Execution SOP</label>
        <textarea
          rows={2}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Specific instructions for housekeeping or maintenance staff..."
          className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
        />
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-[#e2ddd6]">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-[#f1ede8] hover:bg-[#eae6e0] text-[#5a5a40] font-bold text-xs cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 rounded-xl bg-[#5a5a40] hover:bg-[#484832] text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
        >
          Create Task
        </button>
      </div>
    </form>
  );
};

// 5. REPORT ISSUE FORM
const ReportIssueForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addIssue, currentStaff } = useCRM();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory>('Plumbing');
  const [propertyAreaId, setPropertyAreaId] = useState<PropertyAreaId>('suite-3');
  const [severity, setSeverity] = useState<IssueSeverity>('High');
  const [impactsUpcomingStay, setImpactsUpcomingStay] = useState(true);
  const [assignedVendor, setAssignedVendor] = useState('Lucknow Facility Care / Maintenance Team');
  const [estimatedCost, setEstimatedCost] = useState(1200);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    addIssue({
      title,
      description,
      category,
      propertyAreaId,
      severity,
      status: 'Open',
      reportedByStaffId: currentStaff.id,
      assignedToStaffOrVendor: assignedVendor,
      impactsUpcomingStay,
      estimatedCost
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Issue Summary *</label>
        <input
          type="text"
          required
          placeholder="e.g. Kitchen RO Purifier Low Flow / Filter Blockage"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Category</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value as IssueCategory)}
            className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
          >
            <option value="Plumbing">Plumbing</option>
            <option value="Electrical">Electrical</option>
            <option value="Pool">Indoor Pool</option>
            <option value="HVAC/AC">HVAC / AC</option>
            <option value="Amenities">Amenities / Pool Table</option>
            <option value="Cleanliness">Cleanliness</option>
            <option value="Furniture">Furniture & Fixtures</option>
          </select>
        </div>
        <div>
          <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Severity Escalation</label>
          <select
            value={severity}
            onChange={e => setSeverity(e.target.value as IssueSeverity)}
            className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
          >
            <option value="Urgent">🚨 Urgent (Blocks Check-in)</option>
            <option value="High">⚠️ High (Needs Fast Fix)</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low (Cosmetic)</option>
          </select>
        </div>
        <div>
          <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Affected Property Area</label>
          <select
            value={propertyAreaId}
            onChange={e => setPropertyAreaId(e.target.value as PropertyAreaId)}
            className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
          >
            <option value="suite-1">Suite 1 — Royal Parkview</option>
            <option value="suite-2">Suite 2 — Garden Haven</option>
            <option value="suite-3">Suite 3 — Terrace Suite</option>
            <option value="suite-4">Suite 4 — Courtyard Suite</option>
            <option value="pool">Indoor Heated Pool</option>
            <option value="kitchen">Fully Equipped Kitchen</option>
            <option value="lounge-pool-table">Pool Table & Lounge</option>
            <option value="terrace-balcony">Private Terrace & Balcony</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-[#fdf3f0] p-3.5 rounded-2xl border border-[#f0c8bc]">
        <input
          type="checkbox"
          id="impact-stay"
          checked={impactsUpcomingStay}
          onChange={e => setImpactsUpcomingStay(e.target.checked)}
          className="w-4 h-4 rounded text-[#96422b] bg-white border-[#f0c8bc] focus:ring-[#96422b]"
        />
        <label htmlFor="impact-stay" className="text-[#3d3d2e] cursor-pointer">
          <span className="font-bold text-[#96422b]">Impacts Upcoming Guest Stay:</span> Triggers manager escalation alert on dashboard.
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Assigned Vendor / Staff</label>
          <input
            type="text"
            value={assignedVendor}
            onChange={e => setAssignedVendor(e.target.value)}
            className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Estimated Repair Cost (₹)</label>
          <input
            type="number"
            value={estimatedCost}
            onChange={e => setEstimatedCost(parseInt(e.target.value) || 0)}
            className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-[#5a5a40] mb-1 font-bold text-xs">Issue Description & Action Required</label>
        <textarea
          rows={2}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Details on symptoms, affected amenities, parts required..."
          className="w-full bg-[#fcfaf7] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] focus:border-[#5a5a40] focus:outline-none"
        />
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-[#e2ddd6]">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-[#f1ede8] hover:bg-[#eae6e0] text-[#5a5a40] font-bold text-xs cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 rounded-xl bg-[#96422b] hover:bg-[#7a3420] text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
        >
          Report & Escalate Issue
        </button>
      </div>
    </form>
  );
};

// 6. RECORD EXPENSE FORM (COMMERCIALS)
const RecordExpenseForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { categories, addExpense } = useCommercials();
  const { currentStaff } = useCRM();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'Food & Beverages');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'UPI' | 'Bank Transfer' | 'Other'>('Cash');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be a positive number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await addExpense({
        amount: parsedAmount,
        category,
        date,
        description: description.trim(),
        paymentMethod,
        notes: notes.trim() || undefined,
        userName: currentStaff?.name || 'Staff'
      });

      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-[#fdf0f2] border border-[#f5ccd2] rounded-xl text-xs text-[#961c2c]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[#45373a] mb-1 font-bold text-xs">
            Amount (INR ₹) <span className="text-[#961c2c]">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="e.g. 1250"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full bg-[#fdf8f5] border border-[#e4d8cf] focus:border-[#721828] focus:bg-white rounded-xl px-3 py-2 text-[#2d1217] font-bold text-sm outline-none"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-[#45373a] mb-1 font-bold text-xs">
            Category <span className="text-[#961c2c]">*</span>
          </label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full bg-[#fdf8f5] border border-[#e4d8cf] focus:border-[#721828] focus:bg-white rounded-xl px-3 py-2 text-[#2d1217] text-xs outline-none"
          >
            {categories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[#45373a] mb-1 font-bold text-xs">
            Date <span className="text-[#961c2c]">*</span>
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full bg-[#fdf8f5] border border-[#e4d8cf] focus:border-[#721828] focus:bg-white rounded-xl px-3 py-2 text-[#2d1217] text-xs outline-none"
          />
        </div>

        <div>
          <label className="block text-[#45373a] mb-1 font-bold text-xs">
            Payment Method <span className="text-[#961c2c]">*</span>
          </label>
          <select
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value as any)}
            className="w-full bg-[#fdf8f5] border border-[#e4d8cf] focus:border-[#721828] focus:bg-white rounded-xl px-3 py-2 text-[#2d1217] text-xs outline-none"
          >
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="UPI">UPI</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[#45373a] mb-1 font-bold text-xs">
          Description / Vendor
        </label>
        <input
          type="text"
          placeholder="e.g. Milk, bread & organic fruit basket for breakfast"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full bg-[#fdf8f5] border border-[#e4d8cf] focus:border-[#721828] focus:bg-white rounded-xl px-3 py-2 text-[#2d1217] text-xs outline-none"
        />
      </div>

      <div>
        <label className="block text-[#45373a] mb-1 font-bold text-xs">
          Notes (Optional)
        </label>
        <input
          type="text"
          placeholder="e.g. Bill #8821 paid by Front Desk cash float"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          className="w-full bg-[#fdf8f5] border border-[#e4d8cf] focus:border-[#721828] focus:bg-white rounded-xl px-3 py-2 text-[#2d1217] text-xs outline-none"
        />
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-[#e4d8cf]">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-[#f7efe9] hover:bg-[#ebdcc3] text-[#45373a] font-bold text-xs cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 rounded-xl bg-[#721828] hover:bg-[#520b19] disabled:opacity-50 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
        >
          Save Expense
        </button>
      </div>
    </form>
  );
};
