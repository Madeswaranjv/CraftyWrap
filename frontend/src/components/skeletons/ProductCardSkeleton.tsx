'use client';

import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="group bg-white dark:bg-[#1F1610] rounded-2xl border border-peach-200/60 dark:border-warmbrown-900/80 shadow-xs flex flex-col justify-between overflow-hidden relative select-none">
      {/* Shimmer sweep effect */}
      <div className="animate-skeleton-shimmer" />

      {/* Top Media Image Container */}
      <div className="relative w-full aspect-square bg-gradient-to-br from-peach-100/60 via-amber-50/40 to-rose-50/30 dark:from-[#2A1D15] dark:via-[#231810] dark:to-[#1C130D] overflow-hidden flex items-center justify-center p-6 border-b border-peach-100/60 dark:border-warmbrown-900/60">
        {/* Badge Placeholder (e.g. HANDMADE / NEW / SALE) */}
        <div className="absolute top-3 left-3 h-5 w-16 bg-warmbrown-800/20 dark:bg-warmbrown-700/40 rounded-xs animate-pulse" />

        {/* Central Yarn / Image Placeholder Icon */}
        <div className="w-20 h-20 rounded-full bg-peach-200/50 dark:bg-warmbrown-800/40 flex items-center justify-center animate-pulse">
          <div className="w-12 h-12 rounded-full bg-peach-300/40 dark:bg-warmbrown-700/40" />
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Title Placeholder */}
          <div className="h-4 w-3/4 bg-warmbrown-200/70 dark:bg-warmbrown-800/80 rounded-xs animate-pulse" />
          {/* Yarn Type & Size Placeholder */}
          <div className="h-3 w-1/2 bg-peach-200/60 dark:bg-warmbrown-800/50 rounded-xs animate-pulse" />
        </div>

        {/* Pricing & Add Action Button */}
        <div className="pt-2 flex items-center justify-between border-t border-peach-100/60 dark:border-warmbrown-900/60">
          <div className="space-y-1.5">
            <div className="flex items-baseline gap-2">
              {/* Main Price */}
              <div className="h-5 w-16 bg-warmbrown-200/80 dark:bg-warmbrown-800 rounded-xs animate-pulse" />
              {/* Strikethrough Original Price */}
              <div className="h-3.5 w-10 bg-warmbrown-100 dark:bg-warmbrown-900 rounded-xs animate-pulse" />
            </div>
            {/* 100% Hand-crocheted tag line */}
            <div className="h-2.5 w-24 bg-peach-200/50 dark:bg-warmbrown-800/40 rounded-xs animate-pulse" />
          </div>

          {/* Square Add to Cart Button Placeholder */}
          <div className="w-9 h-9 bg-warmbrown-800/25 dark:bg-warmbrown-700/45 rounded-xs shrink-0 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

