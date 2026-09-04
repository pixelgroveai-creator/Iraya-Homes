import React, { useState } from 'react';
import { 
  Sparkles, 
  BedDouble, 
  Bed, 
  Building, 
  Users, 
  Waves, 
  UtensilsCrossed, 
  Trophy, 
  Trees, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Check, 
  Clock, 
  User, 
  Plus, 
  MessageSquare 
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { AreaChecklist, PropertyAreaId } from '../../types';

export const PropertyOpsView: React.FC = () => {
  const { 
    checklists, 
    toggleChecklistItem, 
    resetAreaChecklist, 
    createIssueFromChecklistItem, 
    currentStaff 
  } = useCRM();

  const [selectedAreaId, setSelectedAreaId] = useState<PropertyAreaId>('suite-1');
  const [activeItemForIssue, setActiveItemForIssue] = useState<{ id: string; label: string } | null>(null);
  const [issueNote, setIssueNote] = useState('');

  const selectedArea = checklists.find(c => c.areaId === selectedAreaId) || checklists[0];

  const getAreaIcon = (iconName: string) => {
    switch (iconName) {
      case 'BedDouble': return <BedDouble className="w-5 h-5" />;
      case 'Bed': return <Bed className="w-5 h-5" />;
      case 'Building': return <Building className="w-5 h-5" />;
      case 'Users': return <Users className="w-5 h-5" />;
      case 'Waves': return <Waves className="w-5 h-5" />;
      case 'UtensilsCrossed': return <UtensilsCrossed className="w-5 h-5" />;
      case 'Trophy': return <Trophy className="w-5 h-5" />;
      case 'Trees': return <Trees className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const handleFailAndReport = (itemId: string, itemLabel: string) => {
    if (!issueNote) return;
    createIssueFromChecklistItem(selectedArea.areaId, itemId, itemLabel, issueNote);
    setActiveItemForIssue(null);
    setIssueNote('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-[#e4d8cf] rounded-[28px] p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded-full bg-[#fbf2f4] text-[#721828] border border-[#e2b3bc]">
              Villa Area Checklists
            </span>
            <span className="text-[#968186] text-xs font-medium">• 8 Dedicated Property Zones</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#2d1217] mt-1.5">
            Area-Specific Property Operations & Checklists
          </h1>
          <p className="text-[#7f6b6f] text-xs sm:text-sm mt-0.5">
            4 Bedroom Suites & Washrooms, Indoor Swimming Pool (pH 7.4), Kitchen, Pool Table Lounge, Terrace
          </p>
        </div>

        <button
          onClick={() => resetAreaChecklist(selectedArea.areaId)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-[#fbf2f4] text-[#721828] border border-[#e4d8cf] text-xs font-bold transition-all shadow-2xs cursor-pointer self-start sm:self-center"
          title="Reset checklist for next guest turnover"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#721828]" />
          <span>Reset Current Area Checklist</span>
        </button>
      </div>

      {/* Main Layout: Area Zone Selector + Active Inspection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Villa Zone Cards Selector (4 cols) */}
        <div className="lg:col-span-4 space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-wider text-[#968186] px-1">
            Iraya Homes Zones
          </p>

          <div className="space-y-2">
            {checklists.map(chk => {
              const isSelected = chk.areaId === selectedAreaId;
              const completedCount = chk.items.filter(i => i.completed).length;
              const hasFailed = chk.items.some(i => i.isFailed);

              return (
                <div
                  key={chk.areaId}
                  onClick={() => setSelectedAreaId(chk.areaId)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#fbf2f4] border-[#e2b3bc] shadow-2xs'
                      : hasFailed
                      ? 'bg-[#fdf0f2] border-[#f5ccd2] hover:bg-[#fae1e6]'
                      : 'bg-white hover:bg-[#fdf8f5] border-[#e4d8cf]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-[#721828] text-white' : 'bg-[#f7efe9] text-[#721828]'
                    }`}>
                      {getAreaIcon(chk.iconName)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[#2d1217] text-xs truncate">{chk.areaName}</p>
                      <p className="text-[10px] text-[#7f6b6f] truncate">{chk.areaSubtitle}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      chk.status === 'Needs Attention' ? 'bg-[#fdf0f2] text-[#961c2c] border border-[#f5ccd2]' :
                      chk.status === 'Ready' ? 'bg-[#fbf2f4] text-[#721828] border border-[#e2b3bc]' :
                      'bg-[#f7efe9] text-[#968186] border border-[#e4d8cf]'
                    }`}>
                      {chk.status}
                    </span>
                    <p className="text-[10px] text-[#968186] font-mono mt-1">
                      {completedCount}/{chk.items.length} checks
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Checklist Execution Board (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#e4d8cf] rounded-[28px] p-6 sm:p-7 shadow-xs space-y-6">
          
          {/* Header of Active Inspection */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#e4d8cf]">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#fbf2f4] text-[#721828] flex items-center justify-center border border-[#e2b3bc]">
                {getAreaIcon(selectedArea.iconName)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#2d1217] font-serif">{selectedArea.areaName}</h2>
                <p className="text-xs text-[#7f6b6f]">{selectedArea.areaSubtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                selectedArea.status === 'Needs Attention' ? 'bg-[#fdf0f2] text-[#961c2c] border border-[#f5ccd2]' :
                selectedArea.status === 'Ready' ? 'bg-[#fbf2f4] text-[#721828] border border-[#e2b3bc]' :
                'bg-[#faf4e8] text-[#9b6f25] border border-[#eedab4]'
              }`}>
                Status: {selectedArea.status}
              </span>
            </div>
          </div>

          {/* Checklist Items Interactive List */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#2d1217]">
              Inspection Items & Quality Standards
            </p>

            {selectedArea.items.map(item => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  item.isFailed
                    ? 'bg-[#fdf0f2] border-[#f5ccd2]'
                    : item.completed
                    ? 'bg-[#fbf2f4] border-[#e2b3bc]'
                    : 'bg-[#fdf8f5] border-[#e4d8cf]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {/* Check Toggle */}
                    <button
                      onClick={() => toggleChecklistItem(selectedArea.areaId, item.id)}
                      className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        item.completed && !item.isFailed
                          ? 'bg-[#721828] border-[#721828] text-white'
                          : item.isFailed
                          ? 'bg-[#961c2c] border-[#961c2c] text-white'
                          : 'border-[#e4d8cf] hover:border-[#721828] bg-white'
                      }`}
                    >
                      {item.completed && !item.isFailed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      {item.isFailed && <XCircle className="w-3.5 h-3.5" />}
                    </button>

                    <div>
                      <p className={`text-xs sm:text-sm font-semibold ${
                        item.isFailed ? 'text-[#961c2c]' : item.completed ? 'text-[#2d1217]' : 'text-[#2d1217]'
                      }`}>
                        {item.label}
                      </p>
                      {item.checkedBy && (
                        <p className="text-[11px] text-[#968186] mt-1">
                          Verified by <span className="text-[#2d1217] font-medium">{item.checkedBy}</span> at {new Date(item.checkedAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-xs text-[#9b6f25] mt-1 bg-white p-2.5 rounded-xl border border-[#e4d8cf]">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Fail Item & Log Maintenance Ticket Trigger */}
                  <button
                    onClick={() => setActiveItemForIssue({ id: item.id, label: item.label })}
                    className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#fdf0f2] hover:text-[#961c2c] text-[#968186] border border-[#e4d8cf] text-[10px] font-bold uppercase tracking-wider transition-colors shrink-0 cursor-pointer shadow-2xs"
                    title="Flag Defect & Create Maintenance Ticket"
                  >
                    Flag Issue
                  </button>
                </div>

                {/* Sub-form when flagging issue on this item */}
                {activeItemForIssue?.id === item.id && (
                  <div className="p-4 bg-white rounded-2xl border border-[#f5ccd2] space-y-3 animate-in fade-in shadow-2xs">
                    <p className="text-xs font-bold text-[#961c2c] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Log Maintenance Issue for: {item.label}</span>
                    </p>
                    <textarea
                      rows={2}
                      placeholder="Describe the defect, leakage, or broken component..."
                      value={issueNote}
                      onChange={e => setIssueNote(e.target.value)}
                      className="w-full bg-[#fdf8f5] border border-[#e4d8cf] text-[#2d1217] rounded-xl p-2.5 text-xs focus:border-[#961c2c] focus:outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => { setActiveItemForIssue(null); setIssueNote(''); }}
                        className="px-3.5 py-1.5 bg-[#f7efe9] text-[#721828] font-semibold rounded-xl text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleFailAndReport(item.id, item.label)}
                        className="px-3.5 py-1.5 bg-[#961c2c] hover:bg-[#7a1321] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-2xs"
                      >
                        Dispatch Maintenance Ticket
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer Inspection Sign-off */}
          <div className="p-4 bg-[#fdf8f5] rounded-2xl border border-[#e4d8cf] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-semibold text-[#2d1217]">
                Last Inspected: {selectedArea.lastInspectedAt ? new Date(selectedArea.lastInspectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}
              </p>
              <p className="text-[11px] text-[#968186]">Inspector: {selectedArea.lastInspectedBy || 'Sunita Devi / Housekeeping'}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  selectedArea.items.forEach(item => {
                    if (!item.completed) toggleChecklistItem(selectedArea.areaId, item.id);
                  });
                }}
                className="px-4 py-2.5 bg-[#721828] hover:bg-[#520b19] text-white font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer"
              >
                ✓ Mark All Items Ready
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
