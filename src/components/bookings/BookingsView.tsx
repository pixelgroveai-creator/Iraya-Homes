import React, { useState } from 'react';
import { 
  CalendarCheck, 
  Plus, 
  Calendar, 
  DollarSign, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  User, 
  Filter, 
  LayoutList, 
  CalendarDays, 
  Phone, 
  ArrowRight, 
  AlertCircle,
  FileCheck,
  RefreshCw,
  LogOut,
  LogIn
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Booking, BookingStatus } from '../../types';
import { ActiveSearchBanner } from '../common/ActiveSearchBanner';

const BOOKING_STATUSES: BookingStatus[] = [
  'Hold',
  'Confirmed',
  'Checked-in',
  'Checked-out',
  'Cancelled'
];

export const BookingsView: React.FC = () => {
  const { 
    bookings, 
    updateBookingStatus, 
    togglePreArrivalInspection, 
    togglePostCheckoutInspection, 
    openQuickAction, 
    searchQuery,
    staffList 
  } = useCRM();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<Booking | null>(null);

  const todayStr = '2026-09-01';

  // Filter bookings
  const filteredBookings = bookings.filter(b => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = 
        b.guestName.toLowerCase().includes(q) ||
        b.guestPhone.includes(q) ||
        b.id.toLowerCase().includes(q) ||
        (b.specialRequests && b.specialRequests.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      <ActiveSearchBanner currentModule="Bookings" resultCount={filteredBookings.length} />

      {/* Top Banner */}
      <div className="bg-white border border-[#e4d8cf] rounded-[28px] p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded-full bg-[#fbf2f4] text-[#721828] border border-[#e2b3bc]">
              Villa Reservations & Stays
            </span>
            <span className="text-[#968186] text-xs font-medium">• 4 BHK Whole Villa Booking Workflow</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#2d1217] mt-1.5">
            Booking Pipeline & Stay Operations
          </h1>
          <p className="text-[#7f6b6f] text-xs sm:text-sm mt-0.5">
            Commercial deposit tracking, pre-arrival inspection sign-off, check-in/out workflows & turnover dispatch
          </p>
        </div>

        <button
          onClick={() => openQuickAction('booking')}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#721828] hover:bg-[#520b19] text-white font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Reservation</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white border border-[#e4d8cf] p-3 rounded-2xl text-xs shadow-xs">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
            statusFilter === 'all' ? 'bg-[#721828] text-white shadow-2xs' : 'text-[#7f6b6f] hover:text-[#2d1217] hover:bg-[#f7efe9]'
          }`}
        >
          All Stays ({bookings.length})
        </button>
        {BOOKING_STATUSES.map(st => {
          const count = bookings.filter(b => b.status === st).length;
          return (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                statusFilter === st ? 'bg-[#721828] text-white shadow-2xs' : 'text-[#7f6b6f] hover:text-[#2d1217] hover:bg-[#f7efe9]'
              }`}
            >
              <span>{st}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${statusFilter === st ? 'bg-white/20 text-white' : 'bg-[#f7efe9] text-[#721828]'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bookings List Cards */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="bg-white border border-[#e4d8cf] rounded-[28px] p-12 text-center text-[#968186] shadow-xs">
            No bookings found matching current filters.
          </div>
        ) : (
          filteredBookings.map(booking => {
            const host = staffList.find(s => s.id === booking.assignedHostId);
            const isTodayArrival = booking.checkInDate === todayStr;
            const isTodayDeparture = booking.checkOutDate === todayStr;

            return (
              <div
                key={booking.id}
                className="bg-white border border-[#e4d8cf] hover:border-[#721828] rounded-[28px] p-6 shadow-xs transition-all space-y-4"
              >
                {/* Main Summary Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#e4d8cf]">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-bold text-base text-[#2d1217] font-serif">
                        {booking.guestName}
                      </span>
                      <span className="text-xs text-[#968186] font-mono">
                        #{booking.id}
                      </span>
                      <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                        booking.status === 'Checked-in' ? 'bg-[#fbf2f4] text-[#721828] border border-[#e2b3bc]' :
                        booking.status === 'Confirmed' ? 'bg-[#fbf2f4] text-[#721828] border border-[#e2b3bc]' :
                        booking.status === 'Hold' ? 'bg-[#faf4e8] text-[#9b6f25] border border-[#eedab4]' :
                        booking.status === 'Checked-out' ? 'bg-[#f7efe9] text-[#968186] border border-[#e4d8cf]' :
                        'bg-[#fdf0f2] text-[#961c2c] border border-[#f5ccd2]'
                      }`}>
                        {booking.status}
                      </span>
                      {isTodayArrival && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#fbf2f4] text-[#721828] text-[10px] font-bold border border-[#e2b3bc]">
                          Arrival Today
                        </span>
                      )}
                      {isTodayDeparture && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#faf4e8] text-[#9b6f25] text-[10px] font-bold border border-[#eedab4]">
                          Departure Today
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#7f6b6f]">
                      Contact: <span className="text-[#2d1217] font-mono">{booking.guestPhone}</span> • Assigned Host: <span className="text-[#2d1217] font-medium">{host?.name || 'Aarav Sharma'}</span>
                    </p>
                  </div>

                  {/* Stage Transition Control Bar (PRD Section 9) */}
                  <div className="flex flex-wrap items-center gap-2">
                    {booking.status === 'Confirmed' && (
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'Checked-in')}
                        className="px-3.5 py-2 rounded-xl bg-[#721828] hover:bg-[#520b19] text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer"
                        title="Mark Guest Arrival"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Check-In Guest</span>
                      </button>
                    )}

                    {booking.status === 'Checked-in' && (
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'Checked-out')}
                        className="px-3.5 py-2 rounded-xl bg-[#9b6f25] hover:bg-[#7e5719] text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer"
                        title="Mark Guest Departure & Trigger Turnover Inspection"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Check-Out & Trigger Reset</span>
                      </button>
                    )}

                    <select
                      value={booking.status}
                      onChange={e => updateBookingStatus(booking.id, e.target.value as BookingStatus)}
                      className="bg-[#f7efe9] border border-[#e4d8cf] text-[#2d1217] text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#721828]"
                    >
                      <option value="Hold">Hold</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Checked-in">Checked-in</option>
                      <option value="Checked-out">Checked-out</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Stay Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-[#fdf8f5] p-3.5 rounded-2xl border border-[#e4d8cf]">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-[#968186]">Stay Duration</p>
                    <p className="font-bold text-[#2d1217] mt-1 font-mono text-[11px]">{booking.checkInDate} → {booking.checkOutDate}</p>
                  </div>
                  <div className="bg-[#fdf8f5] p-3.5 rounded-2xl border border-[#e4d8cf]">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-[#968186]">Party Size & Purpose</p>
                    <p className="font-bold text-[#2d1217] mt-1">{booking.guestCount} Guests • {booking.stayPurpose}</p>
                  </div>
                  <div className="bg-[#fdf8f5] p-3.5 rounded-2xl border border-[#e4d8cf]">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-[#968186]">Total Tariff Quote</p>
                    <p className="font-bold text-[#2d1217] font-serif text-sm mt-1">₹{(booking.totalQuote ?? (booking as any).totalAmount ?? 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-[#fdf8f5] p-3.5 rounded-2xl border border-[#e4d8cf]">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-[#968186]">Commercial Balance</p>
                    <p className={`font-bold mt-1 ${(booking.balanceDue ?? 0) > 0 ? 'text-[#961c2c]' : 'text-[#3e6f48]'}`}>
                      {(booking.balanceDue ?? 0) > 0 ? `₹${(booking.balanceDue ?? 0).toLocaleString()} Due` : 'Fully Paid'}
                    </p>
                  </div>
                </div>

                {/* Commercial Deposits & Inspection Checklists Workflow Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  
                  {/* Financial & Deposit Status Log (PRD 8.3 & Scope) */}
                  <div className="p-4 bg-[#fdf8f5] rounded-2xl border border-[#e4d8cf] space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#2d1217]">
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-[#721828]" />
                        <span className="font-bold">Commercial & Deposit Ledger</span>
                      </span>
                      <span className="text-[#7f6b6f]">Advance: ₹{(booking.advanceDepositPaid ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-[#7f6b6f] pt-2 border-t border-[#e4d8cf]">
                      <div>
                        <span>Security Deposit: </span>
                        <span className="font-bold text-[#2d1217]">₹{(booking.securityDepositAmount ?? 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <span>Deposit Status: </span>
                        <span className={`font-bold ${booking.securityDepositRefunded ? 'text-[#3e6f48]' : 'text-[#9b6f25]'}`}>
                          {booking.securityDepositRefunded ? 'Refunded' : 'Held at Desk'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pre-Arrival & Post-Checkout Inspection Checkpoints */}
                  <div className="p-4 bg-[#fdf8f5] rounded-2xl border border-[#e4d8cf] space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#2d1217]">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#721828]" />
                        <span>Villa Readiness Checkpoints</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#e4d8cf]">
                      {/* Pre-Arrival Toggle */}
                      <button
                        onClick={() => togglePreArrivalInspection(booking.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                          booking.preArrivalInspectionDone
                            ? 'bg-[#fbf2f4] border-[#e2b3bc] text-[#721828]'
                            : 'bg-white border-[#e4d8cf] text-[#7f6b6f] hover:text-[#2d1217]'
                        }`}
                      >
                        <span className="text-[10px] font-bold">Pre-Arrival Inspection</span>
                        <CheckCircle2 className={`w-3.5 h-3.5 ${booking.preArrivalInspectionDone ? 'text-[#721828]' : 'text-[#968186]'}`} />
                      </button>

                      {/* Post-Checkout Toggle */}
                      <button
                        onClick={() => togglePostCheckoutInspection(booking.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                          booking.postCheckoutInspectionDone
                            ? 'bg-[#fbf2f4] border-[#e2b3bc] text-[#721828]'
                            : 'bg-white border-[#e4d8cf] text-[#7f6b6f] hover:text-[#2d1217]'
                        }`}
                      >
                        <span className="text-[10px] font-bold">Exit & Damage Check</span>
                        <CheckCircle2 className={`w-3.5 h-3.5 ${booking.postCheckoutInspectionDone ? 'text-[#721828]' : 'text-[#968186]'}`} />
                      </button>
                    </div>
                  </div>

                </div>

                {/* Special Requests & Guest Notes */}
                {booking.specialRequests && (
                  <div className="p-3.5 bg-[#fdf8f5] rounded-2xl border border-[#e4d8cf] text-[11px] text-[#45373a]">
                    <span className="font-bold text-[#721828]">Guest Stay Notes & Preferences: </span>
                    <span className="text-[#7f6b6f]">{booking.specialRequests}</span>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
