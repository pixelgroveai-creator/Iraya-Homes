import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Plus, 
  Wrench, 
  ShieldAlert, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  Filter, 
  Building, 
  User, 
  ArrowRight, 
  AlertCircle 
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Issue, IssueSeverity, IssueStatus, IssueCategory, PropertyAreaId } from '../../types';

export const IssuesView: React.FC = () => {
  const { issues, addIssue, updateIssue, resolveIssue, openQuickAction, searchQuery, staffList } = useCRM();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [selectedIssueForResolve, setSelectedIssueForResolve] = useState<Issue | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Filter issues
  const filteredIssues = issues.filter(issue => {
    if (statusFilter !== 'all' && issue.status !== statusFilter) return false;
    if (severityFilter !== 'all' && issue.severity !== severityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = 
        issue.title.toLowerCase().includes(q) ||
        issue.description.toLowerCase().includes(q) ||
        issue.category.toLowerCase().includes(q) ||
        issue.propertyAreaId.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssueForResolve || !resolutionNotes) return;
    resolveIssue(selectedIssueForResolve.id, resolutionNotes);
    setSelectedIssueForResolve(null);
    setResolutionNotes('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-[#e4d8cf] rounded-[28px] p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded-full bg-[#fdf0f2] text-[#961c2c] border border-[#f5ccd2]">
              Property Quality & Maintenance
            </span>
            <span className="text-[#968186] text-xs font-medium">• Categorized Villa Defect Tracking</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#2d1217] mt-1.5">
            Issue & Maintenance Tracking
          </h1>
          <p className="text-[#7f6b6f] text-xs sm:text-sm mt-0.5">
            Categorized tickets (Plumbing, Electrical, Pool, HVAC) with severity escalation for upcoming stays
          </p>
        </div>

        <button
          onClick={() => openQuickAction('issue')}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#721828] hover:bg-[#520b19] text-white font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>+ Report Maintenance Ticket</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-[#fdf8f5] border border-[#e4d8cf] p-4 rounded-2xl text-xs">
        <div className="flex items-center gap-1.5 text-[#721828] font-bold">
          <Filter className="w-3.5 h-3.5 text-[#721828]" />
          <span>Filter Tickets:</span>
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-[#f7efe9] border border-[#e4d8cf] text-[#2d1217] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#721828]"
        >
          <option value="all">All Ticket Statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Awaiting Parts">Awaiting Parts</option>
          <option value="Resolved">Resolved</option>
        </select>

        <select
          value={severityFilter}
          onChange={e => setSeverityFilter(e.target.value)}
          className="bg-[#f7efe9] border border-[#e4d8cf] text-[#2d1217] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#721828]"
        >
          <option value="all">All Severities</option>
          <option value="Urgent">🚨 Urgent</option>
          <option value="High">⚠️ High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        {(statusFilter !== 'all' || severityFilter !== 'all') && (
          <button
            onClick={() => { setStatusFilter('all'); setSeverityFilter('all'); }}
            className="text-[#721828] hover:underline text-[11px] font-bold cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Issue Ticket Cards */}
      <div className="space-y-3.5">
        {filteredIssues.length === 0 ? (
          <div className="bg-white border border-[#e4d8cf] rounded-[28px] p-12 text-center text-[#968186] text-xs shadow-xs">
            No maintenance tickets found matching selected criteria.
          </div>
        ) : (
          filteredIssues.map(issue => {
            const isResolved = issue.status === 'Resolved';
            const isUrgent = issue.severity === 'Urgent' || issue.severity === 'High';

            return (
              <div
                key={issue.id}
                className={`bg-white border rounded-2xl p-5 shadow-2xs transition-all space-y-3.5 ${
                  issue.impactsUpcomingStay && !isResolved
                    ? 'border-[#f5ccd2] bg-[#fdf0f2]'
                    : isResolved
                    ? 'border-[#e4d8cf] opacity-75'
                    : 'border-[#e4d8cf] hover:border-[#721828]'
                }`}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-[#2d1217] font-serif">{issue.title}</span>
                    <span className="text-xs text-[#968186] font-mono">#{issue.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      issue.severity === 'Urgent' ? 'bg-[#fdf0f2] text-[#961c2c] border border-[#f5ccd2] animate-pulse' :
                      issue.severity === 'High' ? 'bg-[#faf4e8] text-[#9b6f25] border border-[#eedab4]' :
                      'bg-[#f7efe9] text-[#7f6b6f] border border-[#e4d8cf]'
                    }`}>
                      {issue.severity}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#f7efe9] text-[#721828] border border-[#e4d8cf]">
                      {issue.category}
                    </span>
                    {issue.impactsUpcomingStay && !isResolved && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#961c2c] text-white flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Impacts Upcoming Stay</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={issue.status}
                      onChange={e => updateIssue(issue.id, { status: e.target.value as IssueStatus })}
                      className="bg-[#f7efe9] border border-[#e4d8cf] text-[#2d1217] text-xs font-medium rounded-xl px-3 py-1.5 focus:outline-none"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Awaiting Parts">Awaiting Parts</option>
                      <option value="Resolved">Resolved</option>
                    </select>

                    {!isResolved && (
                      <button
                        onClick={() => setSelectedIssueForResolve(issue)}
                        className="px-3.5 py-1.5 bg-[#fbf2f4] hover:bg-[#f5e3e7] text-[#721828] border border-[#e2b3bc] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      >
                        ✓ Mark Resolved
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-[#7f6b6f] leading-relaxed">{issue.description}</p>

                {/* Metadata & Attribution */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-[#e4d8cf] text-[11px] text-[#968186]">
                  <div>
                    <span className="text-[#968186]">Affected Area: </span>
                    <span className="text-[#2d1217] font-semibold">{issue.propertyAreaId}</span>
                  </div>
                  <div>
                    <span className="text-[#968186]">Assigned Vendor: </span>
                    <span className="text-[#9b6f25] font-semibold">{issue.assignedToStaffOrVendor}</span>
                  </div>
                  <div>
                    <span className="text-[#968186]">Reported: </span>
                    <span className="text-[#2d1217]">{issue.reportedAt.split('T')[0]}</span>
                  </div>
                  <div>
                    <span className="text-[#968186]">Estimated Cost: </span>
                    <span className="text-[#2d1217] font-mono font-medium">₹{issue.estimatedCost ? issue.estimatedCost.toLocaleString() : '—'}</span>
                  </div>
                </div>

                {/* Resolution Notes If Resolved */}
                {issue.resolutionNotes && (
                  <div className="p-3.5 bg-[#fbf2f4] rounded-2xl border border-[#e2b3bc] text-xs text-[#721828]">
                    <span className="font-bold">Resolution Note ({issue.resolvedAt?.split('T')[0]}): </span>
                    <span>{issue.resolutionNotes}</span>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* Resolve Issue Modal */}
      {selectedIssueForResolve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d1217]/40 backdrop-blur-xs">
          <div className="bg-white border border-[#e4d8cf] rounded-[28px] p-6 sm:p-7 w-full max-w-md space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-[#2d1217] font-serif">
              Resolve Ticket #{selectedIssueForResolve.id}
            </h3>
            <p className="text-xs text-[#7f6b6f]">
              Enter details of the repair, replacement part, or technician sign-off.
            </p>
            <textarea
              rows={3}
              required
              placeholder="e.g. Ram Lal Plumber replaced geyser washer. Pressure tested at 3.5 bar with no leaks."
              value={resolutionNotes}
              onChange={e => setResolutionNotes(e.target.value)}
              className="w-full bg-[#fdf8f5] border border-[#e4d8cf] text-[#2d1217] rounded-xl p-3 text-xs focus:border-[#721828] focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedIssueForResolve(null)}
                className="px-4 py-2 bg-[#f7efe9] hover:bg-[#eddcd5] text-[#721828] text-xs rounded-xl font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveSubmit}
                className="px-5 py-2 bg-[#721828] hover:bg-[#520b19] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
