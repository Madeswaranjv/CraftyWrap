'use client';

import React from 'react';

export const CartSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      <div className="h-8 w-40 bg-warmbrown-200/50 rounded-xl"></div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 bg-peach-50 rounded-3xl border border-peach-200 p-4"></div>
          ))}
        </div>
        <div className="lg:col-span-4 h-64 bg-white rounded-3xl border border-peach-200 p-6"></div>
      </div>
    </div>
  );
};
