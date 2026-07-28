'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/ProductCard';
import { Filter, SlidersHorizontal, X, RotateCcw } from 'lucide-react';
import { FadeInSection } from '@/components/motion/FadeInSection';
import { StaggeredGrid } from '@/components/motion/StaggeredGrid';
import { apiRequest } from '@/lib/api';
import { CatalogProduct, CatalogProductType, CatalogTheme, toCatalogProduct, toCatalogTheme } from '@/lib/catalog';

function CollectionsContent() {
  const searchParams = useSearchParams();
  const productTypeParam = searchParams.get('productType') || 'All';
  const themeParam = searchParams.get('theme') || searchParams.get('category') || 'All';
  const yarnTypeParam = searchParams.get('yarnType') || 'All';
  const sizeParam = searchParams.get('size') || 'All';
  const searchParam = searchParams.get('search') || '';
  const filterParam = searchParams.get('filter') || '';

  const [productsList, setProductsList] = useState<CatalogProduct[]>([]);
  const [productTypesList, setProductTypesList] = useState<CatalogProductType[]>([]);
  const [designThemesList, setDesignThemesList] = useState<CatalogTheme[]>([]);

  const [selectedProductType, setSelectedProductType] = useState<string>(productTypeParam);
  const [selectedTheme, setSelectedTheme] = useState<string>(themeParam);
  const [selectedYarnType, setSelectedYarnType] = useState<string>(yarnTypeParam);
  const [selectedSize, setSelectedSize] = useState<string>(sizeParam);
  const [maxPrice, setMaxPrice] = useState<number>(65);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  useEffect(() => {
    let isCurrent = true;
    const fetchCatalogData = async () => {
      try {
        const [productsRes, productTypesRes, designThemesRes] = await Promise.all([
          apiRequest<{ products: CatalogProduct[] }>('/products?limit=100'),
          apiRequest<CatalogProductType[]>('/product-types'),
          apiRequest<Omit<CatalogTheme, 'id' | 'badgeColor' | 'bgColor'>[]>('/design-themes'),
        ]);
        if (!isCurrent) return;
        setProductsList(productsRes.products.map(toCatalogProduct));
        setProductTypesList(productTypesRes);
        setDesignThemesList(designThemesRes.map((t, idx) => toCatalogTheme(t, idx)));
      } catch {
        // Handle error
      }
    };
    void fetchCatalogData();
    return () => { isCurrent = false; };
  }, []);

  // Core Faceted Filter Evaluator
  const matchesFilter = (
    product: CatalogProduct,
    overrides?: {
      productType?: string;
      designTheme?: string;
      yarnType?: string;
      size?: string;
      maxPrice?: number;
      search?: string;
      specialFilter?: string;
    }
  ) => {
    const pType = overrides?.productType !== undefined ? overrides.productType : selectedProductType;
    const theme = overrides?.designTheme !== undefined ? overrides.designTheme : selectedTheme;
    const yarn = overrides?.yarnType !== undefined ? overrides.yarnType : selectedYarnType;
    const sz = overrides?.size !== undefined ? overrides.size : selectedSize;
    const price = overrides?.maxPrice !== undefined ? overrides.maxPrice : maxPrice;
    const search = overrides?.search !== undefined ? overrides.search : searchParam;
    const filter = overrides?.specialFilter !== undefined ? overrides.specialFilter : filterParam;

    // 1. Product Type Match
    if (pType !== 'All' && product.productType !== pType) {
      return false;
    }

    // 2. Design & Theme Match
    if (theme !== 'All' && product.designTheme !== theme && product.category !== theme) {
      return false;
    }

    // 3. Yarn Material Match
    if (yarn !== 'All' && product.yarnType !== yarn) {
      return false;
    }

    // 4. Size Match
    if (sz !== 'All' && !product.size.startsWith(sz)) {
      return false;
    }

    // 5. Price Match
    if (product.price > price) {
      return false;
    }

    // 6. Search Query Match
    if (search) {
      const q = search.toLowerCase();
      const nameMatch = product.name.toLowerCase().includes(q);
      const descMatch = product.description.toLowerCase().includes(q);
      const typeMatch = (product.productType || '').toLowerCase().includes(q);
      const themeMatch = (product.designTheme || product.category || '').toLowerCase().includes(q);
      if (!nameMatch && !descMatch && !typeMatch && !themeMatch) {
        return false;
      }
    }

    // 7. Special Filter Params
    if (filter === 'best-seller' && !product.isBestSeller) {
      return false;
    }
    if (filter === 'featured' && product.rating < 4.8) {
      return false;
    }

    return true;
  };

  // Filtered product dataset
  const filteredProducts = useMemo(() => {
    return productsList.filter((product) => matchesFilter(product)).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
    });
  }, [
    productsList,
    selectedProductType,
    selectedTheme,
    selectedYarnType,
    selectedSize,
    maxPrice,
    searchParam,
    filterParam,
    sortBy,
  ]);

  // Dynamic Faceted Search Counts next to each filter option
  const facetedCounts = useMemo(() => {
    const productTypeCounts: Record<string, number> = { All: 0 };
    productTypesList.forEach((pt) => {
      productTypeCounts[pt.name] = 0;
    });

    const themeCounts: Record<string, number> = { All: 0 };
    designThemesList.forEach((dt) => {
      themeCounts[dt.name] = 0;
    });

    const yarnCounts: Record<string, number> = { All: 0 };
    ['Velvet Chenille', 'Milk Cotton', 'Chunky Wool', 'Organic Bamboo'].forEach((y) => {
      yarnCounts[y] = 0;
    });

    const sizeCounts: Record<string, number> = { All: 0 };
    ['Mini', 'Medium', 'Giant'].forEach((s) => {
      sizeCounts[s] = 0;
    });

    productsList.forEach((product) => {
      // Product Type Facet
      if (matchesFilter(product, { productType: 'All' })) {
        productTypeCounts.All += 1;
        if (productTypeCounts[product.productType] !== undefined) {
          productTypeCounts[product.productType] += 1;
        }
      }

      // Design Theme Facet
      if (matchesFilter(product, { designTheme: 'All' })) {
        themeCounts.All += 1;
        const themeName = product.designTheme || product.category;
        if (themeCounts[themeName] !== undefined) {
          themeCounts[themeName] += 1;
        }
      }

      // Yarn Type Facet
      if (matchesFilter(product, { yarnType: 'All' })) {
        yarnCounts.All += 1;
        if (yarnCounts[product.yarnType] !== undefined) {
          yarnCounts[product.yarnType] += 1;
        }
      }

      // Size Facet
      if (matchesFilter(product, { size: 'All' })) {
        sizeCounts.All += 1;
        const matchingSize = ['Mini', 'Medium', 'Giant'].find((s) =>
          product.size.startsWith(s)
        );
        if (matchingSize && sizeCounts[matchingSize] !== undefined) {
          sizeCounts[matchingSize] += 1;
        }
      }
    });

    return { productTypeCounts, themeCounts, yarnCounts, sizeCounts };
  }, [
    productsList,
    productTypesList,
    designThemesList,
    selectedProductType,
    selectedTheme,
    selectedYarnType,
    selectedSize,
    maxPrice,
    searchParam,
    filterParam,
  ]);

  const resetFilters = () => {
    setSelectedProductType('All');
    setSelectedTheme('All');
    setSelectedYarnType('All');
    setSelectedSize('All');
    setMaxPrice(65);
  };

  const hasActiveFilters =
    selectedProductType !== 'All' ||
    selectedTheme !== 'All' ||
    selectedYarnType !== 'All' ||
    selectedSize !== 'All' ||
    maxPrice < 65;

  const renderFilterSidebar = (isMobile = false) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-peach-100 pb-3">
        <h3 className="font-extrabold text-warmbrown-800 text-base flex items-center gap-2">
          <Filter size={16} /> Filter Products
        </h3>
        <button
          onClick={resetFilters}
          className="text-xs font-semibold text-warmbrown-500 hover:text-warmbrown-800 flex items-center gap-1 transition-colors"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* 1. PRODUCT TYPE FILTER */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-warmbrown-700 uppercase tracking-wider block">
          Product Type
        </label>
        <div className="space-y-1 text-xs max-h-56 overflow-y-auto pr-1">
          <button
            onClick={() => {
              setSelectedProductType('All');
              if (isMobile) setIsMobileFilterOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-colors flex items-center justify-between ${
              selectedProductType === 'All'
                ? 'bg-warmbrown-800 text-white font-bold shadow-xs'
                : 'hover:bg-peach-50 text-warmbrown-700'
            }`}
          >
            <span>All Product Types</span>
            <span className="opacity-80">{facetedCounts.productTypeCounts.All}</span>
          </button>
          {productTypesList.map((pt) => {
            const count = facetedCounts.productTypeCounts[pt.name] || 0;
            return (
              <button
                key={pt._id || pt.name}
                onClick={() => {
                  setSelectedProductType(pt.name);
                  if (isMobile) setIsMobileFilterOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-colors flex items-center justify-between ${
                  selectedProductType === pt.name
                    ? 'bg-warmbrown-800 text-white font-bold shadow-xs'
                    : 'hover:bg-peach-50 text-warmbrown-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{pt.icon ?? '🧶'}</span> {pt.name}
                </span>
                <span className="opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. DESIGN & THEME FILTER */}
      <div className="space-y-2 pt-3 border-t border-peach-100">
        <label className="text-xs font-bold text-warmbrown-700 uppercase tracking-wider block">
          Design & Theme
        </label>
        <div className="space-y-1 text-xs max-h-56 overflow-y-auto pr-1">
          <button
            onClick={() => {
              setSelectedTheme('All');
              if (isMobile) setIsMobileFilterOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-colors flex items-center justify-between ${
              selectedTheme === 'All'
                ? 'bg-warmbrown-800 text-white font-bold shadow-xs'
                : 'hover:bg-peach-50 text-warmbrown-700'
            }`}
          >
            <span>All Themes</span>
            <span className="opacity-80">{facetedCounts.themeCounts.All}</span>
          </button>
          {designThemesList.map((theme) => {
            const count = facetedCounts.themeCounts[theme.name] || 0;
            return (
              <button
                key={theme._id || theme.id}
                onClick={() => {
                  setSelectedTheme(theme.name);
                  if (isMobile) setIsMobileFilterOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-colors flex items-center justify-between ${
                  selectedTheme === theme.name
                    ? 'bg-warmbrown-800 text-white font-bold shadow-xs'
                    : 'hover:bg-peach-50 text-warmbrown-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{theme.icon}</span> {theme.name}
                </span>
                <span className="opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. YARN MATERIAL FILTER */}
      <div className="space-y-2 pt-3 border-t border-peach-100">
        <label className="text-xs font-bold text-warmbrown-700 uppercase tracking-wider block">
          Yarn Material
        </label>
        <div className="space-y-1 text-xs">
          {['All', 'Velvet Chenille', 'Milk Cotton', 'Chunky Wool', 'Organic Bamboo'].map(
            (yarn) => {
              const count = facetedCounts.yarnCounts[yarn] || 0;
              return (
                <button
                  key={yarn}
                  onClick={() => {
                    setSelectedYarnType(yarn);
                    if (isMobile) setIsMobileFilterOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl font-medium transition-colors flex items-center justify-between ${
                    selectedYarnType === yarn
                      ? 'bg-peach-200 text-warmbrown-900 font-bold shadow-xs'
                      : 'hover:bg-peach-50 text-warmbrown-700'
                  }`}
                >
                  <span>{yarn === 'All' ? 'All Materials' : yarn}</span>
                  <span className="opacity-70">{count}</span>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* 4. DOLL SIZE FILTER */}
      <div className="space-y-2 pt-3 border-t border-peach-100">
        <label className="text-xs font-bold text-warmbrown-700 uppercase tracking-wider block">
          Doll Size
        </label>
        <div className="flex flex-wrap gap-2 text-xs">
          {['All', 'Mini', 'Medium', 'Giant'].map((sz) => {
            const count = facetedCounts.sizeCounts[sz] || 0;
            return (
              <button
                key={sz}
                onClick={() => {
                  setSelectedSize(sz);
                  if (isMobile) setIsMobileFilterOpen(false);
                }}
                className={`px-3 py-1.5 rounded-full font-semibold transition-all flex items-center gap-1.5 ${
                  selectedSize === sz
                    ? 'bg-warmbrown-800 text-white shadow-xs'
                    : 'bg-peach-50 text-warmbrown-800 hover:bg-peach-100 border border-peach-200'
                }`}
              >
                <span>{sz}</span>
                <span className="opacity-75 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. PRICE SLIDER FILTER */}
      <div className="space-y-2 pt-3 border-t border-peach-100">
        <div className="flex items-center justify-between text-xs font-bold text-warmbrown-700">
          <span className="uppercase tracking-wider">Max Price</span>
          <span className="text-warmbrown-800">${maxPrice.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="10"
          max="65"
          step="5"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-warmbrown-700 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-warmbrown-500">
          <span>$10.00</span>
          <span>$65.00</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header Banner */}
      <div className="bg-gradient-to-r from-peach-100 via-peach-50 to-white p-6 sm:p-8 rounded-3xl border border-peach-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-warmbrown-800">
            {selectedProductType !== 'All' && selectedTheme !== 'All'
              ? `${selectedTheme} ${selectedProductType}`
              : selectedProductType !== 'All'
              ? `${selectedProductType} Collection`
              : selectedTheme !== 'All'
              ? `${selectedTheme} Handcrafted Items`
              : 'All Handcrafted Collections'}
          </h1>
          <p className="text-xs sm:text-sm text-warmbrown-600">
            Showing {filteredProducts.length} unique artisan crochet products
            {searchParam && ` matching "${searchParam}"`}
          </p>
        </div>

        {/* Mobile Filter Toggle Button */}
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="lg:hidden bg-warmbrown-800 text-white px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm hover:bg-warmbrown-900 transition-colors"
        >
          <SlidersHorizontal size={16} />
          <span>Filters ({filteredProducts.length})</span>
        </button>
      </div>

      {/* Main Listing Grid & Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Left Sidebar */}
        <aside className="hidden lg:block bg-white p-6 rounded-3xl border border-peach-200/80 shadow-soft h-fit sticky top-24">
          {renderFilterSidebar(false)}
        </aside>

        {/* Mobile Filter Drawer Modal */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="w-full max-w-xs bg-white h-full p-6 overflow-y-auto space-y-6 shadow-2xl animate-in slide-in-from-right duration-300 relative">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="absolute top-4 right-4 text-warmbrown-600 hover:text-warmbrown-900 p-1 rounded-full bg-peach-50"
              >
                <X size={20} />
              </button>
              {renderFilterSidebar(true)}
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full bg-warmbrown-800 text-white py-3 rounded-2xl text-xs font-bold shadow-md hover:bg-warmbrown-900 transition-colors"
              >
                Apply Filters ({filteredProducts.length} items)
              </button>
            </div>
          </div>
        )}

        {/* Right Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Active Tags Bar & Sort Dropdown */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-peach-200/80 shadow-xs">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-warmbrown-500">Active:</span>
              {selectedProductType !== 'All' && (
                <span className="bg-peach-100 text-warmbrown-800 px-2.5 py-1 rounded-full font-medium flex items-center gap-1 border border-peach-200">
                  Type: {selectedProductType}
                  <X
                    size={12}
                    className="cursor-pointer hover:rotate-90 transition-transform duration-300"
                    onClick={() => setSelectedProductType('All')}
                  />
                </span>
              )}
              {selectedTheme !== 'All' && (
                <span className="bg-peach-100 text-warmbrown-800 px-2.5 py-1 rounded-full font-medium flex items-center gap-1 border border-peach-200">
                  Theme: {selectedTheme}
                  <X
                    size={12}
                    className="cursor-pointer hover:rotate-90 transition-transform duration-300"
                    onClick={() => setSelectedTheme('All')}
                  />
                </span>
              )}
              {selectedYarnType !== 'All' && (
                <span className="bg-peach-100 text-warmbrown-800 px-2.5 py-1 rounded-full font-medium flex items-center gap-1 border border-peach-200">
                  Yarn: {selectedYarnType}
                  <X
                    size={12}
                    className="cursor-pointer hover:rotate-90 transition-transform duration-300"
                    onClick={() => setSelectedYarnType('All')}
                  />
                </span>
              )}
              {selectedSize !== 'All' && (
                <span className="bg-peach-100 text-warmbrown-800 px-2.5 py-1 rounded-full font-medium flex items-center gap-1 border border-peach-200">
                  Size: {selectedSize}
                  <X
                    size={12}
                    className="cursor-pointer hover:rotate-90 transition-transform duration-300"
                    onClick={() => setSelectedSize('All')}
                  />
                </span>
              )}
              {hasActiveFilters ? (
                <button
                  onClick={resetFilters}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800 underline ml-1"
                >
                  Clear All
                </button>
              ) : (
                <span className="text-warmbrown-400 italic">No extra filters applied</span>
              )}
            </div>

            {/* Sort Dropdown Selector */}
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

          {/* Product Cards Grid */}
          {filteredProducts.length > 0 ? (
            <StaggeredGrid className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </StaggeredGrid>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-peach-200 space-y-4">
              <span className="text-6xl block">🧶</span>
              <h3 className="text-xl font-bold text-warmbrown-800">No Products Found</h3>
              <p className="text-xs text-warmbrown-600 max-w-sm mx-auto">
                We couldn&apos;t find any items matching your active combination of filters. Try clearing some criteria or request a custom order!
              </p>
              <button
                onClick={resetFilters}
                className="bg-warmbrown-800 text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-warmbrown-900 transition-colors shadow-sm"
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
    <Suspense
      fallback={
        <div className="p-12 text-center text-warmbrown-700">Loading collection...</div>
      }
    >
      <CollectionsContent />
    </Suspense>
  );
}
