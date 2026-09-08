import React, { useState } from 'react';
import { 
  Home, 
  Users, 
  UserCheck, 
  CalendarCheck, 
  Activity as ActivityIcon, 
  CheckSquare, 
  Sparkles, 
  AlertTriangle, 
  BarChart3, 
  Settings as SettingsIcon, 
  Plus, 
  Search, 
  Sun, 
  Moon, 
  ChevronDown, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Flame,
  X,
  LogOut,
  Package,
  Bot,
  Database,
  Lock,
  Receipt
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { UserRole } from '../../types';
import { IrayaLogo } from '../common/IrayaLogo';
import { GlobalSearch } from './GlobalSearch';

export type NavTab = 
  | 'dashboard' 
  | 'leads' 
  | 'guests' 
  | 'bookings' 
  | 'commercials'
  | 'inventory'
  | 'activities' 
  | 'tasks' 
  | 'property-ops' 
  | 'issues' 
  | 'reports' 
  | 'analytics' 
  | 'settings'
  | 'admin';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

const ROLES: UserRole[] = [
  'Senior Social Media Manager',
  'Admin / Owner',
  'Manager',
  'Front Desk / Host',
  'Housekeeping / Ops',
  'Read-Only / Finance'
];

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { 
    currentUserRole, 
    currentStaff, 
    switchRole, 
    logout,
    openQuickAction, 
    setIsMorningBriefingOpen, 
    setIsEndOfDayOpen,
    toggleIrayaBuddy,
    kpis,
    searchQuery,
    setSearchQuery,
    openSearch
  } = useCRM();

  const { isAdminUnlocked } = useAdminAuth();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: NavTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'leads', label: 'Leads', icon: Users, badge: kpis.urgentFollowUpsToday > 0 ? kpis.urgentFollowUpsToday : undefined },
    { id: 'guests', label: 'Guests', icon: UserCheck },
    { id: 'bookings', label: 'Bookings', icon: CalendarCheck, badge: kpis.inHouseParties > 0 ? kpis.inHouseParties : undefined },
    { id: 'commercials', label: 'Commercials', icon: Receipt },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'activities', label: 'Activities', icon: ActivityIcon },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: kpis.overdueTasks > 0 ? kpis.overdueTasks : undefined },
    { id: 'property-ops', label: 'Property Ops', icon: Sparkles },
    { id: 'issues', label: 'Issues', icon: AlertTriangle, badge: kpis.urgentIssuesCount > 0 ? kpis.urgentIssuesCount : undefined },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'admin', label: 'Admin Panel', icon: isAdminUnlocked ? ShieldCheck : Lock },
    { id: 'settings', label: 'Database & SQL', icon: SettingsIcon }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#f7efe9] text-[#45373a] border-b border-[#e4d8cf] shadow-xs">
      {/* Top Utility & Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Property Brand Header */}
          <div 
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => setActiveTab('dashboard')}
            title="Iraya Homes — Operations Dashboard"
          >
            <IrayaLogo variant="header" size="md" theme="maroon" />
          </div>

          {/* Global Omnisearch Bar */}
          <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md mx-2 lg:mx-4">
            <GlobalSearch 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
            />
          </div>

          {/* Actions & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Mobile Search Icon Button */}
            <button
              type="button"
              onClick={() => openSearch()}
              className="md:hidden p-2 rounded-xl bg-white hover:bg-[#fbf2f4] border border-[#e4d8cf] text-[#721828] transition-colors cursor-pointer shadow-2xs"
              title="Search leads, guests, bookings... (⌘K or /)"
              aria-label="Open Omnisearch"
            >
              <Search className="w-4 h-4" />
            </button>
            {/* Morning Briefing & End of Day SOP shortcuts */}
            <div className="hidden lg:flex items-center gap-1.5 bg-[#f0e4db] p-1 rounded-xl border border-[#e4d8cf]">
              <button
                onClick={() => setIsMorningBriefingOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#721828] hover:bg-[#fbf2f4] rounded-lg transition-colors cursor-pointer"
                title="Review Morning Arrival/Departure Briefing"
              >
                <Sun className="w-3.5 h-3.5 text-[#c29342]" />
                <span>Morning Briefing</span>
              </button>
              <span className="text-[#daccc2]">|</span>
              <button
                onClick={() => setIsEndOfDayOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#7f6b6f] hover:bg-[#fbf2f4] rounded-lg transition-colors cursor-pointer"
                title="End of Day Audit & Compliance"
              >
                <Moon className="w-3.5 h-3.5 text-[#7f6b6f]" />
                <span>End of Day</span>
              </button>
            </div>

            {/* Admin Panel Quick Access Button */}
            <button
              onClick={() => setActiveTab('admin')}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer shadow-2xs ${
                activeTab === 'admin'
                  ? 'bg-[#721828] text-white border-[#721828]'
                  : 'bg-white/90 text-[#45373a] border-[#e4d8cf] hover:bg-[#fbf2f4] hover:text-[#721828]'
              }`}
              title={isAdminUnlocked ? "Admin Panel (Unlocked & Authenticated)" : "Admin Panel (Protected — Passkey Required)"}
            >
              {isAdminUnlocked ? (
                <ShieldCheck className={`w-3.5 h-3.5 ${activeTab === 'admin' ? 'text-amber-300' : 'text-emerald-600'}`} />
              ) : (
                <Lock className={`w-3.5 h-3.5 ${activeTab === 'admin' ? 'text-amber-300' : 'text-[#721828]'}`} />
              )}
              <span className="hidden lg:inline">Admin Panel</span>
              {isAdminUnlocked ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ) : (
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#f4ece7] text-[#721828] font-bold border border-[#e4d8cf]">
                  PIN
                </span>
              )}
            </button>

            {/* Live Sync Status Pill */}
            <button
              onClick={() => setActiveTab('settings')}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                useCRM().isSupabaseLive
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-white/90 text-[#7f6b6f] border-[#e4d8cf] hover:bg-white'
              }`}
              title={useCRM().isSupabaseLive ? 'Connected to Supabase Realtime' : 'Running in Local Mode - Click to connect Supabase'}
            >
              <span className={`w-2 h-2 rounded-full ${
                useCRM().isSupabaseLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
              }`} />
              <span className="hidden xl:inline">
                {useCRM().isSupabaseLive ? 'Live Sync' : 'Local Mode'}
              </span>
            </button>

            {/* Iraya Buddy AI Assistant Trigger */}
            <button
              id="navbar-btn-iraya-buddy"
              onClick={toggleIrayaBuddy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fbf2f4] hover:bg-[#f2dde1] border border-[#e2b3bc] text-[#721828] font-serif font-bold text-xs transition-all shadow-2xs active:scale-95 cursor-pointer"
              title="Open Iraya Buddy — AI Personal Assistant"
            >
              <Bot className="w-3.5 h-3.5 text-[#721828]" />
              <span className="hidden md:inline">Iraya Buddy</span>
              <Sparkles className="w-3 h-3 text-[#c29342] animate-pulse" />
            </button>

            {/* Quick Action Button in Iraya Royal Maroon */}
            <button
              onClick={() => openQuickAction('lead')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#721828] hover:bg-[#520b19] text-white font-semibold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
              id="btn-quick-action"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Quick Action</span>
            </button>

            {/* Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-white hover:bg-[#fbf2f4] border border-[#e4d8cf] rounded-xl text-xs transition-colors cursor-pointer shadow-2xs"
                id="btn-role-switcher"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden border border-[#721828]/40 shrink-0">
                  <img src={currentStaff.avatar} alt={currentStaff.name} className="w-full h-full object-cover" />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-[11px] font-semibold text-[#2d1217] leading-tight">{currentStaff.name}</p>
                  <p className="text-[10px] text-[#7f6b6f] font-medium leading-tight">{currentUserRole}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#968186]" />
              </button>

              {roleDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-white border border-[#e4d8cf] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 border-b border-[#f7efe9] mb-1">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-[#968186]">Switch Role View (RBAC)</p>
                    <p className="text-xs text-[#45373a]">Logged in as {currentStaff.name}</p>
                  </div>

                  {/* Admin Panel Direct Link */}
                  <div className="px-1 pb-1 mb-1 border-b border-[#f7efe9]">
                    <button
                      onClick={() => {
                        setActiveTab('admin');
                        setRoleDropdownOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs flex items-center justify-between bg-[#fbf5f1] hover:bg-[#f2e1d7] text-[#721828] font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Database className="w-3.5 h-3.5 text-[#721828]" />
                        <span>Backend Admin Panel</span>
                      </div>
                      <span className="text-[10px] bg-[#721828] text-white px-1.5 py-0.5 rounded-md font-mono">ALL DATA</span>
                    </button>
                  </div>
                  {ROLES.map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        switchRole(role);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#fbf2f4] transition-colors cursor-pointer ${
                        currentUserRole === role ? 'bg-[#fbf2f4] text-[#721828] font-semibold' : 'text-[#45373a]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className={`w-3.5 h-3.5 ${currentUserRole === role ? 'text-[#721828]' : 'text-[#968186]'}`} />
                        <span>{role}</span>
                      </div>
                      {currentUserRole === role && (
                        <span className="w-2 h-2 rounded-full bg-[#721828]" />
                      )}
                    </button>
                  ))}

                  <div className="pt-1.5 mt-1 border-t border-[#f7efe9] px-1">
                    <button
                      onClick={() => {
                        setRoleDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs flex items-center gap-2 text-[#961c2c] hover:bg-[#fdf0f2] rounded-xl transition-colors cursor-pointer font-semibold"
                      id="btn-logout"
                    >
                      <LogOut className="w-3.5 h-3.5 text-[#961c2c]" />
                      <span>Lock & Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="bg-[#fdf8f5] border-t border-[#e4d8cf]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-1.5 overflow-x-auto py-1.5 scrollbar-none" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-[#fbf2f4] text-[#721828] font-bold border border-[#e2b3bc] shadow-2xs' 
                      : 'text-[#7f6b6f] hover:text-[#2d1217] hover:bg-[#f7efe9] border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#721828]' : 'text-[#968186]'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                      item.id === 'issues' || item.id === 'tasks' 
                        ? 'bg-[#fdf0f2] text-[#961c2c] border border-[#f5ccd2]' 
                        : 'bg-[#fbf2f4] text-[#721828] border border-[#e2b3bc]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
