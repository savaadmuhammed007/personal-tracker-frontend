"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface BentoItem {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  icon: React.ReactNode;
  content: string;
  metrics?: { label: string; value: string }[];
  actionLabel?: string;
  detailsLabel?: string;
  badge?: string;
}

export interface DynamicBentoLayoutProps extends React.ComponentPropsWithoutRef<"div"> {
  items?: BentoItem[];
  title?: string;
  subtitle?: string;
  badgeText?: string;
  badgeDotColor?: string;
  onActionClick?: (item: BentoItem, actionType: 'view' | 'action') => void;
}

const DEFAULT_ITEMS: BentoItem[] = [
  {
    id: "model-registry",
    title: "Model Registry",
    subtitle: "Neural Inference",
    color: "#f97066",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    content: "Host and version neural weights locally. Track inference pipeline drift and configure model fallback routes automatically.",
    metrics: [
      { label: "Active Models", value: "24" },
      { label: "Throughput", value: "1.2k/s" },
      { label: "Uptime", value: "99.97%" }
    ]
  },
  {
    id: "vector-ingestion",
    title: "Vector Ingestion",
    subtitle: "Data Pipelines",
    color: "#3dc3f3",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    content: "Index raw unstructured documents into multi-dimensional embeddings within real-time vector subnets with zero pipeline delay.",
    metrics: [
      { label: "Indexed", value: "3.8M" },
      { label: "Queue", value: "12" },
      { label: "Latency", value: "8ms" }
    ]
  },
  {
    id: "response-cache",
    title: "Response Cache",
    subtitle: "Latency Shield",
    color: "#38bdf8",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    content: "Deduplicate identical queries before model calls. Serve cached semantic embeddings directly from memory for instant responses.",
    metrics: [
      { label: "Hit Rate", value: "94.3%" },
      { label: "Saved", value: "$2.4k" },
      { label: "Entries", value: "18k" }
    ]
  },
  {
    id: "guardrails",
    title: "Safety Guardrails",
    subtitle: "Content Filters",
    color: "#fbbf24",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    content: "Enforce safety boundaries on model I/O. Filter toxic inputs and lock unauthorized data leak vectors in real time.",
    metrics: [
      { label: "Blocked", value: "847" },
      { label: "Accuracy", value: "99.1%" },
      { label: "Policies", value: "12" }
    ]
  }
];

/* ─── Small ring chart for metric visualization ─── */
const MetricRing = ({ value, color, size = 26 }: { value: string; color: string; size?: number }) => {
  const numVal = parseFloat(value.replace(/[^0-9.]/g, ""));
  const pct = isNaN(numVal) ? 65 : numVal > 100 ? 65 : numVal;
  const r = (size - 4) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </svg>
  );
};

