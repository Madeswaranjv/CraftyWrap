'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  if (showLabel) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-all text-xs ${
          isDark
            ? 'bg-amber-950/60 text-amber-300 border border-amber-800/80 hover:bg-amber-900/80'
            : 'bg-peach-100/80 text-warmbrown-800 border border-peach-200 hover:bg-peach-200'
        } ${className}`}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        <span className="flex items-center gap-2 font-bold">
          {isDark ? (
            <Sun size={16} className="text-amber-400" />
          ) : (
            <Moon size={16} className="text-warmbrown-700" />
          )}
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </span>
        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-white/20">
          {isDark ? 'ON' : 'OFF'}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xs border hover:scale-105 active:scale-95 ${
        isDark
          ? 'bg-amber-950/80 text-amber-300 border-amber-800/80 hover:bg-amber-900/90 shadow-amber-950/40'
          : 'bg-peach-100/70 text-warmbrown-800 border-peach-200/60 hover:bg-peach-200/90 hover:border-peach-300 hover:shadow-sm'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <Sun size={18} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
      ) : (
        <Moon size={18} className="text-warmbrown-700 hover:-rotate-12 transition-transform" />
      )}
    </button>
  );
};
