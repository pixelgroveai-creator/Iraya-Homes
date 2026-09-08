import React, { useState } from 'react';
import { CRMProvider, useCRM } from './context/CRMContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { Navbar, NavTab } from './components/layout/Navbar';
import { LoginPage } from './components/auth/LoginPage';
import { DashboardView } from './components/dashboard/DashboardView';
import { LeadsView } from './components/leads/LeadsView';
import { BookingsView } from './components/bookings/BookingsView';
import { GuestsView } from './components/guests/GuestsView';
import { PropertyOpsView } from './components/property-ops/PropertyOpsView';
import { TasksView } from './components/tasks/TasksView';
import { IssuesView } from './components/issues/IssuesView';
import { ActivitiesView } from './components/activities/ActivitiesView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { InventoryView } from './components/inventory/InventoryView';
import { CommercialsView } from './components/commercials/CommercialsView';
import { SchemaView } from './components/settings/SchemaView';
import { AdminView } from './components/admin/AdminView';
import { CommercialsProvider } from './context/CommercialsContext';
import { QuickActionModal } from './components/modals/QuickActionModal';
import { MorningBriefingModal, EndOfDayModal } from './components/modals/DailySOPModals';
import { IrayaBuddyModal } from './components/chat/IrayaBuddyModal';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { ToastContainer } from './components/common/ToastContainer';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const { 
    isAuthenticated,
    isQuickActionOpen, 
    closeQuickAction, 
    isMorningBriefingOpen, 
    setIsMorningBriefingOpen, 
    isEODAuditOpen, 
    setIsEODAuditOpen,
    currentStaff
  } = useCRM();

  // If user is not authenticated, show the boutique luxury Login Page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#fdf8f5] text-[#45373a] font-sans flex flex-col selection:bg-[#721828] selection:text-white">
      
      {/* Global Navigation Header */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}
        {activeTab === 'leads' && <LeadsView />}
        {activeTab === 'bookings' && <BookingsView />}
        {activeTab === 'commercials' && <CommercialsView />}
        {activeTab === 'inventory' && <InventoryView />}
        {activeTab === 'guests' && <GuestsView />}
        {activeTab === 'property-ops' && <PropertyOpsView />}
        {activeTab === 'tasks' && <TasksView />}
        {activeTab === 'issues' && <IssuesView />}
        {activeTab === 'activities' && <ActivitiesView />}
        {(activeTab === 'analytics' || activeTab === 'reports') && <AnalyticsView />}
        {activeTab === 'settings' && <SchemaView />}
        {activeTab === 'admin' && (
          <AdminView 
            onReturnToDashboard={() => setActiveTab('dashboard')} 
            onNavigateTab={(tab) => setActiveTab(tab as any)}
          />
        )}
      </main>

      {/* Global Toast Notifications (Supabase Cloud Sync & Local Status) */}
      <ToastContainer />

      {/* Global Footer */}
      <footer className="border-t border-[#e4d8cf] bg-[#f7efe9] py-4 px-6 text-center text-xs text-[#968186]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-serif text-[#2d1217]">
            <span className="font-bold">IRAYA</span> <span className="font-normal italic">HOMES</span> — The Art of Unwinding • Gomti Nagar, Lucknow
          </p>
          <p className="text-[11px] text-[#7f6b6f] font-mono">
            Active Session: {currentStaff.name} ({currentStaff.role}) • All operations synced
          </p>
        </div>
      </footer>

      {/* Global Modals */}
      {isQuickActionOpen && <QuickActionModal />}
      <MorningBriefingModal />
      <EndOfDayModal />
      <IrayaBuddyModal />
      <GlobalSearchModal activeTab={activeTab} setActiveTab={setActiveTab} />

    </div>
  );
};

export default function App() {
  return (
    <CRMProvider>
      <AdminAuthProvider>
        <CommercialsProvider>
          <MainLayout />
        </CommercialsProvider>
      </AdminAuthProvider>
    </CRMProvider>
  );
}
