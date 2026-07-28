'use client';

import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl border border-peach-100 p-4 space-y-4 shadow-xs animate-pulse">
      {/* Top Badge & Heart Slot */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-16 bg-peach-100 rounded-full"></div>
        <div className="h-8 w-8 bg-peach-100 rounded-full"></div>
      </div>

      {/* Main Image Block Slot */}
      <div className="h-44 bg-gradient-to-tr from-peach-100 via-peach-50 to-amber-50/50 rounded-2xl flex items-center justify-center">
        <div className="h-12 w-12 bg-peach-200/60 rounded-full"></div>
      </div>

      {/* Title & Category Lines */}
      <div className="space-y-2 pt-1">
        <div className="flex justify-between items-center">
          <div className="h-3 w-24 bg-peach-100 rounded-full"></div>
          <div className="h-3 w-12 bg-peach-100 rounded-full"></div>
        </div>
        <div className="h-5 w-3/4 bg-warmbrown-100/60 rounded-lg"></div>
        <div className="h-3 w-20 bg-peach-100 rounded-full"></div>
      </div>

      {/* Price & Button Action Slot */}
      <div className="pt-3 border-t border-peach-100 flex items-center justify-between">
        <div className="h-6 w-16 bg-warmbrown-200/50 rounded-md"></div>
        <div className="h-9 w-24 bg-peach-200/70 rounded-full"></div>
      </div>
    </div>
  );
};
