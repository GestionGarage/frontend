import Image from 'next/image';
import Link from 'next/link';
import { Tag } from 'lucide-react';
import type { CategorieEntity } from '@gestion-garage/shared-validators';

interface CategorieCardProps {
  categorie: CategorieEntity;
}

export default function CategorieCard({ categorie }: CategorieCardProps) {
  const optionsCount = categorie.options?.length ?? 0;

  return (
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
          <p className="text-xs text-neutral-600 line-clamp-2 mb-3">{categorie.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-700">
            {optionsCount} option{optionsCount !== 1 ? 's' : ''}
          </span>
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
  );
}
