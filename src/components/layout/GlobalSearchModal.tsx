import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  X, 
  Users, 
  CalendarCheck, 
  UserCheck, 
  CheckSquare, 
  AlertTriangle, 
  Package, 
  Activity as ActivityIcon,
  ArrowRight,
  Sparkles,
  Command,
  CornerDownLeft
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { NavTab } from './Navbar';
import { Lead, Booking, Guest, Task, Issue, Activity, InventoryItem } from '../../types';

interface GlobalSearchModalProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export type SearchCategory = 'all' | 'leads' | 'bookings' | 'guests' | 'tasks' | 'issues' | 'inventory';

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const {
    isSearchOpen,
    closeSearch,
    searchQuery,
    setSearchQuery,
    leads,
    bookings,
    guests,
    tasks,
    issues,
    activities,
    inventoryItems
  } = useCRM();

  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isSearchOpen) {
      setSelectedIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSearchOpen]);

  // Search Results Computation
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return {
        leads: [],
        bookings: [],
        guests: [],
        tasks: [],
        issues: [],
        inventory: [],
        activities: [],
        total: 0
      };
    }

    const matchedLeads = leads.filter(l => 
      l.name.toLowerCase().includes(q) ||
      l.phone.includes(q) ||
      l.id.toLowerCase().includes(q) ||
      (l.notes && l.notes.toLowerCase().includes(q)) ||
      l.source.toLowerCase().includes(q) ||
      l.status.toLowerCase().includes(q)
    ).slice(0, 6);

    const matchedBookings = bookings.filter(b => 
      b.guestName.toLowerCase().includes(q) ||
      b.guestPhone.includes(q) ||
      b.id.toLowerCase().includes(q) ||
      b.status.toLowerCase().includes(q) ||
      b.checkInDate.includes(q) ||
      b.checkOutDate.includes(q) ||
      (b.specialRequests && b.specialRequests.toLowerCase().includes(q))
    ).slice(0, 6);

    const matchedGuests = guests.filter(g => 
      g.name.toLowerCase().includes(q) ||
      g.phone.includes(q) ||
      g.id.toLowerCase().includes(q) ||
      (g.email && g.email.toLowerCase().includes(q)) ||
      (g.city && g.city.toLowerCase().includes(q)) ||
      (g.serviceNotes && g.serviceNotes.toLowerCase().includes(q))
    ).slice(0, 6);

    const matchedTasks = tasks.filter(t => 
      t.title.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      t.category.toLowerCase().includes(q) ||
      t.priority.toLowerCase().includes(q) ||
      t.status.toLowerCase().includes(q)
    ).slice(0, 6);

    const matchedIssues = issues.filter(i => 
      i.title.toLowerCase().includes(q) ||
      (i.description && i.description.toLowerCase().includes(q)) ||
      i.propertyAreaId.toLowerCase().includes(q) ||
      i.severity.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q) ||
      i.status.toLowerCase().includes(q)
    ).slice(0, 6);

    const matchedInventory = inventoryItems.filter(item => 
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.unit.toLowerCase().includes(q)
    ).slice(0, 6);

    const total = 
      matchedLeads.length + 
      matchedBookings.length + 
      matchedGuests.length + 
      matchedTasks.length + 
      matchedIssues.length + 
      matchedInventory.length;

    return {
      leads: matchedLeads,
      bookings: matchedBookings,
      guests: matchedGuests,
      tasks: matchedTasks,
      issues: matchedIssues,
      inventory: matchedInventory,
      total
    };
  }, [searchQuery, leads, bookings, guests, tasks, issues, inventoryItems]);

  // Flattened results based on selected category tab
  const flatResults = useMemo(() => {
    const list: Array<{
      type: 'lead' | 'booking' | 'guest' | 'task' | 'issue' | 'inventory';
      tab: NavTab;
      title: string;
      subtitle: string;
      badge: string;
      badgeColor: string;
      id: string;
      data: any;
    }> = [];

    if (selectedCategory === 'all' || selectedCategory === 'leads') {
      searchResults.leads.forEach(l => {
        list.push({
          type: 'lead',
          tab: 'leads',
          title: l.name,
          subtitle: `${l.phone} • Status: ${l.status} • Source: ${l.source}`,
          badge: l.status,
          badgeColor: 'bg-amber-100 text-amber-800',
          id: l.id,
          data: l
        });
      });
    }

    if (selectedCategory === 'all' || selectedCategory === 'bookings') {
      searchResults.bookings.forEach(b => {
        list.push({
          type: 'booking',
          tab: 'bookings',
          title: `${b.guestName} (${b.id})`,
          subtitle: `${b.checkInDate} to ${b.checkOutDate} • ₹${b.totalAmount.toLocaleString('en-IN')}`,
          badge: b.status,
          badgeColor: b.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800',
          id: b.id,
          data: b
        });
      });
    }

    if (selectedCategory === 'all' || selectedCategory === 'guests') {
      searchResults.guests.forEach(g => {
        list.push({
          type: 'guest',
          tab: 'guests',
          title: g.name,
          subtitle: `${g.phone} • ${g.city || 'Lucknow'} • ${g.vipStatus ? 'VIP Guest' : 'Guest'}`,
          badge: g.vipStatus ? 'VIP' : 'Verified',
          badgeColor: g.vipStatus ? 'bg-purple-100 text-purple-800' : 'bg-stone-100 text-stone-800',
          id: g.id,
          data: g
        });
      });
    }

    if (selectedCategory === 'all' || selectedCategory === 'tasks') {
      searchResults.tasks.forEach(t => {
        list.push({
          type: 'task',
          tab: 'tasks',
          title: t.title,
          subtitle: `Priority: ${t.priority} • Category: ${t.category} • Status: ${t.status}`,
          badge: t.priority,
          badgeColor: t.priority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-stone-100 text-stone-800',
          id: t.id,
          data: t
        });
      });
    }

    if (selectedCategory === 'all' || selectedCategory === 'issues') {
      searchResults.issues.forEach(i => {
        list.push({
          type: 'issue',
          tab: 'issues',
          title: i.title,
          subtitle: `Area: ${i.propertyAreaId} • Severity: ${i.severity} • Cat: ${i.category}`,
          badge: i.status,
          badgeColor: i.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800',
          id: i.id,
          data: i
        });
      });
    }

    if (selectedCategory === 'all' || selectedCategory === 'inventory') {
      searchResults.inventory.forEach(item => {
        list.push({
          type: 'inventory',
          tab: 'inventory',
          title: item.name,
          subtitle: `Category: ${item.category} • Unit: ${item.unit} • Par Safety: ${item.safetyThreshold}`,
          badge: item.category,
          badgeColor: 'bg-stone-100 text-stone-800',
          id: item.id,
          data: item
        });
      });
    }

    return list;
  }, [searchResults, selectedCategory]);

  const handleSelectItem = (item: typeof flatResults[0]) => {
    setActiveTab(item.tab);
    setSearchQuery(item.title);
    closeSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < flatResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : flatResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatResults.length > 0) {
        handleSelectItem(flatResults[selectedIndex] || flatResults[0]);
      } else if (searchQuery.trim()) {
        if (activeTab === 'dashboard') {
          setActiveTab('leads');
        }
        closeSearch();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeSearch();
    }
  };

  const quickPicks = [
    { label: 'Arjun Sharma', query: 'Arjun' },
    { label: 'BK-01', query: 'BK-01' },
    { label: 'Pooja Mehta', query: 'Pooja' },
    { label: 'Pool Cleaning', query: 'Pool' },
    { label: 'VIP Guests', query: 'VIP' },
    { label: 'Linen', query: 'Linen' },
    { label: 'Toiletries', query: 'Toiletries' },
    { label: 'Chef Service', query: 'Chef' }
  ];

  if (!isSearchOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeSearch();
        }
      }}
    >
      <div 
        ref={modalRef}
        className="w-full max-w-3xl my-4 sm:my-8 md:my-12 bg-white rounded-2xl shadow-2xl border border-[#e4d8cf] overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-150"
      >
        {/* Top Search Input Bar */}
        <div className="p-3 sm:p-4 bg-[#fdfaf8] border-b border-[#e4d8cf] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#f7efe9] border border-[#e4d8cf] flex items-center justify-center text-[#721828] shrink-0">
            <Search className="w-5 h-5" />
          </div>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search leads, guests, bookings, tasks, issues, inventory... (Type to search)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-[#2d1217] text-sm sm:text-base font-medium placeholder-[#968186] focus:outline-none"
            />
          </div>

          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                inputRef.current?.focus();
              }}
              className="p-1.5 rounded-lg text-[#968186] hover:text-[#2d1217] hover:bg-[#f2e7df] transition-colors cursor-pointer"
              title="Clear search text"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={closeSearch}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#7f6b6f] hover:text-[#2d1217] bg-[#f7efe9] hover:bg-[#f2e7df] border border-[#e4d8cf] rounded-lg transition-colors cursor-pointer"
            title="Close modal (Esc)"
          >
            <span>ESC</span>
          </button>
        </div>

        {/* Category Navigation Pills */}
        <div className="px-3 sm:px-4 py-2 bg-white border-b border-[#f0e4db] flex items-center gap-1.5 overflow-x-auto text-xs font-medium scrollbar-none">
          <button
            type="button"
            onClick={() => { setSelectedCategory('all'); setSelectedIndex(0); }}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#721828] text-white shadow-2xs font-semibold'
                : 'text-[#7f6b6f] hover:bg-[#f7efe9] hover:text-[#2d1217]'
            }`}
          >
            All Categories {searchResults.total > 0 && `(${searchResults.total})`}
          </button>

          <button
            type="button"
            onClick={() => { setSelectedCategory('leads'); setSelectedIndex(0); }}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'leads'
                ? 'bg-[#721828] text-white shadow-2xs font-semibold'
                : 'text-[#7f6b6f] hover:bg-[#f7efe9] hover:text-[#2d1217]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Leads ({searchResults.leads.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { setSelectedCategory('bookings'); setSelectedIndex(0); }}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'bookings'
                ? 'bg-[#721828] text-white shadow-2xs font-semibold'
                : 'text-[#7f6b6f] hover:bg-[#f7efe9] hover:text-[#2d1217]'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Bookings ({searchResults.bookings.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { setSelectedCategory('guests'); setSelectedIndex(0); }}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'guests'
                ? 'bg-[#721828] text-white shadow-2xs font-semibold'
                : 'text-[#7f6b6f] hover:bg-[#f7efe9] hover:text-[#2d1217]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Guests ({searchResults.guests.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { setSelectedCategory('tasks'); setSelectedIndex(0); }}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'tasks'
                ? 'bg-[#721828] text-white shadow-2xs font-semibold'
                : 'text-[#7f6b6f] hover:bg-[#f7efe9] hover:text-[#2d1217]'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tasks ({searchResults.tasks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { setSelectedCategory('issues'); setSelectedIndex(0); }}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'issues'
                ? 'bg-[#721828] text-white shadow-2xs font-semibold'
                : 'text-[#7f6b6f] hover:bg-[#f7efe9] hover:text-[#2d1217]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Issues ({searchResults.issues.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { setSelectedCategory('inventory'); setSelectedIndex(0); }}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'inventory'
                ? 'bg-[#721828] text-white shadow-2xs font-semibold'
                : 'text-[#7f6b6f] hover:bg-[#f7efe9] hover:text-[#2d1217]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Inventory ({searchResults.inventory.length})</span>
          </button>
        </div>

        {/* Results Body / Suggestions */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 divide-y divide-[#f7efe9] scrollbar-thin">
          {flatResults.length > 0 ? (
            <div className="space-y-1">
              {flatResults.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleSelectItem(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#fbf2f4] text-[#721828] border border-[#e2b3bc] shadow-xs'
                        : 'hover:bg-[#fdf8f5] text-[#2d1217]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-xl shrink-0 ${
                        item.type === 'lead' ? 'bg-amber-100 text-amber-800' :
                        item.type === 'booking' ? 'bg-emerald-100 text-emerald-800' :
                        item.type === 'guest' ? 'bg-purple-100 text-purple-800' :
                        item.type === 'task' ? 'bg-blue-100 text-blue-800' :
                        item.type === 'issue' ? 'bg-rose-100 text-rose-800' :
                        'bg-stone-100 text-stone-800'
                      }`}>
                        {item.type === 'lead' && <Users className="w-4 h-4" />}
                        {item.type === 'booking' && <CalendarCheck className="w-4 h-4" />}
                        {item.type === 'guest' && <UserCheck className="w-4 h-4" />}
                        {item.type === 'task' && <CheckSquare className="w-4 h-4" />}
                        {item.type === 'issue' && <AlertTriangle className="w-4 h-4" />}
                        {item.type === 'inventory' && <Package className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold truncate text-[#2d1217]">{item.title}</p>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-xs text-[#7f6b6f] truncate mt-0.5">{item.subtitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-medium text-[#968186] capitalize hidden sm:inline">{item.type}</span>
                      <ArrowRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-[#721828] translate-x-1' : 'text-[#daccc2]'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : searchQuery.trim() ? (
            <div className="p-8 text-center text-[#968186]">
              <Search className="w-10 h-10 mx-auto mb-2 text-[#daccc2]" />
              <p className="text-sm font-semibold text-[#2d1217]">No records matching &ldquo;{searchQuery}&rdquo;</p>
              <p className="text-xs text-[#7f6b6f] mt-1">Try searching by guest name, mobile number, booking reference (BK-), or villa consumable.</p>
            </div>
          ) : (
            <div className="p-4 sm:p-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#968186] mb-3">
                  <Sparkles className="w-4 h-4 text-[#c29342]" />
                  <span>Popular & Suggested Searches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickPicks.map((pick) => (
                    <button
                      key={pick.label}
                      type="button"
                      onClick={() => {
                        setSearchQuery(pick.query);
                        inputRef.current?.focus();
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#f7efe9] hover:bg-[#f2e7df] text-[#2d1217] text-xs font-medium border border-[#e4d8cf] transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                    >
                      <Search className="w-3.5 h-3.5 text-[#721828]" />
                      <span>{pick.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#968186] mb-3">Jump to CRM Sections</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('leads'); closeSearch(); }}
                    className="p-2.5 rounded-xl border border-[#e4d8cf] hover:bg-[#fbf2f4] hover:border-[#e2b3bc] text-left transition-colors flex items-center gap-2"
                  >
                    <Users className="w-4 h-4 text-amber-700" />
                    <span className="font-semibold text-[#2d1217]">All Leads</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('bookings'); closeSearch(); }}
                    className="p-2.5 rounded-xl border border-[#e4d8cf] hover:bg-[#fbf2f4] hover:border-[#e2b3bc] text-left transition-colors flex items-center gap-2"
                  >
                    <CalendarCheck className="w-4 h-4 text-emerald-700" />
                    <span className="font-semibold text-[#2d1217]">All Bookings</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('guests'); closeSearch(); }}
                    className="p-2.5 rounded-xl border border-[#e4d8cf] hover:bg-[#fbf2f4] hover:border-[#e2b3bc] text-left transition-colors flex items-center gap-2"
                  >
                    <UserCheck className="w-4 h-4 text-purple-700" />
                    <span className="font-semibold text-[#2d1217]">Guest Directory</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('tasks'); closeSearch(); }}
                    className="p-2.5 rounded-xl border border-[#e4d8cf] hover:bg-[#fbf2f4] hover:border-[#e2b3bc] text-left transition-colors flex items-center gap-2"
                  >
                    <CheckSquare className="w-4 h-4 text-blue-700" />
                    <span className="font-semibold text-[#2d1217]">Tasks & SOPs</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('issues'); closeSearch(); }}
                    className="p-2.5 rounded-xl border border-[#e4d8cf] hover:bg-[#fbf2f4] hover:border-[#e2b3bc] text-left transition-colors flex items-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-700" />
                    <span className="font-semibold text-[#2d1217]">Maintenance</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('inventory'); closeSearch(); }}
                    className="p-2.5 rounded-xl border border-[#e4d8cf] hover:bg-[#fbf2f4] hover:border-[#e2b3bc] text-left transition-colors flex items-center gap-2"
                  >
                    <Package className="w-4 h-4 text-stone-700" />
                    <span className="font-semibold text-[#2d1217]">Consumables</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="p-3 bg-[#fdfaf8] border-t border-[#e4d8cf] flex flex-wrap items-center justify-between gap-2 text-xs text-[#7f6b6f]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-[#e4d8cf] rounded text-[10px] font-mono shadow-2xs">↑↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-[#e4d8cf] rounded text-[10px] font-mono shadow-2xs">↵</kbd> select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-[#e4d8cf] rounded text-[10px] font-mono shadow-2xs">esc</kbd> close
            </span>
          </div>

          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'dashboard') setActiveTab('leads');
                closeSearch();
              }}
              className="text-[#721828] hover:underline font-semibold cursor-pointer flex items-center gap-1"
            >
              <span>Apply filter to current view</span>
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
