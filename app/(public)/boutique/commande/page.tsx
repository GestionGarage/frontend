import PublicCommandeForm from './PublicCommandeForm';
import { getCategoriesPublic } from '@/lib/server-api';
import type { PublicCatalogueItem } from '@gestion-garage/shared-validators';

export const metadata= { title: 'Passer une commande' };

interface PageProps {
  searchParams: Promise<Record<string, string>>;
}

export default async function PublicCommandePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const result = await getCategoriesPublic().catch(() => ({ data: [] as PublicCatalogueItem[] }));
  const categories = (result as { data: PublicCatalogueItem[] }).data;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Passer une commande</h2>
        <p className="text-neutral-500 text-sm">
          Remplissez le formulaire ci-dessous. Nous vous contacterons pour confirmer et finaliser votre commande.
        </p>
      </div>
      <PublicCommandeForm categories={categories} preselectCategorieId={params.categorie_id} />
    </div>
  );
}
