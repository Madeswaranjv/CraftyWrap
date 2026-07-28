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
      className="group relative bg-gradient-to-br from-white via-peach-50/60 to-peach-100/50 rounded-3xl p-5 border border-peach-200/80 shadow-soft hover:shadow-hover transition-all duration-300 flex flex-col justify-between overflow-hidden"
    >
      {/* Subtle decorative background circle */}
      <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-peach-200/30 rounded-full group-hover:scale-150 transition-transform duration-500" />

      <div className="flex items-start justify-between z-10">
        <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
          {category.icon}
        </span>
        <div className="w-8 h-8 rounded-full bg-white text-warmbrown-700 flex items-center justify-center shadow-xs group-hover:bg-warmbrown-800 group-hover:text-white transition-colors">
          <ArrowUpRight size={16} />
        </div>
      </div>

      <div className="mt-6 z-10 space-y-1">
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${category.badgeColor}`}>
          {category.itemCount} Items
        </span>
        <h3 className="font-extrabold text-warmbrown-800 text-lg group-hover:text-warmbrown-600 transition-colors">
          {category.name}
        </h3>
        <p className="text-xs text-warmbrown-600/80 line-clamp-2 leading-relaxed font-normal">
          {category.description}
        </p>
      </div>
    </Link>
  );
};
