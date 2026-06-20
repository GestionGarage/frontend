"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Trash2,
  Eye,
  X,
  MapPin,
  Phone,
  Tag,
  Ruler,
  Palette,
  Package,
  Truck,
  FileText,
  Calendar,
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  TrendingUp,
  BarChart3,
  Layers,
  Printer,
  ChevronDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatMontant, formatDate } from "@/lib/formatters";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import { updateCommandeStatut, deleteCommande } from "@/lib/client-api";

export interface CommandeRow {
  id: string;
  nom_prenom: string;
  telephone: string;
  adresse?: string | null;
  categorie?: { nom: string } | null;
  option?: { id: string; label: string } | null;
  option_id?: string | null;
  mesure?: string | null;
  couleur?: string | null;
  cout_revient?: number | null;
  prix_total: number;
  tarif_livraison?: number;
  type_livraison?: "none" | "bureau" | "vehicule" | null;
  bureau_nom?: string | null;
  statut: "en_attente" | "en_cours" | "terminee" | "annulee";
  date_commande: string;
  notes?: string | null;
}

const STATUT_STYLES = {
  en_attente: {
    label: "En attente",
    color: "#92400E",
    bg: "rgba(146,64,14,0.07)",
    dot: "#B45309",
  },
  en_cours: {
    label: "En cours",
    color: "#A8863A",
    bg: "rgba(197,160,89,0.10)",
    dot: "#C5A059",
  },
  terminee: {
    label: "Terminée",
    color: "#15803D",
    bg: "rgba(21,128,61,0.08)",
    dot: "#16A34A",
  },
  annulee: {
    label: "Annulée",
    color: "#B91C1C",
    bg: "rgba(185,28,28,0.07)",
    dot: "#EF4444",
  },
} as const;

const LIVRAISON_OPTIONS = [
  { value: "none",     label: "Aucune"   },
  { value: "bureau",   label: "Bureau"   },
  { value: "vehicule", label: "Véhicule" },
] as const;

/* ── Sub-components ── */
function StatusBadge({ statut }: { statut: CommandeRow["statut"] }) {
  const s = STATUT_STYLES[statut];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ color: s.color, backgroundColor: s.bg }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: s.dot }}
      />
      {s.label}
    </span>
  );
}

function PremiumKPICard({
  label,
  value,
  sub,
  icon: Icon,
  color = "#C5A059",
  iconBg = "rgba(197,160,89,0.10)",
}: {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  color?: string;
  iconBg?: string;
}) {
  return (
    <motion.div
      whileHover={{
        y: -2,
        boxShadow: `0 8px 28px rgba(0,0,0,0.08), 0 0 0 1px ${color}30`,
        transition: { duration: 0.22 },
      }}
      className="rounded-2xl p-5 relative overflow-hidden cursor-default flex flex-col"
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid rgba(197,160,89,0.10)",
        boxShadow:
          "0 1px 4px rgba(0,0,0,0.05), 0 0 0 1px rgba(197,160,89,0.07)",
        minHeight: "140px",
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-20 opacity-20"
        style={{
          background: `linear-gradient(to bottom, ${iconBg}, transparent)`,
        }}
      />
      <div className="relative flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest leading-none">
            {label}
          </p>
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: iconBg }}
          >
            <Icon size={14} style={{ color }} strokeWidth={2} />
          </div>
        </div>
        <p
          className="text-2xl font-bold tabular-nums tracking-tight mt-auto"
          style={{ color }}
        >
          {value}
        </p>
        {sub && <p className="text-xs text-neutral-400 mt-1.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ backgroundColor: "rgba(197,160,89,0.08)" }}
      >
        <Icon size={13} style={{ color: "#A8863A" }} />
      </div>
      <div>
        <p className="text-xs text-neutral-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-neutral-700 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function PriceRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3"
      style={{
        borderBottom: highlight ? undefined : "1px solid rgba(197,160,89,0.08)",
        backgroundColor: highlight ? "rgba(197,160,89,0.06)" : undefined,
      }}
    >
      <span
        className={`text-sm ${highlight ? "font-bold text-neutral-800" : "text-neutral-500"}`}
      >
        {label}
      </span>
      <span
        className="font-mono font-bold text-sm tabular-nums"
        style={{ color: highlight ? "#C5A059" : "#374151" }}
      >
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return (
    <div
      className="h-px"
      style={{ backgroundColor: "rgba(197,160,89,0.08)" }}
    />
  );
}

