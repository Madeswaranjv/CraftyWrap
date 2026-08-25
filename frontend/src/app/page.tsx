'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FAQS } from '@/data/mockData';
import { CategoryTile } from '@/components/CategoryTile';
import { InstagramLogo, WhatsAppLogo } from '@/components/SocialIcons';
import { FadeInSection } from '@/components/motion/FadeInSection';
import { HeroIntroAnimation } from '@/components/motion/HeroIntroAnimation';
import {
  heroSpringContainerVariants,
  heroSpringItemVariants,
} from '@/lib/motion';
import { apiRequest } from '@/lib/api';
import { CatalogProduct, CatalogTheme, toCatalogProduct, toCatalogTheme } from '@/lib/catalog';
import {
  Wand2,
  ArrowRight,
  Heart,
  Package,
  MessageCircle,
  ChevronDown,
} from 'lucide-react';

declare global {
  interface Window {
    __crafty_has_visited_app?: boolean;
  }
}

type IntroState = 'loading' | 'replay';

const SERVER_RESPONSE_TIMEOUT_MS = 15_000;
const INTRO_DURATION_MS = 2_000;

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showIntro, setShowIntro] = useState(false);
  const [introKey, setIntroKey] = useState(0);
  const [introState, setIntroState] = useState<IntroState>('loading');
  const [categories, setCategories] = useState<CatalogTheme[]>([]);
  const [featuredProduct, setFeaturedProduct] = useState<CatalogProduct | null>(null);

  useEffect(() => {
    // Play 2-second animated intro on initial session visit
    if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem('crafty_intro_seen')) {
      sessionStorage.setItem('crafty_intro_seen', 'true');
      setShowIntro(true);
      const introTimer = window.setTimeout(() => setShowIntro(false), INTRO_DURATION_MS);
      return () => window.clearTimeout(introTimer);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let isCurrent = true;
    const timeoutId = window.setTimeout(() => controller.abort(), SERVER_RESPONSE_TIMEOUT_MS);

    const loadHomeData = async () => {
      try {
        const [themesRes, featuredRes] = await Promise.all([
          apiRequest<Omit<CatalogTheme, 'id' | 'badgeColor' | 'bgColor'>[]>('/design-themes', { signal: controller.signal }),
          apiRequest<Record<string, unknown>>('/products/crochet-sunflower-handbag', { signal: controller.signal }).catch(() => null),
        ]);
        if (!isCurrent) return;
        setCategories(themesRes.map((theme, index) => toCatalogTheme(theme, index)));
        if (featuredRes) {
          setFeaturedProduct(toCatalogProduct(featuredRes as unknown as Parameters<typeof toCatalogProduct>[0]));
        }
      } catch {
        if (!isCurrent) return;
      } finally {
        window.clearTimeout(timeoutId);
      }
    };
    void loadHomeData();

    return () => {
      isCurrent = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!showIntro || introState !== 'replay') return;
    const replayTimer = window.setTimeout(() => setShowIntro(false), 1_600);
    return () => window.clearTimeout(replayTimer);
  }, [introKey, introState, showIntro]);

  return (
    <div className="space-y-16 pb-12">
      {/* Dynamic Intro Curtain on Page Mount & Refresh */}
      <HeroIntroAnimation
        key={introKey}
        isOpen={showIntro}
        state={introState}
      />

      {/* 1. HERO BANNER SECTION WITH CHOREOGRAPHED INTRO ANIMATION */}
      <section className="relative bg-gradient-to-b from-peach-100/90 via-peach-50/60 to-white dark:from-[#1F1610] dark:via-[#1A120B] dark:to-[#140E0A] pt-8 pb-16 px-4 sm:px-6 lg:px-8 border-b border-peach-200/50 dark:border-warmbrown-900/60 overflow-hidden">
        {/* Ambient Decorative Background Circles */}
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-peach-300/20 dark:bg-amber-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-soft" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-200/20 dark:bg-orange-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-soft" style={{ animationDelay: '1.5s' }} />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Hero Content */}
          <motion.div
            key={`hero-left-${introKey}`}
            initial="hidden"
            animate="visible"
            variants={heroSpringContainerVariants}
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            {/* Main Headline */}
            <motion.h1
              variants={heroSpringItemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-warmbrown-800 dark:text-peach-100 leading-[1.15] tracking-tight"
            >
              Handcrafted Yarn Dolls <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-warmbrown-600 via-peach-600 to-amber-600 dark:from-peach-300 dark:via-amber-400 dark:to-orange-300">
                Crafted to Bring Smiles.
              </span>
            </motion.h1>

            {/* Description Body */}
            <motion.p
              variants={heroSpringItemVariants}
              className="text-base sm:text-lg text-warmbrown-700/80 dark:text-peach-200/80 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal"
            >
              Every CraftyWrap doll is individually hand-stitched with ultra-soft velvet and organic bamboo yarn. From tiny pocket fruits to giant huggable critters, unwrap endless joy today.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={heroSpringItemVariants}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2"
            >
              <Link
                href="/collections"
                className="w-full sm:w-auto bg-white dark:bg-[#FFF9F4] hover:bg-peach-100 dark:hover:bg-white text-warmbrown-900 dark:text-[#3D2412] px-7 py-3.5 rounded-full font-extrabold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group border border-peach-200/80 dark:border-white/90"
              >
                <span>Shop All Collections</span>
                <ArrowRight size={16} className="text-warmbrown-800 dark:text-[#3D2412] group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/custom-order"
                className="w-full sm:w-auto bg-warmbrown-800 dark:bg-warmbrown-800 hover:bg-warmbrown-900 dark:hover:bg-warmbrown-700 text-peach-50 dark:text-peach-100 border border-warmbrown-700 dark:border-white/30 px-7 py-3.5 rounded-full font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
              >
                <Wand2 size={16} className="text-peach-200" />
                <span>Request Custom Doll</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Hero Visual Showcase */}
          <motion.div
            key={`hero-right-${introKey}`}
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.2 }}
            className="lg:col-span-5 relative flex items-center justify-center pt-6 lg:pt-0"
          >
            {/* Background Pulsing Aura */}
            <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-peach-300/40 via-peach-200/30 to-amber-100/50 dark:from-warmbrown-800/40 dark:via-warmbrown-700/30 dark:to-amber-900/20 absolute animate-pulse-soft" />

            {/* Main Featured Doll Card */}
            {(() => {
              const primaryImg = featuredProduct?.images && featuredProduct.images.length > 1
                ? featuredProduct.images[1]
                : featuredProduct?.images && featuredProduct.images.length > 0
                ? featuredProduct.images[0]
                : '/frontpage.jpeg';
              const hoverImg = featuredProduct?.images && featuredProduct.images.length > 1
                ? featuredProduct.images[0]
                : null;
              const prodName = featuredProduct?.name || 'Sunflower Handbag';
              const prodPrice = 1000;
              const prodOriginalPrice = 1200;
              const prodTarget = featuredProduct?.slug || featuredProduct?.id || 'crochet-sunflower-handbag';

              return (
                <Link
                  href={`/products/${prodTarget}`}
                  className="block relative z-10 max-w-sm w-full cursor-pointer group"
                >
                  <motion.div
                    whileHover={{ y: -6, rotate: 1, scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="bg-white dark:bg-[#251A13] p-4 sm:p-6 rounded-3xl border border-peach-200 dark:border-warmbrown-800 shadow-card space-y-4"
                  >
                    <div className="relative w-full aspect-square rounded-2xl bg-gradient-to-br from-amber-100 via-peach-100 to-rose-100 dark:from-[#32231A] dark:via-[#2B1E16] dark:to-[#38261C] flex items-center justify-center overflow-hidden border dark:border-warmbrown-800">
                      <img
                        src={primaryImg}
                        alt={prodName}
                        className={`w-full h-full object-cover transition-all duration-500 ${hoverImg ? 'group-hover:opacity-0' : 'group-hover:scale-105'}`}
                      />
                      {hoverImg && (
                        <img
                          src={hoverImg}
                          alt={`${prodName} alternate view`}
                          className="w-full h-full object-cover transition-all duration-500 absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute top-3 right-3 bg-warmbrown-800 text-peach-100 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase shadow-xs">
                        Artisan Pick
                      </div>
                      <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-warmbrown-900/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-warmbrown-800 dark:text-peach-100 shadow-xs flex items-center gap-1 border dark:border-warmbrown-800">
                        <Heart size={12} className="text-peach-600 fill-peach-400" /> {prodName}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-xs text-warmbrown-500 dark:text-peach-300/60 font-medium">Featured Handcraft</span>
                        <div className="flex items-baseline gap-2">
                          <p className="font-extrabold text-warmbrown-800 dark:text-peach-100 text-lg">₹{prodPrice.toFixed(2)}</p>
                          <span className="text-xs text-warmbrown-400 line-through">₹{prodOriginalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                      <span
                        className="bg-warmbrown-800 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-warmbrown-900 group-hover:bg-peach-600 transition-colors flex items-center gap-1 border dark:border-white/30"
                      >
                        <span>View Item</span>
                        <span>&rarr;</span>
                      </span>
                    </div>
                  </motion.div>
                </Link>
              );
            })()}
          </motion.div>
        </div>
      </section>

      {/* 2. SHOP BY COLLECTION TYPE */}
      <FadeInSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 border-b border-peach-100 dark:border-warmbrown-900 pb-4">
          <div>
            <span className="text-xs font-bold text-warmbrown-500 dark:text-peach-300/60 uppercase tracking-widest">
              Browse Categories
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-warmbrown-800 dark:text-peach-100">
              Shop by Collection
            </h2>
          </div>
          <Link
            href="/collections"
            className="text-xs font-bold text-warmbrown-600 dark:text-peach-200 hover:text-warmbrown-800 flex items-center gap-1 hover:underline"
          >
            See All Categories &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <CategoryTile key={cat._id || cat.id} category={cat} />
          ))}
        </div>
      </FadeInSection>

      {/* 3. CUSTOM ORDER CALLOUT BANNER */}
      <FadeInSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-warmbrown-800 via-warmbrown-700 to-warmbrown-900 dark:from-[#231812] dark:via-[#1F1610] dark:to-[#1A120B] rounded-3xl p-8 sm:p-12 text-peach-50 relative overflow-hidden shadow-xl border border-warmbrown-600 dark:border-warmbrown-800">
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
              <div className="bg-warmbrown-900/80 dark:bg-warmbrown-950/80 p-6 rounded-2xl border border-warmbrown-600/50 dark:border-warmbrown-800 text-center space-y-2 max-w-xs w-full">
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
      </FadeInSection>

      {/* 4. TRUST & SERVICES STRIP */}
      <FadeInSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#1A120B] p-6 rounded-3xl border border-peach-200/80 dark:border-warmbrown-900/80 shadow-soft flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-peach-100 dark:bg-warmbrown-900 text-warmbrown-700 dark:text-peach-200 flex items-center justify-center shrink-0">
              <Heart size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-warmbrown-800 dark:text-peach-100 text-base">Handmade with Care</h3>
              <p className="text-xs text-warmbrown-600 dark:text-peach-200/70 leading-relaxed">
                100% hand-crocheted using non-toxic, hypoallergenic yarns and safety-locked stitches.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A120B] p-6 rounded-3xl border border-peach-200/80 dark:border-warmbrown-900/80 shadow-soft flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
              <Package size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-warmbrown-800 dark:text-peach-100 text-base">Safe Gift Packaging</h3>
              <p className="text-xs text-warmbrown-600 dark:text-peach-200/70 leading-relaxed">
                Every order arrives in a padded gift box with custom birth tags and hand-written gift notes.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A120B] p-6 rounded-3xl border border-peach-200/80 dark:border-warmbrown-900/80 shadow-soft flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <MessageCircle size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-warmbrown-800 dark:text-peach-100 text-base">Direct Chat with Maker</h3>
              <p className="text-xs text-warmbrown-600 dark:text-peach-200/70 leading-relaxed">
                Chat directly with our artisan family on Instagram or WhatsApp for questions and updates.
              </p>
            </div>
          </div>
        </div>
      </FadeInSection>

      {/* 5. FAQ PREVIEW SECTION */}
      <FadeInSection id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-warmbrown-500 dark:text-peach-300/60 uppercase tracking-widest">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-warmbrown-800 dark:text-peach-100">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#1A120B] rounded-2xl border border-peach-200/80 dark:border-warmbrown-900/80 overflow-hidden shadow-xs transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-warmbrown-800 dark:text-peach-100 text-sm sm:text-base hover:text-warmbrown-600 dark:hover:text-peach-300 transition-colors"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-warmbrown-500 dark:text-peach-300/60 transition-transform duration-200 ${
                    openFaq === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-warmbrown-600 dark:text-peach-200/80 leading-relaxed border-t border-peach-100/60 dark:border-warmbrown-900/60 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </FadeInSection>
    </div>
  );
}
