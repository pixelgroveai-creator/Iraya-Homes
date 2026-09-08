import React, { useState } from 'react';
import { 
  X, 
  Tag, 
  Plus, 
  Trash2, 
  Lock, 
  Check, 
  AlertCircle, 
  Layers,
  Sparkles
} from 'lucide-react';
import { useCommercials } from '../../context/CommercialsContext';

export const ManageCategoriesModal: React.FC = () => {
  const { 
    isCategoriesModalOpen, 
    setIsCategoriesModalOpen, 
    categories, 
    addCustomCategory, 
    deleteCustomCategory 
  } = useCommercials();

  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [selectedColor, setSelectedColor] = useState('#059669');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isCategoriesModalOpen) return null;

  const colorPalette = [
    '#721828', // Royal Maroon
    '#c29342', // Warm Gold
    '#2d5a43', // Forest Emerald
    '#0284c7', // Sky Cyan
    '#7c3aed', // Purple
    '#d97706', // Amber
    '#059669', // Mint Green
    '#db2777', // Rose Pink
    '#64748b'  // Cool Slate
  ];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newCatName.trim()) {
      setError('Category name is required.');
      return;
    }

    setIsSubmitting(true);
    const success = await addCustomCategory(newCatName.trim(), newCatDesc.trim(), selectedColor);
    setIsSubmitting(false);

    if (success) {
      setNewCatName('');
      setNewCatDesc('');
    }
  };

  const predefinedList = categories.filter(c => c.isPredefined);
  const customList = categories.filter(c => !c.isPredefined);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white border border-[#e4d8cf] rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-categories-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#fbf5f1] border-b border-[#e4d8cf]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#f2dde1] text-[#721828] border border-[#e2b3bc]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 id="modal-categories-title" className="font-serif font-bold text-base text-[#2d1217]">
                Manage Expense Categories
              </h3>
              <p className="text-[11px] text-[#7f6b6f]">
                Predefined commercial classification & scalable custom tags
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCategoriesModalOpen(false)}
            className="p-1.5 rounded-xl hover:bg-[#f7efe9] text-[#968186] hover:text-[#45373a] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#fdf0f2] border border-[#f5ccd2] text-[#961c2c] text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Add New Custom Category Form */}
          <form onSubmit={handleCreate} className="p-4 bg-[#fdf8f5] rounded-2xl border border-[#e4d8cf] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#721828] uppercase tracking-wider">
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Category</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#45373a] mb-1">
                  Category Name <span className="text-[#961c2c]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Guest Event Props, Pool Salts..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#e4d8cf] focus:border-[#721828] focus:ring-1 focus:ring-[#721828] rounded-xl text-xs text-[#2d1217] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#45373a] mb-1">
                  Tag Color
                </label>
                <div className="flex items-center gap-1.5 py-1">
                  {colorPalette.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setSelectedColor(col)}
                      className={`w-6 h-6 rounded-full border transition-transform cursor-pointer flex items-center justify-center ${
                        selectedColor === col ? 'scale-110 ring-2 ring-[#721828] ring-offset-1' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: col, borderColor: 'rgba(0,0,0,0.1)' }}
                      title={col}
                    >
                      {selectedColor === col && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#45373a] mb-1">
                Description / Purpose
              </label>
              <input
                type="text"
                placeholder="Optional notes regarding what expenses belong to this category..."
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#e4d8cf] focus:border-[#721828] focus:ring-1 focus:ring-[#721828] rounded-xl text-xs text-[#2d1217] outline-none"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#721828] hover:bg-[#520b19] disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-2xs transition-all active:scale-98 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Category</span>
              </button>
            </div>
          </form>

          {/* Predefined Categories Section */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7f6b6f]">
                Predefined Standard Categories ({predefinedList.length})
              </span>
              <span className="text-[11px] text-[#968186] flex items-center gap-1">
                <Lock className="w-3 h-3" /> System Locked
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {predefinedList.map((cat) => (
                <div 
                  key={cat.id}
                  className="p-3 bg-white rounded-xl border border-[#e4d8cf] flex items-start justify-between gap-2 shadow-2xs"
                >
                  <div className="flex items-start gap-2.5">
                    <span 
                      className="w-3 h-3 rounded-full mt-1 shrink-0" 
                      style={{ backgroundColor: cat.color || '#721828' }} 
                    />
                    <div>
                      <p className="text-xs font-semibold text-[#2d1217]">{cat.name}</p>
                      {cat.description && (
                        <p className="text-[10px] text-[#7f6b6f] line-clamp-2 leading-relaxed">{cat.description}</p>
                      )}
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#f7efe9] text-[#7f6b6f] rounded-md shrink-0">
                    Predefined
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Categories Section */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7f6b6f]">
                Custom Categories ({customList.length})
              </span>
              <span className="text-[11px] text-[#968186]">Editable by Admin</span>
            </div>
            {customList.length === 0 ? (
              <div className="p-6 text-center bg-[#fdf8f5] rounded-xl border border-dashed border-[#e4d8cf] text-xs text-[#968186]">
                No custom categories added yet. You can create custom categories using the form above.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {customList.map((cat) => (
                  <div 
                    key={cat.id}
                    className="p-3 bg-white rounded-xl border border-[#e4d8cf] flex items-start justify-between gap-2 shadow-2xs group hover:border-[#721828]/40 transition-colors"
                  >
                    <div className="flex items-start gap-2.5">
                      <span 
                        className="w-3 h-3 rounded-full mt-1 shrink-0" 
                        style={{ backgroundColor: cat.color || '#059669' }} 
                      />
                      <div>
                        <p className="text-xs font-semibold text-[#2d1217]">{cat.name}</p>
                        {cat.description && (
                          <p className="text-[10px] text-[#7f6b6f] line-clamp-1">{cat.description}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteCustomCategory(cat.id)}
                      className="p-1 rounded-lg text-[#968186] hover:text-[#961c2c] hover:bg-[#fdf0f2] transition-colors cursor-pointer"
                      title="Delete category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#fbf5f1] border-t border-[#e4d8cf] flex justify-end">
          <button
            type="button"
            onClick={() => setIsCategoriesModalOpen(false)}
            className="px-4 py-2 bg-white hover:bg-[#f7efe9] border border-[#e4d8cf] text-xs font-semibold text-[#45373a] rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
