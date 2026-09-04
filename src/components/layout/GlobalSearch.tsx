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

interface GlobalSearchProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isMobileSearchOpen?: boolean;
  setIsMobileSearchOpen?: (open: boolean) => void;
}

export type SearchCategory = 'all' | 'leads' | 'bookings' | 'guests' | 'tasks' | 'issues' | 'inventory';

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  activeTab,
  setActiveTab,
  isMobileSearchOpen,
  setIsMobileSearchOpen
}) => {
  const {
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

  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcut: '/' or 'Cmd/Ctrl + K' focuses search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) && 
          document.activeElement?.tagName !== 'INPUT' && 
          document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    ).slice(0, 5);

    const matchedBookings = bookings.filter(b => 
      b.guestName.toLowerCase().includes(q) ||
      b.guestPhone.includes(q) ||
      b.id.toLowerCase().includes(q) ||
      b.status.toLowerCase().includes(q) ||
      b.checkInDate.includes(q) ||
      b.checkOutDate.includes(q) ||
      (b.specialRequests && b.specialRequests.toLowerCase().includes(q))
    ).slice(0, 5);

    const matchedGuests = guests.filter(g => 
      g.name.toLowerCase().includes(q) ||
      g.phone.includes(q) ||
      g.id.toLowerCase().includes(q) ||
      (g.email && g.email.toLowerCase().includes(q)) ||
      (g.city && g.city.toLowerCase().includes(q)) ||
      (g.serviceNotes && g.serviceNotes.toLowerCase().includes(q))
    ).slice(0, 5);

    const matchedTasks = tasks.filter(t => 
      t.title.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      t.category.toLowerCase().includes(q) ||
      t.priority.toLowerCase().includes(q) ||
      t.status.toLowerCase().includes(q)
    ).slice(0, 5);

    const matchedIssues = issues.filter(i => 
      i.title.toLowerCase().includes(q) ||
      (i.description && i.description.toLowerCase().includes(q)) ||
      i.propertyAreaId.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q) ||
      i.severity.toLowerCase().includes(q) ||
      i.status.toLowerCase().includes(q)
    ).slice(0, 5);

    const matchedInventory = inventoryItems.filter(item => 
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.unit.toLowerCase().includes(q)
    ).slice(0, 5);

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

  // Flattened list for keyboard navigation
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
          subtitle: `${l.phone} • ${l.source} • Intake: ${l.createdAt}`,
          badge: l.status,
          badgeColor: l.status === 'WON' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800',
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
          title: b.guestName,
          subtitle: `Stay: ${b.checkInDate} to ${b.checkOutDate} • ₹${(b.totalAmount || 0).toLocaleString()} • ID: ${b.id}`,
          badge: b.status,
          badgeColor: b.status === 'Checked-in' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800',
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
          subtitle: `${g.phone} • ${g.city || 'Private Guest'} • LTV: ₹${g.lifetimeValue.toLocaleString()}`,
          badge: g.vipStatus ? 'VIP Guest' : `${g.totalStays} Stays`,
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
          subtitle: `Category: ${t.category} • Due: ${t.dueDate} • Priority: ${t.priority}`,
          badge: t.status,
          badgeColor: t.status === 'Done' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800',
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
          subtitle: `Area: ${i.propertyAreaId} • Priority: ${i.severity} • Cat: ${i.category}`,
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
    setIsOpen(false);
    if (setIsMobileSearchOpen) setIsMobileSearchOpen(false);
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
        // If user typed something and pressed enter with no selected item, navigate to leads or bookings
        if (activeTab === 'dashboard') {
          setActiveTab('leads');
        }
        setIsOpen(false);
        if (setIsMobileSearchOpen) setIsMobileSearchOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      if (setIsMobileSearchOpen) setIsMobileSearchOpen(false);
      inputRef.current?.blur();
    }
  };

  const quickPicks = [
    { label: 'Arjun Sharma', query: 'Arjun' },
    { label: 'BK-01', query: 'BK-01' },
    { label: 'Pooja Mehta', query: 'Pooja' },
    { label: 'Pool Cleaning', query: 'Pool' },
    { label: 'VIP Guests', query: 'VIP' },
    { label: 'Chef Service', query: 'Chef' }
  ];

  return (
    <div ref={containerRef} className="relative w-full max-w-sm sm:max-w-md">
      {/* Search Input Container */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#968186] pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search leads, guests, bookings, tasks... (Press / or ⌘K)"
          value={searchQuery}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          className="w-full bg-[#fdf8f5] hover:bg-white focus:bg-white text-[#2d1217] text-xs rounded-full pl-9.5 pr-16 py-2 border border-[#e4d8cf] focus:outline-none focus:border-[#721828] focus:ring-2 focus:ring-[#721828]/15 placeholder-[#968186] transition-all shadow-2xs"
        />

        {/* Action icons inside input */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {searchQuery ? (
            <button 
              type="button"
              onClick={() => {
                setSearchQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-full text-[#968186] hover:text-[#2d1217] hover:bg-[#f2e7df] transition-colors cursor-pointer"
              title="Clear search query"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-[#968186] bg-[#f0e4db] border border-[#e4d8cf] rounded">
              <span>/</span>
            </kbd>
          )}
        </div>
      </div>

      {/* Live Omnisearch Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-[#e4d8cf] shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150 max-h-[80vh] flex flex-col">
          
          {/* Header Category Pills */}
          <div className="p-2.5 bg-[#fdfaf8] border-b border-[#e4d8cf] flex items-center gap-1.5 overflow-x-auto text-[11px] font-medium scrollbar-none">
            <button
              onClick={() => { setSelectedCategory('all'); setSelectedIndex(0); }}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#721828] text-white shadow-2xs font-semibold'
                  : 'text-[#7f6b6f] hover:bg-[#f2e7df] hover:text-[#2d1217]'
              }`}
            >
              All {searchResults.total > 0 && `(${searchResults.total})`}
            </button>
            <button
              onClick={() => { setSelectedCategory('leads'); setSelectedIndex(0); }}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                selectedCategory === 'leads'
                  ? 'bg-[#721828] text-white shadow-2xs font-semibold'
                  : 'text-[#7f6b6f] hover:bg-[#f2e7df] hover:text-[#2d1217]'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>Leads ({searchResults.leads.length})</span>
            </button>
            <button
              onClick={() => { setSelectedCategory('bookings'); setSelectedIndex(0); }}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                selectedCategory === 'bookings'
                  ? 'bg-[#721828] text-white shadow-2xs font-semibold'
                  : 'text-[#7f6b6f] hover:bg-[#f2e7df] hover:text-[#2d1217]'
              }`}
            >
              <CalendarCheck className="w-3 h-3" />
              <span>Bookings ({searchResults.bookings.length})</span>
            </button>
            <button
              onClick={() => { setSelectedCategory('guests'); setSelectedIndex(0); }}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                selectedCategory === 'guests'
                  ? 'bg-[#721828] text-white shadow-2xs font-semibold'
                  : 'text-[#7f6b6f] hover:bg-[#f2e7df] hover:text-[#2d1217]'
              }`}
            >
              <UserCheck className="w-3 h-3" />
              <span>Guests ({searchResults.guests.length})</span>
            </button>
            <button
              onClick={() => { setSelectedCategory('tasks'); setSelectedIndex(0); }}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                selectedCategory === 'tasks'
                  ? 'bg-[#721828] text-white shadow-2xs font-semibold'
                  : 'text-[#7f6b6f] hover:bg-[#f2e7df] hover:text-[#2d1217]'
              }`}
            >
              <CheckSquare className="w-3 h-3" />
              <span>Tasks ({searchResults.tasks.length})</span>
            </button>
            <button
              onClick={() => { setSelectedCategory('issues'); setSelectedIndex(0); }}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                selectedCategory === 'issues'
                  ? 'bg-[#721828] text-white shadow-2xs font-semibold'
                  : 'text-[#7f6b6f] hover:bg-[#f2e7df] hover:text-[#2d1217]'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Issues ({searchResults.issues.length})</span>
            </button>
            <button
              onClick={() => { setSelectedCategory('inventory'); setSelectedIndex(0); }}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                selectedCategory === 'inventory'
                  ? 'bg-[#721828] text-white shadow-2xs font-semibold'
                  : 'text-[#7f6b6f] hover:bg-[#f2e7df] hover:text-[#2d1217]'
              }`}
            >
              <Package className="w-3 h-3" />
              <span>Inventory ({searchResults.inventory.length})</span>
            </button>
          </div>

          {/* Results List or Empty State */}
          <div className="overflow-y-auto max-h-96 p-2 divide-y divide-[#f2e7df]">
            {flatResults.length > 0 ? (
              flatResults.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const IconComponent = 
                  item.type === 'lead' ? Users :
                  item.type === 'booking' ? CalendarCheck :
                  item.type === 'guest' ? UserCheck :
                  item.type === 'task' ? CheckSquare :
                  item.type === 'issue' ? AlertTriangle : Package;

                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectItem(item);
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#fbf2f4] border border-[#e2b3bc]'
                        : 'hover:bg-[#fdfaf8] border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        item.type === 'lead' ? 'bg-[#721828]/10 text-[#721828]' :
                        item.type === 'booking' ? 'bg-blue-50 text-blue-700' :
                        item.type === 'guest' ? 'bg-purple-50 text-purple-700' :
                        item.type === 'task' ? 'bg-amber-50 text-amber-700' :
                        item.type === 'issue' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-serif font-bold text-[#2d1217] truncate">
                            {item.title}
                          </span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-semibold ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#7f6b6f] truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 text-[#968186]">
                      <span className="text-[10px] uppercase font-bold text-[#721828] bg-[#fdf2f4] px-2 py-0.5 rounded-lg border border-[#e4d8cf]">
                        Jump to {item.tab}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#721828]" />
                    </div>
                  </div>
                );
              })
            ) : searchQuery.trim() ? (
              <div className="p-8 text-center text-[#968186]">
                <Search className="w-8 h-8 mx-auto mb-2 text-[#daccc2]" />
                <p className="text-xs font-semibold text-[#2d1217]">No records matching &ldquo;{searchQuery}&rdquo;</p>
                <p className="text-[11px] text-[#7f6b6f] mt-1">Try searching by guest name, phone number, booking code, or villa area.</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#968186]">
                  <Sparkles className="w-3.5 h-3.5 text-[#c29342]" />
                  <span>Popular & Suggested Quick Searches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickPicks.map((pick) => (
                    <button
                      key={pick.label}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearchQuery(pick.query);
                        setSelectedIndex(0);
                        inputRef.current?.focus();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#f7efe9] hover:bg-[#f2e7df] text-[#2d1217] text-xs font-medium border border-[#e4d8cf] transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Search className="w-3 h-3 text-[#721828]" />
                      <span>{pick.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Quick Navigation Bar */}
          <div className="p-2.5 bg-[#fdfaf8] border-t border-[#e4d8cf] flex items-center justify-between text-[11px] text-[#7f6b6f]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-[#e4d8cf] rounded text-[10px] font-mono">↑↓</kbd> to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-[#e4d8cf] rounded text-[10px] font-mono">↵</kbd> to select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-[#e4d8cf] rounded text-[10px] font-mono">esc</kbd> to close
              </span>
            </div>

            {searchQuery && (
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (activeTab === 'dashboard') setActiveTab('leads');
                  setIsOpen(false);
                }}
                className="text-[#721828] hover:underline font-semibold cursor-pointer flex items-center gap-1"
              >
                <span>Filter current view</span>
                <CornerDownLeft className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
