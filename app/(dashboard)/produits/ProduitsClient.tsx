'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Trash2, Pencil, Package, ImageOff, ChevronDown,
  Upload, X, Images, PlusCircle, Maximize2, Link2, Eye,
} from 'lucide-react';
import {
  getProduits, addProduit, updateProduit, deleteProduit,
  type Produit, type DimensionModel,
} from '@/lib/produits-store';
import { formatMontant } from '@/lib/formatters';
import type { CategorieEntity } from '@gestion-garage/shared-validators';
import ConfirmDeleteModal from '@/components/ui/ConfirmDeleteModal';

interface Props {
  categories: CategorieEntity[];
}

/* ── Slug generator ── */
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

const EMPTY_FORM = { nom: '', categorie_id: '', prix_base: '', prix_vente: '' };
const EMPTY_DIM: DimensionModel = { label: '', prix_base: 0, prix_vente: 0 };
const DIM_PLACEHOLDERS = ['1.4×1.6 m', '1.6×1.8 m', '0.9×2.0 m', '2.0×2.2 m', '1.2×2.4 m'];

const MOCK_CATEGORIES = [
  { id: 'cat-portails',  nom: 'Portails Ferronnerie' },
  { id: 'cat-escaliers', nom: 'Escaliers et Garde-corps' },
  { id: 'cat-mobilier',  nom: 'Mobilier Ornemental' },
] as CategorieEntity[];

const MOCK_PRODUITS: Omit<Produit, 'id' | 'created_at'>[] = [
  {
    nom: 'Portail coulissant motorisé',
    categorie_id: 'cat-portails', categorie_nom: 'Portails Ferronnerie',
    prix_base: 45000, prix_vente: 78000, image_url: '', gallery_urls: [],
    dimensions: [
      { label: '3.0×1.8 m', prix_base: 42000, prix_vente: 72000 },
      { label: '4.0×1.8 m', prix_base: 45000, prix_vente: 78000 },
      { label: '5.0×2.0 m', prix_base: 55000, prix_vente: 95000 },
    ],
  },
  {
    nom: 'Portail battant double vantail',
    categorie_id: 'cat-portails', categorie_nom: 'Portails Ferronnerie',
    prix_base: 28000, prix_vente: 48000, image_url: '', gallery_urls: [],
    dimensions: [
      { label: '2.4×1.8 m', prix_base: 26000, prix_vente: 44000 },
      { label: '3.0×1.8 m', prix_base: 28000, prix_vente: 48000 },
      { label: '3.0×2.0 m', prix_base: 32000, prix_vente: 55000 },
    ],
  },
  {
    nom: 'Escalier hélicoïdal forgé',
    categorie_id: 'cat-escaliers', categorie_nom: 'Escaliers et Garde-corps',
    prix_base: 85000, prix_vente: 145000, image_url: '', gallery_urls: [],
    dimensions: [
      { label: 'Ø1.2 m — 10 marches', prix_base: 75000,  prix_vente: 125000 },
      { label: 'Ø1.4 m — 12 marches', prix_base: 85000,  prix_vente: 145000 },
      { label: 'Ø1.6 m — 14 marches', prix_base: 105000, prix_vente: 180000 },
    ],
  },
  {
    nom: 'Garde-corps balcon',
    categorie_id: 'cat-escaliers', categorie_nom: 'Escaliers et Garde-corps',
    prix_base: 8500, prix_vente: 14500, image_url: '', gallery_urls: [],
    dimensions: [
      { label: 'Linéaire 1 m', prix_base: 7000,  prix_vente: 12000 },
      { label: 'Linéaire 2 m', prix_base: 8500,  prix_vente: 14500 },
      { label: 'Linéaire 3 m', prix_base: 12000, prix_vente: 20000 },
      { label: 'Sur mesure',   prix_base: 0,      prix_vente: 0     },
    ],
  },
  {
    nom: 'Table basse ornementale',
    categorie_id: 'cat-mobilier', categorie_nom: 'Mobilier Ornemental',
    prix_base: 22000, prix_vente: 38000, image_url: '', gallery_urls: [],
    dimensions: [
      { label: '60×60 cm',  prix_base: 18000, prix_vente: 30000 },
      { label: '80×80 cm',  prix_base: 22000, prix_vente: 38000 },
      { label: '100×50 cm', prix_base: 26000, prix_vente: 44000 },
    ],
  },
  {
    nom: 'Étagère murale en fer forgé',
    categorie_id: 'cat-mobilier', categorie_nom: 'Mobilier Ornemental',
    prix_base: 9500, prix_vente: 18000, image_url: '', gallery_urls: [],
    dimensions: [
      { label: '60×20 cm',  prix_base: 7500,  prix_vente: 14000 },
      { label: '80×25 cm',  prix_base: 9500,  prix_vente: 18000 },
      { label: '100×30 cm', prix_base: 12000, prix_vente: 22000 },
    ],
  },
];

