'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Plus, Trash2, Fuel, Truck, TrendingDown, Wrench } from 'lucide-react';
import { formatMontant, formatDate } from '@/lib/formatters';
import { TYPE_DEPENSE_CONFIG } from '@/lib/constants';
import type { VehiculeDepenseEntity } from '@gestion-garage/shared-validators';
import ConfirmDeleteModal from '@/components/ui/ConfirmDeleteModal';

/* ─── Period filter ─── */
const PERIODS = [
  { key: 'jour',    label: 'Jour'    },
  { key: 'semaine', label: 'Semaine' },
  { key: 'mois',    label: 'Mois'    },
  { key: '6mois',   label: '6 Mois'  },
  { key: 'annee',   label: 'Année'   },
] as const;
type PeriodKey = typeof PERIODS[number]['key'];

const PERIOD_KPI: Record<PeriodKey, { essence: number; livraison: number; pertes: number }> = {
  jour:    { essence: 3_200,    livraison: 0,        pertes: 3_200     },
  semaine: { essence: 21_000,   livraison: 8_500,    pertes: 29_500    },
  mois:    { essence: 68_400,   livraison: 35_000,   pertes: 136_900   },
  '6mois': { essence: 385_000,  livraison: 195_000,  pertes: 757_000   },
  annee:   { essence: 720_000,  livraison: 380_000,  pertes: 1_422_000 },
};

const PLACEHOLDER_DEPENSES: VehiculeDepenseEntity[] = [
  { id: 'p1', type_depense: 'carburant',          montant: 3_200,  date_depense: '2026-06-14', kilometrage: null, prestataire: null, description: null, created_at: '' },
  { id: 'p2', type_depense: 'vidange',            montant: 8_500,  date_depense: '2026-06-10', kilometrage: null, prestataire: null, description: null, created_at: '' },
  { id: 'p3', type_depense: 'reparation',         montant: 25_000, date_depense: '2026-06-05', kilometrage: null, prestataire: null, description: null, created_at: '' },
  { id: 'p4', type_depense: 'carburant',          montant: 3_500,  date_depense: '2026-06-01', kilometrage: null, prestataire: null, description: null, created_at: '' },
  { id: 'p5', type_depense: 'controle_technique', montant: 15_000, date_depense: '2026-05-28', kilometrage: null, prestataire: null, description: null, created_at: '' },
  { id: 'p6', type_depense: 'lavage',             montant: 1_200,  date_depense: '2026-05-20', kilometrage: null, prestataire: null, description: null, created_at: '' },
  { id: 'p7', type_depense: 'carburant',          montant: 3_800,  date_depense: '2026-05-15', kilometrage: null, prestataire: null, description: null, created_at: '' },
  { id: 'p8', type_depense: 'assurance',          montant: 45_000, date_depense: '2026-05-01', kilometrage: null, prestataire: null, description: null, created_at: '' },
  { id: 'p9', type_depense: 'reparation',         montant: 18_000, date_depense: '2026-04-22', kilometrage: null, prestataire: null, description: null, created_at: '' },
];

/* ─── Unified premium KPI card ─── */
interface KPICardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  color?: string;
  iconBg?: string;
}

function KPICard({ label, value, icon: Icon, color = '#C5A059', iconBg = 'rgba(197,160,89,0.10)' }: KPICardProps) {
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
        <p className="text-2xl font-bold tabular-nums tracking-tight mt-auto" style={{ color }}>
          {value}
        </p>
      </div>
    </motion.div>
  );
}

export default function VehiculePageClient() {
  const [period, setPeriod] = useState<PeriodKey>('mois');
  const [depenses, setDepenses] = useState<VehiculeDepenseEntity[]>(PLACEHOLDER_DEPENSES);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
    fetch(`${API_URL}/vehicule/depenses?limit=20&sort=date_desc`, { credentials: 'include' })
      .then((r) => r.json())
      .then((body: { data: VehiculeDepenseEntity[] }) => {
        if (Array.isArray(body.data)) setDepenses(body.data);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setDepenses((prev) => prev.filter((d) => d.id !== deleteTarget));
    setDeleteTarget(null);
  };

  const deleteTargetDepense = deleteTarget ? depenses.find((d) => d.id === deleteTarget) : null;

  const kpi = PERIOD_KPI[period];

  /* Computed from live depenses data — NaN-safe */
  const reparationTotal = useMemo(
    () => depenses.reduce((s, d) => s + (d.type_depense === 'reparation' ? (d.montant || 0) : 0), 0),
    [depenses],
  );

  return (
    <div className="space-y-6">
      {/* Header bar */}
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
                    layoutId="vehicule-period-pill"
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

        <Link href="/vehicule/nouvelle-depense" className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
          <Plus size={15} strokeWidth={2.5} />
          Nouvelle dépense
        </Link>
      </div>

      {/* KPI grid — 4 cards: Essence / Livraison / Total / Réparation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Livraison"
          value={formatMontant(kpi.livraison)}
          icon={Truck}
          color="#C5A059"
          iconBg="rgba(197,160,89,0.10)"
        />
        <KPICard
          label="Total Pertes"
          value={formatMontant(kpi.pertes)}
          icon={TrendingDown}
          color="#374151"
          iconBg="rgba(55,65,81,0.08)"
        />
        <KPICard
          label="Essence"
          value={formatMontant(kpi.essence)}
          icon={Fuel}
          color="#64748B"
          iconBg="rgba(100,116,139,0.09)"
        />
        <KPICard
          label="Réparation"
          value={formatMontant(reparationTotal)}
          icon={Wrench}
          color="#A8863A"
          iconBg="rgba(168,134,58,0.10)"
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
          <h3 className="font-bold text-sm text-neutral-700 uppercase tracking-wider">Journal des dépenses</h3>
          <span className="text-xs text-neutral-400">{depenses.length} entrées</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="table-th">Date</th>
                <th className="table-th">Type</th>
                <th className="table-th" style={{ textAlign: 'right' }}>Montant</th>
                <th className="table-th" style={{ width: '48px' }} />
              </tr>
            </thead>
            <tbody>
              {depenses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="table-td text-center py-14 text-neutral-400">
                    Aucune dépense enregistrée
                  </td>
                </tr>
              ) : (
                depenses.map((d) => (
                  <tr key={d.id} className="group hover:bg-neutral-50 transition-colors">
                    <td className="table-td text-neutral-600 text-xs">
                      {formatDate(d.date_depense)}
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
                        {TYPE_DEPENSE_CONFIG[d.type_depense].label}
                      </span>
                    </td>
                    <td className="table-td text-right font-bold tabular-nums" style={{ color: '#C5A059' }}>
                      {formatMontant(d.montant)}
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => setDeleteTarget(d.id)}
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
        title={deleteTargetDepense ? TYPE_DEPENSE_CONFIG[deleteTargetDepense.type_depense].label : ''}
        description="Cette dépense sera retirée du journal local. Cette action ne peut pas être annulée."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
