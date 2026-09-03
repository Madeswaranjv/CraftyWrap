'use client';

import React from 'react';

export const CategoryTileSkeleton: React.FC = () => {
  return (
    <div className="relative bg-gradient-to-br from-white via-peach-50/60 to-peach-100/50 dark:from-[#1F1610] dark:via-[#261B13] dark:to-[#2B1E15] rounded-3xl p-5 border border-peach-200/80 dark:border-warmbrown-900/80 shadow-soft flex flex-col justify-between overflow-hidden select-none min-h-[190px]">
      {/* Shimmer sweep effect */}
      <div className="animate-skeleton-shimmer" />

      {/* Decorative background circle */}
      <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-peach-200/20 dark:bg-warmbrown-800/20 rounded-full pointer-events-none" />

      {/* Top Row: Icon & Action Arrow Placeholders */}
      <div className="flex items-start justify-between z-10">
        <div className="w-10 h-10 rounded-full bg-peach-200/60 dark:bg-warmbrown-800/60 flex items-center justify-center animate-pulse">
          <div className="w-5 h-5 rounded-full bg-peach-300/50 dark:bg-warmbrown-700/50" />
        </div>
        <div className="w-8 h-8 rounded-full bg-white dark:bg-warmbrown-900/80 border border-peach-200/60 dark:border-warmbrown-800 flex items-center justify-center shadow-xs animate-pulse">
          <div className="w-3.5 h-3.5 bg-warmbrown-200/70 dark:bg-warmbrown-700/70 rounded-xs" />
        </div>
      </div>

      {/* Bottom Content: Badge, Category Name, and Description lines */}
      <div className="mt-6 z-10 space-y-2">
        {/* Item count badge pill */}
        <div className="h-4 w-14 bg-peach-200/70 dark:bg-warmbrown-800/70 rounded-full animate-pulse" />

        {/* Category Title */}
        <div className="h-5 w-3/4 bg-warmbrown-200/80 dark:bg-warmbrown-800/90 rounded-xs animate-pulse" />

        {/* Description snippet lines */}
        <div className="space-y-1 pt-0.5">
          <div className="h-2.5 w-full bg-peach-200/50 dark:bg-warmbrown-800/40 rounded-xs animate-pulse" />
          <div className="h-2.5 w-4/5 bg-peach-200/40 dark:bg-warmbrown-800/30 rounded-xs animate-pulse" />
        </div>
      </div>
    </div>
  );
};