/* ── Image picker ── */
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

/* ── Main Component ── */
export default function ProduitsClient({ categories }: Props) {
  const [produits, setProduits]         = useState<Produit[]>([]);
  const [modalOpen, setModalOpen]       = useState(false);
  const [editId, setEditId]             = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [quickView, setQuickView]       = useState<Produit | null>(null);

  /* Form state */
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [slug, setSlug]                 = useState('');
  const [catNom, setCatNom]             = useState('');
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [galleryUrls, setGalleryUrls]   = useState<string[]>([]);
  const [dimensions, setDimensions]     = useState<DimensionModel[]>([EMPTY_DIM]);
  const [hasDimensions, setHasDimensions] = useState(false);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const allCategories = categories.length > 0 ? categories : MOCK_CATEGORIES;

  useEffect(() => {
    const existing = getProduits();
    if (existing.length === 0) MOCK_PRODUITS.forEach((p) => addProduit(p));
    setProduits(getProduits());
  }, []);

  useEffect(() => { setSlug(toSlug(form.nom)); }, [form.nom]);

  const resetForm = () => {
    setForm(EMPTY_FORM); setSlug(''); setCatNom('');
    setMainImageUrl(''); setGalleryUrls([]); setDimensions([EMPTY_DIM]);
    setHasDimensions(false); setEditId(null); setError(null);
  };

  const openCreateModal = () => { resetForm(); setModalOpen(true); };

  const handleEditClick = (p: Produit) => {
    setEditId(p.id);
    setForm({ nom: p.nom, categorie_id: p.categorie_id, prix_base: String(p.prix_base), prix_vente: String(p.prix_vente) });
    setSlug(toSlug(p.nom));
    setCatNom(p.categorie_nom);
    setMainImageUrl(p.image_url);
    setGalleryUrls(p.gallery_urls);
    const hasDims = p.dimensions.length > 0;
    setHasDimensions(hasDims);
    setDimensions(hasDims ? [...p.dimensions] : [EMPTY_DIM]);
    setError(null);
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); };

  const updateDim = (idx: number, field: keyof DimensionModel, value: string | number) => {
    setDimensions((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
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

    setSaving(true);
    const payload = {
      nom: form.nom.trim(), categorie_id: form.categorie_id, categorie_nom: catNom,
      prix_base: prixBase, prix_vente: prixVente, image_url: mainImageUrl,
      gallery_urls: galleryUrls,
      dimensions: validDims,
    };

    if (editId) {
      const updated = updateProduit(editId, payload);
      if (updated) setProduits((prev) => prev.map((p) => p.id === editId ? updated : p));
    } else {
      const newProduit = addProduit(payload);
      setProduits((prev) => [newProduit, ...prev]);
    }
    setSaving(false);
    closeModal();
    setTimeout(resetForm, 260);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteProduit(deleteTarget);
    setProduits((prev) => prev.filter((p) => p.id !== deleteTarget));
    setDeleteTarget(null);
  };

  const deleteTargetProduit = deleteTarget ? produits.find((p) => p.id === deleteTarget) : null;
  const prixBase  = parseFloat(form.prix_base);
  const prixVente = parseFloat(form.prix_vente);
  const margin    = prixBase > 0 && prixVente > 0 ? ((prixVente - prixBase) / prixVente) * 100 : null;

  return (
    <>
      {/* ── Product list ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(197,160,89,0.12)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
      >
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(197,160,89,0.10)', backgroundColor: '#F8F7F4' }}
        >
          <div>
            <h3 className="font-bold text-sm text-neutral-700 uppercase tracking-wider">Catalogue produits</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              {produits.length} article{produits.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={openCreateModal} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={14} strokeWidth={2.5} />
            Nouveau produit
          </button>
        </div>

        {produits.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: 'rgba(197,160,89,0.08)' }}>
              <Package size={24} style={{ color: '#C5A059' }} />
            </div>
            <p className="font-semibold text-sm text-neutral-700 mb-1">Aucun produit dans le catalogue</p>
            <p className="text-xs text-neutral-400 mb-5">Commencez par ajouter votre premier article.</p>
            <button onClick={openCreateModal} className="btn-primary flex items-center gap-2 text-sm">
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
                {produits.map((p, idx) => (
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
                          <p className="text-xs text-neutral-400 mt-0.5 truncate">{p.categorie_nom || '—'}</p>
                          {p.gallery_urls.length > 0 && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Images size={9} className="text-neutral-300" />
                              <span className="text-xs text-neutral-300">{p.gallery_urls.length}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      {p.dimensions.length > 0 ? (
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
      </div>

      {/* ── Product Form Modal ── */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              key="prod-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0"
              style={{ zIndex: 10000, backgroundColor: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(8px)' }}
              onClick={closeModal}
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
                style={{
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(197,160,89,0.14)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
                  {/* Modal Header */}
                  <div
                    className="px-6 py-5 flex items-center justify-between flex-shrink-0 rounded-t-2xl"
                    style={{ borderBottom: '1px solid rgba(197,160,89,0.10)', backgroundColor: '#FAFAFA' }}
                  >
                    <div>
                      <div className="flex items-center gap-2.5 mb-0.5">
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center"
                          style={{ background: 'linear-gradient(135deg, #C5A059, #A8863A)' }}
                        >
                          {editId
                            ? <Pencil size={11} className="text-white" strokeWidth={2.5} />
                            : <Plus size={12} className="text-white" strokeWidth={2.5} />}
                        </div>
                        <h2 className="text-base font-bold text-neutral-800">
                          {editId ? 'Modifier le produit' : 'Nouveau produit'}
                        </h2>
                      </div>
                      <p className="text-xs text-neutral-400">
                        {editId ? 'Mise à jour des informations du produit' : 'Ajouter un article au catalogue'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="p-2 rounded-xl hover:bg-neutral-100 transition-colors ml-4 flex-shrink-0"
                    >
                      <X size={16} className="text-neutral-400" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                    {/* Nom + auto-slug */}
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
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-1.5 mt-2 px-1 overflow-hidden"
                          >
                            <Link2 size={10} className="text-neutral-300 flex-shrink-0" />
                            <span className="text-xs font-mono text-neutral-300 truncate">
                              /produits/{slug}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Catégorie */}
                    <div>
                      <label className="label-base">Catégorie *</label>
                      <div className="relative">
                        <select
                          value={form.categorie_id}
                          onChange={(e) => {
                            const chosen = allCategories.find((c) => c.id === e.target.value);
                            setForm((f) => ({ ...f, categorie_id: e.target.value }));
                            setCatNom(chosen?.nom ?? '');
                          }}
                          className="input-base w-full appearance-none pr-9 cursor-pointer"
                          style={{ color: form.categorie_id ? '#1E293B' : '#9CA3AF' }}
                        >
                          <option value="">Sélectionner une catégorie</option>
                          {allCategories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.nom}</option>
                          ))}
                        </select>
                        <ChevronDown
                          size={14}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                        />
                      </div>
                    </div>

                    {/* Dimensions toggle + conditional section */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <label className="label-base mb-0">Modèles de dimensions</label>
                          <p className="text-xs text-neutral-400 mt-0.5">Prix individuel par variante de taille</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setHasDimensions((v) => !v)}
                          className="relative w-10 h-5 rounded-full transition-all duration-200 flex-shrink-0"
                          style={{ backgroundColor: hasDimensions ? '#C5A059' : '#D1D5DB' }}
                          title={hasDimensions ? 'Désactiver les modèles' : 'Activer les modèles'}
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
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-2">
                              {dimensions.map((dim, idx) => (
                                <div
                                  key={idx}
                                  className="rounded-xl p-3 space-y-2"
                                  style={{ backgroundColor: '#F8F7F4', border: '1px solid rgba(197,160,89,0.12)' }}
                                >
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      className="input-base flex-1 text-sm py-1.5"
                                      placeholder={DIM_PLACEHOLDERS[idx % DIM_PLACEHOLDERS.length]}
                                      value={dim.label}
                                      onChange={(e) => updateDim(idx, 'label', e.target.value)}
                                    />
                                    {dimensions.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => setDimensions((d) => d.filter((_, i) => i !== idx))}
                                        className="p-1 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
                                      >
                                        <X size={12} className="text-danger" />
                                      </button>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <span className="text-xs text-neutral-400 font-medium mb-1 block">Revient (DA)</span>
                                      <input
                                        type="number" min="0" step="0.01"
                                        className="input-base text-sm py-1.5"
                                        placeholder="0"
                                        value={dim.prix_base || ''}
                                        onChange={(e) => updateDim(idx, 'prix_base', Number(e.target.value) || 0)}
                                      />
                                    </div>
                                    <div>
                                      <span className="text-xs text-neutral-400 font-medium mb-1 block">Vente (DA)</span>
                                      <input
                                        type="number" min="0" step="0.01"
                                        className="input-base text-sm py-1.5"
                                        placeholder="0"
                                        value={dim.prix_vente || ''}
                                        onChange={(e) => updateDim(idx, 'prix_vente', Number(e.target.value) || 0)}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => setDimensions((d) => [...d, { ...EMPTY_DIM }])}
                                className="flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-70 mt-1"
                                style={{ color: '#C5A059' }}
                              >
                                <PlusCircle size={14} strokeWidth={1.8} />
                                Ajouter un modèle
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Global prices — only when no dimension models */}
                    <AnimatePresence initial={false}>
                      {!hasDimensions && (
                        <motion.div
                          key="global-prix"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="label-base">Prix de base (DA) *</label>
                              <input
                                type="number" min="0" step="0.01"
                                className="input-base"
                                placeholder="Coût revient"
                                value={form.prix_base}
                                onChange={(e) => setForm((f) => ({ ...f, prix_base: e.target.value }))}
                              />
                            </div>
                            <div>
                              <label className="label-base">Prix de vente (DA) *</label>
                              <input
                                type="number" min="0" step="0.01"
                                className="input-base"
                                placeholder="Prix client"
                                value={form.prix_vente}
                                onChange={(e) => setForm((f) => ({ ...f, prix_vente: e.target.value }))}
                              />
                            </div>
                          </div>
                          {margin !== null && (
                            <div
                              className="rounded-xl px-3 py-2.5 flex items-center justify-between mt-3"
                              style={{ backgroundColor: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.12)' }}
                            >
                              <span className="text-xs text-neutral-500 font-medium">Marge estimée</span>
                              <span className="font-mono font-bold text-sm" style={{ color: '#059669' }}>
                                {margin.toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <ImagePicker
                      label="Image principale"
                      previewUrl={mainImageUrl}
                      onFile={(url) => setMainImageUrl(url as string)}
                      onClear={() => setMainImageUrl('')}
                    />

                    <ImagePicker
                      label="Galerie d'images"
                      multiple
                      galleryUrls={galleryUrls}
                      onFile={(urls) => setGalleryUrls((prev) => [...prev, ...(urls as string[])])}
                      onGalleryRemove={(idx) => setGalleryUrls((prev) => prev.filter((_, i) => i !== idx))}
                    />

                    {error && (
                      <p
                        className="text-xs font-semibold text-danger rounded-lg px-3 py-2.5"
                        style={{ backgroundColor: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.12)' }}
                      >
                        {error}
                      </p>
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div
                    className="px-6 py-4 flex gap-3 flex-shrink-0 rounded-b-2xl"
                    style={{ borderTop: '1px solid rgba(197,160,89,0.10)', backgroundColor: '#FAFAFA' }}
                  >
                    <button type="button" onClick={closeModal} className="btn-secondary flex-1 text-sm">
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-primary flex-1 text-sm flex items-center justify-center gap-2"
                    >
                      {editId
                        ? <Pencil size={13} strokeWidth={2.5} />
                        : <Plus size={13} strokeWidth={2.5} />}
                      {saving ? 'Enregistrement…' : editId ? 'Sauvegarder' : 'Ajouter le produit'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Quick View Modal ── */}
      <AnimatePresence>
        {quickView && (
          <>
            <motion.div
              key="qv-prod-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0"
              style={{ zIndex: 10000, backgroundColor: 'rgba(15,23,42,0.50)', backdropFilter: 'blur(8px)' }}
              onClick={() => setQuickView(null)}
            />
            <motion.div
              key="qv-prod-modal"
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
                {/* Header */}
                <div
                  className="px-6 py-4 flex items-start justify-between flex-shrink-0 rounded-t-2xl"
                  style={{ borderBottom: '1px solid rgba(197,160,89,0.10)', backgroundColor: '#FAFAFA' }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1">Aperçu produit</p>
                    <h2 className="text-lg font-bold text-neutral-800 leading-tight">{quickView.nom}</h2>
                    {quickView.categorie_nom && (
                      <span
                        className="inline-flex items-center mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: 'rgba(197,160,89,0.10)', color: '#A8863A' }}
                      >
                        {quickView.categorie_nom}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setQuickView(null)}
                    className="p-2 rounded-xl hover:bg-neutral-100 transition-colors mt-0.5 ml-3 flex-shrink-0"
                  >
                    <X size={17} className="text-neutral-500" />
                  </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                  {/* Main image */}
                  {quickView.image_url ? (
                    <div className="w-full h-40 rounded-xl overflow-hidden bg-neutral-100">
                      <img src={quickView.image_url} alt={quickView.nom} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div
                      className="w-full h-28 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(197,160,89,0.06)', border: '1.5px dashed rgba(197,160,89,0.20)' }}
                    >
                      <div className="text-center">
                        <ImageOff size={24} className="text-neutral-300 mx-auto mb-1" />
                        <p className="text-xs text-neutral-300">Aucune image</p>
                      </div>
                    </div>
                  )}

                  {/* Dimensions */}
                  {quickView.dimensions.length > 0 ? (
                    <div>
                      <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">
                        Modèles de dimensions ({quickView.dimensions.length})
                      </p>
                      <div className="space-y-1.5">
                        {quickView.dimensions.map((dim) => (
                          <div
                            key={dim.label}
                            className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                            style={{ backgroundColor: '#F8F7F4', border: '1px solid rgba(197,160,89,0.10)' }}
                          >
                            <span className="text-sm font-semibold text-neutral-700">{dim.label}</span>
                            <div className="flex items-center gap-3">
                              {dim.prix_base > 0 && (
                                <span className="text-xs text-neutral-400 font-mono">
                                  {formatMontant(dim.prix_base)}
                                </span>
                              )}
                              {dim.prix_vente > 0 && (
                                <span className="text-sm font-bold font-mono" style={{ color: '#C5A059' }}>
                                  {formatMontant(dim.prix_vente)}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Tarification</p>
                      <div
                        className="rounded-xl overflow-hidden"
                        style={{ border: '1px solid rgba(197,160,89,0.12)' }}
                      >
                        <div
                          className="flex items-center justify-between px-4 py-3"
                          style={{ borderBottom: '1px solid rgba(197,160,89,0.08)' }}
                        >
                          <span className="text-sm text-neutral-500">Prix de revient</span>
                          <span className="font-mono text-sm font-semibold text-neutral-600">
                            {formatMontant(quickView.prix_base)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: 'rgba(197,160,89,0.04)' }}>
                          <span className="text-sm font-bold text-neutral-700">Prix de vente</span>
                          <span className="font-mono font-bold text-sm" style={{ color: '#C5A059' }}>
                            {formatMontant(quickView.prix_vente)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Gallery */}
                  {quickView.gallery_urls.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">
                        Galerie ({quickView.gallery_urls.length} photo{quickView.gallery_urls.length > 1 ? 's' : ''})
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

                {/* Footer */}
                <div
                  className="flex-shrink-0 px-6 py-4 flex gap-3 rounded-b-2xl"
                  style={{ borderTop: '1px solid rgba(197,160,89,0.10)', backgroundColor: '#FAFAFA' }}
                >
                  <button
                    onClick={() => { const p = quickView; setQuickView(null); setTimeout(() => handleEditClick(p), 60); }}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm"
                  >
                    <Pencil size={13} strokeWidth={2.5} />
                    Modifier
                  </button>
                  <button onClick={() => setQuickView(null)} className="btn-secondary text-sm">
                    Fermer
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title={deleteTargetProduit?.nom ?? ''}
        description="Ce produit sera supprimé du catalogue local. Cette action ne peut pas être annulée."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
