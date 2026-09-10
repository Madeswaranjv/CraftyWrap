'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

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
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 220);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-block w-full ${className}`}
    >
      {/* Dropdown Header Trigger Button */}
      <button
        type="button"
        id={id}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        onClick={() => {
          if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
          setIsOpen((prev) => !prev);
        }}
        className="w-full bg-white dark:bg-[#1F1610] border border-peach-200 dark:border-warmbrown-800 hover:border-warmbrown-400 dark:hover:border-peach-400/60 rounded-xl px-4 py-2.5 pr-10 text-xs text-left font-semibold text-warmbrown-900 dark:text-peach-100 outline-none focus:border-warmbrown-600 dark:focus:border-peach-300 shadow-xs hover:shadow-sm cursor-pointer flex items-center justify-between transition-all duration-200"
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        
        {/* Custom Chevron Arrow with smooth rotation animation */}
        <ChevronDown
          size={16}
          className={cn(
            "absolute right-3.5 top-1/2 -translate-y-1/2 text-warmbrown-600 dark:text-peach-300 pointer-events-none transition-transform duration-300 ease-out",
            isOpen ? "rotate-180 text-warmbrown-900 dark:text-peach-100" : "rotate-0"
          )}
        />
      </button>

      {/* Custom Options List Menu Popup with smooth dropping animation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scaleY: 0.92 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.94 }}
            transition={{
              duration: 0.22,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{ originY: 0 }}
            className="absolute left-0 right-0 z-50 mt-1.5 w-full bg-white/95 dark:bg-[#1F1610]/95 backdrop-blur-md border border-peach-200 dark:border-warmbrown-800 rounded-xl shadow-xl max-h-64 overflow-y-auto p-1.5 scrollbar-hover-only"
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <motion.div
                  key={String(option.value)}
                  whileHover={{ x: 3 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors duration-150 select-none",
                    isSelected
                      ? "bg-warmbrown-800 text-white dark:bg-peach-500 dark:text-warmbrown-950 font-bold shadow-xs"
                      : "text-warmbrown-800 dark:text-peach-100 hover:bg-peach-100/90 dark:hover:bg-warmbrown-900/90 hover:text-warmbrown-950 dark:hover:text-peach-50"
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check size={14} className="shrink-0 ml-2" />}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
