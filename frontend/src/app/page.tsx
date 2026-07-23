'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CATEGORIES, PRODUCTS, FAQS } from '@/data/mockData';
import { ProductCard } from '@/components/ProductCard';
import { CategoryTile } from '@/components/CategoryTile';
import { InstagramLogo, WhatsAppLogo } from '@/components/SocialIcons';
import {
  Wand2,
  ArrowRight,
  Heart,
  ShieldCheck,
  Package,
  MessageCircle,
  Instagram,
  ChevronDown,
  Star,
  Zap,
} from 'lucide-react';

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const featuredProducts = PRODUCTS.slice(0, 4);
  const bestSellers = PRODUCTS.filter((p) => p.isBestSeller).slice(0, 4);

  return (
    <div className="space-y-16 pb-12">
      {/* 1. HERO BANNER SECTION (Peach Tint Banner matching reference site's hero layout) */}
      <section className="relative bg-gradient-to-b from-peach-100/90 via-peach-50/60 to-white pt-8 pb-16 px-4 sm:px-6 lg:px-8 border-b border-peach-200/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Text Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/90 border border-peach-300 text-warmbrown-800 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs animate-bounce-short">
              <Heart size={14} className="text-peach-600 fill-peach-400" />
              <span>100% Hand-Crocheted Artisan Dolls</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-warmbrown-800 leading-[1.15] tracking-tight">
              Handcrafted Yarn Dolls <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-warmbrown-600 to-peach-600">
                Crafted to Bring Smiles.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-warmbrown-700/80 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Every CraftyWrap doll is individually hand-stitched with ultra-soft velvet and organic bamboo yarn. From tiny pocket fruits to giant huggable critters, unwrap endless joy today.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Link
                href="/collections"
                className="w-full sm:w-auto bg-warmbrown-800 hover:bg-warmbrown-900 text-peach-50 px-7 py-3.5 rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>Shop All Collections</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/custom-order"
                className="w-full sm:w-auto bg-peach-200 hover:bg-peach-300 text-warmbrown-900 border border-peach-300 px-7 py-3.5 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <Wand2 size={16} className="text-warmbrown-700" />
                <span>Request Custom Doll</span>
              </Link>
            </div>

            {/* Trust Metrics */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-warmbrown-700 font-semibold border-t border-peach-200/60 max-w-lg">
              <div className="flex items-center gap-1.5">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span>4.9 Star Rating (500+ Reviews)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Heart size={14} className="fill-rose-400 text-rose-400" />
                <span>Made by Hand</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Showcase */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-peach-300/40 via-peach-200/30 to-amber-100/50 absolute animate-pulse-soft" />

            <div className="relative z-10 bg-white p-4 sm:p-6 rounded-3xl border border-peach-200 shadow-card max-w-sm w-full space-y-4">
              <div className="relative w-full aspect-square rounded-2xl bg-gradient-to-br from-amber-100 via-peach-100 to-rose-100 flex items-center justify-center overflow-hidden">
                <div className="text-8xl animate-float">🐱</div>
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-warmbrown-800 shadow-xs flex items-center gap-1">
                  <Heart size={12} className="text-peach-600 fill-peach-400" /> Whiskers Calico Kitten
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-xs text-warmbrown-500 font-medium">Featured Handcraft</span>
                  <p className="font-extrabold text-warmbrown-800 text-lg">$34.99</p>
                </div>
                <Link
                  href="/products/crafty-cat-whiskers"
                  className="bg-warmbrown-800 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-warmbrown-900 transition-colors"
                >
                  View Doll &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SHOP BY COLLECTION TYPE (Grid matching reference category tiles) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 border-b border-peach-100 pb-4">
          <div>
            <span className="text-xs font-bold text-warmbrown-500 uppercase tracking-widest">
              Browse Categories
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-warmbrown-800">
              Shop by Collection
            </h2>
          </div>
          <Link
            href="/collections"
            className="text-xs font-bold text-warmbrown-600 hover:text-warmbrown-800 flex items-center gap-1 hover:underline"
          >
            See All 6 Categories &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <CategoryTile key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* 3. TODAY'S PICKS / FEATURED DOLLS (Horizontal 4-col product grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-peach-100 pb-4">
          <div>
            <span className="text-xs font-bold text-warmbrown-500 uppercase tracking-widest">
              Handmade Highlights
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-warmbrown-800">
              Today&apos;s Featured Picks
            </h2>
          </div>
          <Link
            href="/collections?filter=featured"
            className="text-xs font-bold text-warmbrown-600 hover:text-warmbrown-800 flex items-center gap-1 hover:underline"
          >
            View More &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. SHOP BY YARN TYPE & DOLL SIZE (Filter shortcut tiles) */}
      <section className="bg-peach-50/70 py-12 px-4 sm:px-6 lg:px-8 border-y border-peach-100">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-warmbrown-500 uppercase tracking-widest">
              Find Your Favorite Texture & Scale
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-warmbrown-800">
              Choose by Yarn Type & Size
            </h2>
            <p className="text-xs sm:text-sm text-warmbrown-600">
              Whether you prefer velvet softness or durable milk cotton, pick the exact feel you love.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: 'Velvet Chenille', desc: 'Plush & ultra-soft feel', icon: '☁️', query: 'Velvet Chenille' },
              { title: 'Milk Cotton', desc: 'Crisp & durable stitches', icon: '🧶', query: 'Milk Cotton' },
              { title: 'Organic Bamboo', desc: 'Eco & hypoallergenic', icon: '🌱', query: 'Organic Bamboo' },
              { title: 'Chunky Wool', desc: 'Heavy huggable weight', icon: '🐑', query: 'Chunky Wool' },
            ].map((yarn, idx) => (
              <Link
                key={idx}
                href={`/collections?yarnType=${encodeURIComponent(yarn.query)}`}
                className="bg-white p-4 rounded-2xl border border-peach-200 hover:border-warmbrown-500 shadow-soft hover:shadow-hover transition-all text-center space-y-1.5 group"
              >
                <span className="text-3xl block group-hover:scale-110 transition-transform">
                  {yarn.icon}
                </span>
                <h4 className="font-bold text-warmbrown-800 text-sm group-hover:text-warmbrown-600">
                  {yarn.title}
                </h4>
                <p className="text-[11px] text-warmbrown-500">{yarn.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. BEST-SELLING DOLLS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-peach-100 pb-4">
          <div>
            <span className="text-xs font-bold text-warmbrown-500 uppercase tracking-widest">
              Fan Favorites
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-warmbrown-800">
              Best-Selling Dolls
            </h2>
          </div>
          <Link
            href="/collections?filter=best-seller"
            className="text-xs font-bold text-warmbrown-600 hover:text-warmbrown-800 flex items-center gap-1 hover:underline"
          >
            Shop All Best Sellers &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. CUSTOM ORDER CALLOUT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-warmbrown-800 via-warmbrown-700 to-warmbrown-900 rounded-3xl p-8 sm:p-12 text-peach-50 relative overflow-hidden shadow-xl border border-warmbrown-600">
          <div className="absolute right-0 top-0 w-96 h-96 bg-peach-300/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 bg-peach-300/20 text-peach-200 px-3.5 py-1 rounded-full text-xs font-bold">
                <Wand2 size={14} /> Custom Handmade Creations
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Want Something One-of-a-Kind? <br />
                Tell Us What You&apos;re Dreaming Of!
              </h2>
              <p className="text-xs sm:text-sm text-peach-200/90 max-w-xl leading-relaxed">
                Have a favorite pet, cartoon character, or special memory? Share a description or reference picture and our artisan family will crochet it to life for you.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/custom-order"
                  className="bg-peach-300 hover:bg-peach-400 text-warmbrown-900 px-6 py-3 rounded-full font-bold text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <Wand2 size={15} /> Start Custom Order Form
                </Link>
                <a
                  href="https://www.instagram.com/crafty_wrap"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-warmbrown-700/90 hover:bg-warmbrown-600 text-white px-5 py-3 rounded-full font-bold text-xs transition-all flex items-center gap-2 border border-warmbrown-500 shadow-xs"
                >
                  <InstagramLogo size={16} className="text-white" /> Instagram
                </a>
                <a
                  href="https://wa.me/919363515015"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#0F6543] hover:bg-[#0B4F34] text-white px-5 py-3 rounded-full font-bold text-xs transition-all flex items-center gap-2 border border-emerald-600 shadow-xs"
                >
                  <WhatsAppLogo size={16} className="text-white" /> WhatsApp (+91 93635 15015)
                </a>
              </div>
            </div>

            <div className="lg:col-span-4 flex items-center justify-center">
              <div className="bg-warmbrown-900/80 p-6 rounded-2xl border border-warmbrown-600/50 text-center space-y-2 max-w-xs w-full">
                <span className="text-5xl block">🧶</span>
                <p className="text-xs font-bold text-peach-200">
                  Custom Turnaround Time
                </p>
                <p className="text-2xl font-extrabold text-white">3 – 5 Days</p>
                <p className="text-[11px] text-peach-300/70">
                  Includes photo approval before dispatch!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TRUST & SERVICES STRIP (3 short blocks matching reference site's services strip layout) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-peach-200/80 shadow-soft flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-peach-100 text-warmbrown-700 flex items-center justify-center shrink-0">
              <Heart size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-warmbrown-800 text-base">Handmade with Care</h3>
              <p className="text-xs text-warmbrown-600 leading-relaxed">
                100% hand-crocheted using non-toxic, hypoallergenic yarns and safety-locked stitches.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-peach-200/80 shadow-soft flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Package size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-warmbrown-800 text-base">Safe Gift Packaging</h3>
              <p className="text-xs text-warmbrown-600 leading-relaxed">
                Every order arrives in a padded gift box with custom birth tags and hand-written gift notes.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-peach-200/80 shadow-soft flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <MessageCircle size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-warmbrown-800 text-base">Direct Chat with Maker</h3>
              <p className="text-xs text-warmbrown-600 leading-relaxed">
                Chat directly with our artisan family on Instagram or WhatsApp for questions and updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ PREVIEW SECTION */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-warmbrown-500 uppercase tracking-widest">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-warmbrown-800">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-peach-200/80 overflow-hidden shadow-xs transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-warmbrown-800 text-sm sm:text-base hover:text-warmbrown-600 transition-colors"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-warmbrown-500 transition-transform duration-200 ${
                    openFaq === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-warmbrown-600 leading-relaxed border-t border-peach-100/60 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
