'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface CustomSelectOption<T extends string | number> {
  value: T;
  label: string;
}

interface CustomSelectProps<T extends string | number> {
  value: T;
  onChange: (value: T) => void;
  options: CustomSelectOption<T>[];
  placeholder?: string;
  className?: string;
  id?: string;
  ariaLabel?: string;
}

export function CustomSelect<T extends string | number>({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className = '',
  id,
  ariaLabel,
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative inline-block w-full ${className}`}>
      {/* Dropdown Header Trigger Button */}
      <button
        type="button"
        id={id}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white dark:bg-[#1F1610] border border-peach-200 dark:border-warmbrown-800 rounded-xl px-4 py-2.5 pr-10 text-xs text-left font-semibold text-warmbrown-900 dark:text-peach-100 outline-none focus:border-warmbrown-600 dark:focus:border-peach-300 shadow-xs cursor-pointer flex items-center justify-between transition-colors"
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        
        {/* Custom Chevron Arrow with comfortable right-edge padding */}
        <ChevronDown
          size={16}
          className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-warmbrown-600 dark:text-peach-300 pointer-events-none transition-transform duration-200 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        />
      </button>

      {/* Custom Options List Menu Popup */}
      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1.5 w-full bg-white dark:bg-[#1F1610] border border-peach-200 dark:border-warmbrown-800 shadow-lg max-h-60 overflow-y-auto py-1 animate-in fade-in slide-in-from-top-1 duration-150">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <div
                key={String(option.value)}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`px-4 py-2.5 text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-warmbrown-800 dark:bg-warmbrown-800 text-white dark:text-peach-50 font-bold'
                    : 'text-warmbrown-800 dark:text-peach-100 hover:bg-peach-100 dark:hover:bg-warmbrown-900/90 hover:text-warmbrown-900 dark:hover:text-peach-50'
                }`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && <Check size={14} className="shrink-0 ml-2" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
