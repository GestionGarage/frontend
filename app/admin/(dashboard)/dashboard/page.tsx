import Header from '@/components/layout/Header';
import DashboardClient from './DashboardClient';

export const metadata= { title: 'Tableau de bord' };

export default function DashboardPage() {
  return (
    <>
      <Header
        title="Tableau de bord"
        breadcrumb={[{ label: 'Tableau de bord' }]}
      />
      <DashboardClient />
    </>
  );
}
