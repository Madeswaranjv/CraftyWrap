"use client"

import * as React from "react"
import { HTMLMotionProps, Variants, motion } from "framer-motion"

import { cn } from "@/lib/utils"

const curtainVriants: Variants = {
  visible: {
    clipPath: "polygon(0 0,100% 0,100% 100%,0 100%)",
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 1.5, 0.5, 1],
    },
  },

  hidden: {
    clipPath: "polygon(50% 0,50% 0,50% 100%,50% 100%)",
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 1.5, 0.5, 1],
    },
  },
}

interface CardCurtainRevealContextValue {
  isMouseIn: boolean
}
const CardCurtainRevealContext = React.createContext<
  CardCurtainRevealContextValue | undefined
>(undefined)

export function useCardCurtainRevealContext() {
  const context = React.useContext(CardCurtainRevealContext)
  if (!context) {
    throw new Error(
      "useCardCurtainRevealContext must be used within a CardCurtainReveal Component"
    )
  }
  return context
}

const CardCurtainReveal = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  const [isMouseIn, setIsMouseIn] = React.useState(false)
  const handleMouseEnter = React.useCallback(() => setIsMouseIn(true), [])
  const handleMouseLeave = React.useCallback(() => setIsMouseIn(false), [])

  return (
    <CardCurtainRevealContext.Provider value={{ isMouseIn }}>
      <div
        ref={ref}
        className={cn(
          "relative flex flex-col gap-0 overflow-hidden",
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseEnter}
        {...props}
      >
        {children}
      </div>
    </CardCurtainRevealContext.Provider>
  )
})
CardCurtainReveal.displayName = "CardCurtainReveal"

const CardCurtainRevealFooter = React.forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div">
>(({ className, ...props }, ref) => {
  const { isMouseIn } = useCardCurtainRevealContext()

  return (
    <motion.div
      ref={ref}
      className={cn("overflow-hidden", className)}
      initial={false}
      animate={
        isMouseIn
          ? {
              opacity: 1,
              height: "auto",
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            }
          : {
              opacity: 0,
              height: 0,
              clipPath: "polygon(50% 0, 50% 0, 50% 100%, 50% 100%)",
            }
      }
      transition={{ duration: 0.4, ease: [0.25, 1.5, 0.5, 1] }}
      {...props}
    />
  )
})
CardCurtainRevealFooter.displayName = "CardCurtainRevealFooter"

const CardCurtainRevealBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("flex-1", className)} {...props} />
})
CardCurtainRevealBody.displayName = "CardCurtainRevealBody"

const CardCurtainRevealTitle = React.forwardRef<
  HTMLHeadingElement,
  HTMLMotionProps<"h2">
>(({ className, ...props }, ref) => {
  return (
    <motion.h2
      ref={ref}
      className={className}
      layout
      transition={{ duration: 0.35, ease: "easeOut" }}
      {...props}
    />
  )
})
CardCurtainRevealTitle.displayName = "CardCurtainRevealTitle"

const CardCurtainRevealHeader = React.forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div">
>(({ className, ...props }, ref) => {
  const { isMouseIn } = useCardCurtainRevealContext()

  return (
    <motion.div
      ref={ref}
      className={cn("overflow-hidden", className)}
      initial={false}
      animate={
        isMouseIn
          ? { opacity: 1, height: "auto", y: 0 }
          : { opacity: 0, height: 0, y: -10 }
      }
      transition={{ duration: 0.35, ease: "easeOut" }}
      {...props}
    />
  )
})
CardCurtainRevealHeader.displayName = "CardCurtainRevealHeader"

const CardCurtainRevealAction = React.forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div">
>(({ className, ...props }, ref) => {
  const { isMouseIn } = useCardCurtainRevealContext()

  return (
    <motion.div
      ref={ref}
      className={cn("overflow-hidden", className)}
      initial={false}
      animate={
        isMouseIn
          ? { opacity: 1, height: "auto", y: 0, pointerEvents: "auto" }
          : { opacity: 0, height: 0, y: 10, pointerEvents: "none" }
      }
      transition={{ duration: 0.35, ease: "easeOut" }}
      {...props}
    />
  )
})
CardCurtainRevealAction.displayName = "CardCurtainRevealAction"

const CardCurtainRevealTeaser = React.forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div">
>(({ className, ...props }, ref) => {
  const { isMouseIn } = useCardCurtainRevealContext()

  return (
    <motion.div
      ref={ref}
      className={className}
      animate={
        isMouseIn
          ? { opacity: 0, scale: 0.95, pointerEvents: "none" }
          : { opacity: 1, scale: 1, pointerEvents: "auto" }
      }
      transition={{ duration: 0.3, ease: "easeOut" }}
      {...props}
    />
  )
})
CardCurtainRevealTeaser.displayName = "CardCurtainRevealTeaser"

const CardCurtain = React.forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  ({ className, ...props }, ref) => {
    const { isMouseIn } = useCardCurtainRevealContext()

    return (
      <motion.div
        ref={ref}
        className={cn(
          "pointer-events-none absolute inset-0 size-full mix-blend-difference",
          className
        )}
        variants={curtainVriants}
        animate={isMouseIn ? "visible" : "hidden"}
        {...props}
      />
    )
  }
)
CardCurtain.displayName = "CardCurtain"

const CardCurtainRevealDescription = React.forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div">
>(({ className, ...props }, ref) => {
  const { isMouseIn } = useCardCurtainRevealContext()

  return (
    <motion.div
      ref={ref}
      className={cn("overflow-hidden", className)}
      initial={false}
      animate={
        isMouseIn
          ? {
              opacity: 1,
              height: "auto",
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            }
          : {
              opacity: 0,
              height: 0,
              clipPath: "polygon(50% 0, 50% 0, 50% 100%, 50% 100%)",
            }
      }
      transition={{ duration: 0.4, ease: [0.25, 1.5, 0.5, 1] }}
      {...props}
    />
  )
})
CardCurtainRevealDescription.displayName = "CardCurtainRevealDescription"

export {
  CardCurtainReveal,
  CardCurtainRevealBody,
  CardCurtainRevealFooter,
  CardCurtainRevealHeader,
  CardCurtainRevealTitle,
  CardCurtainRevealDescription,
  CardCurtainRevealAction,
  CardCurtainRevealTeaser,
  CardCurtain,
}

