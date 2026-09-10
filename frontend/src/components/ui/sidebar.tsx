"use client";

import { cn } from "@/lib/utils";
import Link, { LinkProps } from "next/link";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

interface Links {
  label: string;
  href?: string;
  icon: React.JSX.Element | React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  count?: number;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        "h-full px-3 py-4 hidden md:flex md:flex-col bg-white dark:bg-[#1A120B] border border-peach-200/80 dark:border-warmbrown-900/80 rounded-2xl shadow-soft w-[280px] flex-shrink-0 transition-colors duration-200 overflow-hidden",
        className
      )}
      animate={{
        width: animate ? (open ? "280px" : "68px") : "280px",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <div
      className={cn(
        "h-12 px-4 py-2 flex flex-row md:hidden items-center justify-between bg-white dark:bg-[#1A120B] border border-peach-200/80 dark:border-warmbrown-900/80 rounded-xl shadow-xs w-full mb-4",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2 text-xs font-bold text-warmbrown-800 dark:text-peach-100">
        <span>Categories & Themes</span>
      </div>
      <div className="flex justify-end z-20">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="p-1.5 rounded-lg text-warmbrown-800 dark:text-peach-200 hover:bg-peach-100 dark:hover:bg-warmbrown-900 transition-colors"
          aria-label="Toggle Categories"
        >
          <Menu className="w-5 h-5 cursor-pointer" />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{
              duration: 0.28,
              ease: "easeInOut",
            }}
            className="fixed h-full w-full inset-0 bg-white/95 dark:bg-[#1A120B]/95 backdrop-blur-md p-6 z-[100] flex flex-col justify-between overflow-y-auto"
          >
            <div
              className="absolute right-6 top-6 z-50 text-warmbrown-800 dark:text-peach-200 p-2 rounded-xl hover:bg-peach-100 dark:hover:bg-warmbrown-900 cursor-pointer"
              onClick={() => setOpen(!open)}
            >
              <X className="w-6 h-6" />
            </div>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
  props?: LinkProps;
}) => {
  const { open, animate } = useSidebar();
  
  const content = (
    <div
      className={cn(
        "flex items-center justify-between w-full rounded-xl px-2.5 py-2 transition-all duration-150 group/sidebar cursor-pointer",
        link.isActive
          ? "bg-warmbrown-800 text-peach-50 dark:bg-peach-500 dark:text-warmbrown-950 font-bold shadow-xs [&_svg]:text-white dark:[&_svg]:text-warmbrown-950"
          : "text-warmbrown-800 dark:text-peach-200 hover:bg-peach-100/80 dark:hover:bg-warmbrown-900/80 hover:text-warmbrown-950 dark:hover:text-peach-50 font-medium",
        className
      )}
      onClick={link.onClick}
    >
      <div className="flex items-center gap-3 shrink-0">
        <span className="w-5 h-5 flex items-center justify-center shrink-0">
          {link.icon}
        </span>
        <motion.span
          animate={{
            display: animate ? (open ? "inline-block" : "none") : "inline-block",
            opacity: animate ? (open ? 1 : 0) : 1,
          }}
          className="text-sm whitespace-nowrap overflow-hidden text-ellipsis group-hover/sidebar:translate-x-0.5 transition-transform duration-150 !p-0 !m-0"
        >
          {link.label}
        </motion.span>
      </div>

      {link.count !== undefined && (
        <motion.span
          animate={{
            display: animate ? (open ? "inline-block" : "none") : "inline-block",
            opacity: animate ? (open ? 1 : 0) : 1,
          }}
          className={cn(
            "text-xs font-mono font-semibold shrink-0 ml-2",
            link.isActive
              ? "text-peach-200 dark:text-warmbrown-900"
              : "text-warmbrown-400 dark:text-peach-300/60"
          )}
        >
          {link.count}
        </motion.span>
      )}
    </div>
  );

  if (link.href && !link.onClick) {
    return (
      <Link href={link.href} className="block w-full" {...props}>
        {content}
      </Link>
    );
  }

  return <div className="block w-full">{content}</div>;
};
