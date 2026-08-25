'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Loader2, Search } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { CustomSelect } from '@/components/CustomSelect';
import { StaggeredGrid } from '@/components/motion/StaggeredGrid';
import { apiRequest } from '@/lib/api';
import { CatalogProduct, CatalogTheme, toCatalogProduct, toCatalogTheme } from '@/lib/catalog';

const CATALOG_PAGE_SIZE = 12;
const MAX_CATALOG_PRICE = 5000;

interface CatalogResponse {
  products: CatalogProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface CatalogParams {
  productType: string;
  theme: string;
  yarnType: string;
  size: string;
  minPrice: number | null;
  maxPrice: number | null;
  sort: string;
  page: number;
  search: string;
  specialFilter: string;
}

function urlPrice(value: string | null): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : MAX_CATALOG_PRICE;
}

function urlPage(value: string | null): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function CollectionsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeQuery, setActiveQuery] = useState(() => searchParams.toString());

  // Keep state in sync with URL changes & show circular loading bar instantly
  useEffect(() => {
    setIsCatalogLoading(true);
    setActiveQuery(searchParams.toString());
  }, [searchParams]);

  const activeSearchParams = useMemo(() => new URLSearchParams(activeQuery), [activeQuery]);

  const catalogParams = useMemo<CatalogParams>(() => {
    const minP = activeSearchParams.get('minPrice');
    const maxP = activeSearchParams.get('maxPrice');
    return {
      productType: activeSearchParams.get('productType') || 'All',
      theme: activeSearchParams.get('theme') || activeSearchParams.get('category') || 'All',
      yarnType: activeSearchParams.get('yarnType') || 'All',
      size: activeSearchParams.get('size') || 'All',
      minPrice: minP ? Number(minP) : null,
      maxPrice: maxP ? Number(maxP) : null,
      sort: activeSearchParams.get('sort') || 'featured',
      page: urlPage(activeSearchParams.get('page')),
      search: activeSearchParams.get('search') || '',
      specialFilter: activeSearchParams.get('filter') || '',
    };
  }, [activeSearchParams]);

  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [designThemesList, setDesignThemesList] = useState<CatalogTheme[]>([]);
  const [pagination, setPagination] = useState<CatalogResponse['pagination']>({
    page: 1,
    limit: CATALOG_PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [hasInitialFetched, setHasInitialFetched] = useState(false);
  const [catalogError, setCatalogError] = useState(false);
  const [catalogRetry, setCatalogRetry] = useState(0);
  const [searchInput, setSearchInput] = useState(catalogParams.search);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout>>();

  const updateCatalogParams = useCallback((updates: Record<string, string | number | null | undefined>, replace = false) => {
    const nextParams = new URLSearchParams(activeQuery);
    const isChangingPage = Object.prototype.hasOwnProperty.call(updates, 'page');

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '' || value === 'All') {
        nextParams.delete(key);
      } else {
        nextParams.set(key, String(value));
      }
    });

    if (!isChangingPage) {
      nextParams.delete('page');
    }

    const nextQueryString = nextParams.toString();
    setActiveQuery(nextQueryString);
    const targetUrl = nextQueryString ? `${pathname}?${nextQueryString}` : pathname;

    if (replace) {
      router.replace(targetUrl, { scroll: false });
    } else {
      router.push(targetUrl, { scroll: false });
    }
  }, [activeQuery, pathname, router]);

  // Keep search input state aligned with URL state
  useEffect(() => {
    setSearchInput(catalogParams.search);
  }, [catalogParams.search]);

  // Fetch themes for top navigation tabs
  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const data = await apiRequest<Array<Omit<CatalogTheme, 'id' | 'badgeColor' | 'bgColor'>>>('/design-themes');
        setDesignThemesList(data.map((theme, index) => toCatalogTheme(theme, index)));
      } catch {
        setDesignThemesList([]);
      }
    };
    void fetchThemes();
  }, []);

  const selectedPriceKey = useMemo(() => {
    if (catalogParams.minPrice === 500) return 'above-500';
    if (catalogParams.maxPrice === 250) return 'under-250';
    if (catalogParams.maxPrice === 500) return 'under-500';
    return 'all';
  }, [catalogParams.minPrice, catalogParams.maxPrice]);

  const handlePriceOptionChange = useCallback((key: string) => {
    if (key === 'under-250') {
      updateCatalogParams({ minPrice: null, maxPrice: 250 });
    } else if (key === 'under-500') {
      updateCatalogParams({ minPrice: null, maxPrice: 500 });
    } else if (key === 'above-500') {
      updateCatalogParams({ minPrice: 500, maxPrice: null });
    } else {
      updateCatalogParams({ minPrice: null, maxPrice: null });
    }
  }, [updateCatalogParams]);

  const productRequestQuery = useMemo(() => {
    const params = new URLSearchParams({
      page: String(catalogParams.page),
      limit: String(CATALOG_PAGE_SIZE),
      sort: catalogParams.sort,
    });
    if (catalogParams.minPrice !== null) {
      params.set('minPrice', String(catalogParams.minPrice));
    }
    if (catalogParams.maxPrice !== null) {
      params.set('maxPrice', String(catalogParams.maxPrice));
    }
    if (catalogParams.search) params.set('search', catalogParams.search);
    if (catalogParams.productType !== 'All') params.set('productType', catalogParams.productType);
    if (catalogParams.theme !== 'All') params.set('designTheme', catalogParams.theme);
    if (catalogParams.yarnType !== 'All') params.set('yarnType', catalogParams.yarnType);
    if (catalogParams.size !== 'All') params.set('size', catalogParams.size);
    if (catalogParams.specialFilter === 'best-seller') params.set('bestSeller', 'true');
    return params.toString();
  }, [catalogParams]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchProducts = async () => {
      setIsCatalogLoading(true);
      setCatalogError(false);
      try {
        const response = await apiRequest<{
          products: Record<string, unknown>[];
          pagination: CatalogResponse['pagination'];
        }>(`/products?${productRequestQuery}`, { signal: controller.signal });

        if (controller.signal.aborted) return;

        setProducts(response.products.map((item) => toCatalogProduct(item as unknown as Parameters<typeof toCatalogProduct>[0])));
        setPagination(response.pagination);
        setHasInitialFetched(true);
      } catch (error) {
        if (!controller.signal.aborted && (error as { name?: string }).name !== 'AbortError') {
          setCatalogError(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsCatalogLoading(false);
        }
      }
    };

    void fetchProducts();
    return () => controller.abort();
  }, [catalogRetry, productRequestQuery]);

  const hasActiveFilters =
    catalogParams.productType !== 'All' ||
    catalogParams.theme !== 'All' ||
    catalogParams.yarnType !== 'All' ||
    catalogParams.size !== 'All' ||
    catalogParams.search !== '' ||
    catalogParams.minPrice !== null ||
    catalogParams.maxPrice !== null;

  const resetFilters = () => {
    setSearchInput('');
    updateCatalogParams({
      productType: null,
      theme: null,
      category: null,
      yarnType: null,
      size: null,
      search: null,
      minPrice: null,
      maxPrice: null,
      sort: null,
      page: null,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 1. Header Headline */}
      <div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-warmbrown-800 dark:text-peach-100 tracking-tight">
          Our Collections
        </h1>
      </div>

      {/* 2. Top Filter Controls (3 Input Columns: Search, Price, Sort) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* Search Input */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs font-bold text-warmbrown-700 dark:text-peach-200">
            <span>Search</span>
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  updateCatalogParams({ search: null });
                }}
                className="text-[11px] text-warmbrown-500 dark:text-peach-300 hover:text-warmbrown-800 dark:hover:text-peach-100 underline"
              >
                Clear
              </button>
            )}
          </div>
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                searchDebounceRef.current = setTimeout(() => {
                  updateCatalogParams({ search: e.target.value.trim() || null });
                }, 350);
              }}
              placeholder="Enter product name..."
              className="w-full bg-white dark:bg-[#1F1610] border border-peach-200 dark:border-warmbrown-800 rounded-xl px-3.5 py-2.5 text-xs text-warmbrown-900 dark:text-peach-100 placeholder-warmbrown-400 dark:placeholder-warmbrown-500 outline-none focus:border-warmbrown-600 dark:focus:border-peach-300 shadow-xs"
            />
            <Search size={14} className="absolute right-3.5 text-warmbrown-400 dark:text-peach-300/60 pointer-events-none" />
          </div>
        </div>

        {/* Price Filter Dropdown */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs font-bold text-warmbrown-700 dark:text-peach-200">
            <span>Price</span>
            {selectedPriceKey !== 'all' && (
              <button
                type="button"
                onClick={() => updateCatalogParams({ minPrice: null, maxPrice: null })}
                className="text-[11px] text-warmbrown-500 dark:text-peach-300 hover:text-warmbrown-800 dark:hover:text-peach-100 underline"
              >
                Clear
              </button>
            )}
          </div>
          <CustomSelect
            value={selectedPriceKey}
            onChange={(val) => handlePriceOptionChange(String(val))}
            options={[
              { value: 'all', label: 'All Prices' },
              { value: 'under-250', label: 'Under ₹250' },
              { value: 'under-500', label: 'Under ₹500' },
              { value: 'above-500', label: 'Above ₹500' },
            ]}
          />
        </div>

        {/* Sort By Dropdown */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs font-bold text-warmbrown-700 dark:text-peach-200">
            <span>Sort By</span>
            {catalogParams.sort !== 'featured' && (
              <button
                type="button"
                onClick={() => updateCatalogParams({ sort: null })}
                className="text-[11px] text-warmbrown-500 dark:text-peach-300 hover:text-warmbrown-800 dark:hover:text-peach-100 underline"
              >
                Clear
              </button>
            )}
          </div>
          <CustomSelect
            value={catalogParams.sort}
            onChange={(val) => updateCatalogParams({ sort: String(val) === 'featured' ? null : String(val) })}
            options={[
              { value: 'featured', label: 'Featured / Popular' },
              { value: 'price-low', label: 'Price: Low to High' },
              { value: 'price-high', label: 'Price: High to Low' },
              { value: 'rating', label: 'Highest Rated' },
              { value: 'newest', label: 'Newest Additions' },
            ]}
          />
        </div>
      </div>

      {/* 3. Horizontal Category Navigation Tabs Bar */}
      <div className="border-b border-peach-200 dark:border-warmbrown-800 overflow-x-auto scrollbar-none flex items-center gap-6 sm:gap-10 text-xs font-bold uppercase tracking-wider pt-2">
        <button
          type="button"
          onClick={() => updateCatalogParams({ theme: null, category: null, productType: null })}
          className={`pb-3.5 whitespace-nowrap transition-colors border-b-2 ${
            catalogParams.theme === 'All' && catalogParams.productType === 'All'
              ? 'border-warmbrown-800 dark:border-peach-300 text-warmbrown-900 dark:text-peach-100 font-extrabold'
              : 'border-transparent text-warmbrown-500 dark:text-peach-300/60 hover:text-warmbrown-800 dark:hover:text-peach-100'
          }`}
        >
          All Collections ({pagination.total})
        </button>

        {designThemesList.map((theme) => (
          <button
            key={theme._id || theme.id}
            type="button"
            onClick={() => updateCatalogParams({ theme: theme.name })}
            className={`pb-3.5 whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
              catalogParams.theme === theme.name
                ? 'border-warmbrown-800 dark:border-peach-300 text-warmbrown-900 dark:text-peach-100 font-extrabold'
                : 'border-transparent text-warmbrown-500 dark:text-peach-300/60 hover:text-warmbrown-800 dark:hover:text-peach-100'
            }`}
          >
            <span>{theme.icon}</span>
            <span>{theme.name}</span>
          </button>
        ))}
      </div>

      {/* 4. Active Filters Reset Bar (If filters applied) */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between bg-peach-50 dark:bg-[#1F1610] p-3 px-4 rounded-xl border border-peach-200 dark:border-warmbrown-800 text-xs">
          <div className="flex items-center gap-2 text-warmbrown-700 dark:text-peach-200 font-medium">
            <span>Filtering by:</span>
            {catalogParams.theme !== 'All' && <span className="font-bold bg-white dark:bg-warmbrown-900 px-2 py-0.5 rounded border border-peach-200 dark:border-warmbrown-800">{catalogParams.theme}</span>}
            {catalogParams.search && <span className="font-bold bg-white dark:bg-warmbrown-900 px-2 py-0.5 rounded border border-peach-200 dark:border-warmbrown-800">“{catalogParams.search}”</span>}
            {selectedPriceKey !== 'all' && (
              <span className="font-bold bg-white dark:bg-warmbrown-900 px-2 py-0.5 rounded border border-peach-200 dark:border-warmbrown-800">
                {selectedPriceKey === 'under-250' && 'Under ₹250'}
                {selectedPriceKey === 'under-500' && 'Under ₹500'}
                {selectedPriceKey === 'above-500' && 'Above ₹500'}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="text-rose-600 dark:text-rose-400 font-bold hover:underline"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* 5. Product Grid & Empty State */}
      {catalogError ? (
        <div className="bg-white dark:bg-[#1F1610] rounded-3xl p-12 text-center border border-peach-200 dark:border-warmbrown-800 space-y-4">
          <h3 className="text-xl font-bold text-warmbrown-800 dark:text-peach-100">Unable to load products.</h3>
          <button
            type="button"
            onClick={() => setCatalogRetry((v) => v + 1)}
            className="bg-warmbrown-800 dark:bg-warmbrown-700 text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-warmbrown-900 transition-colors shadow-sm"
          >
            Try Again
          </button>
        </div>
      ) : isCatalogLoading || !hasInitialFetched ? (
        <div className="bg-white dark:bg-[#1F1610] rounded-3xl p-16 text-center border border-peach-200 dark:border-warmbrown-800 flex flex-col items-center justify-center gap-3 min-h-[300px] my-6 shadow-xs animate-in fade-in duration-200">
          <Loader2 size={36} className="animate-spin text-warmbrown-600 dark:text-peach-300" />
          <p className="text-sm font-semibold text-warmbrown-700 dark:text-peach-200">Loading catalog items...</p>
        </div>
      ) : products.length > 0 ? (
        <div className="space-y-8">
          <StaggeredGrid key={productRequestQuery} className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 ${isCatalogLoading ? 'opacity-60' : ''}`}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </StaggeredGrid>

          {/* Pagination Navigation Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => updateCatalogParams({ page: catalogParams.page - 1 })}
                disabled={catalogParams.page <= 1 || isCatalogLoading}
                className="inline-flex items-center gap-1 rounded-full border border-peach-200 dark:border-warmbrown-800 bg-white dark:bg-[#1F1610] px-4 py-2 text-xs font-bold text-warmbrown-700 dark:text-peach-200 hover:bg-peach-50 dark:hover:bg-warmbrown-900 transition-colors disabled:opacity-50"
              >
                <ChevronLeft size={15} /> Previous
              </button>

              <span className="text-xs font-bold text-warmbrown-700 dark:text-peach-200">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                type="button"
                onClick={() => updateCatalogParams({ page: catalogParams.page + 1 })}
                disabled={catalogParams.page >= pagination.totalPages || isCatalogLoading}
                className="inline-flex items-center gap-1 rounded-full border border-peach-200 dark:border-warmbrown-800 bg-white dark:bg-[#1F1610] px-4 py-2 text-xs font-bold text-warmbrown-700 dark:text-peach-200 hover:bg-peach-50 dark:hover:bg-warmbrown-900 transition-colors disabled:opacity-50"
              >
                Next <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>
      ) : hasActiveFilters ? (
        /* Empty State Safeguard when filters match 0 products */
        <div className="bg-white dark:bg-[#1F1610] rounded-3xl p-12 text-center border border-peach-200 dark:border-warmbrown-800 space-y-4 my-6 shadow-xs">
          <span className="text-6xl block">🧶</span>
          <h3 className="text-xl font-extrabold text-warmbrown-800 dark:text-peach-100">
            No products found matching active filters
          </h3>
          <p className="text-xs sm:text-sm text-warmbrown-600 dark:text-peach-200/70 max-w-md mx-auto leading-relaxed">
            {catalogParams.search ? (
              <>No items match search term <span className="font-bold text-warmbrown-800 dark:text-peach-100">“{catalogParams.search}”</span> under category <span className="font-bold text-warmbrown-800 dark:text-peach-100">{catalogParams.theme}</span>.</>
            ) : (
              <>No items found in <span className="font-bold text-warmbrown-800 dark:text-peach-100">{catalogParams.theme}</span> matching your price filter.</>
            )}
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={resetFilters}
              className="bg-warmbrown-800 dark:bg-warmbrown-700 hover:bg-warmbrown-900 text-white px-7 py-3 rounded-full text-xs font-bold transition-colors shadow-md"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1F1610] rounded-3xl p-16 text-center border border-peach-200 dark:border-warmbrown-800 flex flex-col items-center justify-center gap-3 min-h-[300px] my-6 shadow-xs animate-in fade-in duration-200">
          <Loader2 size={36} className="animate-spin text-warmbrown-600 dark:text-peach-300" />
          <p className="text-sm font-semibold text-warmbrown-700 dark:text-peach-200">Loading catalog items...</p>
        </div>
      )}
    </div>
  );
}

export default function CollectionsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white dark:bg-[#1F1610] rounded-3xl p-16 text-center border border-peach-200 dark:border-warmbrown-800 flex flex-col items-center justify-center gap-3 min-h-[300px] my-6 shadow-xs animate-in fade-in duration-200">
            <Loader2 size={36} className="animate-spin text-warmbrown-600 dark:text-peach-300" />
            <p className="text-sm font-semibold text-warmbrown-700 dark:text-peach-200">Loading catalog items...</p>
          </div>
        </div>
      }
    >
      <CollectionsContent />
    </Suspense>
  );
}
