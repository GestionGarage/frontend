import Header from '@/components/layout/Header';
import CommandeForm from '@/components/commandes/CommandeForm';
import { getCategories } from '@/lib/server-api';
import type { CategorieEntity } from '@gestion-garage/shared-validators';

export const metadata= { title: 'Nouvelle commande' };

export default async function NouvelleCommandePage() {
  const result = await getCategories({ include_options: 'true', limit: '100' }).catch(() => ({
    data: [] as CategorieEntity[],
  }));
  const categories = (result as { data: CategorieEntity[] }).data;

  return (
    <>
      <Header
        title="Nouvelle commande"
        breadcrumb={[
          { label: 'Commandes', href: '/commandes' },
          { label: 'Nouvelle commande' },
        ]}
      />
      <CommandeForm categories={categories} />
    </>
  );
}
