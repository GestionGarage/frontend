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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

const PERIOD_LABELS: Record<string, string> = {
  day:      "Aujourd'hui",
  week:     'Cette semaine',
  month:    'Ce mois',
  '6months': '6 derniers mois',
  year:     'Cette année',
  custom:   'Période personnalisée',
};

/* ─── Static placeholder data ─── */
const PLACEHOLDER_SUMMARY: AnalyticsSummary = {
  chiffre_affaires:    847500,
  benefice_net:        312400,
  depenses_totales:    535100,
  nb_commandes:        24,
  commandes_en_attente: 7,
  cout_matieres:       398200,
  depenses_vehicule:   136900,
  marge_nette_pct:     36.9,
} as AnalyticsSummary;

const CHART_WEEK: ChartDataPoint[] = [
  { periode: '2026-06-10', revenus: 0,      depenses: 42000,  benefice: -42000  },
  { periode: '2026-06-11', revenus: 95000,  depenses: 58000,  benefice: 37000   },
  { periode: '2026-06-12', revenus: 145000, depenses: 89000,  benefice: 56000   },
  { periode: '2026-06-13', revenus: 52000,  depenses: 31000,  benefice: 21000   },
  { periode: '2026-06-14', revenus: 0,      depenses: 12000,  benefice: -12000  },
  { periode: '2026-06-15', revenus: 0,      depenses: 0,      benefice: 0       },
  { periode: '2026-06-16', revenus: 78000,  depenses: 45000,  benefice: 33000   },
] as ChartDataPoint[];

const CHART_MONTH: ChartDataPoint[] = [
  { periode: '2026-06-01', revenus: 320000, depenses: 198000, benefice: 122000 },
  { periode: '2026-06-08', revenus: 285000, depenses: 172000, benefice: 113000 },
  { periode: '2026-06-15', revenus: 242500, depenses: 165100, benefice: 77400  },
  { periode: '2026-06-22', revenus: 0,      depenses: 0,      benefice: 0      },
] as ChartDataPoint[];

const CHART_6M: ChartDataPoint[] = [
  { periode: '2026-01-01', revenus: 580000, depenses: 395000, benefice: 185000 },
  { periode: '2026-02-01', revenus: 890000, depenses: 520000, benefice: 370000 },
  { periode: '2026-03-01', revenus: 760000, depenses: 445000, benefice: 315000 },
  { periode: '2026-04-01', revenus: 940000, depenses: 590000, benefice: 350000 },
  { periode: '2026-05-01', revenus: 820000, depenses: 510000, benefice: 310000 },
  { periode: '2026-06-01', revenus: 847500, depenses: 535100, benefice: 312400 },
] as ChartDataPoint[];

const CHART_YEAR: ChartDataPoint[] = [
  { periode: '2025-07-01', revenus: 420000, depenses: 295000, benefice: 125000 },
  { periode: '2025-08-01', revenus: 385000, depenses: 262000, benefice: 123000 },
  { periode: '2025-09-01', revenus: 510000, depenses: 335000, benefice: 175000 },
  { periode: '2025-10-01', revenus: 620000, depenses: 410000, benefice: 210000 },
  { periode: '2025-11-01', revenus: 730000, depenses: 480000, benefice: 250000 },
  { periode: '2025-12-01', revenus: 580000, depenses: 395000, benefice: 185000 },
  { periode: '2026-01-01', revenus: 890000, depenses: 520000, benefice: 370000 },
  { periode: '2026-02-01', revenus: 760000, depenses: 445000, benefice: 315000 },
  { periode: '2026-03-01', revenus: 940000, depenses: 590000, benefice: 350000 },
  { periode: '2026-04-01', revenus: 820000, depenses: 510000, benefice: 310000 },
  { periode: '2026-05-01', revenus: 730000, depenses: 460000, benefice: 270000 },
  { periode: '2026-06-01', revenus: 847500, depenses: 535100, benefice: 312400 },
] as ChartDataPoint[];

function getPlaceholderChart(p: string): ChartDataPoint[] {
  switch (p) {
    case 'day':     return [];
    case 'week':    return CHART_WEEK;
    case 'month':   return CHART_MONTH;
    case 'year':    return CHART_YEAR;
    default:        return CHART_6M;
  }
}

const PLACEHOLDER_BREAKDOWN: ExpensesBreakdown = {
  cout_matieres:    398200,
  depenses_vehicule: 136900,
} as ExpensesBreakdown;

