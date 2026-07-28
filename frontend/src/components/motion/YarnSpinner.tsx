'use client';

import React from 'react';

interface YarnSpinnerProps {
  size?: number;
  className?: string;
}

export const YarnSpinner: React.FC<YarnSpinnerProps> = ({ size = 16, className = '' }) => {
  return (
    <span
      className={`inline-block animate-spin ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-current"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray="40 15"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
};
