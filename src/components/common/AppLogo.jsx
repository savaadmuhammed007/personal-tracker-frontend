import React from 'react';

export const AppLogo = ({ className = 'w-7 h-7', alt = 'يومي Logo' }) => {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {/* Light Mode: Blue Gradient Emblem (#088ac1 to #3dc3f3) */}
      <img
        src="/logo-gradient.png"
        alt={alt}
        className="w-full h-full object-contain block dark:hidden select-none pointer-events-none transition-opacity duration-200"
      />
      {/* Dark Mode: Pure White Emblem */}
      <img
        src="/logo-white.png"
        alt={alt}
        className="w-full h-full object-contain hidden dark:block select-none pointer-events-none transition-opacity duration-200"
      />
    </div>
  );
};

export default AppLogo;
