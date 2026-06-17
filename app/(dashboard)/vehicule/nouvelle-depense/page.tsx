import Header from '@/components/layout/Header';
import VehiculeDepenseForm from '@/components/vehicule/VehiculeDepenseForm';

export const metadata= { title: 'Nouvelle dépense véhicule' };

export default function NouvelleDepensePage() {
  return (
    <>
      <Header
        title="Nouvelle dépense véhicule"
        breadcrumb={[{ label: 'Véhicule', href: '/vehicule' }, { label: 'Nouvelle dépense' }]}
      />
      <VehiculeDepenseForm />
    </>
  );
}
