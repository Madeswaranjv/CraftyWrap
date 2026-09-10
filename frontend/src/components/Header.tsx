'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { apiRequest } from '@/lib/api';
import { CatalogTheme, toCatalogTheme } from '@/lib/catalog';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Wand2,
  ChevronDown,
  LayoutGrid,
  Flame,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { FlowButton } from '@/components/ui/flow-button';

interface AutocompleteItem {
  slug: string;
  name: string;
  productType: string;
  designTheme: string;
  price: number;
}

const DEFAULT_THEMES: { _id: string; id: string; name: string; itemCount: number; icon?: string }[] = [
  { _id: 'anime', id: 'anime', name: 'Anime', itemCount: 2, icon: '/icons/anime.png' },
  { _id: 'vegetables', id: 'vegetables', name: 'Vegetables', itemCount: 8, icon: '🥕' },
  { _id: 'fruits', id: 'fruits', name: 'Fruits', itemCount: 10, icon: '🍓' },
  { _id: 'aquatic-animals', id: 'aquatic-animals', name: 'Aquatic Animals', itemCount: 7, icon: '🐙' },
  { _id: 'wild-animals', id: 'wild-animals', name: 'Wild Animals', itemCount: 9, icon: '🦊' },
  { _id: 'domestic-animals', id: 'domestic-animals', name: 'Domestic Animals', itemCount: 8, icon: '🐱' },
  { _id: 'flowers', id: 'flowers', name: 'Flowers & Plants', itemCount: 9, icon: '🌸' },
  { _id: 'insects', id: 'insects', name: 'Insects', itemCount: 6, icon: '🐝' },
  { _id: 'fantasy', id: 'fantasy', name: 'Fantasy & Mythical', itemCount: 7, icon: '🦄' },
];

const DEFAULT_PRODUCT_TYPES = [
  { id: 'keychains', name: 'Keychains', count: 14 },
  { id: 'dolls', name: 'Dolls & Figurines', count: 12 },
  { id: 'wall-hanging', name: 'Car & Wall Hanging', count: 10 },
  { id: 'bag-charms', name: 'Bag Charms', count: 8 },
  { id: 'hair-bands', name: 'Hair Bands', count: 8 },
  { id: 'pencil-toppers', name: 'Pencil Toppers', count: 6 },
  { id: 'flower-pots', name: 'Flower Pots & Bouquets', count: 9 },
  { id: 'coasters', name: 'Mats & Coasters', count: 6 },
];

