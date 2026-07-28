'use client';

import React from 'react';
import { ProductGridSkeleton } from '@/components/skeletons/ProductGridSkeleton';

export default function CollectionsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      <div className="h-28 bg-gradient-to-r from-peach-100 to-peach-50 rounded-3xl border border-peach-200"></div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="hidden lg:block h-96 bg-white rounded-3xl border border-peach-200 p-6"></div>
        <div className="lg:col-span-3">
          <ProductGridSkeleton count={6} />
        </div>
      </div>
    </div>
  );
}
