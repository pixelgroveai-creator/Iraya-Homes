import React, { useState } from 'react';
import { 
  UserCheck, 
  Search, 
  Sparkles, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Plus, 
  Heart, 
  FileText, 
  ShieldCheck, 
  History, 
  ChevronRight,
  User,
  Coffee,
  Waves,
  SlidersHorizontal
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Guest, GuestPreference } from '../../types';

export const GuestsView: React.FC = () => {
  const { guests, bookings, updateGuest, openQuickAction, searchQuery } = useCRM();
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(guests[0] || null);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [newPrefCategory, setNewPrefCategory] = useState<GuestPreference['category']>('Dietary');
  const [newPrefNote, setNewPrefNote] = useState('');
  const [serviceNotes, setServiceNotes] = useState('');

  // Filter guests
  const filteredGuests = guests.filter(guest => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = 
        guest.name.toLowerCase().includes(q) ||
        guest.phone.includes(q) ||
        guest.id.toLowerCase().includes(q) ||
        (guest.email && guest.email.toLowerCase().includes(q)) ||
        (guest.city && guest.city.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const handleSelectGuest = (g: Guest) => {
    setSelectedGuest(g);
    setServiceNotes(g.serviceNotes);
    setIsEditingPreferences(false);
  };

  const handleAddPreference = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuest || !newPrefNote) return;
    const updatedPreferences: GuestPreference[] = [
      ...selectedGuest.preferences,
      { category: newPrefCategory, note: newPrefNote }
    ];
    updateGuest(selectedGuest.id, { preferences: updatedPreferences });
    setSelectedGuest({ ...selectedGuest, preferences: updatedPreferences });
    setNewPrefNote('');
  };

  const handleRemovePreference = (index: number) => {
    if (!selectedGuest) return;
    const updatedPreferences = selectedGuest.preferences.filter((_, i) => i !== index);
    updateGuest(selectedGuest.id, { preferences: updatedPreferences });
    setSelectedGuest({ ...selectedGuest, preferences: updatedPreferences });
  };

  const handleSaveNotes = () => {
    if (!selectedGuest) return;
    updateGuest(selectedGuest.id, { serviceNotes });
    setSelectedGuest({ ...selectedGuest, serviceNotes });
  };

  // Get past stays for selected guest
  const guestBookings = selectedGuest 
    ? bookings.filter(b => b.guestId === selectedGuest.id || selectedGuest.bookingIds.includes(b.id))
    : [];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-[#e4d8cf] rounded-[28px] p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded-full bg-[#fbf2f4] text-[#721828] border border-[#e2b3bc]">
              Unified Guest Profiles
            </span>
            <span className="text-[#968186] text-xs font-medium">• Auto-Deduplication by Phone Number</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#2d1217] mt-1.5">
            Guest Directory & Lifecycle Value (LTV)
          </h1>
          <p className="text-[#7f6b6f] text-xs sm:text-sm mt-0.5">
            Persistent stay history, VIP tags, curated preferences (dietary, heated pool, room setup) & service logs
          </p>
        </div>

        <button
          onClick={() => openQuickAction('booking')}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#721828] hover:bg-[#520b19] text-white font-bold text-xs transition-all shadow-xs cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Stay Reservation</span>
        </button>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Guest Directory List (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#e4d8cf] rounded-[28px] p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-[#2d1217] uppercase tracking-wider">
              All Guests ({filteredGuests.length})
            </h2>
            <span className="text-xs text-[#721828] font-serif font-bold">
              Total LTV: ₹{guests.reduce((sum, g) => sum + g.lifetimeValue, 0).toLocaleString()}
            </span>
          </div>

          <div className="space-y-2.5 max-h-[70vh] overflow-y-auto pr-1">
            {filteredGuests.map(guest => {
              const isSelected = selectedGuest?.id === guest.id;
              return (
                <div
                  key={guest.id}
                  onClick={() => handleSelectGuest(guest)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#fbf2f4] border-[#e2b3bc] shadow-2xs'
                      : 'bg-[#fdf8f5] hover:bg-[#f7efe9] border-[#e4d8cf]'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#2d1217] text-xs truncate">{guest.name}</span>
                      {guest.vipStatus && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#faf4e8] text-[#9b6f25] border border-[#eedab4] uppercase tracking-wider">
                          VIP
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#7f6b6f] font-mono">{guest.phone}</p>
                    <div className="flex items-center gap-2.5 text-[11px] text-[#968186]">
                      <span>{guest.totalStays} {guest.totalStays === 1 ? 'Stay' : 'Stays'}</span>
                      <span>•</span>
                      <span className="text-[#2d1217] font-serif font-bold">LTV: ₹{guest.lifetimeValue.toLocaleString()}</span>
                    </div>
                  </div>

                  <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-[#721828]' : 'text-[#968186]'}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Guest Comprehensive Profile & Stay History (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {selectedGuest ? (
            <div className="bg-white border border-[#e4d8cf] rounded-[28px] p-6 sm:p-7 shadow-xs space-y-6">
              
              {/* Profile Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#e4d8cf]">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#721828] text-white flex items-center justify-center font-serif font-bold text-xl shadow-2xs">
                    {selectedGuest.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-[#2d1217] font-serif">{selectedGuest.name}</h2>
                      {selectedGuest.vipStatus && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#faf4e8] text-[#9b6f25] border border-[#eedab4]">
                          VIP Guest
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#968186] font-mono mt-0.5">
                      ID: {selectedGuest.id} • Registered {selectedGuest.createdAt.split('T')[0]}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => openQuickAction('activity', { defaultGuestId: selectedGuest.id })}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#fbf2f4] border border-[#e4d8cf] text-[#721828] text-xs font-semibold flex items-center gap-1.5 transition-colors self-start cursor-pointer shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5 text-[#721828]" />
                  <span>Log Guest Activity</span>
                </button>
              </div>

              {/* Contact & Commercial Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-[#fdf8f5] p-3.5 rounded-2xl border border-[#e4d8cf]">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-[#968186]">Phone (Key)</p>
                  <p className="font-bold text-[#2d1217] font-mono mt-1 text-[11px]">{selectedGuest.phone}</p>
                </div>
                <div className="bg-[#fdf8f5] p-3.5 rounded-2xl border border-[#e4d8cf]">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-[#968186]">Email</p>
                  <p className="font-medium text-[#2d1217] truncate mt-1">{selectedGuest.email || 'N/A'}</p>
                </div>
                <div className="bg-[#fdf8f5] p-3.5 rounded-2xl border border-[#e4d8cf]">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-[#968186]">Total Stays</p>
                  <p className="text-base font-bold text-[#3e6f48] mt-1">{selectedGuest.totalStays}</p>
                </div>
                <div className="bg-[#fdf8f5] p-3.5 rounded-2xl border border-[#e4d8cf]">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-[#968186]">Lifetime Value</p>
                  <p className="text-base font-bold text-[#2d1217] font-serif mt-1">₹{selectedGuest.lifetimeValue.toLocaleString()}</p>
                </div>
              </div>

              {/* Stored Guest Preferences */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#2d1217] flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-[#9b6f25]" />
                    <span>Personalized Guest Preferences & Habits</span>
                  </h3>
                </div>

                <div className="space-y-2">
                  {selectedGuest.preferences.map((pref, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-[#fdf8f5] rounded-2xl border border-[#e4d8cf] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          pref.category === 'Dietary' ? 'bg-[#fbf2f4] text-[#721828] border border-[#e2b3bc]' :
                          pref.category === 'Pool & Recreation' ? 'bg-[#f7efe9] text-[#721828] border border-[#e4d8cf]' :
                          'bg-[#faf4e8] text-[#9b6f25] border border-[#eedab4]'
                        }`}>
                          {pref.category}
                        </span>
                        <span className="text-[#2d1217] font-medium">{pref.note}</span>
                      </div>
                      <button
                        onClick={() => handleRemovePreference(idx)}
                        className="text-[#968186] hover:text-[#961c2c] text-xs px-2 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Preference Input */}
                <form onSubmit={handleAddPreference} className="flex gap-2 pt-1">
                  <select
                    value={newPrefCategory}
                    onChange={e => setNewPrefCategory(e.target.value as any)}
                    className="bg-[#f7efe9] border border-[#e4d8cf] text-[#2d1217] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#721828]"
                  >
                    <option value="Dietary">Dietary</option>
                    <option value="Room Setup">Room Setup</option>
                    <option value="Pool & Recreation">Pool & Recreation</option>
                    <option value="Timing">Timing</option>
                    <option value="Other">Other</option>
                  </select>
                  <input
                    type="text"
                    placeholder="e.g. Heated pool morning 7AM, Almond milk breakfast..."
                    value={newPrefNote}
                    onChange={e => setNewPrefNote(e.target.value)}
                    className="flex-1 bg-[#f7efe9] border border-[#e4d8cf] text-[#2d1217] rounded-xl px-3 py-2 text-xs focus:border-[#721828] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#721828] hover:bg-[#520b19] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-2xs"
                  >
                    + Add
                  </button>
                </form>
              </div>

              {/* Service & Operational Notes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#2d1217] flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#721828]" />
                    <span>Host & Operational Service Notes</span>
                  </h3>
                  <button
                    onClick={handleSaveNotes}
                    className="text-xs text-[#721828] hover:underline font-bold"
                  >
                    Save Notes
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={serviceNotes}
                  onChange={e => setServiceNotes(e.target.value)}
                  placeholder="Special host notes, VIP treatment instructions, past feedback..."
                  className="w-full bg-[#f7efe9] border border-[#e4d8cf] text-[#2d1217] rounded-2xl p-3 text-xs focus:border-[#721828] focus:outline-none"
                />
              </div>

              {/* Historic Stays Breakdown */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#2d1217] flex items-center gap-1.5">
                  <History className="w-4 h-4 text-[#721828]" />
                  <span>Stay History ({guestBookings.length})</span>
                </h3>

                <div className="space-y-2">
                  {guestBookings.map(b => (
                    <div
                      key={b.id}
                      className="p-3.5 bg-[#fdf8f5] rounded-2xl border border-[#e4d8cf] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#2d1217] font-mono">{b.id}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            b.status === 'Checked-in' ? 'bg-[#fbf2f4] text-[#721828] border border-[#e2b3bc]' :
                            b.status === 'Confirmed' ? 'bg-[#fbf2f4] text-[#721828] border border-[#e2b3bc]' :
                            'bg-[#f7efe9] text-[#968186] border border-[#e4d8cf]'
                          }`}>
                            {b.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#7f6b6f] mt-0.5">
                          {b.checkInDate} to {b.checkOutDate} • {b.guestCount} Guests ({b.stayPurpose})
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#2d1217] font-serif">₹{b.totalQuote.toLocaleString()}</p>
                        <p className="text-[10px] text-[#968186]">
                          {b.balanceDue > 0 ? `₹${b.balanceDue.toLocaleString()} Due` : 'Fully Paid'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-[#e4d8cf] rounded-[28px] p-12 text-center text-[#968186] shadow-xs">
              Select a guest profile to view preferences and stay history.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
