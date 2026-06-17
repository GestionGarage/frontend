import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import CategorieForm from '@/components/categories/CategorieForm';
import { getCategorie } from '@/lib/server-api';
import type { CategorieEntity } from '@gestion-garage/shared-validators';

export const metadata= { title: 'Modifier la catégorie' };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoriePage({ params }: PageProps) {
  const { id } = await params;

  const result = await getCategorie(id).catch(() => null);
  if (!result) notFound();

  const categorie = (result as { data: CategorieEntity }).data;

  return (
    <>
      <Header
        title={`Modifier — ${categorie.nom}`}
        breadcrumb={[
          { label: 'Catégories', href: '/categories' },
          { label: categorie.nom },
        ]}
      />
      <CategorieForm
        defaultValues={{
          id: categorie.id,
          nom: categorie.nom,
          description: categorie.description ?? undefined,
          image_url: categorie.image_url ?? undefined,
          image_alt: categorie.image_alt ?? undefined,
          is_active: categorie.is_active,
          ordre: categorie.ordre,
          options: categorie.options?.map((o) => ({
            label: o.label,
            description: o.description ?? undefined,
            prix_base: o.prix_base ?? undefined,
            is_sur_mesure: o.is_sur_mesure,
            is_active: o.is_active,
            ordre: o.ordre,
          })),
        }}
      />
    </>
  );
}
