'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUpVariants, isReducedMotion } from '@/lib/motion';

interface FadeInSectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  delay?: number;
  amount?: number;
}

export const FadeInSection: React.FC<FadeInSectionProps> = ({
  children,
  className = '',
  id,
  delay = 0,
  amount = 0.15,
}) => {
  // Fall back to instant reveal for users with prefers-reduced-motion
  if (typeof window !== 'undefined' && isReducedMotion()) {
    return (
      <div id={id} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.35,
            ease: [0.25, 0.1, 0.25, 1.0],
            delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
