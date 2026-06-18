import { z } from 'zod';

export const TypeMateriauEnum = z.enum([
  'metal',
  'bois',
  'peinture',
  'autre',
]);

export type TypeMateriau = z.infer<typeof TypeMateriauEnum>;

export const TYPE_MATERIAU_LABELS: Record<TypeMateriau, string> = {
  metal: 'Métal / Fer',
  bois: 'Bois / MDF',
  peinture: 'Peinture',
  autre: 'Autre',
};

export const createAchatSchema = z.object({
  type_materiau: TypeMateriauEnum,
  prix_total: z.number().min(0, 'Prix requis'),
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
  prix_total: number | null;
  date_achat: string;
  notes: string | null;
  created_at: string;
}
