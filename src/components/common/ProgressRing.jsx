import React from 'react';

export const ProgressRing = ({
  radius = 60,
  stroke = 8,
  progress = 0,
  strokeColor = '#1eb4eb',
  bgColor = 'rgba(30, 180, 235, 0.15)',
  children,
  className = '',
}) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(Math.max(progress, 0), 100) / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90 transition-all duration-500 ease-out"
      >
        {/* Background Track */}
        <circle
          stroke={bgColor}
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress Value Stroke */}
        <circle
          stroke={strokeColor}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {children}
        </div>
      )}
    </div>
  );
};
