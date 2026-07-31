'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { apiRequest } from '@/lib/api';
import { CatalogTheme, toCatalogTheme } from '@/lib/catalog';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Wand2,
  Heart,
  ChevronDown,
  LayoutGrid,
  Flame,
  LogOut,
} from 'lucide-react';

interface AutocompleteItem {
  slug: string;
  name: string;
  productType: string;
  designTheme: string;
  price: number;
}

export const Header: React.FC = () => {
  const { cartCount, wishlist, user, logout } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [themes, setThemes] = useState<CatalogTheme[]>([]);
  const [autocompleteResults, setAutocompleteResults] = useState<AutocompleteItem[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
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
    setShowAutocomplete(false);
    if (searchQuery.trim()) {
      router.push(`/collections?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };


  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#1A120B]/95 backdrop-blur-md border-b border-peach-100 dark:border-warmbrown-900 transition-colors duration-300 shadow-sm">
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
          {/* Home Icon */}
          <Link
            href="/"
            title="Home"
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xs border group hover:-translate-y-0.5 active:scale-95 ${
              pathname === '/'
                ? 'bg-peach-200 border-peach-300 dark:bg-warmbrown-800 dark:border-warmbrown-700 shadow-xs'
                : 'bg-peach-100/70 border-peach-200/60 dark:bg-warmbrown-900/80 dark:border-warmbrown-800/80 hover:bg-peach-200/90 dark:hover:bg-warmbrown-800 dark:hover:border-warmbrown-700 hover:shadow-sm'
            }`}
          >
            <Image
              src="/home-icon.svg"
              alt="Home"
              width={22}
              height={22}
              className="object-contain dark:brightness-0 dark:invert group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300"
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
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xs border group hover:-translate-y-0.5 active:scale-95 ${
                pathname.startsWith('/collections')
                  ? 'bg-peach-200 border-peach-300 dark:bg-warmbrown-800 dark:border-warmbrown-700 shadow-xs'
                  : 'bg-peach-100/70 border-peach-200/60 dark:bg-warmbrown-900/80 dark:border-warmbrown-800/80 hover:bg-peach-200/90 dark:hover:bg-warmbrown-800 dark:hover:border-warmbrown-700 hover:shadow-sm'
              }`}
            >
              <Image
                src="/collections-icon.svg"
                alt="Collections"
                width={22}
                height={22}
                className="object-contain dark:brightness-0 dark:invert group-hover:-rotate-6 group-hover:scale-110 transition-transform duration-300"
              />
            </Link>

            {isCategoryDropdownOpen && (
              <div className="absolute top-full left-0 w-64 bg-white dark:bg-[#1F1610] rounded-2xl shadow-xl border border-peach-100 dark:border-warmbrown-800 p-2 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-warmbrown-400 dark:text-peach-300/60 border-b border-peach-100 dark:border-warmbrown-800 mb-1">
                  Shop By Category
                </div>
                {themes.map((theme) => (
                  <Link
                    key={theme._id || theme.id}
                    href={`/collections?category=${encodeURIComponent(theme.name)}`}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium hover:bg-peach-50 dark:hover:bg-warmbrown-900/80 text-warmbrown-800 dark:text-peach-100 hover:text-warmbrown-900 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span>{theme.icon}</span>
                      <span>{theme.name}</span>
                    </span>
                    <span className="text-xs text-warmbrown-500 dark:text-peach-300/70 font-semibold">
                      {theme.itemCount} {theme.itemCount === 1 ? 'item' : 'items'}
                    </span>
                  </Link>
                ))}
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
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xs border group hover:-translate-y-0.5 active:scale-95 ${
              pathname === '/custom-order'
                ? 'bg-peach-200 border-peach-300 dark:bg-warmbrown-800 dark:border-warmbrown-700 shadow-xs'
                : 'bg-peach-100/70 border-peach-200/60 dark:bg-warmbrown-900/80 dark:border-warmbrown-800/80 hover:bg-peach-200/90 dark:hover:bg-warmbrown-800 dark:hover:border-warmbrown-700 hover:shadow-sm'
            }`}
          >
            <Image
              src="/custom-icon.svg"
              alt="Custom Orders"
              width={22}
              height={22}
              className="object-contain dark:brightness-0 dark:invert group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300"
            />
          </Link>

          {/* Best Sellers Icon (Trending Chart Arrow) */}
          <Link
            href="/collections?filter=best-seller"
            title="Best Sellers"
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xs border group hover:-translate-y-0.5 active:scale-95 ${
              pathname.includes('best-seller')
                ? 'bg-peach-200 border-peach-300 dark:bg-warmbrown-800 dark:border-warmbrown-700 shadow-xs'
                : 'bg-peach-100/70 border-peach-200/60 dark:bg-warmbrown-900/80 dark:border-warmbrown-800/80 hover:bg-peach-200/90 dark:hover:bg-warmbrown-800 dark:hover:border-warmbrown-700 hover:shadow-sm'
            }`}
          >
            <Image
              src="/bestsellers-icon.svg"
              alt="Best Sellers"
              width={22}
              height={22}
              className="object-contain dark:brightness-0 dark:invert group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:scale-110 transition-transform duration-300"
            />
          </Link>
        </nav>

        {/* Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-sm relative mx-2">
          <form onSubmit={handleSearchSubmit} className="w-full relative">
            <input
              type="text"
              placeholder="Search yarn dolls, veggies, animals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowAutocomplete(autocompleteResults.length > 0)}
              className="w-full bg-peach-50/80 dark:bg-warmbrown-900/90 hover:bg-peach-50 border border-peach-200 dark:border-warmbrown-800 focus:border-warmbrown-500 dark:focus:border-warmbrown-600 rounded-full py-2 pl-4 pr-10 text-xs text-warmbrown-800 dark:text-peach-100 placeholder-warmbrown-400 dark:placeholder-warmbrown-400 outline-none transition-all"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-warmbrown-600 dark:bg-warmbrown-700 hover:bg-warmbrown-700 text-white p-1.5 rounded-full transition-colors"
            >
              <Search size={14} />
            </button>
          </form>

          {/* Autocomplete Popup */}
          {showAutocomplete && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1F1610] rounded-2xl border border-peach-200 dark:border-warmbrown-800 shadow-xl p-2 z-50 max-h-72 overflow-y-auto space-y-1">
              {autocompleteResults.map((item) => (
                <Link
                  key={item.slug}
                  href={`/products/${item.slug}`}
                  onClick={() => setShowAutocomplete(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-peach-50 dark:hover:bg-warmbrown-900 text-xs transition-colors"
                >
                  <div>
                    <span className="font-bold text-warmbrown-800 dark:text-peach-100 block">{item.name}</span>
                    <span className="text-[10px] text-warmbrown-500 dark:text-peach-300/60">{item.productType} • {item.designTheme}</span>
                  </div>
                  <span className="font-extrabold text-warmbrown-800 dark:text-peach-100">₹{item.price.toFixed(2)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Icon Actions: Wishlist, Account & Cart */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Wishlist Link with Badge */}
          <Link
            href="/account"
            title="Wishlist"
            className="w-9 h-9 sm:w-10 sm:h-10 bg-peach-100/70 dark:bg-warmbrown-900/80 hover:bg-peach-200/90 dark:hover:bg-warmbrown-800 text-warmbrown-800 dark:text-peach-100 rounded-full flex items-center justify-center border border-peach-200/60 dark:border-warmbrown-800 shadow-xs hover:scale-105 transition-transform relative"
          >
            <Heart size={18} className={wishlist.length > 0 ? "fill-rose-500 text-rose-500" : "text-warmbrown-700 dark:text-peach-200"} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Account Profile or Auth Links */}
          {user.isLoggedIn ? (
            <div className="flex items-center gap-1.5">
              <Link
                href="/account"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-peach-300 dark:bg-warmbrown-700 hover:bg-peach-400 dark:hover:bg-warmbrown-600 text-warmbrown-900 dark:text-peach-100 flex items-center justify-center font-extrabold text-sm sm:text-base border border-peach-200 dark:border-warmbrown-800 shadow-md transition-transform hover:scale-105 shrink-0"
                title={`Account (${user.name})`}
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  user.name?.[0]?.toUpperCase() ?? <User size={18} />
                )}
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
            <div className="flex items-center gap-1.5">
              <Link
                href="/login"
                className="text-xs font-bold text-warmbrown-800 dark:text-peach-100 hover:text-warmbrown-600 dark:hover:text-peach-300 px-3 py-1.5 rounded-full hover:bg-peach-50 dark:hover:bg-warmbrown-900 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="hidden sm:inline-block bg-warmbrown-800 dark:bg-warmbrown-700 hover:bg-warmbrown-900 text-peach-50 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-xs transition-transform hover:scale-105 border border-peach-200 dark:border-warmbrown-800"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Theme Toggle Button (Light/Dark Switcher) */}
          <ThemeToggle className="shrink-0" />

          {/* Cart Icon Link */}
          <Link
            href="/cart"
            title="View Shopping Cart"
            className="w-9 h-9 sm:w-10 sm:h-10 bg-warmbrown-800 dark:bg-warmbrown-700 hover:bg-warmbrown-900 dark:hover:bg-warmbrown-600 text-peach-50 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-105 relative shrink-0 border border-peach-200 dark:border-warmbrown-800"
          >
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-peach-400 text-warmbrown-900 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-xs">
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
            <input
              type="text"
              placeholder="Search yarn dolls..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-peach-50 border border-peach-200 rounded-full py-2 pl-4 pr-10 text-xs outline-none"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-warmbrown-600 text-white p-1.5 rounded-full"
            >
              <Search size={14} />
            </button>
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
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
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
            <div className="pt-2 border-t border-peach-100 dark:border-warmbrown-800">
              <ThemeToggle showLabel={true} />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
