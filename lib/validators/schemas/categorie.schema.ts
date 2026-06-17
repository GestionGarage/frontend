import { z } from 'zod';

export const createCategorieOptionSchema = z.object({
  label: z.string().min(1, 'Label requis').max(150),
  description: z.string().max(500).optional(),
  prix_base: z.number().min(0).optional().nullable(),
  is_sur_mesure: z.boolean().default(false),
  is_active: z.boolean().default(true),
  ordre: z.number().int().min(0).default(0),
});

export const updateCategorieOptionSchema = createCategorieOptionSchema.partial();

export const createCategorieSchema = z.object({
  nom: z.string().min(1, 'Nom requis').max(100),
  description: z.string().max(500).optional(),
  image_url: z.string().url().optional().nullable(),
  image_alt: z.string().max(200).optional().nullable(),
  is_active: z.boolean().default(true),
  ordre: z.number().int().min(0).default(0),
  options: z.array(createCategorieOptionSchema).optional().default([]),
});

export const updateCategorieSchema = createCategorieSchema
  .omit({ options: true })
  .partial();

export type CreateCategorieOptionDto = z.infer<typeof createCategorieOptionSchema>;
export type UpdateCategorieOptionDto = z.infer<typeof updateCategorieOptionSchema>;
export type CreateCategorieDto = z.infer<typeof createCategorieSchema>;
export type UpdateCategorieDto = z.infer<typeof updateCategorieSchema>;

export interface CategorieOptionEntity {
  id: string;
  categorie_id: string;
  label: string;
  description: string | null;
  prix_base: number | null;
  is_sur_mesure: boolean;
  is_active: boolean;
  ordre: number;
  created_at: string;
}

export interface CategorieEntity {
  id: string;
  nom: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  image_alt: string | null;
  is_active: boolean;
  ordre: number;
  created_at: string;
  updated_at: string;
  options?: CategorieOptionEntity[];
}
