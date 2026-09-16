import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBorder?: boolean;
}

const sizeClasses = {
  sm: 'h-7 w-7 rounded-lg',
  md: 'h-8 w-8 sm:h-9 sm:w-9 rounded-xl',
  lg: 'h-10 w-10 sm:h-12 sm:w-12 rounded-2xl',
  xl: 'h-14 w-14 sm:h-16 sm:w-16 rounded-2xl',
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showBorder = true,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden bg-[#0a1a3a] shadow-sm ${
        showBorder ? 'border border-blue-500/30' : ''
      } ${sizeClasses[size]} ${className}`}
    >
      <img
        src="/carbaseai-logo.png"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = '/logo.png';
        }}
        alt="CardBase AI Logo"
        className="w-full h-full object-cover select-none"
        referrerPolicy="no-referrer"
        loading="eager"
      />
    </div>
  );
};
