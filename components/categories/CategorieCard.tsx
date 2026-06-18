'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tag, Trash2 } from 'lucide-react';
import type { CategorieEntity } from '@gestion-garage/shared-validators';
import { deleteCategorie } from '@/lib/client-api';
import ConfirmDeleteModal from '@/components/ui/ConfirmDeleteModal';

interface CategorieCardProps {
  categorie: CategorieEntity;
}

export default function CategorieCard({ categorie }: CategorieCardProps) {
  const router = useRouter();
  const optionsCount = categorie.options?.length ?? 0;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleDelete = async () => {
    setApiError(null);
    try {
      await deleteCategorie(categorie.id);
      setConfirmOpen(false);
      router.refresh();
    } catch (err) {
      setConfirmOpen(false);
      setApiError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 group"
        style={{
          backgroundColor: 'var(--forge-card)',
          border: '1px solid var(--forge-border)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
        }}
      >
        {/* Image */}
        <div
          className="aspect-video relative overflow-hidden"
          style={{ backgroundColor: 'var(--forge-raised)' }}
        >
          {categorie.image_url ? (
            <Image
              src={categorie.image_url}
              alt={categorie.image_alt ?? categorie.nom}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Tag size={28} style={{ color: 'rgba(255,255,255,0.12)' }} />
            </div>
          )}
          {!categorie.is_active && (
            <span
              className="absolute top-2 right-2 badge text-xs"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(4px)' }}
            >
              Inactif
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-neutral-200 mb-1 text-sm">{categorie.nom}</h3>
          {categorie.description && (
            <p className="text-xs text-neutral-600 line-clamp-2 mb-2">{categorie.description}</p>
          )}
          {apiError && (
            <p className="text-xs font-medium text-danger mb-2 rounded-lg px-2 py-1.5"
              style={{ backgroundColor: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)' }}>
              {apiError}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-700">
              {optionsCount} option{optionsCount !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setApiError(null); setConfirmOpen(true); }}
                className="p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-900/20"
                title="Supprimer"
              >
                <Trash2 size={13} className="text-danger" />
              </button>
              <Link
                href={`/admin/categories/${categorie.id}`}
                className="text-xs font-semibold transition-colors"
                style={{ color: 'rgba(245,158,11,0.5)' }}
              >
                Modifier →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={confirmOpen}
        title={categorie.nom}
        description="Cette catégorie sera définitivement supprimée. Les commandes liées ne seront pas affectées."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
