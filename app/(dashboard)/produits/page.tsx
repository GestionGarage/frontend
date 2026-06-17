import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import ProduitsClient from './ProduitsClient';
import { getCategories } from '@/lib/server-api';
import type { CategorieEntity } from '@gestion-garage/shared-validators';

export const metadata: Metadata = { title: 'Produits — FORGE ERP' };

export default async function ProduitsPage() {
  const result = await getCategories({ limit: '100' }).catch(() => ({ data: [] as CategorieEntity[] }));
  const categories = (result as { data: CategorieEntity[] }).data;

  return (
    <>
      <Header
        title="Produits"
        breadcrumb={[{ label: 'Produits' }]}
      />
      <ProduitsClient categories={categories} />
    </>
  );
}
