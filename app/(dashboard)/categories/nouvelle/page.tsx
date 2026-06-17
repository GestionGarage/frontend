import Header from '@/components/layout/Header';
import CategorieForm from '@/components/categories/CategorieForm';

export const metadata= { title: 'Nouvelle catégorie' };

export default function NouvellCategoriePage() {
  return (
    <>
      <Header
        title="Nouvelle catégorie"
        breadcrumb={[{ label: 'Catégories', href: '/categories' }, { label: 'Nouvelle' }]}
      />
      <CategorieForm />
    </>
  );
}
