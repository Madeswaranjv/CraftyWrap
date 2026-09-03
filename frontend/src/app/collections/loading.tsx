'use client';

import React from 'react';
import { ProductGridSkeleton } from '@/components/skeletons/ProductGridSkeleton';

export default function CollectionsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title skeleton */}
      <div className="h-10 w-64 bg-warmbrown-200/50 dark:bg-warmbrown-800/50 rounded-xs animate-pulse" />

      {/* Top Filter Controls skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="h-12 bg-white dark:bg-[#1F1610] border border-peach-200/60 dark:border-warmbrown-900/80 rounded-xs animate-pulse" />
        <div className="h-12 bg-white dark:bg-[#1F1610] border border-peach-200/60 dark:border-warmbrown-900/80 rounded-xs animate-pulse" />
        <div className="h-12 bg-white dark:bg-[#1F1610] border border-peach-200/60 dark:border-warmbrown-900/80 rounded-xs animate-pulse" />
      </div>

      {/* Categories Bar skeleton */}
      <div className="border-b border-peach-200 dark:border-warmbrown-800 pb-3.5 flex items-center gap-6 sm:gap-10">
        <div className="h-4 w-32 bg-warmbrown-300/60 dark:bg-peach-300/30 rounded-xs animate-pulse" />
        <div className="h-4 w-24 bg-warmbrown-200/50 dark:bg-peach-300/20 rounded-xs animate-pulse" />
        <div className="h-4 w-28 bg-warmbrown-200/50 dark:bg-peach-300/20 rounded-xs animate-pulse" />
        <div className="h-4 w-24 bg-warmbrown-200/50 dark:bg-peach-300/20 rounded-xs animate-pulse" />
      </div>

      {/* Product Cards Skeleton Grid */}
      <ProductGridSkeleton count={8} />
    </div>
  );
}
