'use client';
import { motion } from 'motion/react';
import { AlertTriangle } from 'lucide-react';
import type { AnalyticsSummary } from '@gestion-garage/shared-validators';

interface Props {
  summary: AnalyticsSummary;
  threshold?: number;
}

export default function AlertBanner({ summary, threshold = 0.3 }: Props) {
  const ratio =
    summary.chiffre_affaires > 0
      ? summary.depenses_vehicule / summary.chiffre_affaires
      : 0;

  if (ratio < threshold) return null;

  const pct = (ratio * 100).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 rounded-xl px-4 py-3.5 text-sm"
      style={{
        backgroundColor: 'rgba(197,160,89,0.05)',
        border: '1px solid rgba(197,160,89,0.22)',
      }}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ backgroundColor: 'rgba(197,160,89,0.12)' }}
      >
        <AlertTriangle size={14} style={{ color: '#C5A059' }} strokeWidth={2} />
      </div>
      <div>
        <p className="font-semibold text-xs mb-0.5" style={{ color: '#A8863A' }}>
          Alerte dépenses véhicule
        </p>
        <p className="text-xs" style={{ color: '#78716C' }}>
          Les dépenses véhicule représentent{' '}
          <strong style={{ color: '#374151' }}>{pct}%</strong> du chiffre d'affaires sur cette période,
          dépassant le seuil recommandé de {(threshold * 100).toFixed(0)}%.
        </p>
      </div>
    </motion.div>
  );
}
