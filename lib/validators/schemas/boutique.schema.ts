import { z } from 'zod';
import { createCommandeSchema } from './commande.schema';

// Phase 2 — Boutique publique schemas

export const customerProfileSchema = z.object({
  nom: z.string().min(1, 'Nom requis').max(100),
  prenom: z.string().min(1, 'Prénom requis').max(100),
  email: z.string().email('Email invalide'),
  telephone: z
    .string()
    .min(8, 'Téléphone invalide')
    .max(20)
    .regex(/^[\d\s\+\-\(\)]+$/, 'Format invalide'),
  adresse: z.string().min(1, 'Adresse requise'),
  ville: z.string().min(1, 'Ville requise').max(100),
  code_postal: z.string().min(4, 'Code postal invalide').max(10),
});

export const dimensionsSchema = z.object({
  longueur_cm: z.number().positive().optional(),
  largeur_cm: z.number().positive().optional(),
  hauteur_cm: z.number().positive().optional(),
  poids_kg: z.number().positive().optional(),
}).refine(
  (data) => {
    const hasDim = data.longueur_cm || data.largeur_cm || data.hauteur_cm;
    return !hasDim || (data.longueur_cm !== undefined && data.largeur_cm !== undefined);
  },
  { message: 'Longueur et largeur requises si dimensions spécifiées' }
);

export const publicCommandeSchema = createCommandeSchema
  .omit({ source: true, statut: true })
  .extend({
    source: z.literal('boutique').default('boutique'),
    statut: z.literal('en_attente').default('en_attente'),
    customer_email: z.string().email().optional(),
    dimensions: dimensionsSchema.optional(),
  });

export const updateCustomerProfileSchema = customerProfileSchema.partial();

export type CustomerProfileDto = z.infer<typeof customerProfileSchema>;
export type DimensionsDto = z.infer<typeof dimensionsSchema>;
export type PublicCommandeDto = z.infer<typeof publicCommandeSchema>;
export type UpdateCustomerProfileDto = z.infer<typeof updateCustomerProfileSchema>;

export interface BoutiqueClient {
  id: string;
  supabase_uid: string | null;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  adresse: string | null;
  ville: string | null;
  code_postal: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PublicCatalogueItem {
  id: string;
  nom: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  image_alt: string | null;
  options: Array<{
    id: string;
    label: string;
    description: string | null;
    prix_base: number | null;
    is_sur_mesure: boolean;
  }>;
}
