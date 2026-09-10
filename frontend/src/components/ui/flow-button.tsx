'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  size?: 'default' | 'compact';
  variant?: 'outline' | 'filled';
}

export function FlowButton({
  text = "Modern Button",
  size = 'default',
  variant = 'outline',
  className,
  children,
  ...props
}: FlowButtonProps) {
  const content = children || text;

  return (
    <button
      {...props}
      data-flow-btn="true"
      className={cn(
        "flow-btn group",
        size === 'compact' && "flow-btn-compact",
        variant === 'filled' && "flow-btn-filled",
        className
      )}
    >
      {/* Left arrow (arr-2) */}
      <ArrowRight className="flow-arr-left" />

      {/* Text */}
      <span className="flow-text">
        {content}
      </span>

      {/* Circle */}
      <span className="flow-circle" />

      {/* Right arrow (arr-1) */}
      <ArrowRight className="flow-arr-right" />
    </button>
  );
}

export default FlowButton;
