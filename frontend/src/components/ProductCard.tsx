'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/data/mockData';
import { useCart } from '@/context/CartContext';
import { StarRating } from './StarRating';
import { Heart, ShoppingBag, Clock } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const renderIcon = (name: string) => {
    switch (name) {
      case 'Cat': return '🐱';
      case 'Carrot': return '🥕';
      case 'Strawberry': return '🍓';
      case 'Bear': return '🐻';
      case 'Unicorn': return '🦄';
      case 'Flower': return '🌻';
      case 'Avocado': return '🥑';
      case 'Penguin': return '🐧';
      case 'Broccoli': return '🥦';
      case 'Rose': return '🌹';
      case 'Dragon': return '🐲';
      case 'Bunny': return '🐰';
      default: return '🧶';
    }
  };

  return (
    <div className="group bg-white rounded-3xl border border-peach-100/90 shadow-soft hover:shadow-hover transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
      {/* Top Badges & Wishlist Button */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex flex-col gap-1 pointer-events-auto">
          {product.isBestSeller && (
            <span className="bg-warmbrown-800 text-peach-100 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
              Best Seller
            </span>
          )}
          {product.isNew && (
            <span className="bg-peach-300 text-warmbrown-900 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
              New Drop
            </span>
          )}
          {product.stockCount <= 4 && (
            <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200">
              Only {product.stockCount} left
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            setIsWishlisted(!isWishlisted);
          }}
          className={`pointer-events-auto w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            isWishlisted
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-white/90 backdrop-blur-md text-warmbrown-600 hover:text-rose-500 shadow-sm hover:scale-110'
          }`}
          title="Save to Wishlist"
        >
          <Heart size={16} className={isWishlisted ? 'fill-white' : ''} />
        </button>
      </div>

      {/* Main Image Container */}
      <Link href={`/products/${product.id}`} className="block relative pt-4 px-4">
        <div
          className={`w-full aspect-[4/3] rounded-2xl bg-gradient-to-br ${product.imageBg} flex items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-300`}
        >
          {/* Subtle background yarn ball pattern watermark */}
          <div className="absolute inset-0 opacity-10 flex items-center justify-center text-7xl select-none">
            🧶
          </div>

          <div className="relative z-10 text-center space-y-1">
            <span className="text-6xl drop-shadow-md block transform group-hover:scale-110 transition-transform duration-300">
              {renderIcon(product.imageIconName)}
            </span>
            <span className="inline-block bg-white/70 backdrop-blur-md text-warmbrown-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
              {product.yarnType}
            </span>
          </div>
        </div>
      </Link>

      {/* Card Content Details */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-warmbrown-500 font-medium">
            <span>{product.category}</span>
            <span className="flex items-center gap-1 text-[11px] text-warmbrown-600">
              <Clock size={11} /> {product.prepTimeDays}d prep
            </span>
          </div>

          <Link href={`/products/${product.id}`}>
            <h3 className="font-bold text-warmbrown-800 text-base group-hover:text-warmbrown-600 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <StarRating rating={product.rating} count={product.reviewCount} />
        </div>

        {/* Price & Add to Cart Action */}
        <div className="pt-2 border-t border-peach-100 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-warmbrown-800">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-warmbrown-400 line-through font-normal">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-warmbrown-500/80 font-medium">
              Hand-embroidered
            </span>
          </div>

          <button
            onClick={() => addToCart(product)}
            className="bg-peach-100 hover:bg-warmbrown-800 text-warmbrown-800 hover:text-white px-3.5 py-2 rounded-full font-bold text-xs transition-all duration-200 flex items-center gap-1.5 shadow-xs border border-peach-200/80"
          >
            <ShoppingBag size={14} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
