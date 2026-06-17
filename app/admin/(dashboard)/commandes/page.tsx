import Link from 'next/link';
import Header from '@/components/layout/Header';
import { getCommandes, getCommandesStats } from '@/lib/server-api';
import { Plus } from 'lucide-react';
import type { CommandeEntity } from '@gestion-garage/shared-validators';
import CommandesClient, { type CommandeRow } from '@/components/commandes/CommandesClient';

export const metadata = { title: 'Commandes' };

interface PageProps {
  searchParams: Promise<Record<string, string>>;
}

const STATUT_FILTERS = [
  { value: '',           label: 'Toutes',     color: '#6B7280' },
  { value: 'en_attente', label: 'En attente', color: '#A8863A' },
  { value: 'en_cours',   label: 'En cours',   color: '#475569' },
  { value: 'terminee',   label: 'Terminées',  color: '#374151' },
  { value: 'annulee',    label: 'Annulées',   color: '#78716C' },
];

export default async function CommandesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page   = params.page   ?? '1';
  const statut = params.statut;

  const queryParams: Record<string, string> = { page, limit: '20' };
  if (statut) queryParams.statut = statut;

  const statsParams: Record<string, string> = {};
  if (statut) statsParams.statut = statut;

  const [result, statsResult] = await Promise.all([
    getCommandes(queryParams).catch(() => ({
      data: [] as CommandeEntity[],
      meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
    })),
    getCommandesStats(statsParams).catch(() => ({
      data: { nb_commandes: 0, total_general: 0, cout_total: 0, benefice_net: 0 },
    })),
  ]);

  const commandes = result as {
    data: CommandeEntity[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  };

  const stats = (statsResult as { data: { nb_commandes: number; total_general: number; cout_total: number; benefice_net: number } }).data;

  return (
    <>
      <Header
        title="Commandes"
        breadcrumb={[{ label: 'Commandes' }]}
        action={
          <Link href="/admin/commandes/nouvelle" className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={15} strokeWidth={2.5} />
            Nouvelle commande
          </Link>
        }
      />

      {/* Status filter chips */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUT_FILTERS.map((s) => {
          const isActive = (statut ?? '') === s.value;
          return (
            <Link
              key={s.value}
              href={s.value ? `/admin/commandes?statut=${s.value}` : '/admin/commandes'}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150"
              style={{
                backgroundColor: isActive ? `${s.color}12` : '#F8F7F4',
                border: `1px solid ${isActive ? `${s.color}38` : 'rgba(197,160,89,0.12)'}`,
                color: isActive ? s.color : '#6B7280',
              }}
            >
              {s.label}
            </Link>
          );
        })}
      </div>

      {/* Interactive table (KPI cards rendered inside CommandesClient for motion hover) */}
      <CommandesClient
        initialData={commandes.data as unknown as CommandeRow[]}
        meta={commandes.meta}
        statut={statut}
        kpi={{
          total:         stats.nb_commandes,
          totalGeneral:  stats.total_general,
          totalBase:     stats.cout_total,
          totalLivraison: stats.benefice_net,
          pageLabel:     `sur ${commandes.data.length} affichées`,
        }}
      />
    </>
  );
}
