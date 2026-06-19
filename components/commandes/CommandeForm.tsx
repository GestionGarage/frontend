'use client';
import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Package, Truck, Tag, Ruler, Printer, PlusCircle, Trash2, Palette } from 'lucide-react';
import {
  createCommandeSchema,
  type CreateCommandeDto,
  type CategorieEntity,
} from '@gestion-garage/shared-validators';
import { createCommande, updateCommande, getProduitsParCategorie, type CatalogueProduit } from '@/lib/client-api';

const SAISIE_LIBRE = '__libre__';

interface CommandeFormProps {
  categories: CategorieEntity[];
  defaultValues?: Partial<CreateCommandeDto> & { id?: string };
}

/* ─── Statut dropdown options ─── */
const STATUT_DD_OPTIONS = [
  { value: 'en_attente', label: 'En attente', dot: '#B45309' },
  { value: 'en_cours',   label: 'En cours',   dot: '#C5A059' },
  { value: 'terminee',   label: 'Terminée',   dot: '#16A34A' },
  { value: 'annulee',    label: 'Annulée',    dot: '#EF4444' },
];

const COULEUR_LINE_OPTIONS: Array<{ value: string; label: string; dot?: string }> = [
  { value: 'Noir',  label: 'Noir',  dot: '#1F2937' },
  { value: 'Doré',  label: 'Doré',  dot: '#C5A059' },
  { value: 'Blanc', label: 'Blanc', dot: '#F3F4F6' },
  { value: 'Autre', label: 'Autre…' },
];

/* ─── Field section wrapper ─── */
function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-4 sm:p-6 space-y-4 shadow-card"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(197,160,89,0.12)' }}
    >
      <p
        className="font-display text-xs font-bold text-neutral-400 uppercase tracking-widest pb-3"
        style={{ borderBottom: '1px solid rgba(197,160,89,0.10)' }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

/* ─── Premium checkbox ─── */
function PremiumCheckbox({
  checked, onChange, label,
}: {
  checked: boolean; onChange: (v: boolean) => void; label: string;
}) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-3 group">
      <span
        className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200"
        style={{
          border: checked ? '2px solid #C5A059' : '2px solid #D1D5DB',
          backgroundColor: checked ? 'rgba(197,160,89,0.10)' : '#FFFFFF',
          boxShadow: checked ? '0 0 0 3px rgba(197,160,89,0.10)' : 'none',
        }}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="#C5A059" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span
        className="text-sm font-medium transition-colors duration-200"
        style={{ color: checked ? '#A8863A' : '#374151' }}
      >
        {label}
      </span>
    </button>
  );
}

