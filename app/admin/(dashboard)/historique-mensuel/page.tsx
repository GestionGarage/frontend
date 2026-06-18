import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import HistoriqueMensuelClient from './HistoriqueMensuelClient';
import { getHistoricalTable } from '@/lib/server-api';
import type { HistoricalRow } from './HistoriqueMensuelClient';

export const metadata: Metadata = {
  title: 'Historique mensuel — MOBILE ART ERP',
};

interface PageProps {
  searchParams: Promise<Record<string, string>>;
}

export default async function HistoriqueMensuelPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page  = params.page ?? '1';

  const result = await getHistoricalTable({ page, limit: '20' }).catch(() => ({
    data: [] as HistoricalRow[],
    meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
  }));

  const { data, meta } = result as { data: HistoricalRow[]; meta: { total: number; page: number; limit: number; totalPages: number } };

  return (
    <>
      <Header
        title="Historique mensuel"
        breadcrumb={[
          { label: 'Tableau de bord', href: '/admin/dashboard' },
          { label: 'Historique mensuel' },
        ]}
      />
      <HistoriqueMensuelClient rows={data} meta={meta} currentPage={Number(page)} />
    </>
  );
}
