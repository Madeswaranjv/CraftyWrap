import { Variants } from 'framer-motion';

// Craftsman Motion Tokens - Soft, gentle, natural easing for CraftyWrap
export const MOTION_TOKENS = {
  duration: {
    fast: 0.2,
    standard: 0.35,
    slow: 0.5,
    stagger: 0.08,
  },
  ease: [0.25, 0.1, 0.25, 1.0] as [number, number, number, number], // Custom cubic-bezier for smooth organic motion
};

// Check client-side prefers-reduced-motion preference
export const isReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Standard section scroll reveal variants
export const fadeInUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_TOKENS.duration.standard,
      ease: MOTION_TOKENS.ease,
    },
  },
};

// Staggered parent container variants
export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: MOTION_TOKENS.duration.stagger,
    },
  },
};

// Homepage Intro Choreography Variants
export const heroLogoVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.92,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: MOTION_TOKENS.ease,
    },
  },
};

export const heroTaglineVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: MOTION_TOKENS.ease,
    },
  },
};

export const heroBannerVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: MOTION_TOKENS.ease,
    },
  },
};

export const heroCtaVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.25,
      ease: MOTION_TOKENS.ease,
    },
  },
};

// Playful Spring Intro Physics
export const springTransition = {
  type: 'spring' as const,
  stiffness: 120,
  damping: 14,
  mass: 0.8,
};

export const heroSpringContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

export const heroSpringItemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springTransition,
  },
};

export const floatingYarnVariants: Variants = {
  initial: { y: 0, rotate: 0 },
  animate: (i: number = 0) => ({
    y: [0, -12, 0, 8, 0],
    rotate: [0, 8, -6, 4, 0],
    transition: {
      duration: 4 + (i % 3),
      repeat: Infinity,
      ease: 'easeInOut',
      delay: i * 0.4,
    },
  }),
};
