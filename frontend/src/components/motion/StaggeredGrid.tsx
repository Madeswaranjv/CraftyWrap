'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { isReducedMotion } from '@/lib/motion';

interface StaggeredGridProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export const StaggeredGrid: React.FC<StaggeredGridProps> = ({
  children,
  className = '',
  staggerDelay = 0.06,
}) => {
  if (typeof window !== 'undefined' && isReducedMotion()) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {React.Children.map(children, (child) => (
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 16 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};
