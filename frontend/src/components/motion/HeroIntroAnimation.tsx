'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Heart, RotateCcw, Sparkles } from 'lucide-react';
import { isReducedMotion } from '@/lib/motion';

interface HeroIntroAnimationProps {
  isOpen: boolean;
  state: 'loading' | 'error' | 'replay';
  errorMessage?: string;
  onRetry?: () => void;
}

// High-resolution Vector SVG Yarn Ball Icon for 100% guaranteed cross-platform visibility
const YarnBallIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="32" cy="32" r="28" fill="#F8B195" fillOpacity="0.35" />
    <circle cx="32" cy="32" r="24" fill="#E88A68" stroke="#5C3A21" strokeWidth="2.5" />
    <path d="M 12 28 C 22 16, 42 16, 52 28" stroke="#FFF" strokeWidth="3.5" strokeLinecap="round" opacity="0.95" />
    <path d="M 10 34 C 20 46, 44 46, 54 34" stroke="#FFEAD9" strokeWidth="3.5" strokeLinecap="round" opacity="0.95" />
    <path d="M 26 10 C 14 20, 14 44, 26 54" stroke="#FFF" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
    <path d="M 38 10 C 50 20, 50 44, 38 54" stroke="#FFEAD9" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
    <path d="M 18 20 C 32 32, 32 32, 46 44" stroke="#FDF0E6" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M 46 20 C 32 32, 32 32, 18 44" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" />
    <ellipse cx="32" cy="32" rx="6" ry="12" transform="rotate(30 32 32)" stroke="#5C3A21" strokeWidth="1.5" fill="#E88A68" />
  </svg>
);

export const HeroIntroAnimation: React.FC<HeroIntroAnimationProps> = ({
  isOpen,
  state,
  errorMessage,
  onRetry,
}) => {
  const [hasAutoClosed, setHasAutoClosed] = useState(false);
  const reducedMotion = isReducedMotion();
  const isError = state === 'error';
  const isLoading = state === 'loading';
  const shouldAnimate = !reducedMotion && !isError;
  const eyebrow = isError
    ? 'CraftyWrap Server'
    : state === 'replay'
      ? 'CraftyWrap Handcrafts'
      : 'Connecting to CraftyWrap';
  const title = isError
    ? 'Our shop needs a moment.'
    : state === 'replay'
      ? 'Stitching Handmade Joy...'
      : 'Warming up the yarn basket...';

  useEffect(() => {
    if (!isOpen) {
      setHasAutoClosed(true);
      return;
    }

    if (isError) {
      setHasAutoClosed(false);
      return;
    }

    setHasAutoClosed(false);
    const autoCloseTimer = window.setTimeout(
      () => setHasAutoClosed(true),
      state === 'replay' ? 1_600 : 2_000,
    );
    return () => window.clearTimeout(autoCloseTimer);
  }, [isError, isOpen, state]);

  return (
    <AnimatePresence>
      {isOpen && !hasAutoClosed && (
        <motion.div
          key="hero-intro-curtain"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: 'blur(8px)' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#FFF9F2] via-[#FDF0E6] to-[#FFEAD9] dark:from-[#140E0A] dark:via-[#1A120B] dark:to-[#1F1610] select-none overflow-hidden"
          role={isError ? 'alert' : 'status'}
          aria-live="polite"
          aria-busy={isLoading}
        >
          {/* Animated Ambient Glows */}
          <motion.div
            className="absolute w-96 h-96 bg-amber-300/40 dark:bg-amber-600/20 rounded-full blur-3xl"
            animate={shouldAnimate ? { scale: [1, 1.14, 1], opacity: [0.55, 0.9, 0.55] } : undefined}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute w-72 h-72 bg-peach-300/40 dark:bg-orange-600/20 rounded-full blur-2xl"
            animate={shouldAnimate ? { scale: [0.85, 1.18, 0.85], opacity: [0.35, 0.7, 0.35] } : undefined}
            transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
          />

          <div className="relative z-10 flex flex-col items-center gap-5 text-center px-4 max-w-md">
            {/* Yarn Ball Icon Container */}
            <motion.div
              className="relative w-24 h-24 bg-white dark:bg-[#251A13] rounded-3xl border-2 border-peach-300 dark:border-warmbrown-700 shadow-2xl flex items-center justify-center p-2"
              animate={shouldAnimate ? { rotate: [0, 7, -7, 0], y: [0, -7, 0], scale: [1, 1.05, 1] } : undefined}
              transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
            >
              <YarnBallIcon className="w-16 h-16" />
              {isError ? (
                <div className="absolute -top-2 -right-2 bg-amber-500 text-white p-1.5 rounded-full shadow-md">
                  <AlertCircle size={16} />
                </div>
              ) : (
                <motion.div
                  className="absolute -top-2 -right-2 bg-peach-500 text-white p-1.5 rounded-full shadow-md"
                  animate={shouldAnimate ? { rotate: [0, 20, 0], scale: [1, 1.2, 1] } : undefined}
                  transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Sparkles size={16} />
                </motion.div>
              )}
            </motion.div>

            {/* Title & Badge */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-warmbrown-600 dark:text-peach-300">
                <Heart size={14} className="fill-peach-500 text-peach-500" />
                <span>{eyebrow}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-warmbrown-800 dark:text-peach-100 tracking-tight">
                {title}
              </h2>
            </div>

            {/* Yarn Thread Unwinding Path SVG */}
            <div className="w-56 h-8 relative overflow-hidden flex items-center justify-center">
              <svg className="w-full h-full text-peach-500 dark:text-peach-300" viewBox="0 0 200 24" fill="none">
                <motion.path
                  d="M 0 12 Q 25 2, 50 12 T 100 12 T 150 12 T 200 12"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0.15, pathOffset: 0 }}
                  animate={shouldAnimate ? { pathLength: [0.15, 1, 0.15], pathOffset: [0, 0.5, 1] } : { pathLength: 1 }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                />
              </svg>
            </div>

            {isError ? (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed text-warmbrown-700 dark:text-peach-200">{errorMessage}</p>
                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="inline-flex items-center gap-2 rounded-full bg-warmbrown-800 dark:bg-warmbrown-700 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-colors hover:bg-warmbrown-900"
                  >
                    <RotateCcw size={14} />
                    Try Again
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1.5 text-sm font-semibold text-warmbrown-700 dark:text-peach-200">
                <span>{state === 'replay' ? 'A little handmade magic' : 'Waiting for the shop to respond'}</span>
                {isLoading && !reducedMotion && [0, 1, 2].map((dot) => (
                  <motion.span
                    key={dot}
                    className="h-1.5 w-1.5 rounded-full bg-peach-500 dark:bg-peach-300"
                    animate={{ y: [0, -5, 0], opacity: [0.35, 1, 0.35] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: dot * 0.14, ease: 'easeInOut' }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Quick Skip Intro Button */}
          <button
            type="button"
            onClick={() => setHasAutoClosed(true)}
            className="absolute bottom-6 right-6 text-xs font-bold text-warmbrown-600 dark:text-peach-200 hover:text-warmbrown-900 dark:hover:text-white bg-white/80 dark:bg-warmbrown-900/90 px-4 py-2 rounded-full border border-peach-200 dark:border-warmbrown-800 backdrop-blur-md shadow-sm transition-all hover:scale-105"
          >
            Skip Intro &rarr;
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
