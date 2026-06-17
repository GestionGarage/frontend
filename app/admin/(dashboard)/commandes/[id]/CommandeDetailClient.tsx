'use client';
import { useState } from 'react';
import { formatMontant, formatDate } from '@/lib/formatters';
import { updateCommandeStatut } from '@/lib/client-api';
import type { CommandeEntity, CommandeStatut } from '@gestion-garage/shared-validators';
import { useRouter } from 'next/navigation';
import { STATUT_CONFIG } from '@/lib/constants';

interface Props {
  commande: CommandeEntity;
  categories: any[];
}

const STATUT_TRANSITIONS: Record<CommandeStatut, CommandeStatut[]> = {
  en_attente: ['en_cours', 'annulee'],
  en_cours: ['terminee', 'annulee'],
  terminee: [],
  annulee: [],
};

export default function CommandeDetailClient({ commande, categories }: Props) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statut = commande.statut as CommandeStatut;
  const transitions = STATUT_TRANSITIONS[statut] ?? [];

  const handleStatutChange = async (nextStatut: CommandeStatut) => {
    setUpdating(true);
    setError(null);
    try {
      await updateCommandeStatut(commande.id!, nextStatut);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    } finally {
      setUpdating(false);
    }
  };

  const categorie = categories.find((c) => c.id === commande.categorie_id);
  const option = categorie?.options?.find((o: any) => o.id === commande.option_id);

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-danger">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card space-y-3">
          <h3 className="font-semibold text-neutral-800 border-b border-neutral-100 pb-2">Client</h3>
          <Row label="Nom" value={`${commande.prenom} ${commande.nom}`} />
          <Row label="Téléphone" value={commande.telephone} />
          <Row label="Adresse" value={commande.adresse} />
        </div>

        <div className="card space-y-3">
          <h3 className="font-semibold text-neutral-800 border-b border-neutral-100 pb-2">Produit</h3>
          <Row label="Catégorie" value={categorie?.nom ?? commande.categorie_id} />
          {option && <Row label="Option" value={option.label} />}
          {commande.couleur && <Row label="Couleur" value={commande.couleur} />}
          {commande.mesure && <Row label="Dimensions" value={commande.mesure} />}
        </div>

        <div className="card space-y-3">
          <h3 className="font-semibold text-neutral-800 border-b border-neutral-100 pb-2">Financier</h3>
          <Row label="Prix total" value={formatMontant(commande.prix_total ?? 0)} bold />
          <Row label="Tarif livraison" value={formatMontant(commande.tarif_livraison ?? 0)} />
          <Row label="Source" value={commande.source === 'boutique' ? 'Boutique en ligne' : 'Admin'} />
        </div>

        <div className="card space-y-3">
          <h3 className="font-semibold text-neutral-800 border-b border-neutral-100 pb-2">Dates</h3>
          <Row label="Créée le" value={formatDate(commande.created_at!)} />
          {commande.updated_at && <Row label="Modifiée le" value={formatDate(commande.updated_at)} />}
          {commande.date_livraison && <Row label="Livraison" value={formatDate(commande.date_livraison)} />}
        </div>
      </div>

      {commande.notes && (
        <div className="card">
          <h3 className="font-semibold text-neutral-800 mb-2">Notes</h3>
          <p className="text-sm text-neutral-600 whitespace-pre-line">{commande.notes}</p>
        </div>
      )}

      {transitions.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-neutral-800 mb-3">Changer le statut</h3>
          <div className="flex gap-2 flex-wrap">
            {transitions.map((nextStatut) => {
              const cfg = STATUT_CONFIG[nextStatut];
              return (
                <button
                  key={nextStatut}
                  onClick={() => handleStatutChange(nextStatut)}
                  disabled={updating}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50 ${cfg?.bgClass ?? 'btn-secondary'}`}
                >
                  {updating ? '...' : `Marquer ${nextStatut.replace('_', ' ')}`}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-sm text-neutral-500 shrink-0">{label}</span>
      <span className={`text-sm text-right ${bold ? 'font-semibold text-neutral-900' : 'text-neutral-700'}`}>{value}</span>
    </div>
  );
}
