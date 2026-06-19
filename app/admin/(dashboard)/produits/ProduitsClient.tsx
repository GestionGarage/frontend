'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Trash2, Pencil, Package, ImageOff, ChevronDown,
  Upload, X, Images, PlusCircle, Maximize2, Link2,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import {
  createProduit, updateProduit as apiUpdateProduit, deleteProduit as apiDeleteProduit,
} from '@/lib/client-api';
import { formatMontant } from '@/lib/formatters';
import type { CategorieEntity } from '@gestion-garage/shared-validators';
import ConfirmDeleteModal from '@/components/ui/ConfirmDeleteModal';

export interface DimensionModel {
  label: string;
  prix_base: number;
  prix_vente: number;
  prix_main_oeuvre: number;
}

export interface ProduitRow {
  id: string;
  nom: string;
  categorie_id: string | null;
  categorie?: { id: string; nom: string } | null;
  prix_base: number;
  prix_vente: number;
  prix_main_oeuvre: number;
  image_url: string | null;
  gallery_urls: string[];
  dimensions: DimensionModel[];
  is_active: boolean;
  created_at: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Props {
  initialData: ProduitRow[];
  meta: Meta;
  categories: CategorieEntity[];
  currentPage: number;
  currentCat: string;
  currentSearch: string;
}

function toSlug(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const EMPTY_FORM = { nom: '', categorie_id: '', prix_base: '', prix_vente: '', prix_main_oeuvre: '' };
const EMPTY_DIM: DimensionModel = { label: '', prix_base: 0, prix_vente: 0, prix_main_oeuvre: 0 };
const DIM_PLACEHOLDERS = ['1.4×1.6 m', '1.6×1.8 m', '0.9×2.0 m', '2.0×2.2 m', '1.2×2.4 m'];

/* ─── Reusable custom dropdown ─── */
function CustomDropdown({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
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
        className="w-full flex items-center justify-between input-base text-left"
      >
        <span className={selected ? 'text-neutral-800' : 'text-neutral-400'}>
          {selected?.label ?? placeholder}
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
                  className="w-full text-left px-4 py-2.5 text-sm font-medium transition-colors"
                  style={{
                    color: opt.value === value ? '#A8863A' : '#374151',
                    backgroundColor: opt.value === value ? 'rgba(197,160,89,0.06)' : 'transparent',
                  }}
                  onMouseEnter={(e) => { if (opt.value !== value) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#F8F7F4'; }}
                  onMouseLeave={(e) => { if (opt.value !== value) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
                >
                  {opt.label}
                </button>
              ))}
              {options.length === 0 && (
                <p className="px-4 py-3 text-sm text-neutral-400">Aucune catégorie disponible</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ImagePicker({
  label, previewUrl, onFile, onClear, multiple, galleryUrls, onGalleryRemove,
}: {
  label: string;
  previewUrl?: string;
  onFile: (dataUrl: string | string[]) => void;
  onClear?: () => void;
  multiple?: boolean;
  galleryUrls?: string[];
  onGalleryRemove?: (idx: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (multiple) {
      Promise.all(files.map((f) => new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(f);
      }))).then((urls) => onFile(urls));
    } else {
      const reader = new FileReader();
      reader.onload = () => onFile(reader.result as string);
      reader.readAsDataURL(files[0]);
    }
    e.target.value = '';
  };

  return (
    <div>
      <label className="label-base">{label}</label>
      {!multiple && previewUrl && (
        <div className="relative mb-2 w-full h-28 rounded-xl overflow-hidden bg-neutral-100">
          <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
          {onClear && (
            <button type="button" onClick={onClear}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-red-50 transition-colors">
              <X size={12} className="text-danger" />
            </button>
          )}
        </div>
      )}
      {multiple && galleryUrls && galleryUrls.length > 0 && (
        <div className="grid grid-cols-4 gap-1.5 mb-2">
          {galleryUrls.map((url, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100">
              <img src={url} alt={`galerie ${idx + 1}`} className="w-full h-full object-cover" />
              {onGalleryRemove && (
                <button type="button" onClick={() => onGalleryRemove(idx)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-red-50">
                  <X size={9} className="text-danger" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
        style={{ backgroundColor: '#F8F7F4', border: '1.5px dashed rgba(197,160,89,0.28)', color: '#9CA3AF' }}
        onMouseEnter={(e) => { const b = e.currentTarget; b.style.borderColor = 'rgba(197,160,89,0.55)'; b.style.color = '#A8863A'; }}
        onMouseLeave={(e) => { const b = e.currentTarget; b.style.borderColor = 'rgba(197,160,89,0.28)'; b.style.color = '#9CA3AF'; }}
      >
        <Upload size={13} />
        {multiple ? 'Ajouter des images…' : previewUrl ? "Changer l'image…" : 'Choisir une image…'}
      </button>
      <input ref={inputRef} type="file" accept="image/*" multiple={multiple} className="sr-only" onChange={handleChange} />
    </div>
  );
}

export default function ProduitsClient({
  initialData, meta, categories, currentPage, currentCat, currentSearch,
}: Props) {
  const router = useRouter();
  const [rows, setRows]                 = useState<ProduitRow[]>(initialData);
  const [modalOpen, setModalOpen]       = useState(false);
  const [editId, setEditId]             = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [quickView, setQuickView]       = useState<ProduitRow | null>(null);

  const [form, setForm]                 = useState(EMPTY_FORM);
  const [slug, setSlug]                 = useState('');
  const [catNom, setCatNom]             = useState('');
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [galleryUrls, setGalleryUrls]   = useState<string[]>([]);
  const [dimensions, setDimensions]     = useState<DimensionModel[]>([EMPTY_DIM]);
  const [hasDimensions, setHasDimensions] = useState(false);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState<string | null>(null);

  useEffect(() => { setRows(initialData); }, [initialData]);
  useEffect(() => { setSlug(toSlug(form.nom)); }, [form.nom]);

  const resetForm = () => {
    setForm(EMPTY_FORM); setSlug(''); setCatNom('');
    setMainImageUrl(''); setGalleryUrls([]); setDimensions([EMPTY_DIM]);
    setHasDimensions(false); setEditId(null); setError(null);
  };

  const handleEditClick = (p: ProduitRow) => {
    setEditId(p.id);
    setForm({
      nom: p.nom,
      categorie_id: p.categorie_id ?? '',
      prix_base: String(p.prix_base),
      prix_vente: String(p.prix_vente),
      prix_main_oeuvre: String(p.prix_main_oeuvre ?? 0),
    });
    setSlug(toSlug(p.nom));
    setCatNom(p.categorie?.nom ?? '');
    setMainImageUrl(p.image_url ?? '');
    setGalleryUrls(p.gallery_urls ?? []);
    const hasDims = (p.dimensions ?? []).length > 0;
    setHasDimensions(hasDims);
    setDimensions(hasDims ? [...p.dimensions] : [EMPTY_DIM]);
    setError(null);
    setModalOpen(true);
  };

  const updateDim = (idx: number, field: keyof DimensionModel, value: string | number) => {
    setDimensions((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.nom.trim())   { setError('Le nom du produit est requis.'); return; }
    if (!form.categorie_id) { setError('Veuillez sélectionner une catégorie.'); return; }

    let prixBase: number;
    let prixVente: number;
    let validDims: DimensionModel[];

    if (hasDimensions) {
      validDims = dimensions.filter((d) => d.label.trim());
      if (validDims.length === 0) { setError('Ajoutez au moins un modèle de dimension.'); return; }
      prixBase  = validDims[0].prix_base  || 0;
      prixVente = validDims[0].prix_vente || 0;
    } else {
      validDims = [];
      prixBase  = parseFloat(form.prix_base);
      prixVente = parseFloat(form.prix_vente);
      if (!prixBase  || prixBase  <= 0) { setError('Le prix de base est requis.'); return; }
      if (!prixVente || prixVente <= 0) { setError('Le prix de vente est requis.'); return; }
    }

    const prixMainOeuvre = parseFloat(form.prix_main_oeuvre) || 0;

    setSaving(true);
    const payload = {
      nom: form.nom.trim(),
      categorie_id: form.categorie_id || null,
      prix_base: prixBase,
      prix_vente: prixVente,
      prix_main_oeuvre: prixMainOeuvre,
      image_url: mainImageUrl || null,
      gallery_urls: galleryUrls,
      dimensions: validDims,
    };

    try {
      if (editId) {
        await apiUpdateProduit(editId, payload);
      } else {
        await createProduit(payload);
      }
      setModalOpen(false);
      setTimeout(resetForm, 260);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiDeleteProduit(deleteTarget);
      setRows((prev) => prev.filter((p) => p.id !== deleteTarget));
      setDeleteTarget(null);
      router.refresh();
    } catch {
      setDeleteTarget(null);
    }
  };

  const deleteTargetProduit = deleteTarget ? rows.find((p) => p.id === deleteTarget) : null;
  const prixBase       = parseFloat(form.prix_base);
  const prixVente      = parseFloat(form.prix_vente);
  const prixMO         = parseFloat(form.prix_main_oeuvre) || 0;
  const margin         = prixBase > 0 && prixVente > 0
    ? ((prixVente - prixBase - prixMO) / prixVente) * 100
    : null;

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < meta.totalPages;

  const buildHref = (page: number) => {
    const p = new URLSearchParams();
    p.set('page', String(page));
    if (currentCat)    p.set('categorie_id', currentCat);
    if (currentSearch) p.set('search', currentSearch);
    return `/admin/produits?${p.toString()}`;
  };

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(197,160,89,0.12)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(197,160,89,0.10)', backgroundColor: '#F8F7F4' }}
        >
          <div>
            <h3 className="font-bold text-sm text-neutral-700 uppercase tracking-wider">Catalogue produits</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              {meta.total} article{meta.total !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={() => { resetForm(); setModalOpen(true); }} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={14} strokeWidth={2.5} />
            Nouveau produit
          </button>
        </div>

        {rows.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: 'rgba(197,160,89,0.08)' }}>
              <Package size={24} style={{ color: '#C5A059' }} />
            </div>
            <p className="font-semibold text-sm text-neutral-700 mb-1">Aucun produit dans le catalogue</p>
            <p className="text-xs text-neutral-400 mb-5">Commencez par ajouter votre premier article.</p>
            <button onClick={() => { resetForm(); setModalOpen(true); }} className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={14} strokeWidth={2.5} />
              Ajouter un produit
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr style={{ backgroundColor: '#FAFAFA', borderBottom: '1px solid rgba(197,160,89,0.08)' }}>
                  <th className="table-th">Produit</th>
                  <th className="table-th hidden sm:table-cell">Dimensions</th>
                  <th className="table-th text-right hidden md:table-cell">Revient</th>
                  <th className="table-th text-right">Vente</th>
                  <th className="table-th" style={{ width: '80px' }} />
                </tr>
              </thead>
              <tbody>
                {rows.map((p, idx) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.025 }}
                    className="group hover:bg-neutral-50 transition-colors cursor-pointer"
                    style={{ borderTop: '1px solid rgba(197,160,89,0.07)' }}
                    onClick={() => setQuickView(p)}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center"
                          style={{ backgroundColor: 'rgba(197,160,89,0.07)' }}
                        >
                          {p.image_url
                            ? <img src={p.image_url} alt={p.nom} className="w-full h-full object-cover" />
                            : <ImageOff size={14} className="text-neutral-300" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-neutral-800 truncate">{p.nom}</p>
                          <p className="text-xs text-neutral-400 mt-0.5 truncate">{p.categorie?.nom ?? '—'}</p>
                          {(p.gallery_urls?.length ?? 0) > 0 && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Images size={9} className="text-neutral-300" />
                              <span className="text-xs text-neutral-300">{p.gallery_urls.length}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      {(p.dimensions?.length ?? 0) > 0 ? (
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: 'rgba(197,160,89,0.07)', color: '#A8863A' }}
                        >
                          <Maximize2 size={10} />
                          {p.dimensions.length} modèle{p.dimensions.length > 1 ? 's' : ''}
                        </span>
                      ) : <span className="text-neutral-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-sm text-neutral-400 hidden md:table-cell">
                      {formatMontant(p.prix_base)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-sm" style={{ color: '#C5A059' }}>
                      {formatMontant(p.prix_vente)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditClick(p); }}
                          className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                          title="Modifier"
                        >
                          <Pencil size={14} style={{ color: '#A8863A' }} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(p.id); }}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={14} className="text-danger" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderTop: '1px solid rgba(197,160,89,0.10)', backgroundColor: '#FAFAFA' }}
          >
            <a
              href={hasPrev ? buildHref(currentPage - 1) : '#'}
              aria-disabled={!hasPrev}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${hasPrev ? 'hover:bg-neutral-100' : 'opacity-30 pointer-events-none'}`}
              style={{ color: '#6B7280' }}
            >
              <ChevronLeft size={14} />
              Précédent
            </a>
            <span className="text-xs text-neutral-400 font-medium">
              Page {currentPage} / {meta.totalPages} — {meta.total} produits
            </span>
            <a
              href={hasNext ? buildHref(currentPage + 1) : '#'}
              aria-disabled={!hasNext}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${hasNext ? 'hover:bg-neutral-100' : 'opacity-30 pointer-events-none'}`}
              style={{ color: '#6B7280' }}
            >
              Suivant
              <ChevronRight size={14} />
            </a>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              key="prod-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0"
              style={{ zIndex: 10000, backgroundColor: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(8px)' }}
              onClick={() => { setModalOpen(false); }}
            />
            <motion.div
              key="prod-modal"
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 24 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
              style={{ zIndex: 10001 }}
            >
              <div
                className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl pointer-events-auto"
                style={{ backgroundColor: '#FFFFFF', boxShadow: '0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(197,160,89,0.14)' }}
                onClick={(e) => e.stopPropagation()}
              >
                <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
                  <div
                    className="px-6 py-5 flex items-center justify-between flex-shrink-0 rounded-t-2xl"
                    style={{ borderBottom: '1px solid rgba(197,160,89,0.10)', backgroundColor: '#FAFAFA' }}
                  >
                    <div>
                      <div className="flex items-center gap-2.5 mb-0.5">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                          style={{ background: 'linear-gradient(135deg, #C5A059, #A8863A)' }}>
                          {editId ? <Pencil size={11} className="text-white" strokeWidth={2.5} /> : <Plus size={12} className="text-white" strokeWidth={2.5} />}
                        </div>
                        <h2 className="text-base font-bold text-neutral-800">
                          {editId ? 'Modifier le produit' : 'Nouveau produit'}
                        </h2>
                      </div>
                      <p className="text-xs text-neutral-400">
                        {editId ? 'Mise à jour des informations' : 'Ajouter un article au catalogue'}
                      </p>
                    </div>
                    <button type="button" onClick={() => setModalOpen(false)}
                      className="p-2 rounded-xl hover:bg-neutral-100 transition-colors ml-4 flex-shrink-0">
                      <X size={16} className="text-neutral-400" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-5">
                    <div>
                      <label className="label-base">Nom du produit *</label>
                      <input
                        className="input-base"
                        placeholder="ex: Portail coulissant 3m"
                        value={form.nom}
                        onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                      />
                      <AnimatePresence>
                        {slug && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-1.5 mt-2 px-1 overflow-hidden"
                          >
                            <Link2 size={10} className="text-neutral-300 flex-shrink-0" />
                            <span className="text-xs font-mono text-neutral-300 truncate">/produits/{slug}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div>
                      <label className="label-base">Catégorie *</label>
                      <CustomDropdown
                        options={categories.map((c) => ({ value: c.id, label: c.nom }))}
                        value={form.categorie_id}
                        onChange={(v) => {
                          const chosen = categories.find((c) => c.id === v);
                          setForm((f) => ({ ...f, categorie_id: v }));
                          setCatNom(chosen?.nom ?? '');
                        }}
                        placeholder="Sélectionner une catégorie…"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <label className="label-base mb-0">Modèles de dimensions</label>
                          <p className="text-xs text-neutral-400 mt-0.5">Prix individuel par variante</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setHasDimensions((v) => !v)}
                          className="relative w-10 h-5 rounded-full transition-all duration-200 flex-shrink-0"
                          style={{ backgroundColor: hasDimensions ? '#C5A059' : '#D1D5DB' }}
                        >
                          <span
                            className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200"
                            style={{ left: hasDimensions ? '1.375rem' : '0.125rem' }}
                          />
                        </button>
                      </div>

                      <AnimatePresence initial={false}>
                        {hasDimensions && (
                          <motion.div
                            key="dim-section"
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }} className="overflow-hidden"
                          >
                            <div className="space-y-2">
                              {dimensions.map((dim, idx) => (
                                <div key={idx} className="rounded-xl p-3 space-y-2"
                                  style={{ backgroundColor: '#F8F7F4', border: '1px solid rgba(197,160,89,0.12)' }}>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      className="input-base flex-1 text-sm py-1.5"
                                      placeholder={DIM_PLACEHOLDERS[idx % DIM_PLACEHOLDERS.length]}
                                      value={dim.label}
                                      onChange={(e) => updateDim(idx, 'label', e.target.value)}
                                    />
                                    {dimensions.length > 1 && (
                                      <button type="button"
                                        onClick={() => setDimensions((d) => d.filter((_, i) => i !== idx))}
                                        className="p-1 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0">
                                        <X size={12} className="text-danger" />
                                      </button>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-3 gap-1.5">
                                    <div>
                                      <span className="text-xs text-neutral-400 font-medium mb-1 block">Revient (DA)</span>
                                      <input type="number" min="0" step="0.01" className="input-base text-sm py-1.5"
                                        placeholder="0" value={dim.prix_base || ''}
                                        onChange={(e) => updateDim(idx, 'prix_base', Number(e.target.value) || 0)} />
                                    </div>
                                    <div>
                                      <span className="text-xs text-neutral-400 font-medium mb-1 block">M.O. (DA)</span>
                                      <input type="number" min="0" step="0.01" className="input-base text-sm py-1.5"
                                        placeholder="0" value={dim.prix_main_oeuvre || ''}
                                        onChange={(e) => updateDim(idx, 'prix_main_oeuvre', Number(e.target.value) || 0)} />
                                    </div>
                                    <div>
                                      <span className="text-xs text-neutral-400 font-medium mb-1 block">Vente (DA)</span>
                                      <input type="number" min="0" step="0.01" className="input-base text-sm py-1.5"
                                        placeholder="0" value={dim.prix_vente || ''}
                                        onChange={(e) => updateDim(idx, 'prix_vente', Number(e.target.value) || 0)} />
                                    </div>
                                  </div>
                                </div>
                              ))}
                              <button type="button"
                                onClick={() => setDimensions((d) => [...d, { ...EMPTY_DIM }])}
                                className="flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-70 mt-1"
                                style={{ color: '#C5A059' }}>
                                <PlusCircle size={14} strokeWidth={1.8} />
                                Ajouter un modèle
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <AnimatePresence initial={false}>
                      {!hasDimensions && (
                        <motion.div key="global-prix"
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            <div>
                              <label className="label-base">Revient (DA) *</label>
                              <input type="number" min="0" step="0.01" className="input-base"
                                placeholder="0" value={form.prix_base}
                                onChange={(e) => setForm((f) => ({ ...f, prix_base: e.target.value }))} />
                            </div>
                            <div>
                              <label className="label-base">M.O. (DA)</label>
                              <input type="number" min="0" step="0.01" className="input-base"
                                placeholder="0" value={form.prix_main_oeuvre}
                                onChange={(e) => setForm((f) => ({ ...f, prix_main_oeuvre: e.target.value }))} />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                              <label className="label-base">Vente (DA) *</label>
                              <input type="number" min="0" step="0.01" className="input-base"
                                placeholder="0" value={form.prix_vente}
                                onChange={(e) => setForm((f) => ({ ...f, prix_vente: e.target.value }))} />
                            </div>
                          </div>
                          {margin !== null && (
                            <div className="rounded-xl px-3 py-2.5 flex items-center justify-between mt-3"
                              style={{ backgroundColor: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.12)' }}>
                              <span className="text-xs text-neutral-500 font-medium">Marge nette estimée</span>
                              <span className="font-mono font-bold text-sm" style={{ color: '#059669' }}>
                                {margin.toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <ImagePicker label="Image principale" previewUrl={mainImageUrl}
                      onFile={(url) => setMainImageUrl(url as string)} onClear={() => setMainImageUrl('')} />

                    <ImagePicker label="Galerie d'images" multiple galleryUrls={galleryUrls}
                      onFile={(urls) => setGalleryUrls((prev) => [...prev, ...(urls as string[])])}
                      onGalleryRemove={(idx) => setGalleryUrls((prev) => prev.filter((_, i) => i !== idx))} />

                    {error && (
                      <p className="text-xs font-semibold text-danger rounded-lg px-3 py-2.5"
                        style={{ backgroundColor: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.12)' }}>
                        {error}
                      </p>
                    )}
                  </div>

                  <div className="px-6 py-4 flex gap-3 flex-shrink-0 rounded-b-2xl"
                    style={{ borderTop: '1px solid rgba(197,160,89,0.10)', backgroundColor: '#FAFAFA' }}>
                    <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1 text-sm">
                      Annuler
                    </button>
                    <button type="submit" disabled={saving}
                      className="btn-primary flex-1 text-sm flex items-center justify-center gap-2">
                      {editId ? <Pencil size={13} strokeWidth={2.5} /> : <Plus size={13} strokeWidth={2.5} />}
                      {saving ? 'Enregistrement…' : editId ? 'Sauvegarder' : 'Ajouter le produit'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickView && (
          <>
            <motion.div key="qv-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0"
              style={{ zIndex: 10000, backgroundColor: 'rgba(15,23,42,0.50)', backdropFilter: 'blur(8px)' }}
              onClick={() => setQuickView(null)}
            />
            <motion.div key="qv-modal"
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 24 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
              style={{ zIndex: 10001 }}
            >
              <div
                className="w-full max-w-md max-h-[88vh] flex flex-col rounded-2xl pointer-events-auto"
                style={{ backgroundColor: '#FFFFFF', boxShadow: '0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(197,160,89,0.12)' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-6 py-4 flex items-start justify-between flex-shrink-0 rounded-t-2xl"
                  style={{ borderBottom: '1px solid rgba(197,160,89,0.10)', backgroundColor: '#FAFAFA' }}>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1">Aperçu produit</p>
                    <h2 className="text-lg font-bold text-neutral-800 leading-tight">{quickView.nom}</h2>
                    {quickView.categorie?.nom && (
                      <span className="inline-flex items-center mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: 'rgba(197,160,89,0.10)', color: '#A8863A' }}>
                        {quickView.categorie.nom}
                      </span>
                    )}
                  </div>
                  <button onClick={() => setQuickView(null)}
                    className="p-2 rounded-xl hover:bg-neutral-100 transition-colors mt-0.5 ml-3 flex-shrink-0">
                    <X size={17} className="text-neutral-500" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                  {quickView.image_url ? (
                    <div className="w-full h-40 rounded-xl overflow-hidden bg-neutral-100">
                      <img src={quickView.image_url} alt={quickView.nom} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-full h-28 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(197,160,89,0.06)', border: '1.5px dashed rgba(197,160,89,0.20)' }}>
                      <div className="text-center">
                        <ImageOff size={24} className="text-neutral-300 mx-auto mb-1" />
                        <p className="text-xs text-neutral-300">Aucune image</p>
                      </div>
                    </div>
                  )}

                  {(quickView.dimensions?.length ?? 0) > 0 ? (
                    <div>
                      <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">
                        Modèles ({quickView.dimensions.length})
                      </p>
                      <div className="space-y-1.5">
                        {quickView.dimensions.map((dim) => (
                          <div key={dim.label} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                            style={{ backgroundColor: '#F8F7F4', border: '1px solid rgba(197,160,89,0.10)' }}>
                            <span className="text-sm font-semibold text-neutral-700">{dim.label}</span>
                            <div className="flex items-center gap-3">
                              {dim.prix_base > 0 && (
                                <span className="text-xs text-neutral-400 font-mono" title="Revient">{formatMontant(dim.prix_base)}</span>
                              )}
                              {(dim.prix_main_oeuvre ?? 0) > 0 && (
                                <span className="text-xs font-mono" style={{ color: '#6B7280' }} title="M.O.">+{formatMontant(dim.prix_main_oeuvre)}</span>
                              )}
                              {dim.prix_vente > 0 && (
                                <span className="text-sm font-bold font-mono" style={{ color: '#C5A059' }}>{formatMontant(dim.prix_vente)}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Tarification</p>
                      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(197,160,89,0.12)' }}>
                        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(197,160,89,0.08)' }}>
                          <span className="text-sm text-neutral-500">Prix de revient</span>
                          <span className="font-mono text-sm font-semibold text-neutral-600">{formatMontant(quickView.prix_base)}</span>
                        </div>
                        {(quickView.prix_main_oeuvre ?? 0) > 0 && (
                          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(197,160,89,0.08)' }}>
                            <span className="text-sm text-neutral-500">Main-d'œuvre</span>
                            <span className="font-mono text-sm font-semibold text-neutral-600">{formatMontant(quickView.prix_main_oeuvre)}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: 'rgba(197,160,89,0.04)' }}>
                          <span className="text-sm font-bold text-neutral-700">Prix de vente</span>
                          <span className="font-mono font-bold text-sm" style={{ color: '#C5A059' }}>{formatMontant(quickView.prix_vente)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {(quickView.gallery_urls?.length ?? 0) > 0 && (
                    <div>
                      <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">
                        Galerie ({quickView.gallery_urls.length})
                      </p>
                      <div className="grid grid-cols-4 gap-1.5">
                        {quickView.gallery_urls.map((url, i) => (
                          <div key={i} className="aspect-square rounded-lg overflow-hidden bg-neutral-100">
                            <img src={url} alt={`galerie ${i + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0 px-6 py-4 flex gap-3 rounded-b-2xl"
                  style={{ borderTop: '1px solid rgba(197,160,89,0.10)', backgroundColor: '#FAFAFA' }}>
                  <button
                    onClick={() => { const p = quickView; setQuickView(null); setTimeout(() => handleEditClick(p), 60); }}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm">
                    <Pencil size={13} strokeWidth={2.5} />
                    Modifier
                  </button>
                  <button onClick={() => setQuickView(null)} className="btn-secondary text-sm">Fermer</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title={deleteTargetProduit?.nom ?? ''}
        description="Ce produit sera supprimé définitivement du catalogue."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
