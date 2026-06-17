import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import ProduitsClient from './ProduitsClient';
import { getCategories, getProduits } from '@/lib/server-api';
import type { CategorieEntity } from '@gestion-garage/shared-validators';
import type { ProduitRow } from './ProduitsClient';
import { Plus } from 'lucide-react';

export const metadata: Metadata = { title: 'Produits — FORGE ERP' };

interface PageProps {
  searchParams: Promise<Record<string, string>>;
}

export default async function ProduitsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page   = params.page         ?? '1';
  const cat    = params.categorie_id ?? '';
  const search = params.search       ?? '';

  const queryParams: Record<string, string> = { page, limit: '20' };
  if (cat)    queryParams.categorie_id = cat;
  if (search) queryParams.search       = search;

  const [produitsResult, categoriesResult] = await Promise.all([
    getProduits(queryParams).catch(() => ({
      data: [] as ProduitRow[],
      meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
    })),
    getCategories({ limit: '100' }).catch(() => ({ data: [] as CategorieEntity[] })),
  ]);

  const { data: produits, meta } = produitsResult as {
    data: ProduitRow[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  };

  const categories = (categoriesResult as { data: CategorieEntity[] }).data;

  return (
    <>
      <Header
        title="Produits"
        breadcrumb={[{ label: 'Produits' }]}
      />
      <ProduitsClient
        initialData={produits}
        meta={meta}
        categories={categories}
        currentPage={Number(page)}
        currentCat={cat}
        currentSearch={search}
      />
    </>
  );
}
