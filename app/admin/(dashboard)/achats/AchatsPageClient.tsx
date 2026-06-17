'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Plus, Trash2, ShoppingCart, Hammer, Layers, Package } from 'lucide-react';
import { formatMontant, formatDate } from '@/lib/formatters';
import { TYPE_MATERIAU_CONFIG } from '@/lib/constants';
import type { AchatEntity } from '@gestion-garage/shared-validators';
import ConfirmDeleteModal from '@/components/ui/ConfirmDeleteModal';
import { deleteAchat } from '@/lib/client-api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/admin';

/* ─── Period filter ─── */
const PERIODS = [
  { key: 'jour',    label: 'Jour',    api: 'day'     },
  { key: 'semaine', label: 'Semaine', api: 'week'    },
  { key: 'mois',    label: 'Mois',    api: 'month'   },
  { key: '6mois',   label: '6 Mois',  api: '6months' },
  { key: 'annee',   label: 'Année',   api: 'year'    },
] as const;
type PeriodKey = typeof PERIODS[number]['key'];

interface AchatsStats {
  total_periode: number;
  nb_achats: number;
  par_materiau: Array<{ type: string; label: string; montant: number; pct: number }>;
}

const EMPTY_STATS: AchatsStats = { total_periode: 0, nb_achats: 0, par_materiau: [] };

/* ─── Unified premium KPI card ─── */
interface KPICardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  color?: string;
  iconBg?: string;
  isLoading?: boolean;
}