interface ParsedProduct { cat: string; nom: string; dim: string; couleur: string; qty: number; }

function parseProductsTag(notes: string | null | undefined): ParsedProduct[] | null {
  const tag = notes?.match(/\[PRODUITS:([^\]]+)\]/)?.[1];
  if (!tag) return null;
  if (tag.includes('||')) {
    return tag.split(';;').filter(Boolean).map((entry) => {
      const [cat = '', nom = '', dim = '', couleur = '', qtyStr = '1'] = entry.split('||');
      return { cat, nom, dim, couleur, qty: parseInt(qtyStr) || 1 };
    });
  }
  // Legacy format: "name (dim | couleur) ×qty, ..."
  return tag.split(/,\s+/).filter(Boolean).map((item) => {
    const m = item.match(/^(.+?)\s*(?:\(([^)]*)\))?\s*×(\d+)$/);
    if (!m) return { cat: '', nom: item.trim(), dim: '', couleur: '', qty: 1 };
    const [, nom, details = '', qtyStr] = m;
    const parts = details.split(' | ');
    return { cat: '', nom: nom.trim(), dim: parts[0]?.trim() ?? '', couleur: parts[1]?.trim() ?? '', qty: parseInt(qtyStr) || 1 };
  });
}

/* ── Main Component ── */
interface Props {
  initialData: CommandeRow[];
  meta: { page: number; limit: number; total: number; totalPages: number };
  statut?: string;
  kpi: {
    total: number;
    totalGeneral: number;
    totalLivraison: number;
    totalBase: number;
    pageLabel: string;
  };
}

