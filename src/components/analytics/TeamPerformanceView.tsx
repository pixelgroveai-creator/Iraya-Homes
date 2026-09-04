import React, { useState, useMemo } from 'react';
import { 
  Users, 
  CheckSquare, 
  Activity as ActivityIcon, 
  TrendingUp, 
  Award, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  MessageSquare, 
  DollarSign, 
  Sparkles, 
  Waves, 
  BedDouble, 
  FileText, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  ArrowUpRight, 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  PhoneCall, 
  X,
  PieChart as PieIcon,
  BarChart2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { useCRM } from '../../context/CRMContext';
import { StaffUser, UserRole, ActivityType, TaskStatus, TaskPriority, TaskCategory } from '../../types';

export const TeamPerformanceView: React.FC = () => {
  const { 
    staffList, 
    tasks, 
    activities, 
    leads, 
    bookings, 
    toggleTaskStatus, 
    logActivity, 
    addStaff, 
    openQuickAction 
  } = useCRM();

  // Selected staff for deep dive (defaults to first staff, typically Kunal Singh)
  const [selectedStaffId, setSelectedStaffId] = useState<string>(() => staffList[0]?.id || 'STF-01');
  const [dossierTab, setDossierTab] = useState<'tasks' | 'activities' | 'breakdown'>('tasks');
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>('ALL');
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('ALL');
  const [activitySearch, setActivitySearch] = useState<string>('');
  
  // Add Staff Modal State
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<UserRole>('Front Desk / Host');
  const [newStaffDepartment, setNewStaffDepartment] = useState('Guest Services');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffPin, setNewStaffPin] = useState('1234');

  // Quick Activity Log inline modal for selected staff
  const [isLogActivityOpen, setIsLogActivityOpen] = useState(false);
  const [quickActivityType, setQuickActivityType] = useState<ActivityType>('Note');
  const [quickActivityTitle, setQuickActivityTitle] = useState('');
  const [quickActivityDesc, setQuickActivityDesc] = useState('');
  const [quickActivityOutcome, setQuickActivityOutcome] = useState('');

  const todayStr = '2026-09-01';

  // Ensure selectedStaffId is valid
  const currentSelectedStaff = useMemo(() => {
    return staffList.find(s => s.id === selectedStaffId) || staffList[0];
  }, [staffList, selectedStaffId]);

  // Compute metrics per staff
  const staffPerformanceData = useMemo(() => {
    return staffList.map(staff => {
      const assignedTasks = tasks.filter(t => t.assignedStaffId === staff.id);
      const completedTasks = assignedTasks.filter(t => t.status === 'Done');
      const inProgressTasks = assignedTasks.filter(t => t.status === 'In Progress' || t.status === 'To Do');
      const overdueTasks = assignedTasks.filter(t => t.dueDate < todayStr && t.status !== 'Done');
      
      const staffActivities = activities.filter(a => a.staffId === staff.id || a.staffName.toLowerCase() === staff.name.toLowerCase());
      
      const assignedLeads = leads.filter(l => l.assignedStaffId === staff.id);
      const hostedBookings = bookings.filter(b => b.assignedHostId === staff.id);

      const completionRate = assignedTasks.length > 0 
        ? Math.round((completedTasks.length / assignedTasks.length) * 100) 
        : 100;

      return {
        staff,
        totalTasks: assignedTasks.length,
        completedTasks: completedTasks.length,
        inProgressTasks: inProgressTasks.length,
        overdueTasks: overdueTasks.length,
        completionRate,
        totalActivities: staffActivities.length,
        assignedLeadsCount: assignedLeads.length,
        hostedBookingsCount: hostedBookings.length,
        activitiesList: staffActivities,
        tasksList: assignedTasks
      };
    });
  }, [staffList, tasks, activities, leads, bookings]);

  // Selected Staff Metrics
  const selectedStats = useMemo(() => {
    return staffPerformanceData.find(s => s.staff.id === currentSelectedStaff?.id) || staffPerformanceData[0];
  }, [staffPerformanceData, currentSelectedStaff]);

  // Overall Team Metrics
  const overallTeamMetrics = useMemo(() => {
    const totalTeamTasks = tasks.length;
    const totalTeamCompleted = tasks.filter(t => t.status === 'Done').length;
    const totalTeamOverdue = tasks.filter(t => t.dueDate < todayStr && t.status !== 'Done').length;
    const teamCompletionRate = totalTeamTasks > 0 ? Math.round((totalTeamCompleted / totalTeamTasks) * 100) : 100;

    return {
      totalStaff: staffList.length,
      totalTeamTasks,
      totalTeamCompleted,
      totalTeamOverdue,
      teamCompletionRate,
      totalTeamActivities: activities.length
    };
  }, [staffList, tasks, activities]);

  // Task Category distribution for selected staff
  const staffCategoryData = useMemo(() => {
    if (!selectedStats) return [];
    const catCounts: Record<string, number> = {};
    selectedStats.tasksList.forEach(t => {
      catCounts[t.category] = (catCounts[t.category] || 0) + 1;
    });
    const colors = ['#721828', '#9b6f25', '#3e6f48', '#968186', '#961c2c', '#4a1520'];
    return Object.keys(catCounts).map((cat, idx) => ({
      name: cat,
      count: catCounts[cat],
      color: colors[idx % colors.length]
    }));
  }, [selectedStats]);

  // Activity Type distribution for selected staff
  const staffActivityTypeData = useMemo(() => {
    if (!selectedStats) return [];
    const typeCounts: Record<string, number> = {};
    selectedStats.activitiesList.forEach(a => {
      typeCounts[a.type] = (typeCounts[a.type] || 0) + 1;
    });
    return Object.keys(typeCounts).map(type => ({
      name: type,
      count: typeCounts[type]
    }));
  }, [selectedStats]);

  // Filtered Activities for Selected Staff
  const filteredActivities = useMemo(() => {
    if (!selectedStats) return [];
    return selectedStats.activitiesList.filter(a => {
      const matchesType = activityTypeFilter === 'ALL' || a.type === activityTypeFilter;
      const matchesQuery = activitySearch === '' || 
        a.title.toLowerCase().includes(activitySearch.toLowerCase()) ||
        a.description.toLowerCase().includes(activitySearch.toLowerCase()) ||
        (a.outcome && a.outcome.toLowerCase().includes(activitySearch.toLowerCase()));
      return matchesType && matchesQuery;
    });
  }, [selectedStats, activityTypeFilter, activitySearch]);

  // Filtered Tasks for Selected Staff
  const filteredTasks = useMemo(() => {
    if (!selectedStats) return [];
    return selectedStats.tasksList.filter(t => {
      if (taskStatusFilter === 'ALL') return true;
      if (taskStatusFilter === 'OVERDUE') return t.dueDate < todayStr && t.status !== 'Done';
      return t.status === taskStatusFilter;
    });
  }, [selectedStats, taskStatusFilter]);

  // Comparative Chart Data
  const teamComparisonChartData = useMemo(() => {
    return staffPerformanceData.map(s => ({
      name: s.staff.name.split(' ')[0], // First name for clean axis
      fullName: s.staff.name,
      completed: s.completedTasks,
      inProgress: s.inProgressTasks,
      overdue: s.overdueTasks,
      rate: s.completionRate,
      activities: s.totalActivities
    }));
  }, [staffPerformanceData]);

  // Handle Add Staff
  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim()) return;

    const created = addStaff({
      name: newStaffName.trim(),
      role: newStaffRole,
      email: newStaffEmail.trim(),
      phone: newStaffPhone.trim() || '+91 98000 00000',
      department: newStaffDepartment.trim() || 'Operations',
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 50000)}?w=150&auto=format&fit=crop&q=80`,
      active: true,
      pin: newStaffPin.trim() || '1234'
    });

    setSelectedStaffId(created.id);
    setIsAddStaffOpen(false);
    setNewStaffName('');
    setNewStaffEmail('');
    setNewStaffPhone('');
  };

  // Handle Quick Inline Activity Log
  const handleLogActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickActivityTitle.trim()) return;

    logActivity({
      type: quickActivityType,
      title: quickActivityTitle.trim(),
      description: quickActivityDesc.trim() || `Operational activity logged for ${currentSelectedStaff.name}`,
      outcome: quickActivityOutcome.trim() || 'Completed'
    }, currentSelectedStaff.id);

    setIsLogActivityOpen(false);
    setQuickActivityTitle('');
    setQuickActivityDesc('');
    setQuickActivityOutcome('');
  };

  // Icon helper for Activity Types
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'Call': return <Phone className="w-3.5 h-3.5 text-[#721828]" />;
      case 'WhatsApp': return <MessageSquare className="w-3.5 h-3.5 text-[#3e6f48]" />;
      case 'Pool Check': return <Waves className="w-3.5 h-3.5 text-[#721828]" />;
      case 'Room Inspection': return <BedDouble className="w-3.5 h-3.5 text-[#9b6f25]" />;
      case 'Payment': return <DollarSign className="w-3.5 h-3.5 text-[#721828]" />;
      case 'Task Completed': return <CheckCircle2 className="w-3.5 h-3.5 text-[#3e6f48]" />;
      case 'Guest Request': return <Sparkles className="w-3.5 h-3.5 text-[#9b6f25]" />;
      default: return <FileText className="w-3.5 h-3.5 text-[#968186]" />;
    }
  };

  // Badge helper for Task Priority
  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'Urgent':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fdf2f4] text-[#961c2c] border border-[#f5c6cb]">Urgent</span>;
      case 'High':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fef8eb] text-[#9b6f25] border border-[#fae0c2]">High</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fbf2f4] text-[#721828] border border-[#e2b3bc]">Medium</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#f7efe9] text-[#7f6b6f]">Low</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Overview KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-[#e4d8cf] p-5 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#968186]">Active Team Members</p>
            <Users className="w-4 h-4 text-[#721828]" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#2d1217] mt-1.5">{overallTeamMetrics.totalStaff}</p>
          <p className="text-[11px] text-[#7f6b6f] mt-1">
            Lead: <span className="font-semibold text-[#2d1217]">{staffList[0]?.name || 'Kunal Singh'}</span>
          </p>
        </div>

        <div className="bg-white border border-[#e4d8cf] p-5 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#968186]">Team Task Completion</p>
            <CheckSquare className="w-4 h-4 text-[#721828]" />
          </div>
          <div className="flex items-baseline gap-2 mt-1.5">
            <p className="text-2xl font-serif font-bold text-[#721828]">{overallTeamMetrics.teamCompletionRate}%</p>
            <span className="text-[11px] text-[#7f6b6f]">
              ({overallTeamMetrics.totalTeamCompleted}/{overallTeamMetrics.totalTeamTasks} tasks)
            </span>
          </div>
          <div className="w-full bg-[#f7efe9] h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-[#721828] h-full rounded-full transition-all duration-500" 
              style={{ width: `${overallTeamMetrics.teamCompletionRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-[#e4d8cf] p-5 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#968186]">Logged Activity Velocity</p>
            <ActivityIcon className="w-4 h-4 text-[#9b6f25]" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#9b6f25] mt-1.5">{overallTeamMetrics.totalTeamActivities}</p>
          <p className="text-[11px] text-[#7f6b6f] mt-1">Calls, checks, WhatsApp & audits</p>
        </div>

        <div className="bg-white border border-[#e4d8cf] p-5 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#968186]">Overdue Tasks</p>
            <AlertCircle className="w-4 h-4 text-[#961c2c]" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#961c2c] mt-1.5">{overallTeamMetrics.totalTeamOverdue}</p>
          <p className="text-[11px] text-[#7f6b6f] mt-1">Requires immediate attention</p>
        </div>

      </div>

      {/* Staff Roster Selector Strip & Actions */}
      <div className="bg-white border border-[#e4d8cf] rounded-[28px] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-serif font-bold text-[#2d1217] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#721828]" />
              <span>Staff Roster & Performance Highlights</span>
            </h2>
            <p className="text-xs text-[#7f6b6f] mt-0.5">
              Select a staff member below to inspect individual task execution velocity, completion rates, and real-time activity logs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddStaffOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#fbf2f4] hover:bg-[#f6e2e6] text-[#721828] border border-[#e2b3bc] font-bold text-xs transition-colors cursor-pointer"
              id="btn-add-staff"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Staff</span>
            </button>
            <button
              onClick={() => setIsLogActivityOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#721828] hover:bg-[#520b19] text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
              id="btn-quick-log-activity"
            >
              <Plus className="w-4 h-4" />
              <span>Log Activity</span>
            </button>
          </div>
        </div>

        {/* Staff Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {staffPerformanceData.map((data) => {
            const isSelected = data.staff.id === currentSelectedStaff?.id;
            return (
              <div
                key={data.staff.id}
                onClick={() => setSelectedStaffId(data.staff.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer text-left relative ${
                  isSelected 
                    ? 'bg-[#fdf8f5] border-[#721828] shadow-sm ring-1 ring-[#721828]' 
                    : 'bg-[#fdf8f5] border-[#e4d8cf] hover:border-[#c8b6a9] hover:bg-[#f7efe9]'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 bg-[#721828] text-white text-[9px] font-bold uppercase tracking-wider rounded-full">
                    Active Dossier
                  </span>
                )}

                <div className="flex items-start gap-3">
                  <div className="relative">
                    <img 
                      src={data.staff.avatar} 
                      alt={data.staff.name}
                      className="w-12 h-12 rounded-xl object-cover border border-[#e4d8cf]"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#3e6f48] border-2 border-white rounded-full" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-[#2d1217] truncate">{data.staff.name}</h3>
                    <p className="text-xs text-[#721828] font-medium truncate">{data.staff.role}</p>
                    <p className="text-[11px] text-[#968186] truncate">{data.staff.department || 'Operations'}</p>
                  </div>
                </div>

                {/* Performance Micro-Metrics */}
                <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-[#e4d8cf] text-center">
                  <div>
                    <p className="text-[9px] uppercase font-bold tracking-wider text-[#968186]">Completion</p>
                    <p className="text-xs font-bold text-[#721828] mt-0.5">{data.completionRate}%</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold tracking-wider text-[#968186]">Tasks Done</p>
                    <p className="text-xs font-bold text-[#2d1217] mt-0.5">{data.completedTasks}/{data.totalTasks}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold tracking-wider text-[#968186]">Activities</p>
                    <p className="text-xs font-bold text-[#9b6f25] mt-0.5">{data.totalActivities}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#e4d8cf] h-1 rounded-full mt-2.5 overflow-hidden">
                  <div 
                    className="bg-[#721828] h-full rounded-full transition-all"
                    style={{ width: `${data.completionRate}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Individual Staff Deep-Dive Dossier */}
      {selectedStats && (
        <div className="bg-white border border-[#e4d8cf] rounded-[28px] p-6 shadow-xs space-y-6">
          
          {/* Header of Dossier */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#e4d8cf]">
            <div className="flex items-center gap-4">
              <img 
                src={selectedStats.staff.avatar} 
                alt={selectedStats.staff.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#721828]/30 shadow-xs"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-serif font-bold text-[#2d1217]">
                    {selectedStats.staff.name}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fbf2f4] text-[#721828] border border-[#e2b3bc]">
                    {selectedStats.staff.role}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#7f6b6f] mt-1 font-medium">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#968186]" />
                    {selectedStats.staff.email}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <PhoneCall className="w-3.5 h-3.5 text-[#968186]" />
                    {selectedStats.staff.phone}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#968186]" />
                    PIN: <span className="font-mono">{selectedStats.staff.pin || '1234'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Dossier Tabs */}
            <div className="flex items-center bg-[#f7efe9] p-1 rounded-xl self-start lg:self-center">
              <button
                onClick={() => setDossierTab('tasks')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  dossierTab === 'tasks' ? 'bg-white text-[#721828] shadow-2xs' : 'text-[#7f6b6f] hover:text-[#2d1217]'
                }`}
              >
                Assigned Tasks ({selectedStats.tasksList.length})
              </button>
              <button
                onClick={() => setDossierTab('activities')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  dossierTab === 'activities' ? 'bg-white text-[#721828] shadow-2xs' : 'text-[#7f6b6f] hover:text-[#2d1217]'
                }`}
              >
                Activity Logs ({selectedStats.activitiesList.length})
              </button>
              <button
                onClick={() => setDossierTab('breakdown')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  dossierTab === 'breakdown' ? 'bg-white text-[#721828] shadow-2xs' : 'text-[#7f6b6f] hover:text-[#2d1217]'
                }`}
              >
                Performance Breakdown
              </button>
            </div>
          </div>

          {/* TAB 1: Assigned Tasks */}
          {dossierTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#2d1217]">Filter Status:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['ALL', 'To Do', 'In Progress', 'Done', 'OVERDUE'].map(st => (
                      <button
                        key={st}
                        onClick={() => setTaskStatusFilter(st)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                          taskStatusFilter === st 
                            ? 'bg-[#721828] text-white' 
                            : 'bg-[#f7efe9] text-[#7f6b6f] hover:bg-[#e4d8cf]'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => openQuickAction('task')}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#721828] hover:text-[#520b19] transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Assign New Task</span>
                </button>
              </div>

              {filteredTasks.length === 0 ? (
                <div className="bg-[#fdf8f5] border border-[#e4d8cf] rounded-2xl p-8 text-center text-[#968186] space-y-2">
                  <CheckSquare className="w-8 h-8 mx-auto text-[#968186]" />
                  <p className="text-sm font-semibold text-[#2d1217]">No tasks found for this filter</p>
                  <p className="text-xs">All tasks assigned to {selectedStats.staff.name} match or are completed.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-[#e4d8cf]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#fdf8f5] text-[#968186] uppercase text-[10px] font-bold tracking-wider border-b border-[#e4d8cf]">
                      <tr>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Task Title</th>
                        <th className="p-3.5">Category</th>
                        <th className="p-3.5">Priority</th>
                        <th className="p-3.5">Due Date</th>
                        <th className="p-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e4d8cf]">
                      {filteredTasks.map(task => {
                        const isOverdue = task.dueDate < todayStr && task.status !== 'Done';
                        const isDone = task.status === 'Done';

                        return (
                          <tr key={task.id} className="hover:bg-[#fdf8f5] transition-colors">
                            <td className="p-3.5">
                              <button
                                onClick={() => toggleTaskStatus(task.id)}
                                className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors cursor-pointer border ${
                                  isDone 
                                    ? 'bg-[#3e6f48] border-[#3e6f48] text-white' 
                                    : 'border-[#c8b6a9] hover:border-[#721828] text-transparent hover:text-[#721828]'
                                }`}
                                title={isDone ? 'Mark Incomplete' : 'Mark Complete'}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            </td>

                            <td className="p-3.5">
                              <p className={`font-semibold text-[#2d1217] ${isDone ? 'line-through text-[#968186]' : ''}`}>
                                {task.title}
                              </p>
                              {task.description && (
                                <p className="text-[11px] text-[#7f6b6f] mt-0.5">{task.description}</p>
                              )}
                            </td>

                            <td className="p-3.5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#f7efe9] text-[#721828]">
                                {task.category}
                              </span>
                            </td>

                            <td className="p-3.5">
                              {getPriorityBadge(task.priority)}
                            </td>

                            <td className="p-3.5">
                              <span className={`font-mono text-[11px] ${isOverdue ? 'text-[#961c2c] font-bold' : 'text-[#7f6b6f]'}`}>
                                {task.dueDate} {isOverdue && '(Overdue)'}
                              </span>
                            </td>

                            <td className="p-3.5 text-right">
                              <button
                                onClick={() => toggleTaskStatus(task.id)}
                                className="text-[11px] font-bold text-[#721828] hover:text-[#520b19] underline cursor-pointer"
                              >
                                {isDone ? 'Reopen' : 'Complete'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Activity Logs */}
          {dossierTab === 'activities' && (
            <div className="space-y-4">
              
              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 max-w-sm relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#968186]" />
                  <input
                    type="text"
                    placeholder="Search in logged activities..."
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    className="w-full bg-[#fdf8f5] border border-[#e4d8cf] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#2d1217] focus:outline-none focus:border-[#721828]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {['ALL', 'Call', 'WhatsApp', 'Pool Check', 'Room Inspection', 'Payment', 'Note'].map(type => (
                    <button
                      key={type}
                      onClick={() => setActivityTypeFilter(type)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                        activityTypeFilter === type 
                          ? 'bg-[#721828] text-white' 
                          : 'bg-[#f7efe9] text-[#7f6b6f] hover:bg-[#e4d8cf]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {filteredActivities.length === 0 ? (
                <div className="bg-[#fdf8f5] border border-[#e4d8cf] rounded-2xl p-8 text-center text-[#968186] space-y-2">
                  <ActivityIcon className="w-8 h-8 mx-auto text-[#968186]" />
                  <p className="text-sm font-semibold text-[#2d1217]">No activity logs found</p>
                  <p className="text-xs">No logged operational actions match your current search or type filter.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredActivities.map((act) => (
                    <div 
                      key={act.id}
                      className="p-3.5 bg-[#fdf8f5] border border-[#e4d8cf] rounded-2xl flex items-start gap-3 hover:bg-[#f7efe9] transition-colors"
                    >
                      <div className="p-2 rounded-xl bg-white border border-[#e4d8cf] shadow-2xs mt-0.5">
                        {getActivityIcon(act.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-[#2d1217]">{act.title}</h4>
                            <span className="px-2 py-0.2 rounded-full text-[9px] font-semibold bg-[#e4d8cf] text-[#721828]">
                              {act.type}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#968186] font-mono whitespace-nowrap">
                            {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(act.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        <p className="text-xs text-[#7f6b6f] mt-1">{act.description}</p>
                        
                        {act.outcome && (
                          <div className="mt-2 text-[11px] text-[#3e6f48] bg-[#fbf2f4] border border-[#e2b3bc] px-2.5 py-1 rounded-lg inline-block font-medium">
                            <span className="font-bold">Outcome:</span> {act.outcome}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Performance Breakdown Charts */}
          {dossierTab === 'breakdown' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              
              {/* Task Category Distribution */}
              <div className="bg-[#fdf8f5] border border-[#e4d8cf] rounded-2xl p-5 space-y-4">
                <h4 className="text-sm font-bold text-[#2d1217] font-serif flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-[#721828]" />
                  <span>Tasks by Category ({selectedStats.staff.name})</span>
                </h4>

                {staffCategoryData.length === 0 ? (
                  <p className="text-xs text-[#968186] text-center py-8">No task categories assigned</p>
                ) : (
                  <div className="h-56 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={staffCategoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={5}
                          dataKey="count"
                        >
                          {staffCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4d8cf', borderRadius: '12px', fontSize: '11px', color: '#2d1217' }} 
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', color: '#721828' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Activity Types Volume */}
              <div className="bg-[#fdf8f5] border border-[#e4d8cf] rounded-2xl p-5 space-y-4">
                <h4 className="text-sm font-bold text-[#2d1217] font-serif flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-[#3e6f48]" />
                  <span>Activity Frequency by Action Type</span>
                </h4>

                {staffActivityTypeData.length === 0 ? (
                  <p className="text-xs text-[#968186] text-center py-8">No activities logged yet</p>
                ) : (
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={staffActivityTypeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e4d8cf" vertical={false} />
                        <XAxis dataKey="name" stroke="#968186" fontSize={10} tickLine={false} />
                        <YAxis stroke="#968186" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4d8cf', borderRadius: '12px', fontSize: '11px', color: '#2d1217' }} 
                        />
                        <Bar dataKey="count" name="Action Count" fill="#3e6f48" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      )}

      {/* Team Comparative Analytics Bar Chart */}
      <div className="bg-white border border-[#e4d8cf] rounded-[28px] p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-[#2d1217] font-serif flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#721828]" />
          <span>Team Workload & Completion Benchmarks</span>
        </h2>
        <p className="text-xs text-[#7f6b6f]">
          Real-time comparison of completed tasks, active assignments, and logging velocity across all team profiles.
        </p>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={teamComparisonChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4d8cf" vertical={false} />
              <XAxis dataKey="name" stroke="#968186" fontSize={11} tickLine={false} />
              <YAxis stroke="#968186" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4d8cf', borderRadius: '14px', fontSize: '12px', color: '#2d1217', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }} 
              />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#721828' }} />
              <Bar dataKey="completed" name="Completed Tasks" fill="#721828" radius={[4, 4, 0, 0]} />
              <Bar dataKey="inProgress" name="Open / In Progress" fill="#9b6f25" radius={[4, 4, 0, 0]} />
              <Bar dataKey="activities" name="Logged Activities" fill="#3e6f48" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* MODAL 1: Add Staff Member */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e4d8cf] rounded-[24px] max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4d8cf]">
              <h3 className="text-lg font-serif font-bold text-[#2d1217] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#721828]" />
                <span>Add Team Member</span>
              </h3>
              <button 
                onClick={() => setIsAddStaffOpen(false)}
                className="p-1 rounded-lg hover:bg-[#f7efe9] text-[#968186] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaffSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#2d1217] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e4d8cf] bg-[#fdf8f5] focus:outline-none focus:border-[#721828]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2d1217] mb-1">Role / Designation</label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e4d8cf] bg-[#fdf8f5] focus:outline-none focus:border-[#721828]"
                >
                  <option value="Senior Social Media Manager">Senior Social Media Manager</option>
                  <option value="Admin / Owner">Admin / Owner</option>
                  <option value="Manager">Manager</option>
                  <option value="Front Desk / Host">Front Desk / Host</option>
                  <option value="Housekeeping / Ops">Housekeeping / Ops</option>
                  <option value="Read-Only / Finance">Read-Only / Finance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2d1217] mb-1">Department</label>
                <input
                  type="text"
                  placeholder="e.g. Marketing & Operations"
                  value={newStaffDepartment}
                  onChange={(e) => setNewStaffDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e4d8cf] bg-[#fdf8f5] focus:outline-none focus:border-[#721828]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2d1217] mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="staff@irayahomes.in"
                    value={newStaffEmail}
                    onChange={(e) => setNewStaffEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#e4d8cf] bg-[#fdf8f5] focus:outline-none focus:border-[#721828]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2d1217] mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 98000 00000"
                    value={newStaffPhone}
                    onChange={(e) => setNewStaffPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#e4d8cf] bg-[#fdf8f5] focus:outline-none focus:border-[#721828]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2d1217] mb-1">Access PIN (4 digits)</label>
                <input
                  type="text"
                  maxLength={4}
                  value={newStaffPin}
                  onChange={(e) => setNewStaffPin(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e4d8cf] bg-[#fdf8f5] font-mono focus:outline-none focus:border-[#721828]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e4d8cf]">
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7f6b6f] hover:bg-[#f7efe9] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#721828] hover:bg-[#520b19] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Save Team Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Quick Inline Activity Log for Selected Staff */}
      {isLogActivityOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e4d8cf] rounded-[24px] max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4d8cf]">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#2d1217]">Log Staff Activity</h3>
                <p className="text-xs text-[#7f6b6f]">Attributed to: <span className="font-semibold text-[#2d1217]">{currentSelectedStaff.name}</span></p>
              </div>
              <button 
                onClick={() => setIsLogActivityOpen(false)}
                className="p-1 rounded-lg hover:bg-[#f7efe9] text-[#968186] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogActivitySubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#2d1217] mb-1">Activity Type</label>
                <select
                  value={quickActivityType}
                  onChange={(e) => setQuickActivityType(e.target.value as ActivityType)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e4d8cf] bg-[#fdf8f5] focus:outline-none focus:border-[#721828]"
                >
                  <option value="Note">General Note</option>
                  <option value="Call">Phone Call</option>
                  <option value="WhatsApp">WhatsApp Message</option>
                  <option value="Room Inspection">Room Inspection</option>
                  <option value="Pool Check">Pool Quality Check</option>
                  <option value="Payment">Payment Follow-up</option>
                  <option value="Guest Request">Guest Request Action</option>
                  <option value="Task Completed">Task Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2d1217] mb-1">Activity Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Completed morning social media story & guest greeting"
                  value={quickActivityTitle}
                  onChange={(e) => setQuickActivityTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e4d8cf] bg-[#fdf8f5] focus:outline-none focus:border-[#721828]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2d1217] mb-1">Detailed Description</label>
                <textarea
                  rows={2}
                  placeholder="Enter details of action taken..."
                  value={quickActivityDesc}
                  onChange={(e) => setQuickActivityDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e4d8cf] bg-[#fdf8f5] focus:outline-none focus:border-[#721828]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2d1217] mb-1">Outcome / Resolution</label>
                <input
                  type="text"
                  placeholder="e.g. Verified and approved"
                  value={quickActivityOutcome}
                  onChange={(e) => setQuickActivityOutcome(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e4d8cf] bg-[#fdf8f5] focus:outline-none focus:border-[#721828]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e4d8cf]">
                <button
                  type="button"
                  onClick={() => setIsLogActivityOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7f6b6f] hover:bg-[#f7efe9] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#721828] hover:bg-[#520b19] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Save Activity Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
