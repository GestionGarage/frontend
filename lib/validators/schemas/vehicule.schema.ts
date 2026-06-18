import { z } from 'zod';

export const TypeDepenseVehiculeEnum = z.enum([
  'carburant',
  'reparation',
  'autre',
  'livraison',
]);

export type TypeDepenseVehicule = z.infer<typeof TypeDepenseVehiculeEnum>;

export const TYPE_DEPENSE_LABELS: Record<TypeDepenseVehicule, string> = {
  carburant: 'Carburant / Essence',
  reparation: 'Réparation',
  autre: 'Autre',
  livraison: 'Livraison',
};

export const createVehiculeDepenseSchema = z.object({
  type_depense: TypeDepenseVehiculeEnum,
  montant: z.number().positive('Montant requis'),
  notes: z.string().max(500).optional().nullable(),
  date_depense: z.string().date('Date invalide'),
});

export const updateVehiculeDepenseSchema = createVehiculeDepenseSchema.partial();

export const vehiculeQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  type_depense: TypeDepenseVehiculeEnum.optional(),
  periode: z.string().optional(),
  date_debut: z.string().date().optional(),
  date_fin: z.string().date().optional(),
  sort: z.enum(['date_desc', 'date_asc', 'montant_desc', 'montant_asc']).default('date_desc'),
});

export type CreateVehiculeDepenseDto = z.infer<typeof createVehiculeDepenseSchema>;
export type UpdateVehiculeDepenseDto = z.infer<typeof updateVehiculeDepenseSchema>;
export type VehiculeQueryDto = z.infer<typeof vehiculeQuerySchema>;

export interface VehiculeDepenseEntity {
  id: string;
  type_depense: TypeDepenseVehicule;
  montant: number;
  notes: string | null;
  date_depense: string;
  created_at: string;
}
