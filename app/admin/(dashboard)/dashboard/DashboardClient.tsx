'use client';
import { useState, useEffect } from 'react';
import { motion, type Variants } from 'motion/react';
import Link from 'next/link';
import {
  TrendingUp, Package, ClipboardCheck, Boxes,
  ArrowRight, Clock,
} from 'lucide-react';
import KPICard from '@/components/dashboard/KPICard';
import AlertBanner from '@/components/dashboard/AlertBanner';
import PeriodSelector from '@/components/charts/PeriodSelector';
import RevenueLineChart from '@/components/charts/RevenueLineChart';
import ProfitPieChart from '@/components/charts/ProfitPieChart';
import Card from '@/components/ui/Card';
import { usePeriod } from '@/lib/hooks/usePeriod';
import { formatMontant, formatPct } from '@/lib/formatters';
import type { AnalyticsSummary, ChartDataPoint, ExpensesBreakdown } from '@gestion-garage/shared-validators';

const PERIOD_LABELS: Record<string, string> = {
  day:      "Aujourd'hui",
  week:     'Cette semaine',
  month:    'Ce mois',
  '6months': '6 derniers mois',
  year:     'Cette année',
  custom:   'Période personnalisée',
};

const EMPTY_SUMMARY: AnalyticsSummary = {
  chiffre_affaires: 0,
  benefice_net: 0,
  depenses_totales: 0,
  nb_commandes: 0,
  commandes_en_attente: 0,
  cout_matieres: 0,
  depenses_vehicule: 0,
  marge_nette_pct: 0,
} as AnalyticsSummary;

const EMPTY_BREAKDOWN: ExpensesBreakdown = {
  cout_matieres: 0,
  depenses_vehicule: 0,
} as ExpensesBreakdown;

interface RecentActivity {
  id: string;
  client: string;
  categorie: string;
  montant: number;
  statut: string;
  ago: string;
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `il y a ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'hier';
  return `il y a ${days}j`;
}

function mapToRecentActivities(data: unknown[]): RecentActivity[] {
  return (data as Array<Record<string, unknown>>).map((c) => ({
    id: c.id as string,
    client: (c.nom_prenom as string) ?? '—',
    categorie: (c.categorie as Record<string, unknown> | null)?.nom as string ?? '—',
    montant: Number(c.prix_total) || 0,
    statut: c.statut as string,
    ago: relativeTime(c.date_commande as string),
  }));
}

const STATUT_CFG = {
  en_attente: { label: 'En attente', color: '#92400E', bg: 'rgba(146,64,14,0.07)'  },
  en_cours:   { label: 'En cours',   color: '#A8863A', bg: 'rgba(197,160,89,0.10)' },
  terminee:   { label: 'Terminée',   color: '#15803D', bg: 'rgba(21,128,61,0.08)'  },
  annulee:    { label: 'Annulée',    color: '#B91C1C', bg: 'rgba(185,28,28,0.07)'  },
};

async function apiFetch(path: string) {
  try {
    const res = await fetch(`/api/proxy${path}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-1 h-4 rounded-full flex-shrink-0" style={{ background: 'linear-gradient(to bottom, #C5A059, #A8863A)' }} />
      <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{children}</span>
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(197,160,89,0.20), transparent)' }} />
    </div>
  );
}

