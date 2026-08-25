'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { CatalogProduct } from '@/lib/catalog';
import { YarnSpinner } from './motion/YarnSpinner';
import { Plus } from 'lucide-react';

interface ProductCardProps {
  product: CatalogProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    void addToCart(product);
    setTimeout(() => setIsAdding(false), 450);
  };

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
      case 'Bee': return '🐝';
      case 'Octopus': return '🐙';
      case 'ToteBag': return '👜';
      case 'DoorScreen': return '🚪';
      case 'Cherry': return '🍒';
      case 'Frog': return '🐸';
      case 'Cactus': return '🌵';
      case 'Butterfly': return '🦋';
      case 'BearCap': return '🧢';
      case 'Bouquet': return '💐';
      case 'Ladybug': return '🐞';
      case 'Lemon': return '🍋';
      case 'Tulip': return '🌷';
      case 'Mushroom': return '🍄';
      default: return '🧶';
    }
  };

  return (
    <div className="group bg-white dark:bg-[#1F1610] rounded-2xl border border-peach-200/60 dark:border-warmbrown-900/80 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
      {/* Top Media Image Container */}
      <div className="relative w-full aspect-square bg-gradient-to-br from-peach-100/60 via-amber-50/40 to-rose-50/30 dark:from-[#2A1D15] dark:via-[#231810] dark:to-[#1C130D] overflow-hidden flex items-center justify-center p-6 border-b border-peach-100/60 dark:border-warmbrown-900/60">
        {/* Sale / Best Seller Tag Badge */}
        {product.isBestSeller ? (
          <span className="absolute top-3 left-3 bg-rose-500 text-white font-extrabold text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-sm shadow-xs z-10">
            SALE
          </span>
        ) : product.isNew ? (
          <span className="absolute top-3 left-3 bg-amber-600 text-white font-extrabold text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-sm shadow-xs z-10">
            NEW
          </span>
        ) : (
          <span className="absolute top-3 left-3 bg-warmbrown-800 text-peach-100 font-extrabold text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-sm shadow-xs z-10">
            HANDMADE
          </span>
        )}



        {/* Product Image / Visual Artwork */}
        <Link href={`/products/${product.id}`} prefetch={true} className="w-full h-full flex items-center justify-center relative">
          {product.images && product.images.length > 0 ? (
            <div className="relative w-full h-full">
              <img
                src={product.images[0]}
                alt={product.name}
                className={`w-full h-full object-cover rounded-xl transition-all duration-500 ${
                  product.images.length > 1 ? 'group-hover:opacity-0' : 'group-hover:scale-105'
                }`}
              />
              {product.images.length > 1 && (
                <img
                  src={product.images[1]}
                  alt={`${product.name} alternate view`}
                  className="w-full h-full object-cover rounded-xl transition-all duration-500 absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:scale-105"
                />
              )}
            </div>
          ) : (
            <span className="text-7xl group-hover:scale-110 transition-transform duration-300 drop-shadow-md select-none">
              {renderIcon(product.imageIconName)}
            </span>
          )}
        </Link>
      </div>

      {/* Product Details Section */}
      <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <Link href={`/products/${product.id}`} prefetch={true} className="block">
            <h3 className="font-extrabold uppercase text-warmbrown-800 dark:text-peach-100 text-sm tracking-tight group-hover:text-warmbrown-600 dark:group-hover:text-peach-300 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <p className="text-[11px] text-warmbrown-500 dark:text-peach-300/60 font-medium truncate">
            {product.yarnType} • {product.size}
          </p>
        </div>

        {/* Pricing & Add Action Button */}
        <div className="pt-2 flex items-center justify-between border-t border-peach-100/60 dark:border-warmbrown-900/60">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-warmbrown-800 dark:text-peach-100">
                ₹{product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-warmbrown-400 dark:text-peach-300/50 line-through font-normal">
                  ₹{product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-warmbrown-500/80 dark:text-peach-300/60 font-semibold block">
              100% Hand-crocheted
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdding}
            className="bg-warmbrown-800 dark:bg-warmbrown-700 hover:bg-warmbrown-900 dark:hover:bg-warmbrown-600 text-white p-2.5 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center shrink-0 disabled:opacity-50"
            title="Add to Shopping Cart"
          >
            {isAdding ? <YarnSpinner size={14} /> : <Plus size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};
