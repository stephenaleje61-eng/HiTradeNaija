import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSlogan?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showSlogan = false }) => {
  const iconSize = size === 'sm' ? 24 : size === 'lg' ? 42 : 32;
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon combining Shopping Bag + Nigerian Map Accent + Geometric Spark */}
      <div 
        style={{ width: iconSize, height: iconSize }}
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 text-white shadow-md shadow-orange-500/20 shrink-0"
      >
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="w-3/5 h-3/5"
        >
          {/* Shopping bag handle and body */}
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
        {/* Nigerian Green Shield/Trust Pip */}
        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-xs">
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
      </div>

      <div className="flex flex-col leading-none">
        <div className="flex items-baseline tracking-tight">
          <span className={`font-black ${textSize} text-slate-900`}>Trade</span>
          <span className={`font-black ${textSize} text-orange-600`}>Naija</span>
          <span className="ml-1 text-xs font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            .ng
          </span>
        </div>
        {showSlogan && (
          <span className="text-[10px] font-medium text-slate-500 tracking-wide mt-0.5">
            Buy Smart. Sell Easy. Trade Everywhere.
          </span>
        )}
      </div>
    </div>
  );
};
