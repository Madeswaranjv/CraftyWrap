'use client';

import React from 'react';
import { ProductGridSkeleton } from '@/components/skeletons/ProductGridSkeleton';
import { CategoryGridSkeleton } from '@/components/skeletons/CategoryGridSkeleton';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="h-44 bg-gradient-to-r from-peach-100 via-peach-50 to-white dark:from-[#231812] dark:via-[#1F1610] dark:to-[#1A120B] rounded-3xl border border-peach-200 dark:border-warmbrown-800 animate-pulse" />
      <CategoryGridSkeleton count={12} />
      <ProductGridSkeleton count={8} />
    </div>
  );
}
