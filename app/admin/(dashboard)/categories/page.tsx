import Link from 'next/link';
import Header from '@/components/layout/Header';
import CategorieCard from '@/components/categories/CategorieCard';
import { getCategories } from '@/lib/server-api';
import type { CategorieEntity } from '@gestion-garage/shared-validators';

export const metadata= { title: 'Catégories' };

export default async function CategoriesPage() {
  const result = await getCategories({ include_options: 'true', limit: '50' }).catch(() => ({
    data: [] as CategorieEntity[],
  }));
  const categories = (result as { data: CategorieEntity[] }).data;

  return (
    <>
      <Header
        title="Catégories produits"
        breadcrumb={[{ label: 'Catégories' }]}
        action={
          <Link href="/admin/categories/nouvelle" className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
            + Nouvelle catégorie
          </Link>
        }
      />

      {categories.length === 0 ? (
        <div className="text-center py-20 text-neutral-700">
          <p className="text-sm font-medium mb-4">Aucune catégorie créée</p>
          <Link href="/admin/categories/nouvelle" className="btn-primary inline-flex items-center gap-2 text-sm">
            Créer la première catégorie
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <CategorieCard key={cat.id} categorie={cat} />
          ))}
        </div>
      )}
    </>
  );
}
