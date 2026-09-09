"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CELL = {
  type: "spring",
  stiffness: 520,
  damping: 34,
  mass: 0.45,
} as const;

const EASE = [0.23, 1, 0.32, 1] as const;
const ROLL = { duration: 0.18, ease: EASE } as const;
const STILL = { duration: 0 } as const;

const slotFor = (digits: number) => Math.max(34, 18 + digits * 8);
const GAP = 4;

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

const arrow = (can: boolean) =>
  `flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] outline-none transition-colors duration-150 focus-visible:bg-peach-200/50 focus-visible:shadow-[inset_0_0_0_1px_#8A5A34] dark:focus-visible:bg-warmbrown-800 dark:focus-visible:shadow-[inset_0_0_0_1px_#F6D9BC] ${
    can
      ? "text-warmbrown-700 hover:bg-peach-100 hover:text-warmbrown-900 dark:text-peach-200 dark:hover:bg-warmbrown-800 dark:hover:text-peach-100 cursor-pointer"
      : "text-warmbrown-300/50 dark:text-warmbrown-700/50 cursor-not-allowed opacity-40"
  }`;

export type PaginationItem = number | "gap-l" | "gap-r";

export function paginate(
  page: number,
  count: number,
  siblings: number,
  boundaries: number,
): PaginationItem[] {
  const total = 2 * boundaries + 2 * siblings + 3;
  if (count <= total) return range(1, count);

  const nearStart = page < boundaries + siblings + 2;
  const nearEnd = page > count - boundaries - siblings - 1;

  if (nearStart) {
    return [
      ...range(1, 2 * siblings + boundaries + 2),
      "gap-r",
      ...range(count - boundaries + 1, count),
    ];
  }
  if (nearEnd) {
    return [
      ...range(1, boundaries),
      "gap-l",
      ...range(count - 2 * siblings - boundaries - 1, count),
    ];
  }
  return [
    ...range(1, boundaries),
    "gap-l",
    ...range(page - siblings, page + siblings),
    "gap-r",
    ...range(count - boundaries + 1, count),
  ];
}

export type UsePaginationOptions = {
  count: number;
  page?: number;
  defaultPage?: number;
  siblings?: number;
  boundaries?: number;
  onPageChange?: (page: number) => void;
};

export function usePagination({
  count,
  page,
  defaultPage = 1,
  siblings = 1,
  boundaries = 1,
  onPageChange,
}: UsePaginationOptions) {
  const clampTo = useCallback(
    (value: number) => Math.min(Math.max(1, value), Math.max(1, count)),
    [count],
  );

  const [internal, setInternal] = useState(() => clampTo(defaultPage));
  const controlled = page !== undefined;
  const current = clampTo(controlled ? page : internal);

  const emit = useRef(onPageChange);
  emit.current = onPageChange;

  const previous = useRef(current);
  const direction = current >= previous.current ? 1 : -1;
  useEffect(() => {
    previous.current = current;
  }, [current]);

  const goTo = useCallback(
    (value: number) => {
      const next = clampTo(value);
      if (next === previous.current) return;
      if (!controlled) setInternal(next);
      emit.current?.(next);
    },
    [clampTo, controlled],
  );

  const items = paginate(current, count, siblings, boundaries);

  return {
    page: current,
    count,
    items,
    direction,
    thumbIndex: items.indexOf(current),
    canPrev: current > 1,
    canNext: current < count,
    goTo,
    prev: () => goTo(current - 1),
    next: () => goTo(current + 1),
  };
}

export type PaginationProps = {
  count: number;
  page?: number;
  defaultPage?: number;
  siblings?: number;
  boundaries?: number;
  onPageChange?: (page: number) => void;
  label?: string;
  className?: string;
};

export function Pagination({
  count,
  page,
  defaultPage,
  siblings = 1,
  boundaries = 1,
  onPageChange,
  label = "Pagination",
  className = "",
}: PaginationProps) {
  const pagination = usePagination({
    count,
    page,
    defaultPage,
    siblings,
    boundaries,
    onPageChange,
  });
  const { items, direction, thumbIndex, canPrev, canNext } = pagination;
  const current = pagination.page;

  const reduced = useReducedMotion();
  const digits = String(Math.max(1, count)).length;
  const slot = slotFor(digits);

  const [spoken, setSpoken] = useState("");
  useEffect(() => {
    const t = setTimeout(
      () => setSpoken(`Page ${current} of ${Math.max(1, count)}`),
      500,
    );
    return () => clearTimeout(t);
  }, [current, count]);

  return (
    <nav
      aria-label={label}
      className={`inline-flex items-center p-1.5 rounded-2xl bg-white/90 dark:bg-[#1F1610] border border-peach-200 dark:border-warmbrown-800 shadow-soft ${className}`}
    >
      <div className="flex items-center" style={{ gap: GAP }}>
        <button
          type="button"
          aria-label="Previous page"
          aria-disabled={!canPrev}
          disabled={!canPrev}
          onClick={() => canPrev && pagination.prev()}
          className={arrow(canPrev)}
        >
          <ChevronLeft size={16} />
        </button>
        <div className="relative">
          <motion.span
            aria-hidden
            initial={false}
            animate={{ x: thumbIndex * (slot + GAP) }}
            transition={reduced ? STILL : CELL}
            style={{ width: slot }}
            className="absolute inset-y-0 left-0 rounded-[9px] bg-warmbrown-800 dark:bg-peach-200 shadow-xs"
          />
          <ol className="relative flex" style={{ gap: GAP }}>
            {items.map((item) => {
              if (typeof item !== "number") {
                return (
                  <li
                    key={item}
                    aria-hidden
                    style={{ width: slot }}
                    className="flex h-8 items-center justify-center text-[12.5px] font-bold text-warmbrown-400 dark:text-peach-300/50"
                  >
                    &hellip;
                  </li>
                );
              }

              const selected = item === current;
              return (
                <li key={`slot-${item}`} style={{ width: slot }}>
                  <button
                    type="button"
                    aria-label={`Page ${item}`}
                    aria-current={selected ? "page" : undefined}
                    onClick={() => pagination.goTo(item)}
                    className={`flex h-8 w-full items-center justify-center rounded-[9px] text-[12.5px] font-semibold tabular-nums outline-none transition-colors duration-150 focus-visible:bg-peach-200/50 focus-visible:shadow-[inset_0_0_0_1px_#8A5A34] dark:focus-visible:bg-warmbrown-800 dark:focus-visible:shadow-[inset_0_0_0_1px_#F6D9BC] cursor-pointer ${
                      selected
                        ? "font-bold text-white dark:text-warmbrown-900"
                        : "text-warmbrown-700 hover:bg-peach-100 hover:text-warmbrown-900 dark:text-peach-200 dark:hover:bg-warmbrown-800 dark:hover:text-peach-100"
                    }`}
                  >
                    <motion.span
                      key={item}
                      initial={
                        reduced ? false : { opacity: 0, x: 8 * direction }
                      }
                      animate={{ opacity: 1, x: 0 }}
                      transition={reduced ? STILL : ROLL}
                    >
                      {item}
                    </motion.span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
        <button
          type="button"
          aria-label="Next page"
          aria-disabled={!canNext}
          disabled={!canNext}
          onClick={() => canNext && pagination.next()}
          className={arrow(canNext)}
        >
          <ChevronRight size={16} />
        </button>
      </div>
      <span role="status" className="sr-only">
        {spoken}
      </span>
    </nav>
  );
}

export default Pagination;
