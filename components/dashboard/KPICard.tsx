'use client';
import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { gsap } from 'gsap';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: number;
  formatter?: (v: number) => string;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'primary' | 'success' | 'danger' | 'warning' | 'info';
  icon?: LucideIcon;
  isLoading?: boolean;
}

/* All colors resolved to gold / charcoal / slate — no external semantic hues */
const COLOR_MAP = {
  primary: { text: '#C5A059', bg: 'rgba(197,160,89,0.10)', glow: 'rgba(197,160,89,0.07)' },
  success: { text: '#C5A059', bg: 'rgba(197,160,89,0.10)', glow: 'rgba(197,160,89,0.07)' },
  danger:  { text: '#374151', bg: 'rgba(55,65,81,0.08)',   glow: 'rgba(55,65,81,0.04)'  },
  warning: { text: '#A8863A', bg: 'rgba(168,134,58,0.10)', glow: 'rgba(168,134,58,0.06)' },
  info:    { text: '#64748B', bg: 'rgba(100,116,139,0.09)', glow: 'rgba(100,116,139,0.05)' },
};

const TREND_ICONS = { up: TrendingUp, down: TrendingDown, neutral: Minus };

export default function KPICard({
  label, value, formatter, subtext, trend, trendValue,
  color = 'primary', icon: Icon, isLoading = false,
}: KPICardProps) {
  const valueRef = useRef<HTMLSpanElement>(null);
  const palette = COLOR_MAP[color];

  useEffect(() => {
    if (isLoading || !valueRef.current) return;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: value,
      duration: 1,
      ease: 'power3.out',
      onUpdate: () => {
        if (valueRef.current) {
          valueRef.current.textContent = formatter
            ? formatter(obj.val)
            : Math.round(obj.val).toLocaleString('fr-FR');
        }
      },
    });
  }, [value, formatter, isLoading]);

  if (isLoading) {
    return (
      <div
        className="rounded-2xl p-5 flex flex-col"
        style={{
          minHeight: '140px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}
      >
        <div className="skeleton h-3 w-20 mb-4" />
        <div className="skeleton h-7 w-28 mb-auto" />
        <div className="skeleton h-2.5 w-14 mt-3" />
      </div>
    );
  }

  const TrendIcon = trend ? TREND_ICONS[trend] : null;

  return (
    <motion.div
      className="rounded-2xl p-5 relative overflow-hidden group cursor-default flex flex-col transition-all duration-300"
      style={{
        minHeight: '140px',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05), 0 0 0 1px rgba(197,160,89,0.07)',
      }}
      whileHover={{
        y: -2,
        boxShadow: `0 8px 28px rgba(0,0,0,0.08), 0 0 0 1px ${palette.text}30, 0 0 24px ${palette.glow}`,
        transition: { duration: 0.25 },
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-0 left-0 right-0 h-24 opacity-20"
        style={{ background: `linear-gradient(to bottom, ${palette.glow}, transparent)` }}
      />

      <div className="relative flex flex-col flex-1">
        {/* Label + icon */}
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest leading-none">
            {label}
          </p>
          {Icon && (
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: palette.bg }}
            >
              <Icon size={14} style={{ color: palette.text }} strokeWidth={2} />
            </div>
          )}
        </div>

        {/* Value */}
        <p className="text-2xl font-bold tabular-nums tracking-tight mt-auto" style={{ color: palette.text }}>
          <span ref={valueRef}>
            {formatter ? formatter(value) : value.toLocaleString('fr-FR')}
          </span>
        </p>

        {/* Subtext / trend */}
        <div className="mt-2.5 flex items-center gap-2 min-h-[20px]">
          {trend && TrendIcon && trendValue && (
            <span
              className="inline-flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded-md"
              style={{
                color: trend === 'up' ? '#A8863A' : trend === 'down' ? '#64748B' : '#9CA3AF',
                backgroundColor: trend === 'up' ? 'rgba(197,160,89,0.10)' : trend === 'down' ? 'rgba(100,116,139,0.09)' : 'rgba(156,163,175,0.08)',
              }}
            >
              <TrendIcon size={10} strokeWidth={2.5} />
              {trendValue}
            </span>
          )}
          {subtext && (
            <span className="text-xs text-neutral-400">{subtext}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
