'use client';

import React from 'react';
import { ProductGridSkeleton } from '@/components/skeletons/ProductGridSkeleton';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-pulse">
      <div className="h-44 bg-gradient-to-r from-peach-100 via-peach-50 to-white rounded-3xl border border-peach-200"></div>
      <ProductGridSkeleton count={6} />
    </div>
  );
}
