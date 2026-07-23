'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PRODUCTS, CATEGORIES, Product } from '@/data/mockData';
import { ProductCard } from '@/components/ProductCard';
import { Filter, SlidersHorizontal, X, RotateCcw, Search } from 'lucide-react';

function CollectionsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') || 'All';
  const yarnTypeParam = searchParams.get('yarnType') || 'All';
  const searchParam = searchParams.get('search') || '';
  const filterParam = searchParams.get('filter') || '';

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [selectedYarnType, setSelectedYarnType] = useState<string>(yarnTypeParam);
  const [selectedSize, setSelectedSize] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(65);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Filter logic
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      // Category match
      if (selectedCategory !== 'All' && product.category !== selectedCategory) {
        return false;
      }
      // Yarn type match
      if (selectedYarnType !== 'All' && product.yarnType !== selectedYarnType) {
        return false;
      }
      // Size match
      if (selectedSize !== 'All' && !product.size.startsWith(selectedSize)) {
        return false;
      }
      // Price match
      if (product.price > maxPrice) {
        return false;
      }
      // Search query match
      if (
        searchParam &&
        !product.name.toLowerCase().includes(searchParam.toLowerCase()) &&
        !product.description.toLowerCase().includes(searchParam.toLowerCase()) &&
        !product.category.toLowerCase().includes(searchParam.toLowerCase())
      ) {
        return false;
      }
      // Special filter param match
      if (filterParam === 'best-seller' && !product.isBestSeller) {
        return false;
      }
      if (filterParam === 'featured' && product.rating < 4.8) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
    });
  }, [selectedCategory, selectedYarnType, selectedSize, maxPrice, searchParam, filterParam, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedYarnType('All');
    setSelectedSize('All');
    setMaxPrice(65);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-peach-100 via-peach-50 to-white p-6 sm:p-8 rounded-3xl border border-peach-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-warmbrown-800">
            {selectedCategory === 'All' ? 'All Handcrafted Collections' : `${selectedCategory} Yarn Dolls`}
          </h1>
          <p className="text-xs sm:text-sm text-warmbrown-600">
            Showing {filteredProducts.length} unique artisan yarn dolls
            {searchParam && ` matching "${searchParam}"`}
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          className="lg:hidden bg-warmbrown-800 text-white px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-2"
        >
          <SlidersHorizontal size={16} />
          <span>Filters ({filteredProducts.length})</span>
        </button>
      </div>

      {/* Main Listing Layout: Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Filter (Desktop) */}
        <aside className="hidden lg:block space-y-6 bg-white p-6 rounded-3xl border border-peach-200/80 shadow-soft h-fit sticky top-24">
          <div className="flex items-center justify-between border-b border-peach-100 pb-3">
            <h3 className="font-extrabold text-warmbrown-800 text-base flex items-center gap-2">
              <Filter size={16} /> Filter Dolls
            </h3>
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-warmbrown-500 hover:text-warmbrown-800 flex items-center gap-1"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>

          {/* Filter 1: Collection Category */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-warmbrown-700 uppercase tracking-wider block">
              Collection Category
            </label>
            <div className="space-y-1 text-xs">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-colors flex items-center justify-between ${
                  selectedCategory === 'All'
                    ? 'bg-warmbrown-800 text-white font-bold'
                    : 'hover:bg-peach-50 text-warmbrown-700'
                }`}
              >
                <span>All Collections</span>
                <span>{PRODUCTS.length}</span>
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-colors flex items-center justify-between ${
                    selectedCategory === cat.name
                      ? 'bg-warmbrown-800 text-white font-bold'
                      : 'hover:bg-peach-50 text-warmbrown-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{cat.icon}</span> {cat.name}
                  </span>
                  <span className="opacity-70">{cat.itemCount}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Filter 2: Yarn Type */}
          <div className="space-y-2 pt-3 border-t border-peach-100">
            <label className="text-xs font-bold text-warmbrown-700 uppercase tracking-wider block">
              Yarn Material
            </label>
            <div className="space-y-1 text-xs">
              {['All', 'Velvet Chenille', 'Milk Cotton', 'Chunky Wool', 'Organic Bamboo'].map((yarn) => (
                <button
                  key={yarn}
                  onClick={() => setSelectedYarnType(yarn)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl font-medium transition-colors ${
                    selectedYarnType === yarn
                      ? 'bg-peach-200 text-warmbrown-900 font-bold'
                      : 'hover:bg-peach-50 text-warmbrown-700'
                  }`}
                >
                  {yarn}
                </button>
              ))}
            </div>
          </div>

          {/* Filter 3: Doll Size */}
          <div className="space-y-2 pt-3 border-t border-peach-100">
            <label className="text-xs font-bold text-warmbrown-700 uppercase tracking-wider block">
              Doll Size
            </label>
            <div className="flex flex-wrap gap-2 text-xs">
              {['All', 'Mini', 'Medium', 'Giant'].map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`px-3 py-1.5 rounded-full font-semibold transition-all ${
                    selectedSize === sz
                      ? 'bg-warmbrown-800 text-white'
                      : 'bg-peach-50 text-warmbrown-800 hover:bg-peach-100 border border-peach-200'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Filter 4: Price Slider */}
          <div className="space-y-2 pt-3 border-t border-peach-100">
            <div className="flex items-center justify-between text-xs font-bold text-warmbrown-700">
              <span className="uppercase tracking-wider">Max Price</span>
              <span className="text-warmbrown-800">${maxPrice.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="15"
              max="65"
              step="5"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-warmbrown-700 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-warmbrown-500">
              <span>$15.00</span>
              <span>$65.00</span>
            </div>
          </div>
        </aside>

        {/* Right Main Grid Section */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Sort Bar & Active Tags */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-peach-200/80 shadow-xs">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-warmbrown-500">Active:</span>
              {selectedCategory !== 'All' && (
                <span className="bg-peach-100 text-warmbrown-800 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                  {selectedCategory}
                  <X size={12} className="cursor-pointer transition-transform duration-300 hover:rotate-90" onClick={() => setSelectedCategory('All')} />
                </span>
              )}
              {selectedYarnType !== 'All' && (
                <span className="bg-peach-100 text-warmbrown-800 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                  {selectedYarnType}
                  <X size={12} className="cursor-pointer transition-transform duration-300 hover:rotate-90" onClick={() => setSelectedYarnType('All')} />
                </span>
              )}
              {selectedSize !== 'All' && (
                <span className="bg-peach-100 text-warmbrown-800 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                  {selectedSize} Size
                  <X size={12} className="cursor-pointer transition-transform duration-300 hover:rotate-90" onClick={() => setSelectedSize('All')} />
                </span>
              )}
              {selectedCategory === 'All' && selectedYarnType === 'All' && selectedSize === 'All' && (
                <span className="text-warmbrown-400 italic">No extra filters</span>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs self-end sm:self-auto">
              <label className="font-bold text-warmbrown-700 shrink-0">Sort By:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-peach-50 border border-peach-200 rounded-xl px-3 py-1.5 text-xs text-warmbrown-800 font-semibold outline-none focus:border-warmbrown-500 cursor-pointer"
              >
                <option value="featured">Featured / Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest Additions</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-peach-200 space-y-4">
              <span className="text-6xl block">🧶</span>
              <h3 className="text-xl font-bold text-warmbrown-800">No Yarn Dolls Found</h3>
              <p className="text-xs text-warmbrown-600 max-w-sm mx-auto">
                We couldn&apos;t find any dolls matching your active filters. Try clearing some criteria or request a custom doll!
              </p>
              <button
                onClick={resetFilters}
                className="bg-warmbrown-800 text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-warmbrown-900 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CollectionsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-warmbrown-700">Loading collection...</div>}>
      <CollectionsContent />
    </Suspense>
  );
}
