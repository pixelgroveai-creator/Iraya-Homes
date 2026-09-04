import React from 'react';

interface IrayaLogoProps {
  variant?: 'full' | 'header' | 'mark' | 'emblem';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  theme?: 'maroon' | 'white' | 'gold' | 'dark';
}

export const IrayaLogo: React.FC<IrayaLogoProps> = ({
  variant = 'header',
  size = 'md',
  className = '',
  theme = 'maroon'
}) => {
  // Color palette based on theme
  const colors = {
    maroon: {
      primary: '#721828',
      secondary: '#4E0C17',
      accent: '#C29342',
      bg: '#FBF2F4',
      text: '#2D1217',
      subtext: '#7A1C2C'
    },
    white: {
      primary: '#FFFFFF',
      secondary: '#F5ECE7',
      accent: '#F3D28E',
      bg: 'rgba(255, 255, 255, 0.15)',
      text: '#FFFFFF',
      subtext: '#EAD3D7'
    },
    gold: {
      primary: '#C29342',
      secondary: '#9E7428',
      accent: '#721828',
      bg: '#FAF4E8',
      text: '#4A3410',
      subtext: '#855E1C'
    },
    dark: {
      primary: '#2D1217',
      secondary: '#1A070B',
      accent: '#721828',
      bg: '#F5ECE5',
      text: '#2D1217',
      subtext: '#522329'
    }
  }[theme];

  // Sizing definitions
  const sizeConfig = {
    xs: { iconSize: 24, markWidth: 32, headerHeight: 28, textClass: 'text-sm', subtextClass: 'text-[8px]' },
    sm: { iconSize: 32, markWidth: 44, headerHeight: 36, textClass: 'text-base', subtextClass: 'text-[9px]' },
    md: { iconSize: 42, markWidth: 56, headerHeight: 44, textClass: 'text-lg', subtextClass: 'text-[10px]' },
    lg: { iconSize: 56, markWidth: 80, headerHeight: 56, textClass: 'text-2xl', subtextClass: 'text-xs' },
    xl: { iconSize: 84, markWidth: 120, headerHeight: 80, textClass: 'text-4xl', subtextClass: 'text-sm' }
  }[size];

  // SVG Twin Elephants and Royal Palmette Crest
  const ElephantCrestSVG = ({ width = 120, height = 70 }: { width?: number; height?: number }) => (
    <svg 
      viewBox="0 0 200 115" 
      width={width} 
      height={height} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-200"
    >
      {/* Central Royal Palmette / Lotus Finial */}
      <g fill={colors.primary}>
        {/* Top Fan Palmette */}
        <path d="M100 10 C100 2 100 0 100 0 C100 0 100 2 100 10 Z" />
        <path d="M100 2 C100.8 12 101.5 24 100 32 C98.5 24 99.2 12 100 2 Z" />
        <path d="M100 2 C104 10 109 20 109 28 C105 28 101 24 100 20 Z" />
        <path d="M100 2 C96 10 91 20 91 28 C95 28 99 24 100 20 Z" />
        <path d="M100 6 C107 14 115 24 116 32 C110 32 104 28 100 22 Z" />
        <path d="M100 6 C93 14 85 24 84 32 C90 32 96 28 100 22 Z" />
        <circle cx="100" cy="34" r="3.2" />

        {/* Central Accent Dot */}
        <circle cx="100" cy="45" r="2.4" />

        {/* Bottom Lotus Drop Finial */}
        <path d="M100 52 C103 57 106 61 106 66 C102 65 101 62 100 59 C99 62 98 65 94 66 C94 61 97 57 100 52 Z" />
        <circle cx="100" cy="50" r="1.5" />
      </g>

      {/* Left Ornate Royal Elephant */}
      <g stroke={colors.primary} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Body & Outline */}
        <path 
          d="M72 40 C75 36 78 30 79 24 C80 20 77 18 73 21 C69 24 67 28 65 31 C63 29 58 26 52 26 C44 26 36 30 30 36 C24 42 20 50 20 58 C20 63 22 66 24 68 C24 74 24 82 25 88 L34 88 C35 83 35 78 35 75 C37 75 42 75 44 75 C44 78 44 83 45 88 L54 88 C55 83 55 77 56 74 C58 75 62 76 65 74 C67 76 69 77 71 78 L76 75 C73 70 70 65 71 58 C74 58 77 55 78 52 C79 49 78 44 72 40 Z" 
        />
        {/* Trunk Upward Curl */}
        <path d="M72 40 C76 34 81 26 80 20 C78 16 73 19 70 23 C67 27 66 31 65 34" strokeWidth="1.8" />
        {/* Tusk */}
        <path d="M70 48 C75 48 78 45 77 41" strokeWidth="1.4" />
        {/* Eye */}
        <circle cx="63" cy="35" r="1.5" fill={colors.primary} />
        {/* Ear with traditional scalloped edge */}
        <path d="M57 32 C61 34 63 38 62 44 C61 50 56 53 52 50 C50 48 50 44 51 40 C52 36 54 33 57 32 Z" fill={colors.bg} />
        <path d="M56 36 C58 38 59 41 58 44 C57 47 54 48 53 46" strokeWidth="1.2" />
        {/* Decorative Saddle Cloth (Jhool) */}
        <path d="M33 46 C38 43 45 43 51 46 C52 54 51 62 50 67 C44 68 38 68 32 66 C32 60 32 53 33 46 Z" fill={colors.bg} strokeWidth="1.4" />
        {/* Saddle Intricate Patterns */}
        <path d="M36 50 L48 50 M35 55 L49 55 M34 60 L48 60" strokeWidth="1" strokeDasharray="1.5 1.5" />
        <circle cx="42" cy="55" r="2.2" fill={colors.primary} />
        {/* Tail */}
        <path d="M21 54 C19 58 18 64 19 68 C19 70 21 70 21 68" strokeWidth="1.2" />
        {/* Toe Claws */}
        <path d="M26 85 C28 83 31 83 33 85 M46 85 C48 83 51 83 53 85" strokeWidth="1.2" />
      </g>

      {/* Right Ornate Royal Elephant (Mirrored) */}
      <g stroke={colors.primary} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Body & Outline */}
        <path 
          d="M128 40 C125 36 122 30 121 24 C120 20 123 18 127 21 C131 24 133 28 135 31 C137 29 142 26 148 26 C156 26 164 30 170 36 C176 42 180 50 180 58 C180 63 178 66 176 68 C176 74 176 82 175 88 L166 88 C165 83 165 78 165 75 C163 75 158 75 156 75 C156 78 156 83 155 88 L146 88 C145 83 145 77 144 74 C142 75 138 76 135 74 C133 76 131 77 129 78 L124 75 C127 70 130 65 129 58 C126 58 123 55 122 52 C121 49 122 44 128 40 Z" 
        />
        {/* Trunk Upward Curl */}
        <path d="M128 40 C124 34 119 26 120 20 C122 16 127 19 130 23 C133 27 134 31 135 34" strokeWidth="1.8" />
        {/* Tusk */}
        <path d="M130 48 C125 48 122 45 123 41" strokeWidth="1.4" />
        {/* Eye */}
        <circle cx="137" cy="35" r="1.5" fill={colors.primary} />
        {/* Ear with traditional scalloped edge */}
        <path d="M143 32 C139 34 137 38 138 44 C139 50 144 53 148 50 C150 48 150 44 149 40 C148 36 146 33 143 32 Z" fill={colors.bg} />
        <path d="M144 36 C142 38 141 41 142 44 C143 47 146 48 147 46" strokeWidth="1.2" />
        {/* Decorative Saddle Cloth (Jhool) */}
        <path d="M167 46 C162 43 155 43 149 46 C148 54 149 62 150 67 C156 68 162 68 168 66 C168 60 168 53 167 46 Z" fill={colors.bg} strokeWidth="1.4" />
        {/* Saddle Intricate Patterns */}
        <path d="M164 50 L152 50 M165 55 L151 55 M166 60 L152 60" strokeWidth="1" strokeDasharray="1.5 1.5" />
        <circle cx="158" cy="55" r="2.2" fill={colors.primary} />
        {/* Tail */}
        <path d="M179 54 C181 58 182 64 181 68 C181 70 179 70 179 68" strokeWidth="1.2" />
        {/* Toe Claws */}
        <path d="M174 85 C172 83 169 83 167 85 M154 85 C152 83 149 83 147 85" strokeWidth="1.2" />
      </g>
    </svg>
  );

  // Variant: Mark / Compact Icon (Used in navbar badge, avatar, mobile)
  if (variant === 'mark' || variant === 'emblem') {
    return (
      <div 
        className={`inline-flex items-center justify-center rounded-2xl p-1.5 transition-transform duration-200 hover:scale-105 ${className}`}
        style={{ backgroundColor: colors.bg, border: `1px solid ${colors.primary}33` }}
        title="Iraya Homes — The Art of Unwinding"
      >
        <ElephantCrestSVG width={sizeConfig.markWidth} height={sizeConfig.markWidth * 0.58} />
      </div>
    );
  }

  // Variant: Header (Horizontal lockup for Navbar & Section Headers)
  if (variant === 'header') {
    return (
      <div className={`flex items-center gap-3 select-none ${className}`}>
        {/* Brand Emblem */}
        <div 
          className="rounded-2xl p-1.5 flex items-center justify-center shrink-0 shadow-xs transition-transform duration-200 hover:scale-105"
          style={{ 
            backgroundColor: theme === 'white' ? 'rgba(255,255,255,0.18)' : '#FBF2F4', 
            border: `1.5px solid ${colors.primary}30` 
          }}
        >
          <ElephantCrestSVG width={sizeConfig.iconSize * 1.3} height={sizeConfig.iconSize * 0.75} />
        </div>

        {/* Wordmark and Tagline */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <span 
              className={`font-serif font-bold tracking-wider leading-none ${sizeConfig.textClass}`}
              style={{ color: colors.text, letterSpacing: '0.12em' }}
            >
              IRAYA
            </span>
            <span 
              className="text-[10px] uppercase font-semibold tracking-widest px-2 py-0.5 rounded-full border hidden sm:inline-block"
              style={{ 
                backgroundColor: theme === 'white' ? 'rgba(255,255,255,0.15)' : '#F8E8EA', 
                color: colors.primary,
                borderColor: `${colors.primary}40`
              }}
            >
              Homes
            </span>
          </div>
          <span 
            className={`font-serif tracking-[0.22em] uppercase font-medium mt-1 leading-none ${sizeConfig.subtextClass}`}
            style={{ color: colors.subtext }}
          >
            The Art of Unwinding
          </span>
        </div>
      </div>
    );
  }

  // Variant: Full (Stacked vertical presentation for Login, Hero, SOPs & Invoices)
  return (
    <div className={`flex flex-col items-center text-center select-none ${className}`}>
      {/* Elephant Crest Motif */}
      <div 
        className="rounded-3xl p-3 sm:p-4 mb-3 sm:mb-4 shadow-sm transition-transform duration-300 hover:scale-105"
        style={{ 
          backgroundColor: theme === 'white' ? 'rgba(255,255,255,0.15)' : '#FBF2F4',
          border: `1.5px solid ${colors.primary}25`
        }}
      >
        <ElephantCrestSVG width={sizeConfig.markWidth * 1.8} height={sizeConfig.markWidth * 1.05} />
      </div>

      {/* Main Brand Name */}
      <h1 
        className={`font-serif font-bold tracking-[0.18em] uppercase ${sizeConfig.textClass} leading-tight`}
        style={{ color: colors.text }}
      >
        IRAYA
      </h1>

      {/* Luxury Tagline */}
      <p 
        className={`font-serif tracking-[0.28em] uppercase font-semibold mt-1.5 sm:mt-2 ${sizeConfig.subtextClass}`}
        style={{ color: colors.primary }}
      >
        The Art of Unwinding
      </p>

      {/* Property Details Subtitle */}
      <div 
        className="flex items-center gap-2 mt-2.5 px-3 py-1 rounded-full border text-[11px] font-medium"
        style={{ 
          backgroundColor: theme === 'white' ? 'rgba(255,255,255,0.12)' : '#FAF2EA',
          borderColor: `${colors.primary}25`,
          color: colors.subtext
        }}
      >
        <span>Gomti Nagar, Lucknow</span>
        <span className="opacity-40">•</span>
        <span>4 BHK Luxury Boutique Villa</span>
      </div>
    </div>
  );
};