const PLACEHOLDER_SUMMARIES: Partial<Record<string, AnalyticsSummary>> = {
  day: { chiffre_affaires: 78000, benefice_net: 33000, depenses_totales: 45000, nb_commandes: 2, commandes_en_attente: 7, cout_matieres: 32000, depenses_vehicule: 13000, marge_nette_pct: 42.3 } as AnalyticsSummary,
  week: { chiffre_affaires: 370000, benefice_net: 115000, depenses_totales: 255000, nb_commandes: 12, commandes_en_attente: 7, cout_matieres: 182000, depenses_vehicule: 73000, marge_nette_pct: 31.1 } as AnalyticsSummary,
  '6months': { chiffre_affaires: 4837500, benefice_net: 1652400, depenses_totales: 3185100, nb_commandes: 134, commandes_en_attente: 7, cout_matieres: 2316200, depenses_vehicule: 868900, marge_nette_pct: 34.2 } as AnalyticsSummary,
  year: { chiffre_affaires: 8305000, benefice_net: 2773000, depenses_totales: 5532000, nb_commandes: 218, commandes_en_attente: 7, cout_matieres: 3976000, depenses_vehicule: 1556000, marge_nette_pct: 33.4 } as AnalyticsSummary,
};

const PLACEHOLDER_BREAKDOWNS: Partial<Record<string, ExpensesBreakdown>> = {
  day: { cout_matieres: 32000, depenses_vehicule: 13000 } as ExpensesBreakdown,
  week: { cout_matieres: 182000, depenses_vehicule: 73000 } as ExpensesBreakdown,
  '6months': { cout_matieres: 2316200, depenses_vehicule: 868900 } as ExpensesBreakdown,
  year: { cout_matieres: 3976000, depenses_vehicule: 1556000 } as ExpensesBreakdown,
};

function getPlaceholderSummary(p: string): AnalyticsSummary {
  return (PLACEHOLDER_SUMMARIES[p] ?? PLACEHOLDER_SUMMARY) as AnalyticsSummary;
}

function getPlaceholderBreakdown(p: string): ExpensesBreakdown {
  return (PLACEHOLDER_BREAKDOWNS[p] ?? PLACEHOLDER_BREAKDOWN) as ExpensesBreakdown;
}

const RECENT_ACTIVITIES = [
  { id: '1', client: 'M. Benali Mohamed',   categorie: 'Portail fer forgé',   montant: 45000, statut: 'en_cours',   ago: 'il y a 2h' },
  { id: '2', client: 'Mme Rahmani Fatima',  categorie: 'Garde-corps escalier', montant: 28000, statut: 'en_attente', ago: 'il y a 5h' },
  { id: '3', client: 'M. Meziane Karim',    categorie: 'Clôture 25 ml',       montant: 62000, statut: 'terminee',   ago: 'hier' },
  { id: '4', client: 'Mme Boudehane Amel',  categorie: 'Escalier intérieur',  montant: 95000, statut: 'en_attente', ago: 'hier' },
  { id: '5', client: 'M. Slimani Youcef',   categorie: "Portillon d'accès",   montant: 38500, statut: 'en_cours',   ago: 'il y a 2j' },
];

const STATUT_CFG = {
  en_attente: { label: 'En attente', color: '#92400E', bg: 'rgba(146,64,14,0.07)'  },
  en_cours:   { label: 'En cours',   color: '#A8863A', bg: 'rgba(197,160,89,0.10)' },
  terminee:   { label: 'Terminée',   color: '#15803D', bg: 'rgba(21,128,61,0.08)'  },
  annulee:    { label: 'Annulée',    color: '#B91C1C', bg: 'rgba(185,28,28,0.07)'  },
};

async function apiFetch(path: string) {
  try {
    const res = await fetch(`${API_URL}${path}`, { credentials: 'include', cache: 'no-store' });
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
  const [summary,   setSummary]   = useState<AnalyticsSummary>(() => getPlaceholderSummary('month'));
  const [chartData, setChartData] = useState<ChartDataPoint[]>(() => getPlaceholderChart('month'));
  const [breakdown, setBreakdown] = useState<ExpensesBreakdown>(() => getPlaceholderBreakdown('month'));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(period.toParams()).toString();
    setIsLoading(true);
    setSummary(getPlaceholderSummary(period.periode));
    setBreakdown(getPlaceholderBreakdown(period.periode));
    setChartData(getPlaceholderChart(period.periode));
    Promise.all([
      apiFetch(`/analytics/summary?${params}`),
      apiFetch(`/analytics/revenue-chart?${params}`),
      apiFetch(`/analytics/expenses-breakdown?${params}`),
    ]).then(([s, c, b]) => {
      if (s?.data) setSummary(s.data as AnalyticsSummary);
      if (Array.isArray(c?.data)) setChartData(c.data as ChartDataPoint[]);
      if (b?.data) setBreakdown(b.data as ExpensesBreakdown);
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
                href="/commandes"
                className="flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-70"
                style={{ color: '#C5A059' }}
              >
                Voir tout <ArrowRight size={11} />
              </Link>
            </div>

            <div className="space-y-0">
              {RECENT_ACTIVITIES.map((activity) => {
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
                        style={{ color: cfg.color, backgroundColor: cfg.bg }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                );
              })}
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
                href="/historique-mensuel"
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
