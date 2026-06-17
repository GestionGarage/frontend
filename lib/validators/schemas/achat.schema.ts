import { z } from 'zod';

export const TypeMateriauEnum = z.enum([
  'metal',
  'bois',
  'peinture',
  'pinceau',
  'visserie',
  'soudure',
  'autre',
]);

export const UniteEnum = z.enum(['unite', 'kg', 'm', 'm2', 'litre', 'piece']);

export type TypeMateriau = z.infer<typeof TypeMateriauEnum>;
export type Unite = z.infer<typeof UniteEnum>;

export const TYPE_MATERIAU_LABELS: Record<TypeMateriau, string> = {
  metal: 'Métal / Fer',
  bois: 'Bois / MDF',
  peinture: 'Peinture',
  pinceau: 'Pinceaux & Outils de peinture',
  visserie: 'Visserie & Boulonnerie',
  soudure: 'Matériel de soudure',
  autre: 'Autre',
};

export const UNITE_LABELS: Record<Unite, string> = {
  unite: 'Unité',
  kg: 'Kilogramme (kg)',
  m: 'Mètre (m)',
  m2: 'Mètre carré (m²)',
  litre: 'Litre',
  piece: 'Pièce',
};

export const createAchatSchema = z.object({
  type_materiau: TypeMateriauEnum,
  designation: z.string().min(1, 'Désignation requise').max(200),
  quantite: z.number().positive('Quantité requise'),
  unite: UniteEnum,
  prix_unitaire: z.number().positive('Prix unitaire requis'),
  fournisseur: z.string().max(150).optional().nullable(),
  date_achat: z.string().date('Date invalide'),
  notes: z.string().max(1000).optional().nullable(),
});

export const updateAchatSchema = createAchatSchema.partial();

export const achatQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  type_materiau: TypeMateriauEnum.optional(),
  periode: z.string().optional(),
  date_debut: z.string().date().optional(),
  date_fin: z.string().date().optional(),
  sort: z.enum(['date_desc', 'date_asc', 'montant_desc', 'montant_asc']).default('date_desc'),
});

export type CreateAchatDto = z.infer<typeof createAchatSchema>;
export type UpdateAchatDto = z.infer<typeof updateAchatSchema>;
export type AchatQueryDto = z.infer<typeof achatQuerySchema>;

export interface AchatEntity {
  id: string;
  type_materiau: TypeMateriau;
  designation: string;
  quantite: number;
  unite: Unite;
  prix_unitaire: number;
  prix_total: number;
  fournisseur: string | null;
  date_achat: string;
  notes: string | null;
  created_at: string;
}
