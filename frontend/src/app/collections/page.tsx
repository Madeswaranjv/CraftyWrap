'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Search, LayoutGrid, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { Pagination } from '@/components/ui/pagination';
import { ProductCard } from '@/components/ProductCard';
import { ProductGridSkeleton } from '@/components/skeletons/ProductGridSkeleton';
import { CustomSelect } from '@/components/CustomSelect';
import { StaggeredGrid } from '@/components/motion/StaggeredGrid';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { apiRequest } from '@/lib/api';
import { CatalogProduct, CatalogTheme, toCatalogProduct, toCatalogTheme } from '@/lib/catalog';
import { cn } from '@/lib/utils';

const CATALOG_PAGE_SIZE = 15;
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    <div className="w-full px-2 sm:px-4 lg:px-6 py-6">
      <div className="flex flex-col md:flex-row gap-4 lg:gap-6 items-start">
        {/* Left Animated Sidebar */}
        <Sidebar open={isSidebarOpen} setOpen={setIsSidebarOpen}>
          <SidebarBody className="justify-between gap-4 max-h-[calc(100vh-6rem)] sticky top-20">
            <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden pr-1 scrollbar-hover-only">
              <div className="flex items-center gap-2.5 px-2 py-2 mb-2 border-b border-peach-100 dark:border-warmbrown-900/60 pb-3">
                <LayoutGrid className="w-5 h-5 text-warmbrown-700 dark:text-peach-300 shrink-0" />
                {isSidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col"
                  >
                    <span className="font-extrabold text-sm text-warmbrown-900 dark:text-peach-100">
                      Collections
                    </span>
                    <span className="text-[10px] text-warmbrown-500 dark:text-peach-300/60 uppercase tracking-widest font-mono">
                      Design Themes
                    </span>
                  </motion.div>
                )}
              </div>

              <div className="flex flex-col gap-1">
                {/* All Collections Link */}
                {(() => {
                  const isAllSelected = catalogParams.theme === 'All' && catalogParams.productType === 'All';
                  return (
                    <SidebarLink
                      link={{
                        label: "All Collections",
                        icon: (
                          <Layers
                            className={cn(
                              "w-4 h-4 shrink-0 transition-colors",
                              isAllSelected ? "text-white" : "text-warmbrown-800 dark:text-peach-100"
                            )}
                          />
                        ),
                        isActive: isAllSelected,
                        count: pagination.total,
                        onClick: () => updateCatalogParams({ theme: null, category: null, productType: null }),
                      }}
                    />
                  );
                })()}

                {/* Themes List */}
                {designThemesList.map((theme) => (
                  <SidebarLink
                    key={theme._id || theme.id}
                    link={{
                      label: theme.name,
                      icon: (
                        theme.icon?.startsWith('data:image') || theme.icon?.startsWith('http') || theme.icon?.startsWith('/') ? (
                          <img src={theme.icon} alt={theme.name} className="h-4 w-4 object-contain rounded shrink-0" />
                        ) : (
                          <span className="text-sm shrink-0 leading-none">{theme.icon || '🧶'}</span>
                        )
                      ),
                      isActive: catalogParams.theme === theme.name,
                      count: theme.itemCount,
                      onClick: () => updateCatalogParams({ theme: theme.name }),
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Bottom Info / Quick Reset */}
            {hasActiveFilters && (
              <div className="border-t border-peach-100 dark:border-warmbrown-900/60 pt-3 px-1">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="w-full text-xs font-bold py-2 px-3 rounded-xl bg-peach-100/70 hover:bg-peach-200 text-warmbrown-800 dark:bg-warmbrown-900 dark:hover:bg-warmbrown-800 dark:text-peach-200 transition-colors text-center"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </SidebarBody>
        </Sidebar>

        {/* Right Main Content */}
        <div className="flex-1 w-full min-w-0 space-y-6">
          {/* 1. Header Headline */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-warmbrown-800 dark:text-peach-100 tracking-tight">
              Our Collections
            </h1>
            <p className="text-xs sm:text-sm text-warmbrown-600 dark:text-peach-200/70 mt-1">
              Handmade yarn dolls, keychains, and plush accessories crafted with love.
            </p>
          </div>

          {/* 2. Top Filter Controls (3 Input Columns: Search, Price, Sort) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
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
                  data-search-box
                  className="search-box w-full bg-white dark:bg-[#1F1610] border border-peach-200 dark:border-warmbrown-800 rounded-xl px-3.5 py-2.5 text-xs text-warmbrown-900 dark:text-peach-100 placeholder-warmbrown-400 dark:placeholder-warmbrown-500 outline-none focus:border-warmbrown-600 dark:focus:border-peach-300 shadow-xs"
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

          {/* 3. Active Filters Reset Bar (If filters applied) */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between bg-peach-50 dark:bg-[#1F1610] p-3 px-4 rounded-xl border border-peach-200 dark:border-warmbrown-800 text-xs">
              <div className="flex items-center gap-2 text-warmbrown-700 dark:text-peach-200 font-medium">
                <span>Filtering by:</span>
                {catalogParams.theme !== 'All' && <span className="font-bold bg-white dark:bg-warmbrown-900 px-2 py-0.5 rounded border border-peach-200 dark:border-warmbrown-800">{catalogParams.theme}</span>}
                {catalogParams.search && <span className="font-bold bg-white dark:bg-warmbrown-900 px-2 py-0.5 rounded border border-peach-200 dark:border-warmbrown-800">“{catalogParams.search}”</span>}
                {selectedPriceKey !== 'all' && (
                  <span className="font-bold bg-white dark:bg-warmbrown-900 px-2 py-0.5 rounded border border-peach-200 dark:border-warmbrown-800">
                    {selectedPriceKey === 'under-250' ? 'Under ₹250' : selectedPriceKey === 'under-500' ? 'Under ₹500' : 'Above ₹500'}
                  </span>
                )}
                {catalogParams.sort !== 'featured' && (
                  <span className="font-bold bg-white dark:bg-warmbrown-900 px-2 py-0.5 rounded border border-peach-200 dark:border-warmbrown-800">
                    Sort: {catalogParams.sort}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="font-bold text-warmbrown-800 dark:text-peach-100 hover:text-warmbrown-600 dark:hover:text-peach-300 underline"
              >
                Clear All
              </button>
            </div>
          )}

          {/* 4. Products Catalog Grid or States */}
          {catalogError ? (
            <div className="text-center py-20 space-y-4 bg-white dark:bg-[#1F1610] rounded-3xl border border-peach-200 dark:border-warmbrown-800 p-8 shadow-sm">
              <div className="w-16 h-16 bg-peach-100 dark:bg-warmbrown-900 rounded-full flex items-center justify-center text-warmbrown-600 dark:text-peach-300 mx-auto text-2xl font-bold">
                ⚠️
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-warmbrown-800 dark:text-peach-100">Unable to load dolls</h3>
                <p className="text-xs text-warmbrown-600 dark:text-peach-200/70 max-w-sm mx-auto">
                  We encountered a connection issue while loading the catalog. Please try again.
                </p>
              </div>
              <button
                onClick={() => setCatalogRetry((r) => r + 1)}
                className="bg-warmbrown-800 hover:bg-warmbrown-900 text-white px-6 py-2.5 rounded-full text-xs font-bold transition-colors shadow-xs"
              >
                Retry
              </button>
            </div>
          ) : isCatalogLoading ? (
            <ProductGridSkeleton
              count={10}
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-4 sm:gap-5"
            />
          ) : products.length > 0 ? (
            <StaggeredGrid className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-4 sm:gap-5">
              {products.map((product) => (
                <ProductCard key={product.id || product.slug} product={product} />
              ))}
            </StaggeredGrid>
          ) : hasInitialFetched ? (
            <div className="text-center py-20 space-y-4 bg-white dark:bg-[#1F1610] rounded-3xl border border-peach-200 dark:border-warmbrown-800 p-8 shadow-sm">
              <div className="w-16 h-16 bg-peach-100 dark:bg-warmbrown-900 rounded-full flex items-center justify-center text-warmbrown-600 dark:text-peach-300 mx-auto text-2xl font-bold">
                🧶
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-warmbrown-800 dark:text-peach-100">No dolls match your criteria</h3>
                <p className="text-xs text-warmbrown-600 dark:text-peach-200/70 max-w-sm mx-auto">
                  Try adjusting your filters, selecting a different theme, or clearing your search term.
                </p>
              </div>
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
            <ProductGridSkeleton
              count={10}
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-4 sm:gap-5"
            />
          )}

          {/* 5. Pagination Navigation Controls - PERSISTENT AT ALL TIMES */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center pt-6 pb-2">
              <Pagination
                count={pagination.totalPages}
                page={catalogParams.page}
                onPageChange={(nextPage) => updateCatalogParams({ page: nextPage })}
                label="Product catalog pagination"
              />
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <div className="h-10 w-64 bg-warmbrown-200/50 dark:bg-warmbrown-800/50 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="h-12 bg-white dark:bg-[#1F1610] border border-peach-200/60 dark:border-warmbrown-900/80 animate-pulse" />
            <div className="h-12 bg-white dark:bg-[#1F1610] border border-peach-200/60 dark:border-warmbrown-900/80 animate-pulse" />
            <div className="h-12 bg-white dark:bg-[#1F1610] border border-peach-200/60 dark:border-warmbrown-900/80 animate-pulse" />
          </div>
          <ProductGridSkeleton count={8} />
        </div>
      }
    >
      <CollectionsContent />
    </Suspense>
  );
}