export const Header: React.FC = () => {
  const { cartCount, user, logout } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [themes, setThemes] = useState<CatalogTheme[]>([]);
  const [autocompleteResults, setAutocompleteResults] = useState<AutocompleteItem[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const fetchThemes = React.useCallback(async () => {
    try {
      const rawThemes = await apiRequest<Omit<CatalogTheme, 'id' | 'badgeColor' | 'bgColor'>[]>('/design-themes');
      setThemes(rawThemes.map((theme, index) => toCatalogTheme(theme, index)));
    } catch {
      // Fallback gracefully
    }
  }, []);

  useEffect(() => {
    void fetchThemes();
  }, [fetchThemes]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let isCurrent = true;
    if (searchQuery.trim().length < 2) {
      setAutocompleteResults([]);
      setShowAutocomplete(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const results = await apiRequest<AutocompleteItem[]>(`/products/autocomplete?q=${encodeURIComponent(searchQuery.trim())}`);
        if (isCurrent) {
          setAutocompleteResults(results);
          setShowAutocomplete(results.length > 0);
        }
      } catch {
        if (isCurrent) setAutocompleteResults([]);
      }
    }, 250);
    return () => { isCurrent = false; clearTimeout(timer); };
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchOpen(false);
    setShowAutocomplete(false);
    if (searchQuery.trim()) {
      router.push(`/collections?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const allThemes = themes.length > 0 ? themes : DEFAULT_THEMES;
  const filteredThemes = allThemes.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );
  const filteredTypes = DEFAULT_PRODUCT_TYPES.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );


  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#1A120B]/95 backdrop-blur-md border-b border-peach-100 dark:border-warmbrown-900 transition-colors duration-300 shadow-sm">
      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-peach-300 dark:border-warmbrown-700 shadow-sm group-hover:scale-105 transition-transform">
            <Image
              src="/logo.png"
              alt="CraftyWrap Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-warmbrown-800 dark:text-peach-100 leading-tight group-hover:text-warmbrown-600 transition-colors">
              CraftyWrap
            </span>
            <span className="text-[10px] tracking-widest uppercase font-semibold text-warmbrown-500 dark:text-warmbrown-400">
              Unwrap The Joy 🧶
            </span>
          </div>
        </Link>

        {/* Desktop Icon-Only Navbar */}
        <nav className="hidden lg:flex items-center gap-3 text-warmbrown-800 dark:text-peach-100">
          {/* Home Icon *          {/* Home Navigation Icon */}
          <Link
            href="/"
            title="Home"
            className={`nav-icon-btn ${pathname === '/' ? 'nav-icon-active' : ''}`}
          >
            <Image
              src="/home-icon.svg"
              alt="Home"
              width={22}
              height={22}
              className="object-contain"
            />
          </Link>

          {/* Category Dropdown Icon */}
          <div
            className="relative"
            onMouseEnter={() => {
              setIsCategoryDropdownOpen(true);
              void fetchThemes();
            }}
            onMouseLeave={() => setIsCategoryDropdownOpen(false)}
          >
            <Link
              href="/collections"
              title="Collections"
              className={`nav-icon-btn ${pathname.startsWith('/collections') ? 'nav-icon-active' : ''}`}
            >
              <Image
                src="/collections-icon.svg"
                alt="Collections"
                width={22}
                height={22}
                className="object-contain"
              />
            </Link>

            {isCategoryDropdownOpen && (
              <div className="absolute top-full left-0 w-64 bg-white dark:bg-[#1F1610] rounded-2xl shadow-xl border border-peach-100 dark:border-warmbrown-800 p-2 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-warmbrown-400 dark:text-peach-300/60 border-b border-peach-100 dark:border-warmbrown-800 mb-1">
                  Shop By Category
                </div>
                <div className="max-h-[195px] overflow-y-auto pr-1 space-y-0.5 overscroll-contain">
                  {themes.map((theme) => (
                    <Link
                      key={theme._id || theme.id}
                      href={`/collections?category=${encodeURIComponent(theme.name)}`}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium hover:bg-peach-50 dark:hover:bg-warmbrown-900/80 text-warmbrown-800 dark:text-peach-100 hover:text-warmbrown-900 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        {theme.icon?.startsWith('data:image') || theme.icon?.startsWith('http') || theme.icon?.startsWith('/') ? (
                          <img src={theme.icon} alt={theme.name} className="h-4 w-auto max-w-[32px] object-contain rounded inline-block" />
                        ) : (
                          <span>{theme.icon}</span>
                        )}
                        <span>{theme.name}</span>
                      </span>
                      <span className="text-xs text-warmbrown-500 dark:text-peach-300/70 font-semibold">
                        {theme.itemCount} {theme.itemCount === 1 ? 'item' : 'items'}
                      </span>
                    </Link>
                  ))}
                </div>
                <div className="border-t border-peach-100 dark:border-warmbrown-800 mt-2 pt-2 px-2">
                  <Link
                    href="/collections"
                    className="block text-center text-xs font-bold text-warmbrown-600 dark:text-peach-200 hover:text-warmbrown-800 py-1 bg-peach-100/60 dark:bg-warmbrown-900 rounded-lg hover:bg-peach-200/60 transition-colors"
                  >
                    View All Collections &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Custom Orders Icon (Needle & Thread) */}
          <Link
            href="/custom-order"
            title="Custom Order Request"
            className={`nav-icon-btn ${pathname === '/custom-order' ? 'nav-icon-active' : ''}`}
          >
            <Image
              src="/custom-icon.svg"
              alt="Custom Orders"
              width={22}
              height={22}
              className="object-contain"
            />
          </Link>

        </nav>

        {/* Search Bar with Category Design Theme */}
        <div ref={searchRef} data-search-rounded className="hidden md:flex items-center flex-1 max-w-sm relative mx-2">
          <form onSubmit={handleSearchSubmit} className="w-full relative">
            <div className="relative flex items-center">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warmbrown-400 dark:text-peach-300/50 pointer-events-none stroke-[2]"
              />
              <input
                type="text"
                placeholder="Search categories, themes..."
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setIsSearchOpen(false);
                }}
                data-search-box
                className="search-box w-full bg-peach-50/70 dark:bg-warmbrown-900/60 hover:bg-peach-50/90 border border-peach-200 dark:border-warmbrown-800 focus:border-warmbrown-600 dark:focus:border-peach-300 focus:bg-white dark:focus:bg-warmbrown-950 rounded-2xl py-2 pl-9 pr-8 text-xs sm:text-sm text-warmbrown-900 dark:text-peach-100 placeholder-warmbrown-400 dark:placeholder-peach-300/40 outline-none transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-warmbrown-400 hover:text-warmbrown-700 dark:text-peach-300/50 dark:hover:text-peach-100 p-0.5 rounded-full"
                  title="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </form>

          {/* Category-Driven Search Popover Menu */}
          {isSearchOpen && (
            <div
              data-search-popover
              className="search-popover absolute top-full left-0 right-0 mt-2 min-w-[340px] bg-white dark:bg-[#1A120B] rounded-2xl border border-peach-200/90 dark:border-warmbrown-800/90 shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden"
            >
              {/* All Categories Row */}
              <Link
                href="/collections"
                onClick={() => setIsSearchOpen(false)}
                data-search-option
                className="search-option-item flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-sm text-warmbrown-900 dark:text-peach-100 hover:bg-peach-100/70 dark:hover:bg-warmbrown-900 transition-colors group"
              >
                <span>All Categories</span>
                <span className="text-xs font-semibold text-warmbrown-400 dark:text-peach-300/60 font-mono group-hover:text-warmbrown-700 dark:group-hover:text-peach-200">
                  163
                </span>
              </Link>

              <div className="max-h-[340px] overflow-y-auto overscroll-contain pr-1 space-y-3 mt-1 scrollbar-hover-only">
                {/* Section: DESIGN THEMES */}
                {filteredThemes.length > 0 && (
                  <div>
                    <div className="px-3.5 pt-2 pb-1 text-[11px] font-black uppercase tracking-wider text-warmbrown-400 dark:text-peach-300/60 font-mono">
                      DESIGN THEMES
                    </div>
                    <div className="space-y-0.5">
                      {filteredThemes.map((theme) => (
                        <Link
                          key={theme._id || theme.id}
                          href={`/collections?category=${encodeURIComponent(theme.name)}`}
                          onClick={() => setIsSearchOpen(false)}
                          data-search-option
                          className="search-option-item flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-medium text-warmbrown-800 dark:text-peach-200 hover:bg-peach-100/90 dark:hover:bg-warmbrown-800 hover:text-warmbrown-950 dark:hover:text-peach-50 transition-colors group"
                        >
                          <span className="flex items-center gap-2">
                            {theme.icon ? (
                              theme.icon.startsWith('data:image') || theme.icon.startsWith('http') || theme.icon.startsWith('/') ? (
                                <img src={theme.icon} alt={theme.name} className="h-4 w-4 object-contain rounded shrink-0" />
                              ) : (
                                <span className="text-sm shrink-0 leading-none">{theme.icon}</span>
                              )
                            ) : null}
                            <span>{theme.name}</span>
                          </span>
                          <span className="text-xs font-semibold text-warmbrown-400 dark:text-peach-300/60 font-mono group-hover:text-warmbrown-700 dark:group-hover:text-peach-200">
                            {theme.itemCount}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section: PRODUCT TYPES */}
                {filteredTypes.length > 0 && (
                  <div>
                    <div className="px-3.5 pt-2 pb-1 text-[11px] font-black uppercase tracking-wider text-warmbrown-400 dark:text-peach-300/60 font-mono">
                      PRODUCT TYPES
                    </div>
                    <div className="space-y-0.5">
                      {filteredTypes.map((type) => (
                        <Link
                          key={type.id}
                          href={`/collections?type=${encodeURIComponent(type.name)}`}
                          onClick={() => setIsSearchOpen(false)}
                          data-search-option
                          className="search-option-item flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-medium text-warmbrown-800 dark:text-peach-200 hover:bg-peach-100/90 dark:hover:bg-warmbrown-800 hover:text-warmbrown-950 dark:hover:text-peach-50 transition-colors group"
                        >
                          <span>{type.name}</span>
                          <span className="text-xs font-semibold text-warmbrown-400 dark:text-peach-300/60 font-mono group-hover:text-warmbrown-700 dark:group-hover:text-peach-200">
                            {type.count}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Autocomplete Matching Dolls if searching */}
                {searchQuery.trim().length >= 2 && autocompleteResults.length > 0 && (
                  <div>
                    <div className="px-3.5 pt-2 pb-1 text-[11px] font-black uppercase tracking-wider text-warmbrown-400 dark:text-peach-300/60 font-mono border-t border-peach-100 dark:border-warmbrown-800/80 mt-2">
                      MATCHING DOLLS
                    </div>
                    <div className="space-y-0.5">
                      {autocompleteResults.slice(0, 4).map((item) => (
                        <Link
                          key={item.slug}
                          href={`/products/${item.slug}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs hover:bg-peach-100/80 dark:hover:bg-warmbrown-900 transition-colors"
                        >
                          <div>
                            <span className="font-bold text-warmbrown-800 dark:text-peach-100 block">{item.name}</span>
                            <span className="text-[10px] text-warmbrown-500 dark:text-peach-300/60">{item.designTheme}</span>
                          </div>
                          <span className="font-extrabold text-warmbrown-800 dark:text-peach-100">₹{item.price.toFixed(2)}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {filteredThemes.length === 0 && filteredTypes.length === 0 && (
                  <div className="py-6 text-center px-4">
                    <p className="text-xs text-warmbrown-500 dark:text-peach-300/60">
                      No categories matching &quot;{searchQuery}&quot;
                    </p>
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="mt-2 text-xs font-bold text-warmbrown-800 dark:text-peach-200 underline hover:text-warmbrown-950"
                    >
                      Search all dolls for &quot;{searchQuery}&quot; &rarr;
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Icon Actions: Account & Cart */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">

          {/* Account Profile or Auth Links */}
          {user.isLoggedIn ? (
            <div className="flex items-center gap-1.5">
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  className="bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/80 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 text-xs font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1 transition-all shadow-xs shrink-0"
                  title="Admin Dashboard"
                >
                  <ShieldAlert size={14} /> Admin
                </Link>
              )}
              <Link
                href="/account"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-peach-300 dark:bg-warmbrown-700 hover:bg-peach-400 dark:hover:bg-warmbrown-600 text-warmbrown-900 dark:text-peach-100 flex items-center justify-center font-extrabold text-sm sm:text-base border border-peach-200 dark:border-warmbrown-800 shadow-md transition-transform hover:scale-105 shrink-0"
                title={`Account (${user.name})`}
              >
                {user.name?.[0]?.toUpperCase() ?? <User size={18} />}
              </Link>
              <button
                onClick={() => {
                  logout();
                  router.push('/');
                }}
                title="Sign Out"
                className="w-9 h-9 bg-peach-100/70 dark:bg-warmbrown-900/80 hover:bg-rose-100 dark:hover:bg-rose-950 text-warmbrown-700 dark:text-peach-200 hover:text-rose-700 dark:hover:text-rose-300 rounded-full flex items-center justify-center border border-peach-200/60 dark:border-warmbrown-800 transition-colors shadow-xs"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center">
              <Link href="/login" tabIndex={-1} title="Sign in to your account">
                <FlowButton
                  type="button"
                  variant="outline"
                  text="Log In"
                  className="min-w-[125px] sm:min-w-[135px] px-6 py-2 text-xs font-bold border-warmbrown-700/40 text-warmbrown-800 dark:text-peach-100 shadow-xs"
                />
              </Link>
            </div>
          )}

          {/* Cart Icon Link */}
          <Link
            href="/cart"
            title="View Shopping Cart"
            className={`nav-icon-btn shrink-0 ${pathname === '/cart' ? 'nav-icon-active' : ''}`}
          >
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-warmbrown-800 text-white dark:bg-peach-300 dark:text-warmbrown-900 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center transition-colors shadow-xs">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-warmbrown-800 hover:bg-peach-50 rounded-xl transition-all duration-300 group"
          >
            {isMobileMenuOpen ? (
              <X size={24} className="transition-transform duration-500 group-hover:rotate-180" />
            ) : (
              <Menu size={24} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-peach-200 px-4 py-4 space-y-4 shadow-lg animate-in slide-in-from-top duration-200">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warmbrown-400 pointer-events-none stroke-[2]"
            />
            <input
              type="text"
              placeholder="Search categories, themes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-search-box
              className="search-box w-full bg-peach-50/70 border border-peach-200 focus:border-warmbrown-600 rounded-2xl py-2.5 pl-9.5 pr-8 text-xs text-warmbrown-900 placeholder-warmbrown-400 outline-none transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-warmbrown-400 hover:text-warmbrown-700"
              >
                <X size={13} />
              </button>
            )}
          </form>

          <nav className="flex flex-col space-y-2 text-sm font-semibold text-warmbrown-800">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-peach-50"
            >
              Home
            </Link>
            <div className="px-3 py-1 font-bold text-xs uppercase text-warmbrown-400">
              Collections
            </div>
            <div className="grid grid-cols-2 gap-2 pl-2">
              {themes.map((cat) => (
                <Link
                  key={cat._id || cat.id}
                  href={`/collections?category=${encodeURIComponent(cat.name)}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-lg bg-peach-50 text-xs text-warmbrown-800 font-medium"
                >
                  <span className="flex items-center gap-2">
                    {cat.icon?.startsWith('data:image') || cat.icon?.startsWith('http') || cat.icon?.startsWith('/') ? (
                      <img src={cat.icon} alt={cat.name} className="h-4 w-auto max-w-[32px] object-contain rounded inline-block" />
                    ) : (
                      <span>{cat.icon}</span>
                    )}
                    <span>{cat.name}</span>
                  </span>
                </Link>
              ))}
            </div>
            <Link
              href="/custom-order"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-peach-100 text-warmbrown-800 font-bold text-xs"
            >
              <Wand2 size={16} className="text-peach-600" />
              Request Custom Doll Order
            </Link>
            <Link
              href="/collections"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-peach-50"
            >
              All Products
            </Link>
            <Link
              href={user.isLoggedIn ? '/account' : '/login'}
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-peach-50 flex items-center gap-2 text-warmbrown-700"
            >
              <User size={16} />
              {user.isLoggedIn ? `Account (${user.name})` : 'Sign In'}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
