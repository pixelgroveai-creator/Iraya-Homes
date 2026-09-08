import React from 'react';

interface IrayaBuddyAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showOnlineIndicator?: boolean;
  className?: string;
}

export const IrayaBuddyAvatar: React.FC<IrayaBuddyAvatarProps> = ({
  size = 'md',
  showOnlineIndicator = false,
  className = ''
}) => {
  const sizeMap = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  };

  const indicatorSizeMap = {
    xs: 'w-1.5 h-1.5 -top-0.5 -right-0.5',
    sm: 'w-2 h-2 -top-0.5 -right-0.5',
    md: 'w-2.5 h-2.5 -top-0.5 -right-0.5 ring-2',
    lg: 'w-3 h-3 -top-0.5 -right-0.5 ring-2',
    xl: 'w-3.5 h-3.5 top-0 right-0 ring-2'
  };

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/iraya-buddy-avatar.svg"
        alt="Iraya Buddy AI Avatar"
        className={`${sizeMap[size]} rounded-full shadow-xs object-cover border border-[#c29342]/40 bg-[#721828] select-none`}
        loading="eager"
        onError={(e) => {
          // Fallback if image load fails
          const target = e.currentTarget;
          target.style.display = 'none';
        }}
      />
      {showOnlineIndicator && (
        <span
          className={`absolute ${indicatorSizeMap[size]} bg-emerald-400 rounded-full ring-white animate-pulse`}
          title="AI Assistant Active"
        />
      )}
    </div>
  );
};
