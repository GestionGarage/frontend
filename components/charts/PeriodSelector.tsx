'use client';
import { motion } from 'motion/react';
import { type Periode } from '@/lib/hooks/usePeriod';
import { Calendar } from 'lucide-react';

const PERIODES: Array<{ value: Periode; label: string }> = [
  { value: 'day',      label: "Auj." },
  { value: 'week',     label: 'Semaine' },
  { value: 'month',    label: 'Mois' },
  { value: '6months',  label: '6 mois' },
  { value: 'year',     label: 'Année' },
];

interface PeriodSelectorProps {
  value: Periode;
  onChange: (p: Periode) => void;
  dateDebut?: string;
  dateFin?: string;
  onCustomChange?: (debut: string, fin: string) => void;
}

export default function PeriodSelector({
  value,
  onChange,
  dateDebut,
  dateFin,
  onCustomChange,
}: PeriodSelectorProps) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Quick period pills */}
      <div
        className="flex items-center rounded-xl p-1 gap-0.5"
        style={{ backgroundColor: 'var(--bg-raised)', border: '1px solid var(--border-default)' }}
      >
        {PERIODES.map((p) => {
          const isActive = value === p.value;
          return (
            <button
              key={p.value}
              onClick={() => onChange(p.value)}
              className="relative px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-150"
              style={{ color: isActive ? '#FFFFFF' : '#6B7280' }}
            >
              {isActive && (
                <motion.div
                  layoutId="period-pill"
                  className="absolute inset-0 rounded-lg"
                  style={{ backgroundColor: '#C5A059' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <span className="relative z-10">{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Custom date range toggle */}
      <button
        onClick={() => onChange('custom')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150"
        style={{
          backgroundColor: value === 'custom' ? 'rgba(197,160,89,0.08)' : 'var(--bg-raised)',
          border: `1px solid ${value === 'custom' ? 'rgba(197,160,89,0.30)' : 'var(--border-default)'}`,
          color: value === 'custom' ? '#A8863A' : '#6B7280',
        }}
      >
        <Calendar size={12} />
        Personnalisé
      </button>

      {/* Custom date inputs */}
      {value === 'custom' && onCustomChange && (
        <motion.div
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-wrap items-center gap-2"
        >
          <input
            type="date"
            value={dateDebut ?? ''}
            onChange={(e) => onCustomChange(e.target.value, dateFin ?? '')}
            className="input-base w-32 sm:w-36 py-1.5 text-xs"
          />
          <span className="text-neutral-400 text-xs">→</span>
          <input
            type="date"
            value={dateFin ?? ''}
            onChange={(e) => onCustomChange(dateDebut ?? '', e.target.value)}
            className="input-base w-32 sm:w-36 py-1.5 text-xs"
          />
        </motion.div>
      )}
    </div>
  );
}
