'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FAQS } from '@/data/mockData';
import { CategoryTile } from '@/components/CategoryTile';
import { CategoryGridSkeleton } from '@/components/skeletons/CategoryGridSkeleton';
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
  Plus,
  Minus,
} from 'lucide-react';
import { FlowButton } from '@/components/ui/flow-button';
import {
  CardCurtainReveal,
  CardCurtainRevealBody,
  CardCurtainRevealTitle,
  CardCurtainRevealDescription,
  CardCurtainRevealAction,
  CardCurtainRevealFooter,
  CardCurtain,
} from '@/components/ui/card-curtain-reveal';

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
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
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
        if (isCurrent) setIsCategoriesLoading(false);
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
              <FlowButton
                href="/collections"
                variant="outline"
                text="Shop All Collections"
                className="w-full sm:w-auto min-w-[220px] py-3.5 px-8 text-sm font-extrabold bg-white dark:bg-[#FFF9F4] text-warmbrown-900 dark:text-[#3D2412] border-peach-200/80 dark:border-white/90 shadow-md hover:shadow-xl"
              />
              <FlowButton
                href="/custom-order"
                variant="filled"
                icon={Wand2}
                text="Request Custom Doll"
                className="w-full sm:w-auto min-w-[220px] py-3.5 px-8 text-sm font-bold shadow-md hover:shadow-xl"
              />
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

        {isCategoriesLoading || categories.length === 0 ? (
          <CategoryGridSkeleton count={12} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <CategoryTile key={cat._id || cat.id} category={cat} />
            ))}
          </div>
        )}
      </FadeInSection>

      {/* 3. CUSTOM ORDER CALLOUT BANNER - RECREATED WITH CARD CURTAIN REVEAL DESIGN THEME */}
      <FadeInSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CardCurtainReveal className="w-full min-h-[170px] sm:min-h-[200px] rounded-3xl border border-zinc-800/90 bg-zinc-950 text-zinc-50 shadow-2xl overflow-hidden relative group transition-all duration-500 gap-0">
          <CardCurtainRevealBody className="pt-8 px-6 pb-2 sm:pt-10 sm:px-12 sm:pb-3 relative z-20 flex flex-col justify-center items-center text-center">
            <div className="max-w-3xl mx-auto flex flex-col items-center justify-center space-y-2">
              {/* Title: Centered, compact size fitting cleanly on 2 lines */}
              <CardCurtainRevealTitle className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-snug">
                Want Something One-of-a-Kind? <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-peach-200 via-amber-100 to-peach-400">
                  Tell Us What You&apos;re Dreaming Of!
                </span>
              </CardCurtainRevealTitle>

              {/* Description: Invisible first, shown on hover */}
              <CardCurtainRevealDescription className="max-w-lg mx-auto">
                <p className="text-xs sm:text-sm text-zinc-300/90 leading-relaxed font-normal pt-1">
                  Have a favorite pet, cartoon character, or special memory? Share a description or reference picture and our artisan family will crochet it to life for you.
                </p>
              </CardCurtainRevealDescription>

              {/* Action Button: Invisible first, shown on hover */}
              <CardCurtainRevealAction className="pt-1 pb-1">
                <FlowButton
                  href="/custom-order"
                  variant="light"
                  icon={Wand2}
                  text="Start Custom Order Form"
                  className="min-w-[240px] px-8 py-3 text-xs font-bold shadow-xl"
                />
              </CardCurtainRevealAction>
            </div>

            <CardCurtain className="bg-zinc-50/10 pointer-events-none" />
          </CardCurtainRevealBody>

          {/* Curtain Reveal Footer Showcase Image - seamlessly flush with no black separation */}
          <CardCurtainRevealFooter className="mt-0 w-full relative overflow-hidden border-t-0">
            <div className="h-36 sm:h-44 w-full relative">
              <img
                width="100%"
                height="100%"
                alt="Artisan yarn crafting workshop"
                className="w-full h-full object-cover object-center brightness-95 contrast-105"
                src="https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=1400&q=80"
              />
            </div>
          </CardCurtainRevealFooter>
        </CardCurtainReveal>
      </FadeInSection>

      {/* 4. TRUST & SERVICES STRIP */}
      <FadeInSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[28px] sm:rounded-[32px] bg-white dark:bg-[#0A0604] p-3.5 sm:p-5 lg:p-6 border border-peach-200/90 dark:border-warmbrown-900/70 shadow-soft">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-5">
            {/* 001: Handmade with Care */}
            <div className="relative overflow-hidden rounded-[22px] sm:rounded-[26px] bg-gradient-to-b from-[#FFF5EC] via-[#FDF0E5] to-[#F7DFC9] dark:from-[#2E180E] dark:via-[#23120A] dark:to-[#170B06] border border-peach-200/90 dark:border-peach-300/15 p-6 sm:p-7 min-h-[320px] sm:min-h-[360px] flex flex-col justify-between shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-peach-300 dark:hover:border-peach-300/35 hover:shadow-md group">
              <div className="absolute -top-16 -right-16 w-36 h-36 bg-peach-400/15 dark:bg-peach-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-peach-400/25 transition-all duration-500" />
              
              <div>
                <span className="font-mono text-xs tracking-widest text-warmbrown-600 dark:text-peach-300/60 uppercase font-bold">
                  ( 001 )
                </span>
                <div className="pt-6 sm:pt-8">
                  <Heart className="w-10 h-10 sm:w-11 sm:h-11 text-warmbrown-800 dark:text-peach-200 stroke-[1.75] group-hover:scale-105 transition-transform duration-300" />
                </div>
              </div>

              <div className="pt-10 sm:pt-14 space-y-2">
                <h3 className="font-extrabold text-base sm:text-lg tracking-wider uppercase text-warmbrown-900 dark:text-peach-50">
                  Handmade with Care
                </h3>
                <p className="text-xs sm:text-sm text-warmbrown-700/90 dark:text-peach-100/75 leading-relaxed font-normal">
                  100% hand-crocheted using non-toxic, hypoallergenic yarns and safety-locked stitches.
                </p>
              </div>
            </div>

            {/* 002: Safe Gift Packaging */}
            <div className="relative overflow-hidden rounded-[22px] sm:rounded-[26px] bg-gradient-to-b from-[#FFF9EE] via-[#FEF3DC] to-[#FCE8BD] dark:from-[#38220E] dark:via-[#2A1809] dark:to-[#1B0F05] border border-amber-200/90 dark:border-amber-300/15 p-6 sm:p-7 min-h-[320px] sm:min-h-[360px] flex flex-col justify-between shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 dark:hover:border-amber-300/35 hover:shadow-md group">
              <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-400/15 dark:bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-400/25 transition-all duration-500" />
              
              <div>
                <span className="font-mono text-xs tracking-widest text-amber-700 dark:text-amber-300/60 uppercase font-bold">
                  ( 002 )
                </span>
                <div className="pt-6 sm:pt-8">
                  <Package className="w-10 h-10 sm:w-11 sm:h-11 text-amber-800 dark:text-amber-200 stroke-[1.75] group-hover:scale-105 transition-transform duration-300" />
                </div>
              </div>

              <div className="pt-10 sm:pt-14 space-y-2">
                <h3 className="font-extrabold text-base sm:text-lg tracking-wider uppercase text-amber-950 dark:text-amber-50">
                  Safe Gift Packaging
                </h3>
                <p className="text-xs sm:text-sm text-amber-900/90 dark:text-amber-100/75 leading-relaxed font-normal">
                  Every order arrives in a padded gift box with custom birth tags and hand-written gift notes.
                </p>
              </div>
            </div>

            {/* 003: Direct Chat with Maker */}
            <div className="relative overflow-hidden rounded-[22px] sm:rounded-[26px] bg-gradient-to-b from-[#F2FAF5] via-[#E4F5EB] to-[#CEEBD9] dark:from-[#142C1E] dark:via-[#0E2015] dark:to-[#08130D] border border-emerald-200/90 dark:border-emerald-300/15 p-6 sm:p-7 min-h-[320px] sm:min-h-[360px] flex flex-col justify-between shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 dark:hover:border-emerald-300/35 hover:shadow-md group">
              <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-400/15 dark:bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-400/25 transition-all duration-500" />
              
              <div>
                <span className="font-mono text-xs tracking-widest text-emerald-700 dark:text-emerald-300/60 uppercase font-bold">
                  ( 003 )
                </span>
                <div className="pt-6 sm:pt-8">
                  <MessageCircle className="w-10 h-10 sm:w-11 sm:h-11 text-emerald-800 dark:text-emerald-200 stroke-[1.75] group-hover:scale-105 transition-transform duration-300" />
                </div>
              </div>

              <div className="pt-10 sm:pt-14 space-y-2">
                <h3 className="font-extrabold text-base sm:text-lg tracking-wider uppercase text-emerald-950 dark:text-emerald-50">
                  Direct Chat with Maker
                </h3>
                <p className="text-xs sm:text-sm text-emerald-900/90 dark:text-emerald-100/75 leading-relaxed font-normal">
                  Chat directly with our artisan family on Instagram or WhatsApp for questions and updates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </FadeInSection>

      {/* 5. FAQ PREVIEW SECTION */}
      <FadeInSection id="faq" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-warmbrown-500 dark:text-peach-300/60 uppercase tracking-widest">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-warmbrown-800 dark:text-peach-100">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="rounded-[28px] sm:rounded-[32px] bg-white dark:bg-[#140D08] border border-peach-200/80 dark:border-warmbrown-900/70 shadow-soft overflow-hidden divide-y divide-peach-200/60 dark:divide-warmbrown-900/60">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="group transition-colors">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left py-5 sm:py-6 px-6 sm:px-8 flex items-center gap-4 sm:gap-5 cursor-pointer focus:outline-none transition-colors"
                aria-expanded={openFaq === idx}
              >
                {openFaq === idx ? (
                  <Minus className="w-5 h-5 sm:w-5.5 sm:h-5.5 shrink-0 text-warmbrown-900 dark:text-peach-200 stroke-[2.2]" />
                ) : (
                  <Plus className="w-5 h-5 sm:w-5.5 sm:h-5.5 shrink-0 text-warmbrown-500 dark:text-peach-300/70 stroke-[2.2] group-hover:text-warmbrown-800 dark:group-hover:text-peach-200 transition-colors" />
                )}
                <span className="font-bold text-base sm:text-lg lg:text-xl text-warmbrown-900 dark:text-peach-100 group-hover:text-warmbrown-700 dark:group-hover:text-peach-300 transition-colors">
                  {faq.question}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {openFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 sm:px-8 pb-7 sm:pb-8 pt-1">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 pt-4 border-t border-peach-100 dark:border-warmbrown-900/40 items-end">
                        {/* Left narrative answer */}
                        <div className="lg:col-span-7">
                          <p className="text-sm sm:text-base text-warmbrown-700 dark:text-peach-200/85 leading-relaxed font-normal">
                            {faq.answer}
                          </p>
                        </div>

                        {/* Right side metadata & action button */}
                        <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-5">
                          <div>
                            <span className="text-[11px] font-bold tracking-widest uppercase text-warmbrown-400 dark:text-peach-300/60 font-mono block mb-1.5">
                              {faq.sideTitle || 'RELATED DETAILS'}
                            </span>
                            <p className="text-xs sm:text-sm text-warmbrown-600 dark:text-peach-200/70 leading-relaxed font-normal">
                              {faq.sideDetails}
                            </p>
                          </div>

                          <div className="pt-2 flex justify-start lg:justify-end">
                            <FlowButton
                              href={faq.actionHref || '/collections'}
                              size="compact"
                              variant="filled"
                              text={faq.actionText || 'Explore More'}
                              className="min-w-[150px] text-xs font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </FadeInSection>
    </div>
  );
}