function KPICard({ label, value, icon: Icon, color = '#C5A059', iconBg = 'rgba(197,160,89,0.10)', isLoading }: KPICardProps) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: `0 8px 28px rgba(0,0,0,0.08), 0 0 0 1px ${color}30` }}
      transition={{ duration: 0.22 }}
      className="rounded-2xl p-5 relative overflow-hidden cursor-default flex flex-col"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid rgba(197,160,89,0.10)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05), 0 0 0 1px rgba(197,160,89,0.07)',
        minHeight: '140px',
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-20 opacity-20" style={{ background: `linear-gradient(to bottom, ${iconBg}, transparent)` }} />

      <div className="relative flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest leading-none">{label}</p>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: iconBg }}>
            <Icon size={14} style={{ color }} strokeWidth={2} />
          </div>
        </div>
        {isLoading ? (
          <div className="mt-auto h-8 w-24 rounded-lg animate-pulse" style={{ backgroundColor: 'rgba(197,160,89,0.08)' }} />
        ) : (
          <p className="text-2xl font-bold tabular-nums tracking-tight mt-auto" style={{ color }}>
            {value}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function AchatsPageClient() {
  const [period, setPeriod] = useState<PeriodKey>('mois');
  const [achats, setAchats] = useState<AchatEntity[]>([]);
  const [stats, setStats] = useState<AchatsStats>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const apiPeriode = PERIODS.find((p) => p.key === period)?.api ?? 'month';

  const fetchData = useCallback(async (periode: string) => {
    setIsLoading(true);
    try {
      const [achatsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/achats?periode=${periode}&limit=100&sort=date_desc`, { credentials: 'include' }),
        fetch(`${API_URL}/achats/stats?periode=${periode}`, { credentials: 'include' }),
      ]);

      if (achatsRes.ok) {
        const body = await achatsRes.json() as { data: AchatEntity[] };
        if (Array.isArray(body.data)) setAchats(body.data);
      }
      if (statsRes.ok) {
        const body = await statsRes.json() as { data: AchatsStats };
        if (body.data) setStats(body.data);
      }
    } catch {
      // silently keep previous data on network error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData(apiPeriode);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiPeriode]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAchat(deleteTarget);
      setAchats((prev) => prev.filter((a) => a.id !== deleteTarget));
    } catch {
      // keep state unchanged if API call fails
    } finally {
      setDeleteTarget(null);
    }
  };

  const deleteTargetAchat = deleteTarget ? achats.find((a) => a.id === deleteTarget) : null;

  const periodLabel = PERIODS.find((p) => p.key === period)?.label ?? '';

  const ferTotal   = stats.par_materiau.find((m) => m.type === 'metal')?.montant ?? 0;
  const boisTotal  = stats.par_materiau.find((m) => m.type === 'bois')?.montant ?? 0;
  const autreTotal = stats.par_materiau
    .filter((m) => m.type !== 'metal' && m.type !== 'bois')
    .reduce((s, m) => s + m.montant, 0);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="overflow-x-auto max-w-full">
        <div
          className="flex items-center rounded-xl p-1 gap-0.5 w-max"
          style={{ backgroundColor: '#F8F7F4', border: '1px solid rgba(197,160,89,0.12)' }}
        >
          {PERIODS.map((p) => {
            const isActive = period === p.key;
            return (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className="relative px-3.5 py-1.5 text-sm font-semibold rounded-lg transition-all duration-150"
                style={{ color: isActive ? '#FFFFFF' : '#6B7280' }}
              >
                {isActive && (
                  <motion.div
                    layoutId="achats-period-pill"
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
        </div>

        <Link href="/admin/achats/nouvel-achat" className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
          <Plus size={15} strokeWidth={2.5} />
          Nouvel achat
        </Link>
      </div>

      {/* KPI grid — total period + 3 material breakdown cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label={`Achats — ${periodLabel}`}
          value={formatMontant(stats.total_periode)}
          icon={ShoppingCart}
          color="#C5A059"
          iconBg="rgba(197,160,89,0.10)"
          isLoading={isLoading}
        />
        <KPICard
          label="Fer / Métal"
          value={formatMontant(ferTotal)}
          icon={Hammer}
          color="#374151"
          iconBg="rgba(55,65,81,0.08)"
          isLoading={isLoading}
        />
        <KPICard
          label="Bois / MDF"
          value={formatMontant(boisTotal)}
          icon={Layers}
          color="#A8863A"
          iconBg="rgba(168,134,58,0.10)"
          isLoading={isLoading}
        />
        <KPICard
          label="Autre"
          value={formatMontant(autreTotal)}
          icon={Package}
          color="#64748B"
          iconBg="rgba(100,116,139,0.09)"
          isLoading={isLoading}
        />
      </div>

      {/* Table */}
      <div
        className="rounded-2xl shadow-card overflow-hidden"
        style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(197,160,89,0.12)' }}
      >
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(197,160,89,0.10)', backgroundColor: '#F8F7F4' }}
        >
          <h3 className="font-bold text-sm text-neutral-700 uppercase tracking-wider">Journal des achats</h3>
          <span className="text-xs text-neutral-400">{isLoading ? '…' : `${achats.length} entrées`}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="table-th">Date</th>
                <th className="table-th">Type</th>
                <th className="table-th" style={{ textAlign: 'right' }}>Total</th>
                <th className="table-th" style={{ width: '48px' }} />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="table-td text-center py-14 text-neutral-400">
                    Chargement…
                  </td>
                </tr>
              ) : achats.length === 0 ? (
                <tr>
                  <td colSpan={4} className="table-td text-center py-14 text-neutral-400">
                    Aucun achat enregistré pour cette période
                  </td>
                </tr>
              ) : (
                achats.map((a) => (
                  <tr key={a.id} className="group hover:bg-neutral-50 transition-colors">
                    <td className="table-td text-neutral-600 text-xs">
                      {formatDate(a.date_achat)}
                    </td>
                    <td className="table-td">
                      <span
                        className="badge text-xs"
                        style={{
                          backgroundColor: 'rgba(197,160,89,0.07)',
                          color: '#A8863A',
                          border: '1px solid rgba(197,160,89,0.15)',
                        }}
                      >
                        {TYPE_MATERIAU_CONFIG[a.type_materiau]?.label ?? a.type_materiau}
                      </span>
                    </td>
                    <td className="table-td text-right font-bold tabular-nums" style={{ color: '#C5A059' }}>
                      {formatMontant(a.prix_total)}
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => setDeleteTarget(a.id)}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                        title="Supprimer"
                      >
                        <Trash2 size={14} className="text-danger" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title={deleteTargetAchat?.designation ?? ''}
        description="Cet achat sera définitivement supprimé. Cette action ne peut pas être annulée."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
