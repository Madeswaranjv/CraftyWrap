'use client';

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { Check, Circle, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";

// Define the type for each timeline item
export interface TimelineItem {
  id: string | number;
  title: string;
  date: string;
  status: "completed" | "in-progress" | "pending";
  icon?: React.ReactNode;
  description?: string;
  badge?: string;
  highlight?: boolean;
}

// Define the props for the main component
export interface TrackingTimelineProps {
  items: TimelineItem[];
  className?: string;
}

// Status-specific components for icons to keep the main component clean
const StatusIcon = ({
  status,
  customIcon,
}: {
  status: TimelineItem["status"];
  customIcon?: React.ReactNode;
}) => {
  if (customIcon) {
    return <>{customIcon}</>;
  }

  switch (status) {
    case "completed":
      return <Check className="h-4 w-4 text-white" />;
    case "in-progress":
      return <CircleDot className="h-4 w-4 text-warmbrown-900 dark:text-peach-200" />;
    default:
      return <Circle className="h-3.5 w-3.5 text-warmbrown-400/60 dark:text-warmbrown-600" />;
  }
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 14, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({ items, className }) => {

  return (
    <motion.ol
      className={cn("relative border-l-2 border-peach-200/90 dark:border-warmbrown-800 ml-4 py-1", className)}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <motion.li
            key={item.id}
            className={cn("relative ml-7", isLast ? "mb-1" : "mb-7")}
            variants={itemVariants}
            aria-current={item.status === "in-progress" ? "step" : undefined}
          >
            {/* The icon circle */}
            <span
              className={cn(
                "absolute -left-[39px] top-0 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300 shadow-xs",
                {
                  "bg-emerald-600 border-emerald-500 text-white shadow-emerald-500/20":
                    item.status === "completed",
                  "bg-peach-100 border-warmbrown-600 text-warmbrown-900 ring-4 ring-peach-200/60 dark:bg-warmbrown-800 dark:border-peach-300 dark:text-peach-100":
                    item.status === "in-progress",
                  "bg-peach-50 border-peach-200 text-warmbrown-400 dark:bg-warmbrown-900/50 dark:border-warmbrown-800":
                    item.status === "pending",
                }
              )}
            >
              {/* Pulsing animation for the 'in-progress' state */}
              {item.status === "in-progress" && (
                <span className="absolute h-full w-full animate-ping rounded-full bg-amber-400/40 opacity-75" />
              )}
              <StatusIcon status={item.status} customIcon={item.icon} />
            </span>

            {/* Content: Title, Date, and Description */}
            <div className="flex flex-col space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  className={cn("font-bold text-sm tracking-tight", {
                    "text-warmbrown-900 dark:text-peach-100": item.status === "completed",
                    "text-warmbrown-950 dark:text-white font-extrabold": item.status === "in-progress",
                    "text-warmbrown-500/80 dark:text-peach-300/50": item.status === "pending",
                  })}
                >
                  {item.title}
                </h3>

                {item.badge && (
                  <span
                    className={cn(
                      "px-2 py-0.5 text-[10px] font-bold rounded-full border uppercase tracking-wider",
                      item.status === "in-progress"
                        ? "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-800"
                        : item.status === "completed"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                        : "bg-peach-50 text-warmbrown-500 border-peach-200 dark:bg-warmbrown-900 dark:text-warmbrown-400"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              <time
                className={cn("text-xs leading-relaxed", {
                  "text-warmbrown-800 dark:text-peach-200 font-semibold":
                    item.status === "in-progress",
                  "text-warmbrown-600 dark:text-peach-300/80": item.status === "completed",
                  "text-warmbrown-400 dark:text-warmbrown-600": item.status === "pending",
                })}
              >
                {item.date}
              </time>

              {item.description && (
                <p
                  className={cn("text-xs pt-0.5", {
                    "text-warmbrown-700 dark:text-peach-200/90": item.status !== "pending",
                    "text-warmbrown-400/80 dark:text-peach-400/40": item.status === "pending",
                  })}
                >
                  {item.description}
                </p>
              )}
            </div>
          </motion.li>
        );
      })}
    </motion.ol>
  );
};

export default TrackingTimeline;
