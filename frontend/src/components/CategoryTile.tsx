'use client';

import React from 'react';
import Link from 'next/link';
import { CatalogTheme } from '@/lib/catalog';
import { ArrowUpRight } from 'lucide-react';

interface CategoryTileProps {
  category: CatalogTheme;
}

export const CategoryTile: React.FC<CategoryTileProps> = ({ category }) => {
  return (
    <Link
      href={`/collections?category=${encodeURIComponent(category.name)}`}
      prefetch={true}
      className="group relative bg-gradient-to-br from-white via-peach-50/60 to-peach-100/50 dark:from-[#1F1610] dark:via-[#261B13] dark:to-[#2B1E15] rounded-3xl p-5 border border-peach-200/80 dark:border-warmbrown-900/80 shadow-soft hover:shadow-hover transition-all duration-300 flex flex-col justify-between overflow-hidden"
    >
      {/* Subtle decorative background circle */}
      <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-peach-200/30 dark:bg-warmbrown-800/30 rounded-full group-hover:scale-150 transition-transform duration-500" />

      <div className="flex items-start justify-between z-10">
        <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
          {category.icon}
        </span>
        <div className="w-8 h-8 rounded-full bg-white dark:bg-warmbrown-900/80 text-warmbrown-700 dark:text-peach-200 border border-peach-200/60 dark:border-warmbrown-800 flex items-center justify-center shadow-xs group-hover:bg-warmbrown-900 dark:group-hover:bg-[#FFF9F4] group-hover:text-peach-50 dark:group-hover:text-warmbrown-900 group-hover:border-warmbrown-900 dark:group-hover:border-peach-200 transition-all duration-300 group-hover:scale-110">
          <ArrowUpRight size={16} />
        </div>
      </div>

      <div className="mt-6 z-10 space-y-1">
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${category.badgeColor}`}>
          {category.itemCount} Items
        </span>
        <h3 className="font-extrabold text-warmbrown-800 dark:text-peach-100 text-lg group-hover:text-warmbrown-600 dark:group-hover:text-peach-300 transition-colors">
          {category.name}
        </h3>
        <p className="text-xs text-warmbrown-600/80 dark:text-peach-200/70 line-clamp-2 leading-relaxed font-normal">
          {category.description}
        </p>
      </div>
    </Link>
  );
};