/* ─── Custom dropdown (reusable, supports optional dot color) ─── */
function CustomDropdown<T extends string>({
  options, value, onChange, placeholder, renderOption, error,
}: {
  options: Array<{ value: T; label: string; sub?: string; dot?: string }>;
  value: T | '';
  onChange: (v: T) => void;
  placeholder: string;
  renderOption?: (opt: { value: T; label: string; sub?: string; dot?: string }) => React.ReactNode;
  error?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between input-base text-left gap-2"
        style={error ? { borderColor: '#DC2626', boxShadow: '0 0 0 3px rgba(220,38,38,0.08)' } : undefined}
      >
        <span className={`flex items-center gap-2 min-w-0 flex-1 ${selected ? 'text-neutral-800' : 'text-neutral-400'}`}>
          {selected?.dot && (
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{
                backgroundColor: selected.dot,
                border: selected.value === 'Blanc' || selected.value === 'Blanc Crème' ? '1px solid #D1D5DB' : 'none',
              }}
            />
          )}
          <span className="truncate">{selected?.label ?? placeholder}</span>
        </span>
        <ChevronDown
          size={14}
          className="text-neutral-400 transition-transform flex-shrink-0"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.14 }}
            className="absolute z-50 w-full mt-1.5 rounded-xl overflow-hidden bg-white"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(197,160,89,0.14)' }}
          >
            <div className="max-h-52 overflow-y-auto">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className="w-full text-left px-4 py-2.5 transition-colors"
                  style={{
                    color: opt.value === value ? '#A8863A' : '#374151',
                    backgroundColor: opt.value === value ? 'rgba(197,160,89,0.06)' : 'transparent',
                  }}
                  onMouseEnter={(e) => { if (opt.value !== value) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#F8F7F4'; }}
                  onMouseLeave={(e) => { if (opt.value !== value) (e.currentTarget as HTMLButtonElement).style.backgroundColor = opt.value === value ? 'rgba(197,160,89,0.06)' : 'transparent'; }}
                >
                  {renderOption ? renderOption(opt) : (
                    <div>
                      <div className="flex items-center gap-2">
                        {opt.dot && (
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: opt.dot,
                              border: opt.value === 'Blanc' || opt.value === 'Blanc Crème' ? '1px solid #D1D5DB' : 'none',
                            }}
                          />
                        )}
                        <p className="text-sm font-medium">{opt.label}</p>
                      </div>
                      {opt.sub && <p className="text-xs text-neutral-400 mt-0.5 ml-5">{opt.sub}</p>}
                    </div>
                  )}
                </button>
              ))}
              {options.length === 0 && (
                <p className="px-4 py-3 text-sm text-neutral-400">Aucune option disponible</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Multi-product order line ─── */
interface OrderLine {
  id: string;
  lineCategorieId: string;
  produitId: string;
  produit: CatalogueProduit | null;
  dimension: string;
  mesureLibre: string;
  lineCouleurMode: string;    // 'Noir' | 'Doré' | 'Blanc' | 'Autre' | ''
  lineCouleurCustom: string;  // free text when lineCouleurMode === 'Autre'
  quantite: number;
  prixRevientUnit: number;
  prixVenteUnit: number;
  prixMainOeuvreUnit: number;
}

function newOrderLine(categorieId = ''): OrderLine {
  return {
    id: Math.random().toString(36).slice(2),
    lineCategorieId: categorieId,
    produitId: '', produit: null, dimension: '',
    mesureLibre: '', lineCouleurMode: '', lineCouleurCustom: '',
    quantite: 1, prixRevientUnit: 0, prixVenteUnit: 0, prixMainOeuvreUnit: 0,
  };
}

function parseCouleurFromString(couleur: string): { mode: string; custom: string } {
  if (!couleur) return { mode: '', custom: '' };
  if (['Noir', 'Doré', 'Blanc'].includes(couleur)) return { mode: couleur, custom: '' };
  return { mode: 'Autre', custom: couleur };
}

/* ─── Main Form ─── */
export default function CommandeForm({ categories, defaultValues }: CommandeFormProps) {
  const router = useRouter();
  const isEdit = !!defaultValues?.id;

  /* ── Local UI state ── */
  const [typeLivraison, setTypeLivraison] = useState<'none' | 'bureau' | 'vehicule'>('none');
  const [bureauNom, setBureauNom] = useState('');
  const [livraisonGratuite, setLivraisonGratuite] = useState(false);

  /* Multi-product order lines — first line pre-seeded with edit-mode category + color */
  const [orderLines, setOrderLines] = useState<OrderLine[]>(() => {
    const initCouleur = parseCouleurFromString(defaultValues?.couleur ?? '');
    return [{
      ...newOrderLine(defaultValues?.categorie_id ?? ''),
      lineCouleurMode: initCouleur.mode,
      lineCouleurCustom: initCouleur.custom,
    }];
  });
  const [lineErrors, setLineErrors] = useState<Record<string, string>>({});

  /* Per-line product catalog cache — keyed by categorie_id */
  const [produitsCache, setProduitsCache] = useState<Record<string, CatalogueProduit[]>>({});
  const [loadingCats, setLoadingCats] = useState<Set<string>>(new Set());

  const [serverError,   setServerError]   = useState<string | null>(null);
  const [livraisonError, setLivraisonError] = useState(false);

  /* Derived totals */
  const totalPrixRevient = orderLines.reduce((s, l) => s + l.prixRevientUnit    * l.quantite, 0);
  const totalMainOeuvre  = orderLines.reduce((s, l) => s + l.prixMainOeuvreUnit * l.quantite, 0);
  const totalPrixVente   = orderLines.reduce((s, l) => s + l.prixVenteUnit      * l.quantite, 0);
  const beneficeNet      = totalPrixVente - totalPrixRevient - totalMainOeuvre;

  /* ── RHF ── */
  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<CreateCommandeDto>({
    resolver: zodResolver(createCommandeSchema),
    mode: 'onTouched',
    defaultValues: {
      nom_prenom: '',
      telephone: '',
      adresse: '',
      categorie_id: '',
      prix_total: 0,
      statut: 'en_attente',
      source: 'admin',
      tarif_livraison: 0,
      date_livraison: new Date().toISOString().split('T')[0],
      ...defaultValues,
    },
  });

  const tarifLivraison = watch('tarif_livraison') ?? 0;

  /* Button gating: disabled when products missing, livraison not set, or total is 0 */
  const canSubmit =
    !isSubmitting &&
    typeLivraison !== 'none' &&
    totalPrixVente > 0 &&
    orderLines.every((l) => !!l.produitId);

  /* ── Pre-load products for the initial category when editing an existing order ── */
  useEffect(() => {
    const categorieId = defaultValues?.categorie_id;
    if (!categorieId) return;
    setLoadingCats(new Set([categorieId]));
    getProduitsParCategorie(categorieId)
      .then((body) => setProduitsCache({ [categorieId]: body.data ?? [] }))
      .catch(() => setProduitsCache({ [categorieId]: [] }))
      .finally(() => setLoadingCats(new Set()));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeLivraison === 'none') setValue('tarif_livraison', 0);
  }, [typeLivraison, setValue]);

  useEffect(() => {
    if (livraisonGratuite) setValue('tarif_livraison', 0, { shouldValidate: false });
  }, [livraisonGratuite, setValue]);

  /* Sync prix_total RHF field from computed line total — re-validate after first submit so the error clears dynamically */
  useEffect(() => {
    setValue('prix_total', totalPrixVente, { shouldValidate: isSubmitted });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPrixVente, isSubmitted]);

  /* ── Order line handlers ── */
  const handleLineCategorieChange = (lineId: string, categorieId: string) => {
    setOrderLines((prev) => prev.map((l) => l.id !== lineId ? l : {
      ...l,
      lineCategorieId: categorieId,
      produitId: '', produit: null, dimension: '', mesureLibre: '',
      prixRevientUnit: 0, prixVenteUnit: 0,
    }));
    setLineErrors((prev) => { const next = { ...prev }; delete next[lineId]; return next; });
    if (orderLines[0]?.id === lineId) setValue('categorie_id', categorieId, { shouldValidate: isSubmitted });
    if (!categorieId || produitsCache[categorieId] !== undefined) return;
    setLoadingCats((prev) => new Set([...prev, categorieId]));
    getProduitsParCategorie(categorieId)
      .then((body) => setProduitsCache((prev) => ({ ...prev, [categorieId]: body.data ?? [] })))
      .catch(() => setProduitsCache((prev) => ({ ...prev, [categorieId]: [] })))
      .finally(() => setLoadingCats((prev) => { const s = new Set(prev); s.delete(categorieId); return s; }));
  };

  const handleProductSelectForLine = (lineId: string, produitId: string) => {
    const line = orderLines.find((l) => l.id === lineId);
    const p = produitId
      ? (produitsCache[line?.lineCategorieId ?? ''] ?? []).find((x) => x.id === produitId) ?? null
      : null;
    // Products with no dimension models go straight to free-text mode
    const autoDimension = p !== null && p.dimensions.length === 0 ? SAISIE_LIBRE : '';
    setOrderLines((prev) => prev.map((l) => {
      if (l.id !== lineId) return l;
      return {
        ...l,
        produitId,
        produit: p,
        dimension: autoDimension,
        mesureLibre: '',
        prixRevientUnit:    p && p.dimensions.length === 0 ? p.prix_base          : 0,
        prixVenteUnit:      p && p.dimensions.length === 0 ? p.prix_vente         : 0,
        prixMainOeuvreUnit: p && p.dimensions.length === 0 ? (p.prix_main_oeuvre ?? 0) : 0,
      };
    }));
    // Keep first-line mesure RHF in sync when auto-switching to saisie libre
    const isFirstLine = orderLines[0]?.id === lineId;
    if (isFirstLine && autoDimension === SAISIE_LIBRE) setValue('mesure', '');
    setLineErrors((prev) => { const next = { ...prev }; delete next[lineId]; return next; });
  };

  const handleDimensionSelectForLine = (lineId: string, dimLabel: string) => {
    setOrderLines((prev) => prev.map((l) => {
      if (l.id !== lineId) return l;
      if (dimLabel === SAISIE_LIBRE) return { ...l, dimension: SAISIE_LIBRE, mesureLibre: '' };
      const dim = l.produit?.dimensions.find((d) => d.label === dimLabel);
      return {
        ...l,
        dimension: dimLabel,
        mesureLibre: '',
        prixRevientUnit:    dim && dim.prix_base  > 0 ? dim.prix_base  : l.prixRevientUnit,
        prixVenteUnit:      dim && dim.prix_vente > 0 ? dim.prix_vente : l.prixVenteUnit,
        prixMainOeuvreUnit: dim && (dim.prix_main_oeuvre ?? 0) > 0 ? dim.prix_main_oeuvre : l.prixMainOeuvreUnit,
      };
    }));
    // Sync mesure RHF from first line's dimension selection
    const isFirstLine = orderLines[0]?.id === lineId;
    if (isFirstLine && dimLabel !== SAISIE_LIBRE) {
      setValue('mesure', dimLabel);
    } else if (isFirstLine && dimLabel === SAISIE_LIBRE) {
      setValue('mesure', '');
    }
    setLineErrors((prev) => { const next = { ...prev }; delete next[lineId]; return next; });
  };

  const updateLineMesureLibre = (lineId: string, val: string) => {
    setOrderLines((prev) => prev.map((l) => l.id === lineId ? { ...l, mesureLibre: val } : l));
    const isFirstLine = orderLines[0]?.id === lineId;
    if (isFirstLine) setValue('mesure', val);
  };

  const addLine = () => {
    setOrderLines((prev) => [...prev, newOrderLine()]);
  };

  const removeLine = (lineId: string) => {
    setOrderLines((prev) => prev.filter((l) => l.id !== lineId));
    setLineErrors((prev) => { const next = { ...prev }; delete next[lineId]; return next; });
  };

  const updateLineQty = (lineId: string, qty: number) => {
    setOrderLines((prev) => prev.map((l) => l.id === lineId ? { ...l, quantite: Math.max(1, qty) } : l));
  };

  const updateLinePriceRevient = (lineId: string, val: number) => {
    setOrderLines((prev) => prev.map((l) => l.id === lineId ? { ...l, prixRevientUnit: val } : l));
  };

  const updateLinePriceVente = (lineId: string, val: number) => {
    setOrderLines((prev) => prev.map((l) => l.id === lineId ? { ...l, prixVenteUnit: val } : l));
  };

  const updateLineCouleurMode = (lineId: string, mode: string) => {
    setOrderLines((prev) => prev.map((l) => l.id === lineId ? { ...l, lineCouleurMode: mode } : l));
  };

  const updateLineCouleurCustom = (lineId: string, val: string) => {
    setOrderLines((prev) => prev.map((l) => l.id === lineId ? { ...l, lineCouleurCustom: val } : l));
  };

  const updateLineMainOeuvre = (lineId: string, val: number) => {
    setOrderLines((prev) => prev.map((l) => l.id === lineId ? { ...l, prixMainOeuvreUnit: val } : l));
  };

  /* ── Submit ── */
  const onSubmit = async (data: CreateCommandeDto) => {
    setServerError(null);
    if (typeLivraison === 'none') {
      setLivraisonError(true);
      return;
    }
    setLivraisonError(false);
    try {
      const newLineErrors: Record<string, string> = {};
      for (const line of orderLines) {
        if (!line.produitId) {
          newLineErrors[line.id] = 'Veuillez sélectionner un produit';
        } else if (line.produit && line.produit.dimensions.length > 0 && !line.dimension) {
          newLineErrors[line.id] = 'Veuillez sélectionner un modèle de dimensions';
        } else if (line.dimension === SAISIE_LIBRE && !line.mesureLibre.trim()) {
          newLineErrors[line.id] = 'Veuillez saisir les dimensions personnalisées';
        }
      }
      if (Object.keys(newLineErrors).length > 0) {
        setLineErrors(newLineErrors);
        return;
      }
      setLineErrors({});

      const effectiveCouleur = (l: OrderLine) =>
        l.lineCouleurMode === 'Autre' ? l.lineCouleurCustom.trim() : l.lineCouleurMode;

      const produitsSummary = orderLines
        .filter((l) => l.prixVenteUnit > 0 || l.produit)
        .map((l) => {
          const cat = categories.find((c) => c.id === l.lineCategorieId);
          const catName = cat?.nom ?? '';
          const nom = l.produit?.nom ?? 'Produit';
          const dim = l.dimension && l.dimension !== SAISIE_LIBRE
            ? l.dimension
            : l.mesureLibre.trim();
          const couleur = effectiveCouleur(l);
          return `${catName}||${nom}||${dim}||${couleur}||${l.quantite}`;
        }).join(';;');

      const noteParts = [
        totalPrixRevient > 0 ? `[REVIENT:${totalPrixRevient}]` : '',
        totalMainOeuvre  > 0 ? `[MOE:${totalMainOeuvre}]` : '',
        produitsSummary ? `[PRODUITS:${produitsSummary}]` : '',
        bureauNom.trim() && typeLivraison === 'bureau' ? `[BUREAU:${bureauNom.trim()}]` : '',
        data.notes ?? '',
      ].filter(Boolean);

      const firstLine = orderLines[0];
      const payload = {
        ...data,
        couleur: firstLine ? effectiveCouleur(firstLine) || undefined : undefined,
        type_livraison: typeLivraison,
        bureau_nom: typeLivraison === 'bureau' ? (bureauNom.trim() || undefined) : undefined,
        cout_revient: totalPrixRevient > 0 ? totalPrixRevient : undefined,
        cout_main_oeuvre: totalMainOeuvre > 0 ? totalMainOeuvre : undefined,
        notes: noteParts.join('\n') || undefined,
      };

      if (isEdit && defaultValues?.id) {
        await updateCommande(defaultValues.id, payload);
      } else {
        await createCommande(payload);
      }
      router.push('/admin/commandes');
      router.refresh();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Une erreur inattendue est survenue');
    }
  };

  const prixTotalAffiche = totalPrixVente + (Number(tarifLivraison) || 0);

  /* Build category options */
  const categorieOptions = categories.map((c) => ({
    value: c.id,
    label: c.nom,
    sub: c.description ?? undefined,
  }));

  return (
    <form
      onSubmit={handleSubmit(onSubmit, () => {
        if (typeLivraison === 'none') setLivraisonError(true);
        const errs: Record<string, string> = {};
        for (const line of orderLines) {
          if (!line.produitId) errs[line.id] = 'Veuillez sélectionner un produit';
          else if (line.produit && line.produit.dimensions.length > 0 && !line.dimension) errs[line.id] = 'Veuillez sélectionner un modèle de dimensions';
          else if (line.dimension === SAISIE_LIBRE && !line.mesureLibre.trim()) errs[line.id] = 'Veuillez saisir les dimensions personnalisées';
        }
        if (Object.keys(errs).length > 0) setLineErrors(errs);
      })}
      className="space-y-5 max-w-2xl"
    >
      {/* ── Section 1: Informations Client ── */}
      <FormSection title="Informations client">
        <div>
          <label className="label-base">Nom & Prénom *</label>
          <input
            className="input-base"
            placeholder="ex: Mohamed Benali"
            style={errors.nom_prenom ? { borderColor: '#DC2626', boxShadow: '0 0 0 3px rgba(220,38,38,0.08)' } : undefined}
            {...register('nom_prenom')}
          />
          {errors.nom_prenom && (
            <p className="text-danger text-xs mt-1.5 font-medium">
              {errors.nom_prenom.message}
            </p>
          )}
        </div>
        <div>
          <label className="label-base">Téléphone *</label>
          <input
            className="input-base"
            placeholder="0555000000"
            inputMode="numeric"
            maxLength={10}
            style={errors.telephone ? { borderColor: '#DC2626', boxShadow: '0 0 0 3px rgba(220,38,38,0.08)' } : undefined}
            {...register('telephone')}
            onChange={(e) => {
              let v = e.target.value.replace(/\D/g, '');
              if (v.length > 0 && v[0] !== '0') v = ('0' + v).slice(0, 10);
              else v = v.slice(0, 10);
              e.target.value = v;
              void register('telephone').onChange(e);
            }}
          />
          {errors.telephone && <p className="text-danger text-xs mt-1.5 font-medium">{errors.telephone.message}</p>}
        </div>
        <div>
          <label className="label-base">Adresse *</label>
          <textarea
            rows={2}
            className="input-base resize-none"
            placeholder="Rue, ville..."
            style={errors.adresse ? { borderColor: '#DC2626', boxShadow: '0 0 0 3px rgba(220,38,38,0.08)' } : undefined}
            {...register('adresse')}
          />
          {errors.adresse && <p className="text-danger text-xs mt-1.5 font-medium">{errors.adresse.message}</p>}
        </div>
      </FormSection>

      {/* ── Section 2: Produits commandés (multi-ligne) ── */}
      <FormSection title="Produits commandés">
        {/* Product lines — each line has its own category + product selector */}
        <div className="space-y-3">
          {orderLines.map((line, idx) => {
            const lineProduits = produitsCache[line.lineCategorieId] ?? [];
            const lineProduitsLoading = loadingCats.has(line.lineCategorieId);
            const lineProductOptions: Array<{ value: string; label: string; sub?: string }> = lineProduits.map((p) => ({
              value: p.id,
              label: p.nom,
              sub: p.prix_vente > 0 ? `${p.prix_vente.toLocaleString('fr-FR')} DA` : undefined,
            }));

            const dimOptions: Array<{ value: string; label: string; sub?: string }> = line.produit
              ? [
                  ...line.produit.dimensions.map((d) => ({
                    value: d.label,
                    label: d.label,
                    sub: d.prix_vente > 0 ? `${d.prix_vente.toLocaleString('fr-FR')} DA` : undefined,
                  })),
                  { value: SAISIE_LIBRE, label: 'Saisie libre' },
                ]
              : [];

            const lineTotal = line.prixVenteUnit * line.quantite;
            const lineErr   = lineErrors[line.id];

            return (
              <div
                key={line.id}
                className="rounded-xl p-4 space-y-3"
                style={{
                  backgroundColor: '#F8F7F4',
                  border: `1px solid ${lineErr ? 'rgba(220,38,38,0.30)' : 'rgba(197,160,89,0.12)'}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Produit {idx + 1}
                  </span>
                  {orderLines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLine(line.id)}
                      className="p-1 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={13} className="text-danger" />
                    </button>
                  )}
                </div>

                {/* Per-line category selector */}
                <div>
                  <label className="label-base flex items-center gap-1.5 mb-1.5">
                    <Tag size={10} /> Catégorie *
                  </label>
                  <CustomDropdown
                    options={categorieOptions}
                    value={line.lineCategorieId}
                    onChange={(id) => handleLineCategorieChange(line.id, id)}
                    placeholder="Sélectionner une catégorie…"
                    error={idx === 0 && !!errors.categorie_id}
                  />
                  {idx === 0 && errors.categorie_id && (
                    <p className="text-danger text-xs mt-1.5 font-medium">Veuillez sélectionner une catégorie</p>
                  )}
                </div>

                {/* Product selector */}
                <div>
                  <label className="label-base flex items-center gap-1.5 mb-1.5">
                    <Package size={10} /> Produit *
                  </label>
                  {!line.lineCategorieId ? (
                    <p className="text-xs text-neutral-400 px-3 py-2.5 rounded-lg bg-neutral-100">
                      Sélectionnez d'abord une catégorie
                    </p>
                  ) : lineProduitsLoading ? (
                    <p className="text-xs text-neutral-400 px-3 py-2.5 rounded-lg bg-neutral-100">
                      Chargement…
                    </p>
                  ) : lineProduits.length === 0 ? (
                    <p className="text-xs text-neutral-400 px-3 py-2.5 rounded-lg bg-neutral-100">
                      Aucun produit pour cette catégorie
                    </p>
                  ) : (
                    <CustomDropdown
                      options={lineProductOptions}
                      value={line.produitId}
                      onChange={(id) => handleProductSelectForLine(line.id, id)}
                      placeholder="Choisir dans le catalogue…"
                    />
                  )}
                </div>

                {/* Dimension — rendered when product has models, or auto-saisie-libre for those without */}
                {line.produit && (line.produit.dimensions.length > 0 || line.dimension === SAISIE_LIBRE) && (
                  <div>
                    <label className="label-base flex items-center gap-1.5 mb-1.5">
                      <Ruler size={10} /> Modèle de dimensions *
                    </label>
                    {line.produit.dimensions.length > 0 && (
                      <CustomDropdown
                        options={dimOptions}
                        value={line.dimension}
                        onChange={(dim) => handleDimensionSelectForLine(line.id, dim)}
                        placeholder="Choisir un modèle…"
                      />
                    )}
                    <AnimatePresence>
                      {line.dimension === SAISIE_LIBRE && (
                        <motion.div
                          key={`libre-${line.id}`}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <input
                            className={`input-base${line.produit.dimensions.length > 0 ? ' mt-2' : ''}`}
                            placeholder="ex: 200 × 90 × 45 cm"
                            value={line.mesureLibre}
                            onChange={(e) => updateLineMesureLibre(line.id, e.target.value)}
                            autoFocus={line.produit.dimensions.length > 0}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Per-line color / finish */}
                <div>
                  <label className="label-base flex items-center gap-1.5 mb-1">
                    <Palette size={10} /> Couleur / Finition
                  </label>
                  <CustomDropdown
                    options={COULEUR_LINE_OPTIONS}
                    value={line.lineCouleurMode}
                    onChange={(mode) => updateLineCouleurMode(line.id, mode)}
                    placeholder="Choisir une finition…"
                  />
                  <AnimatePresence>
                    {line.lineCouleurMode === 'Autre' && (
                      <motion.div
                        key={`couleur-autre-${line.id}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <input
                          className="input-base text-sm py-1.5 mt-2"
                          placeholder="ex: Bronze, Rouille, Sur mesure…"
                          value={line.lineCouleurCustom}
                          onChange={(e) => updateLineCouleurCustom(line.id, e.target.value)}
                          autoFocus
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Prices row */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  <div>
                    <label className="label-base mb-1">Revient (DA)</label>
                    <input
                      type="number" min="0" step="1"
                      className="input-base text-sm py-1.5"
                      placeholder="0"
                      value={line.prixRevientUnit || ''}
                      onChange={(e) => updateLinePriceRevient(line.id, Number(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="label-base mb-1">M.O. (DA)</label>
                    <input
                      type="number" min="0" step="1"
                      className="input-base text-sm py-1.5"
                      placeholder="0"
                      value={line.prixMainOeuvreUnit || ''}
                      onChange={(e) => updateLineMainOeuvre(line.id, Number(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="label-base mb-1">Vente (DA)</label>
                    <input
                      type="number" min="0" step="1"
                      className="input-base text-sm py-1.5"
                      placeholder="0"
                      value={line.prixVenteUnit || ''}
                      onChange={(e) => updateLinePriceVente(line.id, Number(e.target.value) || 0)}
                    />
                  </div>
                </div>
                {/* Quantity row */}
                <div>
                  <label className="label-base mb-1">Quantité</label>
                  <div className="flex items-center gap-1 max-w-[200px]">
                    <button
                      type="button"
                      onClick={() => updateLineQty(line.id, line.quantite - 1)}
                      className="w-8 h-9 rounded-xl font-bold text-neutral-500 transition-colors hover:bg-neutral-200 flex-shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: '#EBEBEB' }}
                    >
                      −
                    </button>
                    <input
                      type="number" min="1" max="999"
                      className="input-base text-sm py-1.5 text-center"
                      value={line.quantite}
                      onChange={(e) => updateLineQty(line.id, Number(e.target.value) || 1)}
                    />
                    <button
                      type="button"
                      onClick={() => updateLineQty(line.id, line.quantite + 1)}
                      className="w-8 h-9 rounded-xl font-bold text-neutral-500 transition-colors hover:bg-neutral-200 flex-shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: '#EBEBEB' }}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Line error */}
                {lineErr && (
                  <p className="text-danger text-xs font-medium">{lineErr}</p>
                )}

                {/* Line subtotal */}
                {lineTotal > 0 && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-neutral-400">
                      {line.prixVenteUnit.toLocaleString('fr-FR')} × {line.quantite}
                    </span>
                    <span className="text-sm font-bold tabular-nums" style={{ color: '#C5A059' }}>
                      {lineTotal.toLocaleString('fr-FR')} DA
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Add line button */}
          <button
            type="button"
            onClick={addLine}
            className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70 mt-1"
            style={{ color: '#C5A059' }}
          >
            <PlusCircle size={15} strokeWidth={1.8} />
            Ajouter un produit
          </button>
        </div>

      </FormSection>

      {/* ── Section 3: Tarification ── */}
      <FormSection title="Tarification">
        {/* Computed totals from product lines */}
        <div
          className="rounded-xl p-4 space-y-2"
          style={{ backgroundColor: '#F8F7F4', border: '1px solid rgba(197,160,89,0.12)' }}
        >
          {orderLines.filter((l) => l.prixVenteUnit > 0).map((l, i) => (
            <div key={l.id} className="flex items-center justify-between text-xs text-neutral-500">
              <span>
                {l.produit?.nom ?? `Produit ${i + 1}`}
                {l.dimension && l.dimension !== SAISIE_LIBRE ? ` (${l.dimension})` : ''}
                {l.dimension === SAISIE_LIBRE && l.mesureLibre ? ` (${l.mesureLibre})` : ''}
                {l.quantite > 1 ? ` ×${l.quantite}` : ''}
              </span>
              <span className="font-mono font-semibold text-neutral-600">
                {(l.prixVenteUnit * l.quantite).toLocaleString('fr-FR')} DA
              </span>
            </div>
          ))}
          <div
            className="pt-2 mt-1 space-y-2"
            style={{ borderTop: '1px solid rgba(197,160,89,0.12)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-neutral-700">Total produits</span>
              <span className="font-mono font-bold text-base" style={{ color: '#C5A059' }}>
                {totalPrixVente.toLocaleString('fr-FR')} DA
              </span>
            </div>
            {totalPrixRevient > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">Coût revient</span>
                <span className="text-xs font-mono font-semibold text-neutral-600">
                  {totalPrixRevient.toLocaleString('fr-FR')} DA
                </span>
              </div>
            )}
            {totalMainOeuvre > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">Main-d'œuvre</span>
                <span className="text-xs font-mono font-semibold text-neutral-600">
                  {totalMainOeuvre.toLocaleString('fr-FR')} DA
                </span>
              </div>
            )}
            {totalPrixVente > 0 && (totalPrixRevient > 0 || totalMainOeuvre > 0) && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">Bénéfice net</span>
                <span
                  className="text-xs font-mono font-bold"
                  style={{ color: beneficeNet >= 0 ? '#059669' : '#DC2626' }}
                >
                  {beneficeNet.toLocaleString('fr-FR')} DA
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Hidden RHF prix_total (synced via useEffect) */}
        <input type="hidden" {...register('prix_total', { valueAsNumber: true })} />
        {errors.prix_total && (
          <p className="text-danger text-xs font-medium">
            {orderLines.some((l) => l.produitId)
              ? 'Le prix de vente total doit être supérieur à 0'
              : 'Veuillez ajouter au moins un produit'}
          </p>
        )}

        {/* Delivery type — required */}
        <div>
          <label className="label-base flex items-center gap-1.5">
            <Truck size={11} />
            Option de livraison *
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['none', 'bureau', 'vehicule'] as const).map((type) => {
              const LABELS = { none: 'Non définie', bureau: 'Bureau', vehicule: 'Véhicule propre' };
              const isActive = typeLivraison === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setTypeLivraison(type);
                    setLivraisonGratuite(false);
                    setBureauNom('');
                    if (type !== 'none') setLivraisonError(false);
                  }}
                  className="px-2 py-2 rounded-xl text-xs font-semibold transition-all duration-150 text-center"
                  style={{
                    backgroundColor: isActive
                      ? type === 'none' ? 'rgba(220,38,38,0.07)' : 'rgba(197,160,89,0.10)'
                      : '#F8F7F4',
                    border: `1px solid ${isActive
                      ? type === 'none' ? 'rgba(220,38,38,0.25)' : 'rgba(197,160,89,0.35)'
                      : 'rgba(197,160,89,0.12)'}`,
                    color: isActive
                      ? type === 'none' ? '#DC2626' : '#A8863A'
                      : '#6B7280',
                  }}
                >
                  {LABELS[type]}
                </button>
              );
            })}
          </div>
          {livraisonError && (
            <p className="text-danger text-xs mt-1.5 font-medium">
              Sélectionnez un mode de livraison (Bureau ou Véhicule propre)
            </p>
          )}

          <AnimatePresence>
            {typeLivraison === 'bureau' && (
              <motion.div
                key="bureau-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="label-base">Nom du bureau</label>
                    <input
                      className="input-base"
                      placeholder="ex: Yalidine, DHL, Zaki…"
                      value={bureauNom}
                      onChange={(e) => setBureauNom(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label-base">Prix de livraison bureau (DA)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="input-base"
                      {...register('tarif_livraison', { valueAsNumber: true })}
                    />
                  </div>
                </div>
              </motion.div>
            )}
            {typeLivraison === 'vehicule' && (
              <motion.div
                key="vehicule-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="label-base">Prix de livraison véhicule (DA)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      disabled={livraisonGratuite}
                      className="input-base disabled:opacity-40 disabled:cursor-not-allowed"
                      {...register('tarif_livraison', { valueAsNumber: true })}
                    />
                  </div>
                  <PremiumCheckbox
                    checked={livraisonGratuite}
                    onChange={(v) => {
                      setLivraisonGratuite(v);
                      if (v) setValue('tarif_livraison', 0, { shouldValidate: false });
                    }}
                    label="Livraison gratuite"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Total */}
        <div
          className="rounded-xl px-4 py-3 flex items-center justify-between"
          style={{ backgroundColor: 'rgba(197,160,89,0.06)', border: '1px solid rgba(197,160,89,0.15)' }}
        >
          <span className="text-sm font-semibold text-neutral-600">Total facturé client</span>
          <span className="font-mono font-bold text-lg" style={{ color: '#C5A059' }}>
            {prixTotalAffiche.toLocaleString('fr-FR')} DA
          </span>
        </div>
      </FormSection>

      {/* ── Section 4: Planification ── */}
      <FormSection title="Planification">
        <div>
          <label className="label-base">Date de livraison prévue</label>
          <input type="date" className="input-base" {...register('date_livraison')} />
        </div>

        {/* Statut — premium dropdown */}
        <div>
          <label className="label-base">Statut initial</label>
          <Controller
            name="statut"
            control={control}
            render={({ field }) => (
              <CustomDropdown
                options={STATUT_DD_OPTIONS}
                value={field.value ?? 'en_attente'}
                onChange={(v) => field.onChange(v)}
                placeholder="Sélectionner un statut…"
              />
            )}
          />
        </div>

        <div>
          <label className="label-base">Notes internes</label>
          <textarea
            rows={3}
            className="input-base resize-none"
            placeholder="Remarques, détails techniques…"
            {...register('notes')}
          />
        </div>
      </FormSection>

      {serverError && (
        <div
          className="rounded-xl px-4 py-3 text-sm font-medium text-danger"
          style={{ backgroundColor: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.15)' }}
        >
          {serverError}
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <button
          type="submit"
          disabled={!canSubmit}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          title={
            typeLivraison === 'none'
              ? 'Sélectionnez un mode de livraison'
              : totalPrixVente === 0
              ? 'Ajoutez au moins un produit avec un prix'
              : orderLines.some((l) => !l.produitId)
              ? 'Chaque ligne doit avoir un produit sélectionné'
              : undefined
          }
        >
          {isSubmitting ? 'Enregistrement…' : isEdit ? 'Modifier la commande' : 'Créer la commande'}
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="btn-secondary flex items-center gap-2"
        >
          <Printer size={14} />
          Imprimer
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Annuler
        </button>
      </div>
    </form>
  );
}
