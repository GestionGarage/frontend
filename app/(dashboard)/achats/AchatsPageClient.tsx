'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Plus, Trash2, ShoppingCart, Hammer, Layers, Package } from 'lucide-react';
import { formatMontant, formatDate } from '@/lib/formatters';
import { TYPE_MATERIAU_CONFIG } from '@/lib/constants';
import type { AchatEntity } from '@gestion-garage/shared-validators';
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

const PERIOD_KPI: Record<PeriodKey, { total: number }> = {
  jour:    { total: 12_400    },
  semaine: { total: 74_000    },
  mois:    { total: 245_000   },
  '6mois': { total: 1_380_000 },
  annee:   { total: 2_650_000 },
};

const PLACEHOLDER_ACHATS: AchatEntity[] = [
  { id: 'a1', type_materiau: 'metal',    designation: 'Fer à béton 10mm',     quantite: 20, unite: 'kg',    prix_unitaire: 1_200, prix_total: 24_000, fournisseur: null, date_achat: '2026-06-14', notes: null, created_at: '' },
  { id: 'a2', type_materiau: 'soudure',  designation: 'Fil à souder 1.2mm',   quantite: 5,  unite: 'kg',    prix_unitaire: 3_500, prix_total: 17_500, fournisseur: null, date_achat: '2026-06-12', notes: null, created_at: '' },
  { id: 'a3', type_materiau: 'peinture', designation: 'Peinture antirouille', quantite: 4,  unite: 'litre', prix_unitaire: 2_800, prix_total: 11_200, fournisseur: null, date_achat: '2026-06-10', notes: null, created_at: '' },
  { id: 'a4', type_materiau: 'metal',    designation: 'Tube carré 40×40',     quantite: 12, unite: 'kg',    prix_unitaire: 1_400, prix_total: 16_800, fournisseur: null, date_achat: '2026-06-08', notes: null, created_at: '' },
  { id: 'a5', type_materiau: 'visserie', designation: 'Boulons M8 (boîte)',   quantite: 3,  unite: 'unite', prix_unitaire: 1_500, prix_total: 4_500,  fournisseur: null, date_achat: '2026-06-05', notes: null, created_at: '' },
  { id: 'a6', type_materiau: 'metal',    designation: 'Cornière 30×30',       quantite: 8,  unite: 'kg',    prix_unitaire: 1_100, prix_total: 8_800,  fournisseur: null, date_achat: '2026-06-03', notes: null, created_at: '' },
  { id: 'a7', type_materiau: 'bois',     designation: 'Contreplaqué 18mm',    quantite: 6,  unite: 'piece', prix_unitaire: 4_500, prix_total: 27_000, fournisseur: null, date_achat: '2026-06-01', notes: null, created_at: '' },
  { id: 'a8', type_materiau: 'bois',     designation: 'Tasseaux pin 45×45',   quantite: 10, unite: 'm',     prix_unitaire: 850,   prix_total: 8_500,  fournisseur: null, date_achat: '2026-05-29', notes: null, created_at: '' },
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
      {/* Ambient glow */}
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

export default function AchatsPageClient() {
  const [period, setPeriod] = useState<PeriodKey>('mois');
  const [achats, setAchats] = useState<AchatEntity[]>(PLACEHOLDER_ACHATS);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
    fetch(`${API_URL}/achats?limit=20&sort=date_desc`, { credentials: 'include' })
      .then((r) => r.json())
      .then((body: { data: AchatEntity[] }) => {
        if (Array.isArray(body.data)) setAchats(body.data);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setAchats((prev) => prev.filter((a) => a.id !== deleteTarget));
    setDeleteTarget(null);
  };

  const deleteTargetAchat = deleteTarget ? achats.find((a) => a.id === deleteTarget) : null;

  const kpi = PERIOD_KPI[period];
  const periodLabel = PERIODS.find((p) => p.key === period)?.label ?? '';

  /* Computed from live achats data — NaN-safe with || 0 */
  const ferTotal   = useMemo(() => achats.reduce((s, a) => s + (a.type_materiau === 'metal' ? (a.prix_total || 0) : 0), 0), [achats]);
  const boisTotal  = useMemo(() => achats.reduce((s, a) => s + (a.type_materiau === 'bois'  ? (a.prix_total || 0) : 0), 0), [achats]);
  const autreTotal = useMemo(() => achats.reduce((s, a) => s + (!['metal', 'bois'].includes(a.type_materiau) ? (a.prix_total || 0) : 0), 0), [achats]);

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

        <Link href="/achats/nouvel-achat" className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
          <Plus size={15} strokeWidth={2.5} />
          Nouvel achat
        </Link>
      </div>

      {/* KPI grid — total period + 3 computed material cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label={`Achats — ${periodLabel}`}
          value={formatMontant(kpi.total)}
          icon={ShoppingCart}
          color="#C5A059"
          iconBg="rgba(197,160,89,0.10)"
        />
        <KPICard
          label="Fer / Métal"
          value={formatMontant(ferTotal)}
          icon={Hammer}
          color="#374151"
          iconBg="rgba(55,65,81,0.08)"
        />
        <KPICard
          label="Bois / MDF"
          value={formatMontant(boisTotal)}
          icon={Layers}
          color="#A8863A"
          iconBg="rgba(168,134,58,0.10)"
        />
        <KPICard
          label="Autre"
          value={formatMontant(autreTotal)}
          icon={Package}
          color="#64748B"
          iconBg="rgba(100,116,139,0.09)"
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
          <span className="text-xs text-neutral-400">{achats.length} entrées</span>
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
              {achats.length === 0 ? (
                <tr>
                  <td colSpan={4} className="table-td text-center py-14 text-neutral-400">
                    Aucun achat enregistré
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
                        {TYPE_MATERIAU_CONFIG[a.type_materiau].label}
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
        description="Cet achat sera retiré du journal local. Cette action ne peut pas être annulée."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
