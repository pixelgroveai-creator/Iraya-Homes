import React from 'react';
import { Search, X, Command } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { NavTab } from './Navbar';

interface GlobalSearchProps {
  activeTab?: NavTab;
  setActiveTab?: (tab: NavTab) => void;
  isMobileSearchOpen?: boolean;
  setIsMobileSearchOpen?: (open: boolean) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = () => {
  const { searchQuery, setSearchQuery, openSearch } = useCRM();

  return (
    <div 
      className="relative w-full max-w-sm sm:max-w-md cursor-pointer group"
      onClick={() => openSearch()}
    >
      <div className="relative flex items-center">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#968186] group-hover:text-[#721828] transition-colors pointer-events-none" />
        
        <input
          type="text"
          readOnly
          placeholder="Search leads, guests, bookings... (⌘K or /)"
          value={searchQuery}
          onClick={(e) => {
            e.stopPropagation();
            openSearch();
          }}
          className="w-full bg-[#fdf8f5] group-hover:bg-white text-[#2d1217] text-xs rounded-full pl-9.5 pr-16 py-2 border border-[#e4d8cf] group-hover:border-[#721828]/50 focus:outline-none placeholder-[#968186] transition-all shadow-2xs cursor-pointer select-none"
        />

        {/* Action icons inside input */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {searchQuery ? (
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSearchQuery('');
              }}
              className="p-1 rounded-full text-[#968186] hover:text-[#2d1217] hover:bg-[#f2e7df] transition-colors cursor-pointer"
              title="Clear search query"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-[#968186] bg-[#f0e4db] border border-[#e4d8cf] rounded group-hover:border-[#721828]/30 transition-colors">
              <span className="text-[9px]">⌘</span>
              <span>K</span>
            </kbd>
          )}
        </div>
      </div>
    </div>
  );
};
