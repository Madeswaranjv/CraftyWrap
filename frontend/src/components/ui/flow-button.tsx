'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  size?: 'default' | 'compact';
  variant?: 'outline' | 'filled' | 'light';
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  href?: string;
}

export function FlowButton({
  text = "Modern Button",
  size = 'default',
  variant = 'outline',
  icon: Icon = ArrowRight,
  href,
  className,
  children,
  ...props
}: FlowButtonProps) {
  const content = children || text;

  const innerContent = (
    <>
      {/* Left arrow / icon */}
      <Icon className="flow-arr-left" />

      {/* Text */}
      <span className="flow-text">
        {content}
      </span>

      {/* Circle */}
      <span className="flow-circle" />

      {/* Right arrow / icon */}
      <Icon className="flow-arr-right" />
    </>
  );

  const combinedClassName = cn(
    "flow-btn group",
    size === 'compact' && "flow-btn-compact",
    variant === 'filled' && "flow-btn-filled",
    variant === 'light' && "flow-btn-light",
    className
  );

  if (href) {
    const { type, ...linkProps } = props;
    return (
      <Link
        href={href}
        data-flow-btn="true"
        className={combinedClassName}
        {...(linkProps as any)}
      >
        {innerContent}
      </Link>
    );
  }

  return (
    <button
      {...props}
      data-flow-btn="true"
      className={combinedClassName}
    >
      {innerContent}
    </button>
  );
}

export default FlowButton;
