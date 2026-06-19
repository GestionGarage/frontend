import { z } from 'zod';

export const CommandeStatutEnum = z.enum([
  'en_attente',
  'en_cours',
  'terminee',
  'annulee',
]);

export const CommandeSourceEnum = z.enum(['admin', 'boutique']);

export type CommandeStatut = z.infer<typeof CommandeStatutEnum>;
export type CommandeSource = z.infer<typeof CommandeSourceEnum>;

export const createCommandeSchema = z.object({
  nom_prenom: z.string().min(1, 'Nom & prénom requis').max(100),
  telephone: z
    .string()
    .regex(/^0\d{9}$/, 'Le numéro doit commencer par 0 et contenir exactement 10 chiffres'),
  adresse: z.string().min(1, 'Adresse requise'),
  categorie_id: z.string().uuid('Catégorie invalide'),
  option_id: z.string().uuid('Option invalide').optional(),
  mesure: z.string().max(200).optional(),
  couleur: z.string().max(100).optional(),
  tarif_livraison: z.number().min(0).default(0),
  cout_revient: z.number().min(0).optional(),
  cout_main_oeuvre: z.number().min(0).optional(),
  prix_total: z.number().positive('Prix total requis'),
  statut: CommandeStatutEnum.default('en_attente'),
  source: CommandeSourceEnum.default('admin'),
  notes: z.string().max(2000).optional(),
  date_livraison: z.string().date().optional().nullable(),
});

export const updateCommandeSchema = createCommandeSchema.partial();

export const updateCommandeStatutSchema = z.object({
  statut: CommandeStatutEnum,
});

export const commandeQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  statut: CommandeStatutEnum.optional(),
  categorie_id: z.string().uuid().optional(),
  source: CommandeSourceEnum.optional(),
  periode: z.string().optional(),
  date_debut: z.string().date().optional(),
  date_fin: z.string().date().optional(),
  search: z.string().max(100).optional(),
  sort: z.enum(['date_desc', 'date_asc', 'montant_desc', 'montant_asc']).default('date_desc'),
});

export type CreateCommandeDto = z.infer<typeof createCommandeSchema>;
export type UpdateCommandeDto = z.infer<typeof updateCommandeSchema>;
export type UpdateCommandeStatutDto = z.infer<typeof updateCommandeStatutSchema>;
export type CommandeQueryDto = z.infer<typeof commandeQuerySchema>;

export interface CommandeEntity {
  id: string;
  nom_prenom: string;
  telephone: string;
  adresse: string;
  categorie_id: string | null;
  categorie?: { id: string; nom: string } | null;
  option_id: string | null;
  option?: { id: string; label: string } | null;
  mesure: string | null;
  couleur: string | null;
  type_livraison: 'none' | 'bureau' | 'vehicule' | null;
  bureau_nom: string | null;
  tarif_livraison: number;
  cout_revient: number | null;
  cout_main_oeuvre: number | null;
  prix_total: number;
  statut: CommandeStatut;
  source: CommandeSource;
  notes: string | null;
  date_commande: string;
  date_livraison: string | null;
  created_at: string;
  updated_at: string;
}
