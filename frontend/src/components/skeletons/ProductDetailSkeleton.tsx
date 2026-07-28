'use client';

import React from 'react';

export const ProductDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Image Skeleton Slot */}
        <div className="lg:col-span-6 bg-peach-100/60 rounded-3xl h-96 border border-peach-200"></div>

        {/* Right Info Skeleton Slot */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <div className="h-4 w-28 bg-peach-200 rounded-full"></div>
            <div className="h-8 w-3/4 bg-warmbrown-200/50 rounded-xl"></div>
            <div className="h-4 w-32 bg-peach-200/80 rounded-full"></div>
          </div>

          <div className="h-8 w-24 bg-warmbrown-300/40 rounded-lg"></div>

          <div className="space-y-2 py-4 border-y border-peach-100">
            <div className="h-3 w-full bg-peach-100 rounded"></div>
            <div className="h-3 w-5/6 bg-peach-100 rounded"></div>
            <div className="h-3 w-4/6 bg-peach-100 rounded"></div>
          </div>

          <div className="flex gap-4 pt-2">
            <div className="h-12 w-28 bg-peach-200 rounded-full"></div>
            <div className="h-12 flex-1 bg-warmbrown-700/40 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
