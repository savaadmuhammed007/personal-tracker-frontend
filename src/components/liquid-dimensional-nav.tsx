"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  to?: string;
  badge?: string;
  color?: string;
}

export interface LiquidDimensionalNavProps extends React.ComponentPropsWithoutRef<"div"> {
  items?: NavItem[];
  primaryColor?: string;
  accentColor?: string;
  bg?: string;
  borderColor?: string;
  activeId?: string;
  onNavigate?: (path: string, item: NavItem) => void;
  onItemChange?: (id: string, item: NavItem) => void;
}

const DEFAULT_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" />
        <rect x="14" y="3" width="7" height="5" />
        <rect x="14" y="12" width="7" height="9" />
        <rect x="3" y="16" width="7" height="5" />
      </svg>
    ),
    content: (
      <div className="h-full w-full flex flex-col gap-4">
        <h3 className="font-['Outfit'] font-bold text-2xl text-white">System Metrics</h3>
        <div className="flex-1 grid grid-cols-2 gap-3">
          <div className="bg-[#111] rounded-xl border border-white/5 p-4 flex flex-col justify-center items-center">
            <span className="text-[#3dc3f3] text-3xl font-mono">99%</span>
            <span className="text-white/50 text-xs mt-1">UPTIME</span>
          </div>
          <div className="bg-[#111] rounded-xl border border-white/5 p-4 flex flex-col justify-center items-center">
            <span className="text-[#00f0ff] text-3xl font-mono">12ms</span>
            <span className="text-white/50 text-xs mt-1">LATENCY</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "network",
    label: "Network",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 14h.01" />
        <path d="M12 14h.01" />
        <path d="M7.5 14h.01" />
        <path d="M12 8h.01" />
        <path d="M3 20h6v-6H3v6z" />
        <path d="M12 14v6" />
        <path d="M12 8v6" />
      </svg>
    ),
    content: (
      <div className="h-full w-full flex flex-col gap-4">
        <h3 className="font-['Outfit'] font-bold text-2xl text-white">Connectivity Net</h3>
        <div className="flex-1 bg-[#111] rounded-xl border border-white/5 p-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(#ff5c71 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
          <motion.div
            animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 rounded-full bg-[#ff5c71] blur-xl absolute top-1/4 left-1/4"
          />
        </div>
      </div>
    ),
  },
  {
    id: "security",
    label: "Security",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    content: (
      <div className="h-full w-full flex flex-col gap-4">
        <h3 className="font-['Outfit'] font-bold text-2xl text-white">Access Protection</h3>
        <div className="flex-1 border border-[#ff5c71]/30 bg-[#ff5c71]/5 rounded-xl flex items-center justify-center p-4">
          <div className="text-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ff5c71" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="text-[#ff5c71] font-mono text-sm uppercase tracking-widest">All Sessions Secured</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "settings",
    label: "Settings",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    content: (
      <div className="h-full w-full flex flex-col gap-4">
        <h3 className="font-['Outfit'] font-bold text-2xl text-white">Configuration Settings</h3>
        <div className="flex-1 bg-[#111] rounded-xl border border-white/5 p-4 flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-2 w-16 bg-white/20 rounded-full" />
              <div className="w-8 h-4 rounded-full bg-white/10 relative">
                <div className="absolute right-0 top-0 bottom-0 w-4 bg-[#3dc3f3] rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

const MagneticIcon = ({
  children,
  isActive,
  onClick,
  onHover,
  accentColor
}: {
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  onHover: () => void;
  accentColor: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate distance for magnetic pull
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    x.set(distanceX * 0.4);
    y.set(distanceY * 0.4);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover();
  };

  return (
    <div
      className="relative p-4 cursor-pointer flex items-center justify-center"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onClick={onClick}
    >
      <motion.div
        ref={ref}
        style={{ x: springX, y: springY }}
        className="relative z-10 w-10 h-10 flex items-center justify-center transition-colors duration-300"
        animate={{ color: isActive || isHovered ? accentColor : "rgba(255,255,255,0.4)" }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export function LiquidDimensionalNav({
  items = DEFAULT_ITEMS,
  primaryColor = "#1eb4eb",
  accentColor = "#3dc3f3",
  bg = "rgba(6, 14, 20, 0.95)",
  borderColor = "rgba(255, 255, 255, 0.08)",
  activeId,
  onNavigate,
  onItemChange,
  className = "",
  style,
  ...props
}: LiquidDimensionalNavProps) {
  const [internalActiveItem, setInternalActiveItem] = useState<string>(items[0]?.id || 'dashboard');
  const activeItem = activeId !== undefined ? activeId : internalActiveItem;
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) return null;

  const currentHover = hoveredItem || activeItem;
  const activeNavItem = items.find((item) => item.id === activeItem) || items[0];
  const activeContent = activeNavItem?.content;

  const handleItemClick = (item: NavItem) => {
    setInternalActiveItem(item.id);
    if (onItemChange) {
      onItemChange(item.id, item);
    }
    if (item.to && onNavigate) {
      onNavigate(item.to, item);
    }
  };

  return (
    <div
      className={`relative w-full min-h-[460px] max-h-[600px] flex items-center justify-center font-['Outfit'] overflow-hidden rounded-3xl ${className}`}
      style={{ backgroundColor: bg, ...style }}
      {...props}
    >
      {/* Background Grid */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
      />

      {/* Ambient Backplate Glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full blur-[100px] pointer-events-none opacity-25"
        style={{
          background: `radial-gradient(circle, ${primaryColor} 0%, ${accentColor} 100%)`
        }}
      />

      <div className="relative flex items-center justify-center h-full max-h-[440px] scale-[0.82] min-[390px]:scale-[0.9] sm:scale-100 transition-transform duration-300">
        {/* The Navigation Bar */}
        <motion.div
          className="relative z-20 w-16 sm:w-20 bg-white/90 dark:bg-slate-950/85 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 rounded-[2rem] py-3.5 flex flex-col items-center justify-between gap-1.5 shadow-md dark:shadow-[0_0_40px_rgba(0,0,0,0.8)]"
          style={{ borderColor: style?.borderColor || undefined }}
          layout
        >
          {/* Liquid Indicator */}
          <div className="absolute inset-y-3.5 left-0 w-full pointer-events-none flex flex-col items-center gap-1.5">
            {items.map((item) => (
              <div key={`indicator-${item.id}`} className="relative h-12 sm:h-14 w-full flex items-center justify-center">
                <AnimatePresence>
                  {currentHover === item.id && (
                    <motion.div
                      layoutId="liquid-blob"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                        mass: 1
                      }}
                      className="absolute w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-sky-500/15 dark:bg-white/[0.08] border border-sky-500/30 dark:border-white/10 shadow-xs dark:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                    >
                      {/* Inner glow dot */}
                      <motion.div
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-3.5 sm:h-4 rounded-full shadow-[0_0_10px_currentColor]"
                        style={{ backgroundColor: primaryColor, color: primaryColor }}
                        layoutId="liquid-dot"
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Nav Items */}
          <div className="flex flex-col gap-1.5 w-full relative z-10" onMouseLeave={() => setHoveredItem(null)}>
            {items.map((item) => {
              const isItemActive = activeItem === item.id || hoveredItem === item.id;
              const isHovered = hoveredItem === item.id;
              return (
                <div
                  key={item.id}
                  className="relative h-11 sm:h-12 w-full flex items-center justify-center cursor-pointer select-none"
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onClick={() => handleItemClick(item)}
                >
                  <motion.div
                    className={`relative z-10 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-colors duration-200 ${
                      !isItemActive ? "text-slate-500 dark:text-slate-400/60 hover:text-slate-900 dark:hover:text-white" : ""
                    }`}
                    animate={{ color: isItemActive ? (item.color || primaryColor) : undefined }}
                  >
                    {item.icon}
                  </motion.div>

                  {/* Sleek Floating Tooltip: Section Name Only */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, x: -8, scale: 0.92 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -8, scale: 0.92 }}
                        transition={{ duration: 0.14, ease: "easeOut" }}
                        className="absolute left-full ml-3.5 z-50 px-3 py-1.5 rounded-xl bg-slate-900/95 dark:bg-[#071926]/95 backdrop-blur-md border border-slate-700/80 dark:border-[#0b5d81] text-white dark:text-[#f0faff] text-xs font-bold whitespace-nowrap shadow-xl shadow-black/25 flex items-center gap-2 pointer-events-none"
                      >
                        <span
                          className="w-2 h-2 rounded-full shadow-xs"
                          style={{ backgroundColor: item.color || primaryColor }}
                        />
                        <span>{item.label}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
