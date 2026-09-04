import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

interface ActiveSearchBannerProps {
  currentModule: string;
  resultCount: number;
}

export const ActiveSearchBanner: React.FC<ActiveSearchBannerProps> = ({ currentModule, resultCount }) => {
  const { searchQuery, setSearchQuery } = useCRM();

  if (!searchQuery || !searchQuery.trim()) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-[#fdf2f4] border border-[#e2b3bc] rounded-2xl px-4 py-2.5 shadow-2xs animate-in fade-in slide-in-from-top-1 duration-150">
      <div className="flex items-center gap-2 text-xs text-[#721828] min-w-0">
        <div className="p-1 rounded-lg bg-[#721828] text-white shrink-0">
          <Filter className="w-3.5 h-3.5" />
        </div>
        <span className="font-semibold shrink-0">Filtering {currentModule}:</span>
        <span className="truncate max-w-xs font-serif bg-white/80 px-2 py-0.5 rounded-md border border-[#e2b3bc] font-medium text-[#2d1217]">
          &ldquo;{searchQuery}&rdquo;
        </span>
        <span className="text-[#968186] font-normal shrink-0">
          ({resultCount} {resultCount === 1 ? 'match' : 'matches'})
        </span>
      </div>

      <button
        type="button"
        onClick={() => setSearchQuery('')}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#721828] bg-white hover:bg-[#ebdcd3] border border-[#e2b3bc] rounded-xl transition-colors cursor-pointer shadow-2xs"
        title="Clear search filter"
      >
        <span>Clear Filter</span>
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
