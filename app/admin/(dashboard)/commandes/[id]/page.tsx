import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCommande, getCategories } from '@/lib/server-api';
import CommandeDetailClient from './CommandeDetailClient';

export const metadata= { title: 'Détail commande' };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CommandeDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [commandeRes, categoriesRes] = await Promise.all([
    getCommande(id).catch(() => null),
    getCategories().catch(() => ({ data: [] })),
  ]);

  if (!commandeRes) notFound();

  const commande = (commandeRes as any).data;
  const categories = (categoriesRes as any).data ?? [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/commandes" className="text-neutral-400 hover:text-neutral-600 transition-colors">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-neutral-900">
          Commande #{commande.id?.slice(0, 8)}
        </h1>
        <span className={`badge ${commande.statut === 'terminee' ? 'bg-success/10 text-success' : commande.statut === 'annulee' ? 'bg-danger/10 text-danger' : commande.statut === 'en_cours' ? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning'}`}>
          {commande.statut?.replace('_', ' ')}
        </span>
      </div>

      <CommandeDetailClient commande={commande} categories={categories} />
    </div>
  );
}