export const DynamicBentoLayout = React.forwardRef<HTMLDivElement, DynamicBentoLayoutProps>(
  (
    {
      items = DEFAULT_ITEMS,
      title = "System Overview",
      subtitle = "Infrastructure",
      badgeText = "All systems online",
      badgeDotColor = "bg-[#3dc3f3]",
      onActionClick,
      className = "",
      style,
      ...props
    },
    forwardedRef
  ) => {
    const [activeId, setActiveId] = useState<string | null>(null);
    const safeItems = Array.isArray(items) ? items : DEFAULT_ITEMS;
    const internalRef = useRef<HTMLDivElement>(null);
    const ref = (forwardedRef as React.RefObject<HTMLDivElement | null>) || internalRef;

    return (
      <div
        ref={ref}
        className={`relative w-full min-h-0 flex flex-col rounded-2xl overflow-hidden bg-white/90 dark:bg-[#0b1822]/95 border border-slate-200/90 dark:border-[#163246] shadow-soft-lg ${className}`}
        {...props}
      >
        {/* Soft ambient background glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-16 -right-16 w-60 h-60 rounded-full opacity-[0.07] dark:opacity-[0.12]"
            style={{ background: "radial-gradient(circle, #1eb4eb 0%, transparent 70%)" }}
          />
          <div
            className="absolute -bottom-12 -left-12 w-52 h-52 rounded-full opacity-[0.05] dark:opacity-[0.1]"
            style={{ background: "radial-gradient(circle, #088ac1 0%, transparent 70%)" }}
          />
        </div>

        {/* Header */}
        <div className="relative z-10 px-4 pt-3.5 pb-2 flex flex-wrap justify-between items-center gap-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold tracking-wider text-[#088ac1] dark:text-[#3dc3f3] uppercase">
              {subtitle}
            </span>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h2>
          </div>
          {badgeText && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] backdrop-blur-md">
              <span className={`w-1.5 h-1.5 rounded-full ${badgeDotColor} animate-pulse`} />
              <span className="text-[10px] font-semibold text-slate-700 dark:text-white/80">
                {badgeText}
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/[0.08] to-transparent" />

        {/* Bento Grid */}
        <motion.div
          layout
          className={`relative z-10 p-3 sm:p-3.5 flex-1 gap-2.5 flex flex-col ${
            activeId === null
              ? "grid grid-cols-1 sm:grid-cols-2"
              : "md:flex-row min-h-[220px]"
          }`}
        >
          <AnimatePresence mode="popLayout">
            {safeItems.map((item) => {
              const isActive = activeId === item.id;
              const isOther = activeId !== null && !isActive;

              return (
                <motion.div
                  key={item.id}
                  layout
                  layoutId={`bento-${item.id}`}
                  onClick={() => setActiveId(isActive ? null : item.id)}
                  className={`
                    relative group cursor-pointer overflow-hidden rounded-xl border transition-all duration-200
                    ${isActive ? "w-full md:w-[60%] min-h-[220px] md:min-h-0 z-10 shadow-md" : ""}
                    ${isOther ? "w-full md:w-[40%] h-[56px] md:h-auto flex-1 opacity-70 hover:opacity-100" : ""}
                    ${activeId === null ? "w-full h-[105px] sm:h-[110px]" : ""}
                    bg-slate-50/80 dark:bg-[#0a141e]/80 hover:bg-white dark:hover:bg-[#0e1d2b]
                    border-slate-200/90 dark:border-white/[0.06]
                  `}
                  style={{
                    borderColor: isActive ? `${item.color}60` : undefined,
                    backdropFilter: "blur(10px)",
                  }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  whileTap={{ scale: 0.985 }}
                >
                  {/* Hover gradient bloom */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${item.color}15 0%, transparent 70%)`,
                    }}
                  />

                  <div className="p-3 sm:p-3.5 flex flex-col h-full relative z-10">
                    {/* Card header */}
                    <motion.div layout className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <motion.div
                          layout="position"
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            color: item.color,
                            backgroundColor: `${item.color}15`,
                          }}
                        >
                          {item.icon}
                        </motion.div>
                        <motion.div layout="position" className="flex flex-col min-w-0">
                          <motion.span
                            layout="position"
                            className="text-[9px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider leading-tight truncate"
                          >
                            {item.subtitle}
                          </motion.span>
                          <motion.h3
                            layout="position"
                            className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white/90 mt-0.5 leading-tight truncate"
                          >
                            {item.title}
                          </motion.h3>
                        </motion.div>
                      </div>

                      {/* Status dot */}
                      <motion.div
                        layout
                        className="mt-1 w-1.5 h-1.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: item.color,
                          boxShadow: `0 0 6px ${item.color}80`,
                        }}
                      />
                    </motion.div>

                    {/* Collapsed mini metrics */}
                    {!isActive && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-auto pt-1.5 flex items-center gap-3 sm:gap-4"
                      >
                        {item.metrics?.slice(0, 2).map((m, idx) => (
                          <div key={idx} className="flex flex-col">
                            <span className="text-[9px] text-slate-500 dark:text-white/40 leading-tight font-medium">{m.label}</span>
                            <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-white/90 mt-0.5 leading-tight">{m.value}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}

                    {/* Expanded content */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="mt-2.5 flex flex-col flex-1"
                        >
                          <p className="text-[11px] sm:text-xs leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-2 max-w-md">
                            {item.content}
                          </p>

                          {/* Metric cards with ring charts */}
                          <div className="grid grid-cols-3 gap-2 mt-2.5">
                            {item.metrics?.map((m, idx) => (
                              <div
                                key={idx}
                                className="flex flex-col items-center gap-1.5 rounded-lg px-2 py-2 bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04] shadow-xs"
                              >
                                <MetricRing value={m.value} color={item.color} size={26} />
                                <div className="flex flex-col items-center text-center">
                                  <span
                                    className="text-xs font-bold leading-none"
                                    style={{ color: item.color }}
                                  >
                                    {m.value}
                                  </span>
                                  <span className="text-[9px] text-slate-500 dark:text-white/40 mt-1 leading-none">{m.label}</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Action buttons */}
                          <div className="mt-auto pt-2.5 flex gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onActionClick) {
                                  onActionClick(item, "view");
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/[0.05] dark:hover:bg-white/[0.08] dark:text-white/75 dark:hover:text-white transition-all border border-slate-200 dark:border-white/[0.06] cursor-pointer active:scale-[0.97]"
                            >
                              {item.detailsLabel || "View Details"}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onActionClick) {
                                  onActionClick(item, "action");
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border border-transparent cursor-pointer active:scale-[0.97]"
                              style={{
                                backgroundColor: `${item.color}25`,
                                color: item.color,
                              }}
                            >
                              {item.actionLabel || "Configure"}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }
);

DynamicBentoLayout.displayName = "DynamicBentoLayout";
