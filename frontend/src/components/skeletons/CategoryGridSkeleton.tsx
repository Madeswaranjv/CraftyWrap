'use client';

import React from 'react';
import { CategoryTileSkeleton } from './CategoryTileSkeleton';

interface CategoryGridSkeletonProps {
  count?: number;
  className?: string;
}

export const CategoryGridSkeleton: React.FC<CategoryGridSkeletonProps> = ({
  count = 12,
  className = 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4',
}) => {
  return (
    <div className={className} aria-busy="true" aria-label="Loading categories">
      {Array.from({ length: count }).map((_, idx) => (
        <CategoryTileSkeleton key={idx} />
      ))}
    </div>
  );
};
