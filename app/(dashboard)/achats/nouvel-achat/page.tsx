import Header from '@/components/layout/Header';
import AchatForm from '@/components/achats/AchatForm';

export const metadata= { title: 'Nouvel achat' };

export default function NouvelAchatPage() {
  return (
    <>
      <Header
        title="Nouvel achat"
        breadcrumb={[{ label: 'Achats', href: '/achats' }, { label: 'Nouvel achat' }]}
      />
      <AchatForm />
    </>
  );
}
