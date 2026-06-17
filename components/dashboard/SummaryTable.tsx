'use client';
import { motion } from 'motion/react';
import type { HistoricalRow } from '@gestion-garage/shared-validators';
import { formatMontant, formatMois } from '@/lib/formatters';

interface Props {
  data: HistoricalRow[];
  isLoading?: boolean;
}

export default function SummaryTable({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div
        className="rounded-2xl p-6 shadow-card"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
      >
        <div className="skeleton h-3.5 w-32 mb-5" />
        <div className="space-y-2.5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-10 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="rounded-2xl shadow-card overflow-hidden"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-default)' }}>
        <h3 className="font-display font-bold text-sm text-neutral-700 uppercase tracking-widest">
          Historique mensuel
        </h3>
        <span className="text-xs text-neutral-400">{data.length} mois</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              {['Mois', 'CA', 'Achats', 'Véhicule', 'Bénéfice', 'Cmds'].map((h, i) => (
                <th
                  key={h}
                  className="table-th"
                  style={{ textAlign: i > 0 ? 'right' : 'left' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <motion.tr
                key={row.mois}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.03 }}
                className="group hover:bg-neutral-50 transition-colors"
              >
                <td className="table-td font-medium text-neutral-700">{formatMois(row.mois)}</td>
                <td className="table-td text-right font-mono text-neutral-600">{formatMontant(row.chiffre_affaires)}</td>
                <td className="table-td text-right font-mono text-neutral-400">{formatMontant(row.cout_matieres)}</td>
                <td className="table-td text-right font-mono text-neutral-400">{formatMontant(row.depenses_vehicule)}</td>
                <td
                  className="table-td text-right font-mono font-semibold"
                  style={{ color: row.benefice >= 0 ? '#059669' : '#DC2626' }}
                >
                  {formatMontant(row.benefice)}
                </td>
                <td className="table-td text-right text-neutral-400">{row.nb_commandes}</td>
              </motion.tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="table-td text-center py-10 text-neutral-300">
                  Aucune donnée disponible
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
