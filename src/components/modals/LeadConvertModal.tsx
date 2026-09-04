import React, { useState } from 'react';
import { X, CheckCircle2, ArrowRight, ShieldAlert, Sparkles, User, Calendar, DollarSign } from 'lucide-react';
import { Lead } from '../../types';
import { useCRM } from '../../context/CRMContext';

interface LeadConvertModalProps {
  lead: Lead | null;
  onClose: () => void;
  onSuccess: (bookingId: string) => void;
}

export const LeadConvertModal: React.FC<LeadConvertModalProps> = ({ lead, onClose, onSuccess }) => {
  const { convertLeadToBooking, guests } = useCRM();

  if (!lead) return null;

  const defaultQuote = lead.quoteAmount || 65000;
  const [quoteAmount, setQuoteAmount] = useState(defaultQuote);
  const [advancePaid, setAdvancePaid] = useState(Math.round(defaultQuote * 0.5));
  const [securityDeposit, setSecurityDeposit] = useState(15000);

  const existingGuest = guests.find(g => g.phone.replace(/\s+/g, '') === lead.phone.replace(/\s+/g, ''));

  const handleConvert = (e: React.FormEvent) => {
    e.preventDefault();
    const result = convertLeadToBooking(lead.id, quoteAmount, advancePaid);
    onSuccess(result.booking.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-[#e2ddd6] rounded-[28px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-[#fcfaf7] px-6 py-5 border-b border-[#e2ddd6] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#f1f4e8] text-[#5a7a40] flex items-center justify-center border border-[#d8e2c8]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#3d3d2e] font-serif">Convert Lead to Confirmed Stay</h2>
              <p className="text-[11px] text-[#8c8c7a]">Lead #{lead.id} → Confirmed Booking & Unified Guest Profile</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8c8c7a] hover:text-[#3d3d2e] hover:bg-[#f1ede8] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lead Details Overview */}
        <form onSubmit={handleConvert} className="p-6 space-y-4 text-[#4a4a40] text-xs">
          
          <div className="bg-[#fcfaf7] p-4 rounded-2xl border border-[#e2ddd6] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#5a5a40]" />
                <span className="font-bold text-sm text-[#3d3d2e]">{lead.name}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#f1ede8] text-[#5a5a40] border border-[#ded8cf]">
                Source: {lead.source}
              </span>
            </div>

            <p className="text-[#7a7a6a] text-xs">{lead.phone} {lead.email ? `• ${lead.email}` : ''}</p>

            <div className="flex items-center gap-4 text-[11px] text-[#4a4a40] pt-2 border-t border-[#e8e4de]">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#8c8c7a]" />
                <span>{lead.checkInDate} to {lead.checkOutDate}</span>
              </div>
              <div>
                <span>{lead.guestCount} Guests • {lead.stayPurpose}</span>
              </div>
            </div>
          </div>

          {/* Auto-Deduplication Status */}
          {existingGuest ? (
            <div className="p-3.5 bg-[#f5f2eb] border border-[#dcd6ca] rounded-2xl text-[#5a5a40] flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#5a5a40] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs text-[#3d3d2e]">Returning Guest Profile Recognized!</p>
                <p className="text-[11px] text-[#7a7a6a] mt-0.5">
                  Matches #{existingGuest.id} ({existingGuest.totalStays} past stays, ₹{existingGuest.lifetimeValue.toLocaleString()} LTV). New booking will link automatically.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-[#f1f4e8] border border-[#d8e2c8] rounded-2xl text-[#5a7a40] flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#5a7a40] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs text-[#3d3d2e]">New Unified Guest Profile Will Be Created</p>
                <p className="text-[11px] text-[#7a7a6a] mt-0.5">
                  Primary phone ({lead.phone}) indexed for future deduplication and lifetime value tracking.
                </p>
              </div>
            </div>
          )}

          {/* Commercials Form */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[#7a7a6a] mb-1 font-semibold text-[11px]">Final Agreed Tariff (₹)</label>
              <input
                type="number"
                required
                value={quoteAmount}
                onChange={e => setQuoteAmount(parseInt(e.target.value) || 0)}
                className="w-full bg-[#f1ede8] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] font-bold focus:border-[#5a5a40] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#7a7a6a] mb-1 font-semibold text-[11px]">Advance Deposit Paid (₹)</label>
              <input
                type="number"
                required
                value={advancePaid}
                onChange={e => setAdvancePaid(parseInt(e.target.value) || 0)}
                className="w-full bg-[#f1ede8] border border-[#d8d2c8] rounded-xl px-3 py-2 text-[#3d3d2e] font-bold focus:border-[#5a5a40] focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-[#fcfaf7] p-3.5 rounded-xl border border-[#e2ddd6] flex justify-between items-center text-xs">
            <span className="text-[#7a7a6a] font-medium">Balance Due on Check-In:</span>
            <span className="font-bold text-[#3d3d2e] text-sm font-serif">
              ₹{Math.max(0, quoteAmount - advancePaid).toLocaleString()}
            </span>
          </div>

          {/* Auto-Trigger Notice */}
          <div className="p-3 bg-[#fcfaf7] rounded-xl border border-[#e8e4de] text-[11px] text-[#7a7a6a] space-y-1">
            <p className="font-bold text-[#3d3d2e]">Automated System Triggers Upon Conversion:</p>
            <p>• Generates pre-arrival 4-suites & heated pool preparation checklist task.</p>
            <p>• Generates front-desk welcome drinks & key handover dispatch task.</p>
            <p>• Lead status updated to <span className="font-bold text-[#5a7a40]">WON</span> in CRM pipeline.</p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-[#e2ddd6]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white hover:bg-[#eae6e0] border border-[#e2ddd6] text-[#5a5a40] font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#5a5a40] hover:bg-[#484832] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <span>Confirm & Convert</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
