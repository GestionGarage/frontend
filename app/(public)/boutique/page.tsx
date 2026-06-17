import Image from 'next/image';
import Link from 'next/link';
import { getCategoriesPublic } from '@/lib/server-api';
import type { PublicCatalogueItem } from '@gestion-garage/shared-validators';

export const metadata= { title: 'Notre catalogue' };

export default async function BoutiquePage() {
  const result = await getCategoriesPublic().catch(() => ({ data: [] as PublicCatalogueItem[] }));
  const categories = (result as { data: PublicCatalogueItem[] }).data;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-neutral-900 mb-3">Notre catalogue</h2>
        <p className="text-neutral-500 max-w-xl mx-auto">
          Découvrez nos créations artisanales en fer forgé. Chaque pièce est fabriquée sur mesure
          dans notre atelier.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow group">
            <div className="aspect-video bg-neutral-100 relative overflow-hidden">
              {cat.image_url ? (
                <Image
                  src={cat.image_url}
                  alt={cat.image_alt ?? cat.nom}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-5xl text-neutral-200">
                  🔩
                </div>
              )}
            </div>
            <div className="p-5">
              <h3 className="text-lg font-bold text-neutral-900 mb-1">{cat.nom}</h3>
              {cat.description && (
                <p className="text-sm text-neutral-500 mb-3 line-clamp-2">{cat.description}</p>
              )}
              {cat.options.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-1">
                  {cat.options.slice(0, 3).map((o) => (
                    <span key={o.id} className="badge bg-neutral-100 text-neutral-600 text-xs">
                      {o.label}
                    </span>
                  ))}
                  {cat.options.length > 3 && (
                    <span className="badge bg-neutral-100 text-neutral-400 text-xs">
                      +{cat.options.length - 3}
                    </span>
                  )}
                </div>
              )}
              <Link
                href={`/boutique/commande?categorie_id=${cat.id}`}
                className="btn-primary w-full text-center block text-sm py-2"
              >
                Commander
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
