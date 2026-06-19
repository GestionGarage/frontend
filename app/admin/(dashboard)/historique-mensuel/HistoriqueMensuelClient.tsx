'use client';
import Link from 'next/link';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight, CalendarRange } from 'lucide-react';
import { formatMontant } from '@/lib/formatters';

export interface HistoricalRow {
  mois: string;
  chiffre_affaires: number;
  cout_matieres: number;
  depenses_vehicule: number;
  depenses: number;
  benefice: number;
  marge_pct: number;
  nb_commandes: number;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Props {
  rows: HistoricalRow[];
  meta: Meta;
  currentPage: number;
}

const MONTH_NAMES_FULL: Record<string, string> = {
  '01': 'Janvier', '02': 'Février', '03': 'Mars', '04': 'Avril',
  '05': 'Mai', '06': 'Juin', '07': 'Juillet', '08': 'Août',
  '09': 'Septembre', '10': 'Octobre', '11': 'Novembre', '12': 'Décembre',
};

function formatMois(mois: string): string {
  const [year, month] = mois.split('-');
  return `${MONTH_NAMES_FULL[month] ?? month} ${year}`;
}

export default function HistoriqueMensuelClient({ rows, meta, currentPage }: Props) {
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < meta.totalPages;

  return (
    <div className="space-y-6">
      {/* Summary KPIs for visible rows */}
      {rows.length > 0 && (() => {
        const totalCA  = rows.reduce((s, r) => s + r.chiffre_affaires, 0);
        const totalBen = rows.reduce((s, r) => s + r.benefice, 0);
        const totalCmds = rows.reduce((s, r) => s + r.nb_commandes, 0);
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              { label: 'CA (période)', value: formatMontant(totalCA), color: '#C5A059' },
              { label: 'Bénéfice net', value: formatMontant(totalBen), color: totalBen >= 0 ? '#A8863A' : '#64748B' },
              { label: 'Commandes', value: String(totalCmds), color: '#374151' },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="rounded-2xl p-4"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(197,160,89,0.12)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
              >
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-lg sm:text-xl font-bold tabular-nums" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(197,160,89,0.12)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
      >
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(197,160,89,0.10)', backgroundColor: '#F8F7F4' }}
        >
          <div>
            <h3 className="font-bold text-sm text-neutral-700 uppercase tracking-wider">Historique mensuel</h3>
            <p className="text-xs text-neutral-400 mt-0.5">{meta.total} mois disponibles</p>
          </div>
          {meta.totalPages > 1 && (
            <span className="text-xs text-neutral-400 font-medium">
              Page {currentPage} / {meta.totalPages}
            </span>
          )}
        </div>

        {rows.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: 'rgba(197,160,89,0.08)' }}
            >
              <CalendarRange size={24} style={{ color: '#C5A059' }} />
            </div>
            <p className="font-semibold text-sm text-neutral-700 mb-1">Aucune donnée historique</p>
            <p className="text-xs text-neutral-400">Les données apparaîtront dès que des commandes seront enregistrées.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: '#FAFAFA', borderBottom: '1px solid rgba(197,160,89,0.08)' }}>
                  {[
                    { label: 'Mois', align: 'left' },
                    { label: 'CA', align: 'right' },
                    { label: 'Matières', align: 'right', hide: 'sm' },
                    { label: 'Véhicule', align: 'right', hide: 'md' },
                    { label: 'Dép. totales', align: 'right', hide: 'lg' },
                    { label: 'Bénéfice', align: 'right' },
                    { label: 'Marge', align: 'right', hide: 'lg' },
                    { label: 'Cmds', align: 'right' },
                  ].map(({ label, align, hide }) => (
                    <th
                      key={label}
                      className={`table-th ${hide === 'sm' ? 'hidden sm:table-cell' : hide === 'md' ? 'hidden md:table-cell' : hide === 'lg' ? 'hidden lg:table-cell' : ''}`}
                      style={{ textAlign: align as 'left' | 'right' }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const isProfit = row.benefice >= 0;
                  return (
                    <motion.tr
                      key={row.mois}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02, duration: 0.2 }}
                      style={{ borderTop: '1px solid rgba(197,160,89,0.07)' }}
                      className="hover:bg-neutral-50/60 transition-colors"
                    >
                      <td className="table-td font-semibold text-neutral-700">{formatMois(row.mois)}</td>
                      <td className="table-td text-right font-bold tabular-nums" style={{ color: '#C5A059' }}>
                        {formatMontant(row.chiffre_affaires)}
                      </td>
                      <td className="table-td text-right tabular-nums text-neutral-500 hidden sm:table-cell">
                        {formatMontant(row.cout_matieres)}
                      </td>
                      <td className="table-td text-right tabular-nums text-neutral-500 hidden md:table-cell">
                        {formatMontant(row.depenses_vehicule)}
                      </td>
                      <td className="table-td text-right tabular-nums text-neutral-400 hidden lg:table-cell">
                        {formatMontant(row.depenses)}
                      </td>
                      <td className="table-td text-right">
                        <span
                          className="inline-flex items-center gap-1 font-bold tabular-nums text-sm"
                          style={{ color: isProfit ? '#A8863A' : '#64748B' }}
                        >
                          {isProfit ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                          {formatMontant(row.benefice)}
                        </span>
                      </td>
                      <td className="table-td text-right tabular-nums text-neutral-400 hidden lg:table-cell">
                        {row.marge_pct.toFixed(1)}%
                      </td>
                      <td className="table-td text-right font-semibold text-neutral-600">
                        {row.nb_commandes}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderTop: '1px solid rgba(197,160,89,0.10)', backgroundColor: '#FAFAFA' }}
          >
            <Link
              href={hasPrev ? `/admin/historique-mensuel?page=${currentPage - 1}` : '#'}
              aria-disabled={!hasPrev}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${hasPrev ? 'hover:bg-neutral-100' : 'opacity-30 pointer-events-none'}`}
              style={{ color: '#6B7280' }}
            >
              <ChevronLeft size={14} />
              Précédent
            </Link>

            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(meta.totalPages, 7) }, (_, i) => {
                const page = i + 1;
                const isActive = page === currentPage;
                return (
                  <Link
                    key={page}
                    href={`/admin/historique-mensuel?page=${page}`}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-all"
                    style={{
                      backgroundColor: isActive ? '#C5A059' : 'transparent',
                      color: isActive ? '#FFFFFF' : '#6B7280',
                    }}
                  >
                    {page}
                  </Link>
                );
              })}
            </div>

            <Link
              href={hasNext ? `/admin/historique-mensuel?page=${currentPage + 1}` : '#'}
              aria-disabled={!hasNext}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${hasNext ? 'hover:bg-neutral-100' : 'opacity-30 pointer-events-none'}`}
              style={{ color: '#6B7280' }}
            >
              Suivant
              <ChevronRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
