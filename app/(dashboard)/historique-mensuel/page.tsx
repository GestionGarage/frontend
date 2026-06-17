import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import HistoriqueMensuelClient from './HistoriqueMensuelClient';

export const metadata: Metadata = {
  title: 'Historique mensuel — FORGE ERP',
};

export default function HistoriqueMensuelPage() {
  return (
    <>
      <Header
        title="Historique mensuel"
        breadcrumb={[
          { label: 'Tableau de bord', href: '/dashboard' },
          { label: 'Historique mensuel' },
        ]}
      />
      <HistoriqueMensuelClient />
    </>
  );
}