export default function DashboardClient() {
  const period = usePeriod('month');
  const [summary,      setSummary]      = useState<AnalyticsSummary>(EMPTY_SUMMARY);
  const [chartData,    setChartData]    = useState<ChartDataPoint[]>([]);
  const [breakdown,    setBreakdown]    = useState<ExpensesBreakdown>(EMPTY_BREAKDOWN);
  const [recentOrders, setRecentOrders] = useState<RecentActivity[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(period.toParams()).toString();
    setIsLoading(true);
    Promise.all([
      apiFetch(`/analytics/summary?${params}`),
      apiFetch(`/analytics/revenue-chart?${params}`),
      apiFetch(`/analytics/expenses-breakdown?${params}`),
      apiFetch('/commandes?limit=5&sort=date_desc'),
    ]).then(([s, c, b, orders]) => {
      if (s?.data) setSummary(s.data as AnalyticsSummary);
      if (Array.isArray(c?.data)) setChartData(c.data as ChartDataPoint[]);
      if (b?.data) setBreakdown(b.data as ExpensesBreakdown);
      if (Array.isArray(orders?.data)) setRecentOrders(mapToRecentActivities(orders.data as unknown[]));
    }).finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period.periode, period.dateDebut, period.dateFin]);

  /* Charcoal for Matières (dominant), gold for Véhicule */
  const pieData = [
    { name: 'Matières',  value: breakdown.cout_matieres,     color: '#374151' },
    { name: 'Véhicule',  value: breakdown.depenses_vehicule, color: '#C5A059' },
  ];

  const netMarginColor = (summary.marge_nette_pct ?? 0) >= 0 ? 'success' : 'danger' as const;

  const periodLabel = PERIOD_LABELS[period.periode] ?? 'Période';

  return (
    <div className="space-y-8">
      {/* Period selector */}
      <PeriodSelector
        value={period.periode}
        onChange={period.setPeriode}
        dateDebut={period.dateDebut}
        dateFin={period.dateFin}
        onCustomChange={period.setCustomRange}
      />

      {/* ── Row 1: 4 KPI Cards ── */}
      <div>
        <SectionLabel>Performance clé</SectionLabel>
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={cardVariants}>
            <KPICard
              label="Chiffre d'Affaires"
              value={summary.chiffre_affaires}
              formatter={formatMontant}
              color="primary"
              icon={TrendingUp}
              isLoading={isLoading}
            />
          </motion.div>
          <motion.div variants={cardVariants}>
            <KPICard
              label="Bénéfice Net"
              value={summary.benefice_net}
              formatter={formatMontant}
              color={netMarginColor}
              icon={Package}
              subtext={formatPct(summary.marge_nette_pct) + ' de marge'}
              isLoading={isLoading}
            />
          </motion.div>
          <motion.div variants={cardVariants}>
            <KPICard
              label="Dépenses Totales"
              value={summary.depenses_totales}
              formatter={formatMontant}
              color="danger"
              icon={Boxes}
              isLoading={isLoading}
            />
          </motion.div>
          <motion.div variants={cardVariants}>
            <KPICard
              label="Commandes"
              value={summary.nb_commandes}
              color="info"
              icon={ClipboardCheck}
              subtext={`${summary.commandes_en_attente} en attente`}
              isLoading={isLoading}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* ── Row 2: Chart + Activity ── */}
      <div>
        <SectionLabel>Analyse financière</SectionLabel>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Revenue vs Expenses — 2/3 */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                Revenus vs Dépenses
              </h3>
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                style={{ backgroundColor: 'rgba(197,160,89,0.08)', color: '#A8863A' }}
              >
                {periodLabel}
              </span>
            </div>
            <div className="pt-3">
              <RevenueLineChart data={chartData} period={period.periode} />
            </div>
          </Card>

          {/* Recent orders — 1/3 */}
          <Card>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                Commandes récentes
              </h3>
              <Link
                href="/admin/commandes"
                className="flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-70"
                style={{ color: '#C5A059' }}
              >
                Voir tout <ArrowRight size={11} />
              </Link>
            </div>

            <div className="space-y-0">
              {recentOrders.length === 0 ? (
                <p className="text-xs text-neutral-400 py-6 text-center">
                  {isLoading ? 'Chargement…' : 'Aucune commande'}
                </p>
              ) : (
                recentOrders.map((activity) => {
                  const cfg = STATUT_CFG[activity.statut as keyof typeof STATUT_CFG];
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 py-3 border-b last:border-0"
                      style={{ borderColor: 'rgba(197,160,89,0.08)' }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-neutral-700 truncate">{activity.client}</p>
                        <p className="text-xs text-neutral-400 mt-0.5 truncate">{activity.categorie}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold tabular-nums text-neutral-700">
                          {activity.montant.toLocaleString('fr-FR')}
                          <span className="text-xs font-normal text-neutral-400 ml-0.5">DA</span>
                        </p>
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block"
                          style={{ color: cfg?.color ?? '#6B7280', backgroundColor: cfg?.bg ?? 'transparent' }}
                        >
                          {cfg?.label ?? activity.statut}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-3 pt-3 flex items-center gap-2 text-xs text-neutral-400" style={{ borderTop: '1px solid rgba(197,160,89,0.08)' }}>
              <Clock size={11} />
              <span>Mis à jour il y a quelques minutes</span>
            </div>
          </Card>
        </div>
      </div>

      {/* ── Row 3: Pie + Indicateurs ── */}
      <div>
        <SectionLabel>Répartition des coûts</SectionLabel>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                Répartition des dépenses
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#C5A059' }} />
                Matières + Véhicule
              </div>
            </div>
            <ProfitPieChart data={pieData} />
          </Card>

          {/* Indicateurs clés */}
          <Card variant="raised">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-5">
              Indicateurs clés
            </h3>
            <div className="space-y-1">
              {[
                {
                  label: 'Marge nette',
                  value: formatPct(summary.marge_nette_pct),
                  color: (summary.marge_nette_pct ?? 0) >= 0 ? '#16A34A' : '#EF4444',
                  accent: (summary.marge_nette_pct ?? 0) >= 0 ? 'rgba(21,128,61,0.35)' : 'rgba(239,68,68,0.35)',
                },
                {
                  label: 'Coût matières',
                  value: formatMontant(summary.cout_matieres),
                  color: '#374151',
                  accent: '#E5E7EB',
                },
                {
                  label: 'Dépenses véhicule',
                  value: formatMontant(summary.depenses_vehicule),
                  color: '#64748B',
                  accent: '#E5E7EB',
                },
                {
                  label: 'Commandes en attente',
                  value: String(summary.commandes_en_attente),
                  color: '#A8863A',
                  accent: 'rgba(197,160,89,0.35)',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                  style={{ borderColor: 'rgba(197,160,89,0.08)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-0.5 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.accent }}
                    />
                    <span className="text-sm text-neutral-500">{item.label}</span>
                  </div>
                  <span
                    className="text-sm font-bold tabular-nums"
                    style={{ color: item.color }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(197,160,89,0.10)' }}>
              <Link
                href="/admin/historique-mensuel"
                className="flex items-center justify-between w-full group"
              >
                <span className="text-sm font-semibold" style={{ color: '#C5A059' }}>
                  Voir l'historique mensuel complet
                </span>
                <ArrowRight
                  size={14}
                  style={{ color: '#C5A059' }}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Vehicle expense alert */}
      <AlertBanner summary={summary} />
    </div>
  );
}