export default function CommandesClient({
  initialData,
  meta,
  statut,
  kpi,
}: Props) {
  const [rows, setRows] = useState<CommandeRow[]>(initialData);
  const [selected, setSelected] = useState<CommandeRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!statusRef.current?.contains(e.target as Node)) setStatusOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleStatusChange = async (newStatut: CommandeRow["statut"]) => {
    if (!selected) return;
    try {
      await updateCommandeStatut(selected.id, newStatut);
      setRows((prev) =>
        prev.map((r) => (r.id === selected.id ? { ...r, statut: newStatut } : r)),
      );
      setSelected((prev) => (prev ? { ...prev, statut: newStatut } : null));
    } catch {
      // keep state unchanged on API failure
    }
  };

  const handleDeleteRequest = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(null);
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCommande(deleteTarget);
      setRows((prev) => prev.filter((r) => r.id !== deleteTarget));
    } catch {
      // keep rows unchanged on API failure
    } finally {
      setDeleteTarget(null);
    }
  };

  const deleteTargetRow = deleteTarget
    ? rows.find((r) => r.id === deleteTarget)
    : null;

  return (
    <>
      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <PremiumKPICard
          label="Total Général"
          value={formatMontant(kpi.totalGeneral)}
          sub={kpi.pageLabel}
          icon={TrendingUp}
        />
        <PremiumKPICard
          label="Bénéfice Net"
          value={formatMontant(kpi.totalLivraison)}
          sub="vente − revient − M.O."
          icon={BarChart3}
          color="#A8863A"
          iconBg="rgba(168,134,58,0.10)"
        />
        <PremiumKPICard
          label="Coût Total"
          value={formatMontant(kpi.totalBase)}
          sub="hors livraison"
          icon={Layers}
          color="#374151"
          iconBg="rgba(55,65,81,0.08)"
        />
        <PremiumKPICard
          label="Total Commandes"
          value={String(kpi.total)}
          icon={ClipboardList}
          color="#64748B"
          iconBg="rgba(100,116,139,0.09)"
        />
      </div>

      {/* ── Table ── */}
      <div
        className="rounded-2xl shadow-card overflow-hidden"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid rgba(197,160,89,0.12)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr
                style={{
                  backgroundColor: "#F8F7F4",
                  borderBottom: "1px solid rgba(197,160,89,0.10)",
                }}
              >
                <th className="table-th">Client</th>
                <th className="table-th hidden sm:table-cell">Catégorie</th>
                <th className="table-th hidden md:table-cell">Date</th>
                <th className="table-th" style={{ textAlign: "right" }}>
                  Montant
                </th>
                <th className="table-th" style={{ paddingLeft: "24px" }}>
                  Statut
                </th>
                <th className="table-th" style={{ width: "88px" }} />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-16 text-sm font-medium text-neutral-400"
                    style={{ borderTop: "1px solid rgba(197,160,89,0.08)" }}
                  >
                    Aucune commande trouvée
                  </td>
                </tr>
              ) : (
                rows.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className="group transition-all duration-150 cursor-pointer hover:bg-neutral-50"
                    style={{ borderTop: "1px solid rgba(197,160,89,0.07)" }}
                  >
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-semibold text-neutral-800 group-hover:text-primary transition-colors">
                        {c.nom_prenom}
                      </p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {c.telephone}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-neutral-500 hidden sm:table-cell">
                      {c.categorie?.nom ?? "—"}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-neutral-400 font-medium hidden md:table-cell">
                      {formatDate(c.date_commande)}
                    </td>
                    <td
                      className="px-4 py-3.5 text-right font-bold tabular-nums text-sm"
                      style={{ color: "#C5A059" }}
                    >
                      {formatMontant(c.prix_total)}
                    </td>
                    <td
                      className="py-3.5"
                      style={{ paddingLeft: "24px", paddingRight: "16px" }}
                    >
                      <StatusBadge statut={c.statut} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(c);
                          }}
                          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-neutral-100"
                          title="Aperçu rapide"
                        >
                          <Eye size={14} style={{ color: "#A8863A" }} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteRequest(c.id, e)}
                          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                          title="Supprimer"
                        >
                          <Trash2 size={14} className="text-danger" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta.totalPages > 1 && (
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{
              borderTop: "1px solid rgba(197,160,89,0.10)",
              backgroundColor: "#FAFAFA",
            }}
          >
            <span className="text-xs text-neutral-400 font-medium">
              {(meta.page - 1) * meta.limit + 1}–
              {Math.min(meta.page * meta.limit, meta.total)} sur {meta.total}
            </span>
            <div className="flex gap-2">
              {meta.page > 1 && (
                <Link
                  href={`/admin/commandes?page=${meta.page - 1}${statut ? `&statut=${statut}` : ""}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{
                    backgroundColor: "#F8F7F4",
                    border: "1px solid rgba(197,160,89,0.12)",
                    color: "#6B7280",
                  }}
                >
                  <ArrowLeft size={12} /> Précédent
                </Link>
              )}
              {meta.page < meta.totalPages && (
                <Link
                  href={`/admin/commandes?page=${meta.page + 1}${statut ? `&statut=${statut}` : ""}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{
                    backgroundColor: "#F8F7F4",
                    border: "1px solid rgba(197,160,89,0.12)",
                    color: "#6B7280",
                  }}
                >
                  Suivant <ArrowRight size={12} />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Quick View — centered modal (no z-index conflict with sidebar) ── */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              key="qv-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0"
              style={{
                zIndex: 10000,
                backgroundColor: "rgba(15,23,42,0.50)",
                backdropFilter: "blur(8px)",
              }}
              onClick={() => setSelected(null)}
            />

            <motion.div
              key="qv-modal"
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 24 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
              style={{ zIndex: 10001 }}
            >
              <div
                className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl pointer-events-auto"
                style={{
                  backgroundColor: "#FFFFFF",
                  boxShadow:
                    "0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(197,160,89,0.12)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div
                  className="px-6 py-4 flex items-start justify-between flex-shrink-0 rounded-t-2xl"
                  style={{
                    borderBottom: "1px solid rgba(197,160,89,0.10)",
                    backgroundColor: "#FAFAFA",
                  }}
                >
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1">
                      Aperçu Rapide
                    </p>
                    <h2 className="text-lg font-bold text-neutral-800">
                      {selected.nom_prenom}
                    </h2>
                    <div className="mt-2">
                      <StatusBadge statut={selected.statut} />
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="p-2 rounded-xl hover:bg-neutral-100 transition-colors mt-0.5 ml-3 flex-shrink-0"
                  >
                    <X size={17} className="text-neutral-500" />
                  </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                  {/* Status selector — custom premium dropdown */}
                  <section>
                    <h3 className="label-base">Statut de la commande</h3>
                    <div ref={statusRef} className="relative">
                      <button
                        type="button"
                        onClick={() => setStatusOpen((v) => !v)}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all duration-150"
                        style={{
                          backgroundColor: STATUT_STYLES[selected.statut].bg,
                          border: `1.5px solid ${STATUT_STYLES[selected.statut].dot}55`,
                        }}
                      >
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: STATUT_STYLES[selected.statut].dot }}
                        />
                        <span
                          className="flex-1 text-xs font-semibold text-left"
                          style={{ color: STATUT_STYLES[selected.statut].color }}
                        >
                          {STATUT_STYLES[selected.statut].label}
                        </span>
                        <ChevronDown
                          size={12}
                          className="flex-shrink-0 transition-transform duration-150"
                          style={{
                            color: STATUT_STYLES[selected.statut].color,
                            transform: statusOpen ? "rotate(180deg)" : "none",
                          }}
                        />
                      </button>
                      <AnimatePresence>
                        {statusOpen && (
                          <motion.div
                            key="status-dd"
                            initial={{ opacity: 0, y: -6, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.97 }}
                            transition={{ duration: 0.14 }}
                            className="absolute z-50 w-full mt-1.5 rounded-xl overflow-hidden"
                            style={{
                              backgroundColor: "#FFFFFF",
                              boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(197,160,89,0.14)",
                            }}
                          >
                            {(Object.keys(STATUT_STYLES) as CommandeRow["statut"][]).map((key) => (
                              <button
                                key={key}
                                type="button"
                                onClick={() => { handleStatusChange(key); setStatusOpen(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left"
                                style={{
                                  backgroundColor: key === selected.statut ? STATUT_STYLES[key].bg : "transparent",
                                }}
                                onMouseEnter={(e) => {
                                  if (key !== selected.statut)
                                    e.currentTarget.style.backgroundColor = "#F8F7F4";
                                }}
                                onMouseLeave={(e) => {
                                  if (key !== selected.statut)
                                    e.currentTarget.style.backgroundColor = "transparent";
                                }}
                              >
                                <span
                                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: STATUT_STYLES[key].dot }}
                                />
                                <span
                                  className="text-sm font-semibold flex-1"
                                  style={{
                                    color: key === selected.statut ? STATUT_STYLES[key].color : "#374151",
                                  }}
                                >
                                  {STATUT_STYLES[key].label}
                                </span>
                                {key === selected.statut && (
                                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M2.5 7L5.5 10L11.5 4" stroke={STATUT_STYLES[key].dot} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </section>

                  <Divider />

                  {/* Client */}
                  <section>
                    <h3 className="label-base">Informations client</h3>
                    <div className="space-y-3">
                      <InfoRow
                        icon={Phone}
                        label="Téléphone"
                        value={selected.telephone}
                      />
                      {selected.adresse && (
                        <InfoRow
                          icon={MapPin}
                          label="Adresse"
                          value={selected.adresse}
                        />
                      )}
                      <InfoRow
                        icon={Calendar}
                        label="Date de commande"
                        value={formatDate(selected.date_commande)}
                      />
                    </div>
                  </section>

                  <Divider />

                  {/* Product details — read-only, one section per product */}
                  <section>
                    <h3 className="label-base">Détails du produit</h3>
                    {(() => {
                      const products = parseProductsTag(selected.notes);
                      if (products?.length) {
                        return (
                          <div>
                            {products.map((p, i) => (
                              <div key={i}>
                                {i > 0 && (
                                  <div
                                    className="my-4 flex items-center gap-3"
                                  >
                                    <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(197,160,89,0.35)' }} />
                                    <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#C5A059' }}>+</span>
                                    <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(197,160,89,0.35)' }} />
                                  </div>
                                )}
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="text-xs font-bold tracking-wide px-2 py-0.5 rounded-full"
                                      style={{ backgroundColor: "rgba(197,160,89,0.10)", color: "#A8863A" }}
                                    >
                                      Produit {i + 1}
                                    </span>
                                    {p.cat && (
                                      <span className="text-xs text-neutral-400 font-medium">{p.cat}</span>
                                    )}
                                  </div>
                                  <InfoRow icon={Package} label="Produit" value={p.nom} />
                                  {p.dim && (
                                    <InfoRow icon={Ruler} label="Dimensions" value={p.dim} />
                                  )}
                                  {p.couleur && (
                                    <InfoRow icon={Palette} label="Couleur / Finition" value={p.couleur} />
                                  )}
                                  <InfoRow icon={Layers} label="Quantité" value={`×${p.qty}`} />
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      // Fallback for orders without structured product tag
                      return (
                        <div className="space-y-3">
                          {selected.categorie?.nom && (
                            <InfoRow icon={Tag} label="Catégorie" value={selected.categorie.nom} />
                          )}
                          {selected.mesure && (
                            <InfoRow icon={Ruler} label="Dimensions" value={selected.mesure} />
                          )}
                          {selected.couleur && (
                            <InfoRow icon={Palette} label="Couleur / Finition" value={selected.couleur} />
                          )}
                        </div>
                      );
                    })()}
                  </section>

                  <Divider />

                  {/* Pricing */}
                  <section>
                    <h3 className="label-base">Tarification</h3>
                    <div
                      className="rounded-2xl overflow-hidden"
                      style={{ border: "1px solid rgba(197,160,89,0.12)" }}
                    >
                      {selected.cout_revient != null && (
                        <PriceRow
                          label="Prix de revient"
                          value={formatMontant(selected.cout_revient)}
                        />
                      )}
                      {(selected.tarif_livraison ?? 0) > 0 && (
                        <PriceRow
                          label="Frais de livraison"
                          value={formatMontant(selected.tarif_livraison!)}
                        />
                      )}
                      <PriceRow
                        label="Total client"
                        value={formatMontant(selected.prix_total)}
                        highlight
                      />
                    </div>
                  </section>

                  <Divider />

                  {/* Livraison — read-only */}
                  <section>
                    <h3 className="label-base flex items-center gap-2">
                      <Truck size={12} style={{ color: "#C5A059" }} />
                      Livraison
                    </h3>
                    <div className="space-y-3">
                      <InfoRow
                        icon={Truck}
                        label="Type"
                        value={
                          LIVRAISON_OPTIONS.find(
                            (o) => o.value === (selected.type_livraison ?? "none"),
                          )?.label ?? "Aucune"
                        }
                      />
                      {selected.bureau_nom && (
                        <InfoRow
                          icon={MapPin}
                          label="Bureau"
                          value={selected.bureau_nom}
                        />
                      )}
                      {(selected.tarif_livraison ?? 0) > 0 && (
                        <InfoRow
                          icon={Truck}
                          label="Tarif"
                          value={formatMontant(selected.tarif_livraison!)}
                        />
                      )}
                    </div>
                  </section>

                  <Divider />

                  {/* Notes — read-only */}
                  <section>
                    <h3 className="label-base flex items-center gap-2">
                      <FileText size={12} style={{ color: "#C5A059" }} />
                      Notes internes
                    </h3>
                    {(() => {
                      const visibleNotes = (selected.notes ?? "")
                        .replace(/\[(BUREAU|REVIENT|PRODUITS|MOE):[^\]]*\]\n?/g, "")
                        .trim();
                      return visibleNotes ? (
                        <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
                          {visibleNotes}
                        </p>
                      ) : (
                        <p className="text-sm text-neutral-400 italic">
                          Aucune note interne
                        </p>
                      );
                    })()}
                  </section>
                </div>

                {/* Footer */}
                <div
                  className="flex-shrink-0 px-6 py-4 flex gap-3 rounded-b-2xl"
                  style={{
                    borderTop: "1px solid rgba(197,160,89,0.10)",
                    backgroundColor: "#FAFAFA",
                  }}
                >
                  <a
                    href={`/admin/commandes/${selected.id}`}
                    className="btn-primary flex-1 text-center text-sm"
                  >
                    Voir commande complète
                  </a>
                  <button
                    onClick={() => window.print()}
                    className="p-2.5 rounded-xl hover:bg-neutral-100 transition-colors flex-shrink-0"
                    title="Imprimer"
                  >
                    <Printer size={16} style={{ color: "#A8863A" }} />
                  </button>
                  <button
                    onClick={() => setSelected(null)}
                    className="btn-secondary text-sm"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Print order slip — off-screen in UI, fills page during @media print */}
      {selected && (() => {
        const products = parseProductsTag(selected.notes);
        const livraisonLabel =
          LIVRAISON_OPTIONS.find((o) => o.value === (selected.type_livraison ?? "none"))?.label ?? "Aucune";
        const sousTotal = selected.prix_total - (selected.tarif_livraison ?? 0);
        const hasLivraison = (selected.tarif_livraison ?? 0) > 0;
        const visibleNotes = (selected.notes ?? "")
          .replace(/\[(BUREAU|REVIENT|PRODUITS|MOE):[^\]]*\]\n?/g, "")
          .trim();

        return (
          <div className="print-order-slip" aria-hidden="true">

            {/* ── 1. HEADER ── */}
            <div
              className="print-section"
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: "32px",
                paddingBottom: "22px",
                borderBottom: "2.5px solid #0F172A",
              }}
            >
              <div>
                <div style={{ fontSize: "30px", fontWeight: 900, color: "#0F172A", letterSpacing: "-1px", lineHeight: 1 }}>
                  MOBILE ART
                </div>
                <div style={{ fontSize: "9px", color: "#94A3B8", marginTop: "6px", letterSpacing: "3px", textTransform: "uppercase", fontWeight: 600 }}>
                  SIHAMDA Ferronnerie
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748B", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "5px" }}>
                  Bon de Commande
                </div>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.5px", lineHeight: 1 }}>
                  #{selected.id.slice(0, 8).toUpperCase()}
                </div>
                <div style={{ fontSize: "12px", color: "#64748B", marginTop: "5px" }}>
                  {formatDate(selected.date_commande)}
                </div>
              </div>
            </div>

            {/* ── 2. CLIENT + LIVRAISON ── */}
            <div
              className="print-section"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
                marginBottom: "28px",
                padding: "18px 22px",
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: "6px",
              }}
            >
              <div>
                <div style={{ fontSize: "9px", fontWeight: 700, color: "#94A3B8", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "10px" }}>
                  Informations client
                </div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#0F172A", marginBottom: "4px" }}>
                  {selected.nom_prenom}
                </div>
                <div style={{ fontSize: "13px", color: "#475569", marginBottom: "2px" }}>
                  {selected.telephone}
                </div>
                {selected.adresse && (
                  <div style={{ fontSize: "13px", color: "#475569" }}>{selected.adresse}</div>
                )}
              </div>
              <div>
                <div style={{ fontSize: "9px", fontWeight: 700, color: "#94A3B8", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "10px" }}>
                  Type de livraison
                </div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", marginBottom: "4px" }}>
                  {livraisonLabel}
                </div>
                {selected.bureau_nom && (
                  <div style={{ fontSize: "13px", color: "#475569", marginBottom: "2px" }}>
                    {selected.bureau_nom}
                  </div>
                )}
                {hasLivraison && (
                  <div style={{ fontSize: "13px", color: "#475569" }}>
                    Tarif : {formatMontant(selected.tarif_livraison!)}
                  </div>
                )}
              </div>
            </div>

            {/* ── 3. PRODUCTS TABLE ── */}
            <div className="print-section" style={{ marginBottom: "26px" }}>
              <div style={{ fontSize: "9px", fontWeight: 700, color: "#94A3B8", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "12px" }}>
                Produits commandés
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", border: "1px solid #CBD5E1" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F1F5F9" }}>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "#374151", fontSize: "11px", borderBottom: "1px solid #CBD5E1", width: "38%" }}>
                      Produit
                    </th>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "#374151", fontSize: "11px", borderBottom: "1px solid #CBD5E1", width: "26%" }}>
                      Détails
                    </th>
                    <th style={{ padding: "10px 14px", textAlign: "center", fontWeight: 700, color: "#374151", fontSize: "11px", borderBottom: "1px solid #CBD5E1", width: "10%" }}>
                      Qté
                    </th>
                    <th style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "#374151", fontSize: "11px", borderBottom: "1px solid #CBD5E1", width: "13%" }}>
                      Prix Unit.
                    </th>
                    <th style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "#374151", fontSize: "11px", borderBottom: "1px solid #CBD5E1", width: "13%" }}>
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products?.length ? (
                    products.map((p, i) => {
                      const canPrice = products.length === 1;
                      const unitP = canPrice ? sousTotal / (p.qty || 1) : null;
                      const rowT = canPrice ? sousTotal : null;
                      return (
                        <tr key={i} style={{ borderBottom: "1px solid #E2E8F0" }}>
                          <td style={{ padding: "12px 14px", verticalAlign: "top" }}>
                            <span style={{ fontWeight: 600, color: "#0F172A" }}>{p.nom || p.cat || "—"}</span>
                            {p.cat && p.nom && (
                              <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "2px" }}>{p.cat}</div>
                            )}
                          </td>
                          <td style={{ padding: "12px 14px", verticalAlign: "top", color: "#475569" }}>
                            {p.dim && <div>{p.dim}</div>}
                            {p.couleur && <div style={{ marginTop: p.dim ? "2px" : "0" }}>{p.couleur}</div>}
                            {!p.dim && !p.couleur && "—"}
                          </td>
                          <td style={{ padding: "12px 14px", textAlign: "center", verticalAlign: "top", fontWeight: 700, color: "#374151" }}>
                            {p.qty}
                          </td>
                          <td style={{ padding: "12px 14px", textAlign: "right", verticalAlign: "top", fontFamily: "monospace", color: "#374151" }}>
                            {unitP != null ? formatMontant(unitP) : "—"}
                          </td>
                          <td style={{ padding: "12px 14px", textAlign: "right", verticalAlign: "top", fontFamily: "monospace", fontWeight: 700, color: "#0F172A" }}>
                            {rowT != null ? formatMontant(rowT) : "—"}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    /* Fallback: single-product legacy order */
                    <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                      <td style={{ padding: "12px 14px", verticalAlign: "top" }}>
                        <span style={{ fontWeight: 600, color: "#0F172A" }}>
                          {selected.option?.label || selected.categorie?.nom || "—"}
                        </span>
                        {selected.categorie?.nom && selected.option?.label && (
                          <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "2px" }}>{selected.categorie.nom}</div>
                        )}
                      </td>
                      <td style={{ padding: "12px 14px", verticalAlign: "top", color: "#475569" }}>
                        {selected.mesure && <div>{selected.mesure}</div>}
                        {selected.couleur && <div style={{ marginTop: selected.mesure ? "2px" : "0" }}>{selected.couleur}</div>}
                        {!selected.mesure && !selected.couleur && "—"}
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "center", verticalAlign: "top", fontWeight: 700, color: "#374151" }}>
                        1
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right", verticalAlign: "top", fontFamily: "monospace", color: "#374151" }}>
                        {formatMontant(sousTotal)}
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right", verticalAlign: "top", fontFamily: "monospace", fontWeight: 700, color: "#0F172A" }}>
                        {formatMontant(sousTotal)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ── 4. TARIFICATION ── */}
            <div className="print-section" style={{ marginBottom: "28px" }}>
              <div style={{ fontSize: "9px", fontWeight: 700, color: "#94A3B8", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "12px" }}>
                Tarification
              </div>
              <div style={{ border: "1px solid #E2E8F0", borderRadius: "6px", overflow: "hidden" }}>
                {hasLivraison && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 18px", borderBottom: "1px solid #E2E8F0", fontSize: "13px" }}>
                    <span style={{ color: "#475569" }}>Sous-total produits</span>
                    <span style={{ color: "#374151", fontFamily: "monospace", fontWeight: 600 }}>{formatMontant(sousTotal)}</span>
                  </div>
                )}
                {hasLivraison && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 18px", borderBottom: "1px solid #E2E8F0", fontSize: "13px" }}>
                    <span style={{ color: "#475569" }}>Frais de livraison ({livraisonLabel})</span>
                    <span style={{ color: "#374151", fontFamily: "monospace", fontWeight: 600 }}>{formatMontant(selected.tarif_livraison!)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 18px", backgroundColor: "#F8FAFC" }}>
                  <span style={{ fontSize: "17px", fontWeight: 700, color: "#0F172A" }}>Total à régler</span>
                  <span style={{ fontSize: "20px", fontWeight: 900, color: "#C5A059", fontFamily: "monospace" }}>{formatMontant(selected.prix_total)}</span>
                </div>
              </div>
            </div>

            {/* ── 5. NOTES INTERNES (conditional) ── */}
            {visibleNotes && (
              <div className="print-section" style={{ marginBottom: "28px" }}>
                <div style={{ fontSize: "9px", fontWeight: 700, color: "#94A3B8", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "10px" }}>
                  Notes internes
                </div>
                <div style={{ fontSize: "12px", color: "#475569", lineHeight: 1.75, padding: "14px 16px", backgroundColor: "#FFFBEB", borderRadius: "6px", border: "1px solid #FDE68A", whiteSpace: "pre-line" }}>
                  {visibleNotes}
                </div>
              </div>
            )}

            {/* ── FOOTER ── */}
            <div style={{ marginTop: "52px", paddingTop: "14px", borderTop: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "10px", color: "#CBD5E1", letterSpacing: "1px", textTransform: "uppercase", fontWeight: 600 }}>
                MOBILE ART — SIHAMDA Ferronnerie
              </div>
              <div style={{ fontSize: "10px", color: "#CBD5E1" }}>
                Imprimé le {new Date().toLocaleDateString("fr-FR")}
              </div>
            </div>

          </div>
        );
      })()}

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title={deleteTargetRow?.nom_prenom ?? ""}
        description="Cette commande sera définitivement supprimée. Cette action est irréversible."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
