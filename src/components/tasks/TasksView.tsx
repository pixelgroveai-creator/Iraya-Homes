import React, { useState } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  User, 
  Filter, 
  CheckCircle2, 
  Flame, 
  Layers, 
  Sparkles, 
  Trash2, 
  Tag 
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Task, TaskPriority, TaskStatus, TaskCategory } from '../../types';
import { ActiveSearchBanner } from '../common/ActiveSearchBanner';

export const TasksView: React.FC = () => {
  const { 
    tasks, 
    addTask, 
    updateTask, 
    toggleTaskStatus, 
    deleteTask, 
    staffList, 
    openQuickAction, 
    searchQuery 
  } = useCRM();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');

  const todayStr = '2026-09-01';

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    if (assigneeFilter !== 'all' && task.assignedStaffId !== assigneeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = 
        task.title.toLowerCase().includes(q) ||
        (task.description && task.description.toLowerCase().includes(q)) ||
        task.category.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const overdueCount = tasks.filter(t => t.dueDate < todayStr && t.status !== 'Done').length;
  const todayCount = tasks.filter(t => t.dueDate === todayStr && t.status !== 'Done').length;

  return (
    <div className="space-y-6">
      
      <ActiveSearchBanner currentModule="Tasks" resultCount={filteredTasks.length} />

      {/* Top Banner */}
      <div className="bg-white border border-[#e4d8cf] rounded-[28px] p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded-full bg-[#fbf2f4] text-[#721828] border border-[#e2b3bc]">
              Operational Accountability
            </span>
            <span className="text-[#968186] text-xs font-medium">• Single Owner & Defined Status</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#2d1217] mt-1.5">
            Tasks, Reminders & Overdue Alerts
          </h1>
          <p className="text-[#7f6b6f] text-xs sm:text-sm mt-0.5">
            Housekeeping turnover dispatch, heated pool maintenance schedules & guest request tracking
          </p>
        </div>

        <button
          onClick={() => openQuickAction('task')}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#721828] hover:bg-[#520b19] text-white font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Task</span>
        </button>
      </div>

      {/* KPI Overview Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div 
          onClick={() => setStatusFilter(statusFilter === 'all' ? 'To Do' : 'all')}
          className="bg-white border border-[#e4d8cf] p-4 rounded-2xl cursor-pointer hover:border-[#721828] transition-colors shadow-2xs"
        >
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#968186]">Total Active Tasks</p>
          <p className="text-2xl font-serif font-bold text-[#2d1217] mt-1">{tasks.filter(t => t.status !== 'Done').length}</p>
        </div>
        <div 
          onClick={() => { setPriorityFilter('all'); setStatusFilter('all'); }}
          className="bg-white border border-[#e4d8cf] p-4 rounded-2xl cursor-pointer hover:border-[#9b6f25] transition-colors shadow-2xs"
        >
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#9b6f25]">Due Today</p>
          <p className="text-2xl font-serif font-bold text-[#9b6f25] mt-1">{todayCount}</p>
        </div>
        <div 
          onClick={() => { setPriorityFilter('Urgent'); }}
          className="bg-white border border-[#e4d8cf] p-4 rounded-2xl cursor-pointer hover:border-[#961c2c] transition-colors shadow-2xs"
        >
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#961c2c]">Overdue Alerts</p>
          <p className="text-2xl font-serif font-bold text-[#961c2c] mt-1">{overdueCount}</p>
        </div>
        <div 
          onClick={() => setStatusFilter('Done')}
          className="bg-white border border-[#e4d8cf] p-4 rounded-2xl cursor-pointer hover:border-[#3e6f48] transition-colors shadow-2xs"
        >
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#3e6f48]">Completed</p>
          <p className="text-2xl font-serif font-bold text-[#3e6f48] mt-1">{tasks.filter(t => t.status === 'Done').length}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-[#fdf8f5] border border-[#e4d8cf] p-4 rounded-2xl text-xs">
        <div className="flex items-center gap-1.5 text-[#721828] font-bold">
          <Filter className="w-3.5 h-3.5 text-[#721828]" />
          <span>Filters:</span>
        </div>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="bg-[#f7efe9] border border-[#e4d8cf] text-[#2d1217] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#721828]"
        >
          <option value="all">All Categories</option>
          <option value="Housekeeping">Housekeeping</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Front Desk">Front Desk</option>
          <option value="Guest Request">Guest Request</option>
          <option value="Inspection">Inspection Checklist</option>
          <option value="Follow-up">Lead Follow-up</option>
        </select>

        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          className="bg-[#f7efe9] border border-[#e4d8cf] text-[#2d1217] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#721828]"
        >
          <option value="all">All Priorities</option>
          <option value="Urgent">🚨 Urgent</option>
          <option value="High">⚠️ High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-[#f7efe9] border border-[#e4d8cf] text-[#2d1217] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#721828]"
        >
          <option value="all">All Statuses</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Blocked">Blocked</option>
          <option value="Done">Done</option>
        </select>

        <select
          value={assigneeFilter}
          onChange={e => setAssigneeFilter(e.target.value)}
          className="bg-[#f7efe9] border border-[#e4d8cf] text-[#2d1217] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#721828]"
        >
          <option value="all">All Assignees</option>
          {staffList.map(s => (
            <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
          ))}
        </select>

        {(categoryFilter !== 'all' || priorityFilter !== 'all' || statusFilter !== 'all' || assigneeFilter !== 'all') && (
          <button
            onClick={() => { setCategoryFilter('all'); setPriorityFilter('all'); setStatusFilter('all'); setAssigneeFilter('all'); }}
            className="text-[#721828] hover:underline text-[11px] font-bold cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white border border-[#e4d8cf] rounded-[28px] p-12 text-center text-[#968186] text-xs shadow-xs">
            No tasks found matching filter criteria.
          </div>
        ) : (
          filteredTasks.map(task => {
            const assignee = staffList.find(s => s.id === task.assignedStaffId);
            const isOverdue = task.dueDate < todayStr && task.status !== 'Done';
            const isDone = task.status === 'Done';

            return (
              <div
                key={task.id}
                className={`bg-white border rounded-2xl p-4.5 sm:p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs ${
                  isOverdue 
                    ? 'border-[#f5ccd2] bg-[#fdf0f2]' 
                    : isDone 
                    ? 'border-[#e4d8cf] opacity-75' 
                    : 'border-[#e4d8cf] hover:border-[#721828]'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  {/* Status Checkbox Button */}
                  <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className={`mt-1 w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                      isDone 
                        ? 'bg-[#721828] border-[#721828] text-white' 
                        : 'border-[#e4d8cf] hover:border-[#721828] bg-white'
                    }`}
                  >
                    {isDone && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`font-bold text-sm ${isDone ? 'line-through text-[#968186]' : 'text-[#2d1217]'}`}>
                        {task.title}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        task.priority === 'Urgent' ? 'bg-[#fdf0f2] text-[#961c2c] border border-[#f5ccd2]' :
                        task.priority === 'High' ? 'bg-[#faf4e8] text-[#9b6f25] border border-[#eedab4]' :
                        'bg-[#f7efe9] text-[#7f6b6f] border border-[#e4d8cf]'
                      }`}>
                        {task.priority}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#f7efe9] text-[#721828] border border-[#e4d8cf]">
                        {task.category}
                      </span>
                      {isOverdue && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#961c2c] text-white animate-pulse">
                          OVERDUE
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-[#7f6b6f] leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#968186] pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#721828]" />
                        <span>Due: <span className="text-[#2d1217] font-mono font-medium">{task.dueDate}</span></span>
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#721828]" />
                        <span>Owner: <span className="text-[#2d1217] font-medium">{assignee?.name || 'Unassigned'}</span></span>
                      </span>
                      {task.linkedAreaId && (
                        <span className="text-[#7f6b6f]">Area: {task.linkedAreaId}</span>
                      )}
                      {task.linkedBookingId && (
                        <span className="text-[#721828] font-mono font-medium">Booking: {task.linkedBookingId}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Status Controls */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <select
                    value={task.status}
                    onChange={e => updateTask(task.id, { status: e.target.value as TaskStatus })}
                    className="bg-[#f7efe9] border border-[#e4d8cf] text-[#2d1217] text-xs font-medium rounded-xl px-3 py-1.5 focus:outline-none"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Blocked">Blocked</option>
                    <option value="Done">Done</option>
                  </select>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 rounded-xl text-[#968186] hover:text-[#961c2c] hover:bg-[#fdf0f2] transition-colors cursor-pointer"
                    title="Delete Task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
