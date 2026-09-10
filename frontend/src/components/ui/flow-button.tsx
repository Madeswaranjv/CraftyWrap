'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
}

export function FlowButton({
  text = "Modern Button",
  className,
  children,
  ...props
}: FlowButtonProps) {
  const content = children || text;

  return (
    <button
      {...props}
      className={cn(
        "group relative flex items-center justify-center gap-1 overflow-hidden rounded-[100px] border-[1.5px] border-[#333333]/40 dark:border-peach-300/40 bg-transparent px-8 py-3 text-sm font-semibold text-[#111111] dark:text-peach-100 cursor-pointer transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-transparent hover:text-white dark:hover:text-white hover:rounded-[12px] active:scale-[0.95] disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      {/* Left arrow (arr-2) */}
      <ArrowRight 
        className="absolute w-4 h-4 left-[-25%] stroke-[#111111] dark:stroke-peach-100 fill-none z-[9] group-hover:left-4 group-hover:stroke-white transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]" 
      />

      {/* Text */}
      <span className="relative z-[1] -translate-x-3 group-hover:translate-x-3 transition-all duration-[800ms] ease-out">
        {content}
      </span>

      {/* Circle */}
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#111111] dark:bg-warmbrown-800 rounded-[50%] opacity-0 group-hover:w-[600px] group-hover:h-[600px] group-hover:opacity-100 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)]"></span>

      {/* Right arrow (arr-1) */}
      <ArrowRight 
        className="absolute w-4 h-4 right-4 stroke-[#111111] dark:stroke-peach-100 fill-none z-[9] group-hover:right-[-25%] group-hover:stroke-white transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]" 
      />
    </button>
  );
}

export default FlowButton;
