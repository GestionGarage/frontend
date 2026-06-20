import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
import { getCategoriesForDropdown, getProduits } from '@/lib/server-api';
import type { CategorieEntity } from '@gestion-garage/shared-validators';
import type { ProduitRow } from './ProduitsClient';

export const metadata: Metadata = { title: 'Produits — MOBILE ART ERP' };

function TableSkeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden animate-pulse"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(197,160,89,0.12)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
    >
      <div className="px-6 py-4 h-16" style={{ backgroundColor: '#F8F7F4' }} />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-3.5" style={{ borderTop: '1px solid rgba(197,160,89,0.07)' }}>
          <div className="w-10 h-10 rounded-xl flex-shrink-0" style={{ backgroundColor: 'rgba(197,160,89,0.07)' }} />
          <div className="flex-1 space-y-2">
            <div className="h-3 rounded w-1/3 bg-neutral-100" />
            <div className="h-2.5 rounded w-1/5 bg-neutral-100" />
          </div>
          <div className="h-3 rounded w-16 bg-neutral-100" />
          <div className="h-3 rounded w-16 bg-neutral-100" />
        </div>
      ))}
    </div>
  );
}

const ProduitsClient = dynamic(() => import('./ProduitsClient'), {
  loading: () => <TableSkeleton />,
});

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
    getCategoriesForDropdown({ limit: '100' }).catch(() => ({ data: [] as CategorieEntity[] })),
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
