'use client';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';

interface HeaderProps {
  title: string;
  action?: React.ReactNode;
  breadcrumb?: Array<{ label: string; href?: string }>;
}

export default function Header({ title, action, breadcrumb }: HeaderProps) {
  return (
    <motion.div
      className="mb-5 sm:mb-7"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="flex items-center gap-1 mb-2">
          {breadcrumb.map((item, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={12} className="text-neutral-300" />}
              {item.href ? (
                <a
                  href={item.href}
                  className="text-xs font-medium text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <span className="text-xs font-medium text-neutral-500">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-headline text-xl sm:text-2xl font-bold tracking-tight leading-none" style={{ color: '#1E293B' }}>
            {title}
          </h1>
          <div
            className="mt-1.5 w-8 h-0.5 rounded-full"
            style={{ background: 'linear-gradient(to right, #C5A059, transparent)' }}
          />
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </motion.div>
  );
}
