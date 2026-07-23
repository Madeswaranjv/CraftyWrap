'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
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
} from 'lucide-react';
import { CATEGORIES } from '@/data/mockData';

export const Header: React.FC = () => {
  const { cartCount, user } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/collections?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-peach-100 transition-all shadow-sm">
      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-peach-300 shadow-sm group-hover:scale-105 transition-transform">
            <Image
              src="/logo.png"
              alt="CraftyWrap Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-warmbrown-800 leading-tight group-hover:text-warmbrown-600 transition-colors">
              CraftyWrap
            </span>
            <span className="text-[10px] tracking-widest uppercase font-semibold text-warmbrown-500">
              Unwrap The Joy 🧶
            </span>
          </div>
        </Link>

        {/* Desktop Icon-Only Navbar */}
        <nav className="hidden lg:flex items-center gap-4 text-warmbrown-800">
          {/* Animated Home Icon */}
          <Link
            href="/"
            title="Home"
            className="p-1.5 rounded-2xl hover:bg-peach-100/70 transition-all duration-300 group hover:scale-110"
          >
            <div className="w-8 h-8 relative animate-bounce-short">
              <Image
                src="/home-icon.svg"
                alt="Home"
                width={32}
                height={32}
                className="object-contain drop-shadow-xs group-hover:rotate-6 transition-transform duration-300"
              />
            </div>
          </Link>

          {/* Category Dropdown Icon */}
          <div
            className="relative"
            onMouseEnter={() => setIsCategoryDropdownOpen(true)}
            onMouseLeave={() => setIsCategoryDropdownOpen(false)}
          >
            <button
              title="Collections"
              className="w-10 h-10 rounded-2xl bg-peach-100/70 hover:bg-peach-200 flex items-center justify-center transition-all hover:scale-110 shadow-xs border border-peach-200/60 p-2.5"
            >
              <Image
                src="/collections-icon.svg"
                alt="Collections"
                width={22}
                height={22}
                className="object-contain"
              />
            </button>

            {isCategoryDropdownOpen && (
              <div className="absolute top-full left-0 w-64 bg-white rounded-2xl shadow-xl border border-peach-100 p-2 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-warmbrown-400 border-b border-peach-100 mb-1">
                  Shop By Category
                </div>
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/collections?category=${encodeURIComponent(cat.name)}`}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium hover:bg-peach-50 text-warmbrown-800 hover:text-warmbrown-900 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </span>
                    <span className="text-xs text-warmbrown-400 font-normal">
                      {cat.itemCount}
                    </span>
                  </Link>
                ))}
                <div className="border-t border-peach-100 mt-2 pt-2 px-2">
                  <Link
                    href="/collections"
                    className="block text-center text-xs font-bold text-warmbrown-600 hover:text-warmbrown-800 py-1 bg-peach-100/60 rounded-lg hover:bg-peach-200/60 transition-colors"
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
            className="w-10 h-10 rounded-2xl bg-peach-100/80 hover:bg-peach-200 flex items-center justify-center transition-all hover:scale-110 shadow-xs border border-peach-200/60 p-2"
          >
            <Image
              src="/custom-icon.svg"
              alt="Custom Orders"
              width={22}
              height={22}
              className="object-contain"
            />
          </Link>

          {/* Best Sellers Icon (Trending Chart Arrow) */}
          <Link
            href="/collections?filter=best-seller"
            title="Best Sellers"
            className="w-10 h-10 rounded-2xl hover:bg-peach-100/80 flex items-center justify-center transition-all hover:scale-110 p-2"
          >
            <Image
              src="/bestsellers-icon.svg"
              alt="Best Sellers"
              width={22}
              height={22}
              className="object-contain"
            />
          </Link>
        </nav>

        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex items-center flex-1 max-w-sm relative mx-2"
        >
          <input
            type="text"
            placeholder="Search yarn dolls, veggies, animals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-peach-50/80 hover:bg-peach-50 border border-peach-200 focus:border-warmbrown-500 rounded-full py-2 pl-4 pr-10 text-xs text-warmbrown-800 placeholder-warmbrown-400 outline-none transition-all"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-warmbrown-600 hover:bg-warmbrown-700 text-white p-1.5 rounded-full transition-colors"
          >
            <Search size={14} />
          </button>
        </form>

        {/* Right Icon Actions: Account & Cart (No Text Labels) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href={user.isLoggedIn ? '/account' : '/login'}
            className="hover:bg-peach-50 p-1.5 rounded-full text-warmbrown-800 transition-colors"
            title={user.isLoggedIn ? `Account (${user.name})` : 'Sign In'}
          >
            <div className="w-9 h-9 rounded-full bg-peach-100 text-warmbrown-700 flex items-center justify-center border border-peach-200 hover:scale-105 transition-transform shadow-xs">
              <User size={19} />
            </div>
          </Link>

          <Link
            href="/cart"
            title="View Shopping Cart"
            className="w-10 h-10 bg-warmbrown-800 hover:bg-warmbrown-900 text-peach-50 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-105 relative"
          >
            <ShoppingCart size={19} />
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
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
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
          </nav>
        </div>
      )}
    </header>
  );
};
