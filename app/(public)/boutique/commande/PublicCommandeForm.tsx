'use client';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { publicCommandeSchema, type PublicCommandeDto, type PublicCatalogueItem } from '@gestion-garage/shared-validators';
import { createPublicCommande } from '@/lib/client-api';

interface Props {
  categories: PublicCatalogueItem[];
  preselectCategorieId?: string;
}

type FormData = PublicCommandeDto;

export default function PublicCommandeForm({ categories, preselectCategorieId }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, control, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(publicCommandeSchema),
    defaultValues: {
      source: 'boutique',
      statut: 'en_attente',
      tarif_livraison: 0,
      prix_total: 0,
      categorie_id: preselectCategorieId ?? '',
    },
  });

  const selectedCategorieId = watch('categorie_id');
  const selectedCategorie = categories.find((c) => c.id === selectedCategorieId);

  useEffect(() => {
    setValue('option_id', undefined);
  }, [selectedCategorieId, setValue]);

  useEffect(() => {
    if (preselectCategorieId) setValue('categorie_id', preselectCategorieId);
  }, [preselectCategorieId, setValue]);

  const selectedOption = selectedCategorie?.options.find((o) => o.id === watch('option_id'));
  const isSurMesure = selectedOption?.is_sur_mesure ?? false;

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      await createPublicCommande(data);
      setSubmitted(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Erreur');
    }
  };

  if (submitted) {
    return (
      <div className="card text-center py-12">
        <p className="text-4xl mb-4">✅</p>
        <h3 className="text-xl font-bold text-neutral-900 mb-2">Commande envoyée !</h3>
        <p className="text-neutral-500 text-sm">
          Nous vous contacterons très bientôt pour confirmer votre commande et discuter des détails.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="card space-y-4">
        <h3 className="font-semibold text-neutral-800 border-b border-neutral-100 pb-2">Vos informations</h3>
        <div>
          <label className="label-base">Nom & Prénom *</label>
          <input className="input-base" placeholder="ex: Mohamed Benali" {...register('nom_prenom')} />
          {errors.nom_prenom && <p className="text-danger text-xs mt-1">{errors.nom_prenom.message}</p>}
        </div>
        <div>
          <label className="label-base">Téléphone *</label>
          <input className="input-base" placeholder="0555 00 00 00" {...register('telephone')} />
          {errors.telephone && <p className="text-danger text-xs mt-1">{errors.telephone.message}</p>}
        </div>
        <div>
          <label className="label-base">Adresse *</label>
          <textarea rows={2} className="input-base resize-none" {...register('adresse')} />
          {errors.adresse && <p className="text-danger text-xs mt-1">{errors.adresse.message}</p>}
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="font-semibold text-neutral-800 border-b border-neutral-100 pb-2">Produit souhaité</h3>
        <div>
          <label className="label-base">Catégorie *</label>
          <Controller
            name="categorie_id"
            control={control}
            render={({ field }) => (
              <select className="input-base" {...field}>
                <option value="">Choisir une catégorie...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
            )}
          />
          {errors.categorie_id && <p className="text-danger text-xs mt-1">{errors.categorie_id.message}</p>}
        </div>

        {selectedCategorie?.options && selectedCategorie.options.length > 0 && (
          <div>
            <label className="label-base">Modèle</label>
            <Controller
              name="option_id"
              control={control}
              render={({ field }) => (
                <select className="input-base" {...field} value={field.value ?? ''}>
                  <option value="">Sans préférence</option>
                  {selectedCategorie.options.map((o) => (
                    <option key={o.id} value={o.id}>{o.label}</option>
                  ))}
                </select>
              )}
            />
          </div>
        )}

        {isSurMesure && (
          <div>
            <label className="label-base">Dimensions souhaitées</label>
            <input className="input-base" placeholder="Ex: 200 × 90 × 45 cm" {...register('mesure')} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-base">Couleur souhaitée</label>
            <input className="input-base" placeholder="Noir mat, Bronze..." {...register('couleur')} />
          </div>
          <div>
            <label className="label-base">Budget indicatif (DA)</label>
            <input type="number" min="0" className="input-base" {...register('prix_total', { valueAsNumber: true })} />
          </div>
        </div>

        <div>
          <label className="label-base">Informations complémentaires</label>
          <textarea rows={3} className="input-base resize-none" placeholder="Décrivez votre projet, vos contraintes d'espace, vos préférences..." {...register('notes')} />
        </div>
      </div>

      {serverError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-danger">{serverError}</div>
      )}

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 text-base">
        {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma demande'}
      </button>

      <p className="text-center text-xs text-neutral-400">
        En soumettant ce formulaire, vous acceptez d'être contacté pour votre commande.
      </p>
    </form>
  );
}
