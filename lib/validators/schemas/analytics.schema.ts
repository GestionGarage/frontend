import { z } from 'zod';

export const PeriodeEnum = z.enum([
  'day',
  'week',
  'month',
  '6months',
  'year',
  'custom',
]);

export type Periode = z.infer<typeof PeriodeEnum>;

export const PERIODE_LABELS: Record<Periode, string> = {
  day: "Aujourd'hui",
  week: 'Cette semaine',
  month: 'Ce mois',
  '6months': '6 Derniers mois',
  year: 'Cette année',
  custom: 'Période personnalisée',
};

export const analyticsQuerySchema = z.object({
  periode: PeriodeEnum.default('month'),
  date_debut: z.string().date().optional(),
  date_fin: z.string().date().optional(),
  limit: z.coerce.number().int().positive().max(50).default(5),
}).refine(
  (data) =>
    data.periode !== 'custom' ||
    (data.date_debut !== undefined && data.date_fin !== undefined),
  { message: 'date_debut et date_fin requis pour période personnalisée' },
);

export type AnalyticsQueryDto = z.infer<typeof analyticsQuerySchema>;

export interface AnalyticsSummary {
  periode: string;
  date_debut: string;
  date_fin: string;
  chiffre_affaires: number;
  depenses_totales: number;
  cout_matieres: number;
  depenses_vehicule: number;
  cout_main_oeuvre?: number;
  benefice_net: number;
  marge_nette_pct: number;
  nb_commandes: number;
  commandes_en_attente: number;
  commandes_en_cours: number;
  commandes_terminees: number;
  commandes_annulees: number;
}

export interface ChartDataPoint {
  periode: string;
  revenus: number;
  depenses: number;
  benefice: number;
}

export interface ExpensesBreakdown {
  cout_matieres: number;
  depenses_vehicule: number;
  total: number;
  matieres_pct: number;
  vehicule_pct: number;
  par_type_materiau: Array<{ type: string; label: string; montant: number; pct: number }>;
  par_type_vehicule: Array<{ type: string; label: string; montant: number; pct: number }>;
}

export interface TopCategorie {
  categorie_id: string;
  nom: string;
  revenus: number;
  nb_commandes: number;
  pct_revenus: number;
}

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

export interface VehiculeSummary {
  total_periode: number;
  total_annee: number;
  par_type: Array<{ type: string; label: string; montant: number; pct: number }>;
  evolution_mensuelle: Array<{ mois: string; montant: number }>;
}

export interface AchatsSummary {
  total_periode: number;
  total_annee: number;
  par_materiau: Array<{ type: string; label: string; montant: number; pct: number }>;
  evolution_mensuelle: Array<{ mois: string; montant: number }>;
}
