import { z } from 'zod';

export const TypeDepenseVehiculeEnum = z.enum([
  'vidange',
  'carburant',
  'reparation',
  'assurance',
  'controle_technique',
  'lavage',
  'autre',
]);

export type TypeDepenseVehicule = z.infer<typeof TypeDepenseVehiculeEnum>;

export const TYPE_DEPENSE_LABELS: Record<TypeDepenseVehicule, string> = {
  vidange: 'Vidange',
  carburant: 'Carburant / Essence',
  reparation: 'Réparation',
  assurance: 'Assurance',
  controle_technique: 'Contrôle technique',
  lavage: 'Lavage',
  autre: 'Autre',
};

export const createVehiculeDepenseSchema = z.object({
  type_depense: TypeDepenseVehiculeEnum,
  montant: z.number().positive('Montant requis'),
  description: z.string().max(500).optional(),
  date_depense: z.string().date('Date invalide'),
  kilometrage: z.number().int().positive().optional().nullable(),
  prestataire: z.string().max(150).optional().nullable(),
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
  description: string | null;
  date_depense: string;
  kilometrage: number | null;
  prestataire: string | null;
  created_at: string;
}
