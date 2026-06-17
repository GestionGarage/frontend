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

export interface CommandeRow {
  id: string;
  prenom: string;
  nom: string;
  telephone: string;
  adresse?: string;
  categorie?: { nom: string };
  option_label?: string;
  mesure?: string;
  couleur?: string;
  prix_revient?: number;
  prix_total: number;
  tarif_livraison?: number;
  mode_livraison?: string;
  statut: "en_attente" | "en_cours" | "terminee" | "annulee";
  date_commande: string;
  notes?: string;
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
  { value: "aucune", label: "Aucune" },
  { value: "bureau", label: "Bureau" },
  { value: "vehicule", label: "Véhicule" },
] as const;

const MOCK_COMMANDES: CommandeRow[] = [
  {
    id: "cmd-001",
    prenom: "Karim",
    nom: "Bensalem",
    telephone: "0555 12 34 56",
    adresse: "12 Rue des Acacias, Alger Centre",
    categorie: { nom: "Portails Ferronnerie" },
    option_label: "Portail coulissant motorisé",
    mesure: "4.0×1.8 m",
    couleur: "Noir époxy mat",
    prix_revient: 45000,
    prix_total: 78000,
    tarif_livraison: 3000,
    mode_livraison: "vehicule",
    statut: "terminee",
    date_commande: "2026-05-10",
    notes: "Finition époxy mate noir. Livraison prévue avec pose sur site.",
  },
  {
    id: "cmd-002",
    prenom: "Nadia",
    nom: "Ferhat",
    telephone: "0661 78 90 12",
    adresse: "7 Cité des Fleurs, Tizi Ouzou",
    categorie: { nom: "Escaliers et Garde-corps" },
    option_label: "Garde-corps balcon",
    mesure: "6.0 m linéaire",
    couleur: "Noir forge + laquage Or",
    prix_revient: 32000,
    prix_total: 58500,
    tarif_livraison: 2500,
    mode_livraison: "bureau",
    statut: "en_cours",
    date_commande: "2026-06-02",
    notes:
      "[BUREAU:Yalidine]\nAccent doré sur les pointes de lance. Validation visuelle avant expédition.",
  },
  {
    id: "cmd-003",
    prenom: "Mustapha",
    nom: "Ould-Ali",
    telephone: "0770 45 67 89",
    adresse: "3 Boulevard Zighoud Youcef, Béjaïa",
    categorie: { nom: "Escaliers et Garde-corps" },
    option_label: "Escalier hélicoïdal forgé",
    mesure: "Ø1.4 m — 12 marches",
    couleur: "Noir mat",
    prix_revient: 85000,
    prix_total: 145000,
    tarif_livraison: 0,
    mode_livraison: "aucune",
    statut: "en_attente",
    date_commande: "2026-06-12",
    notes:
      "Devis accepté verbalement. Acompte de 50 % à encaisser avant démarrage.",
  },
  {
    id: "cmd-004",
    prenom: "Leila",
    nom: "Hammoudi",
    telephone: "0555 23 45 67",
    adresse: "29 Rue Larbi Ben M'hidi, Oran",
    categorie: { nom: "Portails Ferronnerie" },
    option_label: "Portail battant double vantail",
    mesure: "2.4×1.8 m",
    couleur: "Anthracite thermolaqué",
    prix_revient: 28000,
    prix_total: 52000,
    tarif_livraison: 4000,
    mode_livraison: "bureau",
    statut: "terminee",
    date_commande: "2026-04-25",
    notes: "[BUREAU:DHL Express]",
  },
  {
    id: "cmd-005",
    prenom: "Sofiane",
    nom: "Tlemçani",
    telephone: "0665 99 11 22",
    adresse: "14 Cité Palmiers, Constantine",
    categorie: { nom: "Escaliers et Garde-corps" },
    option_label: "Rampe escalier droite",
    mesure: "8 m linéaire",
    couleur: "Noir forge",
    prix_revient: 20000,
    prix_total: 34000,
    tarif_livraison: 0,
    mode_livraison: "aucune",
    statut: "annulee",
    date_commande: "2026-05-18",
    notes:
      "Client a annulé suite à un déménagement. Matière première non transformée.",
  },
  {
    id: "cmd-006",
    prenom: "Amina",
    nom: "Boudiaf",
    telephone: "0550 33 44 55",
    adresse: "5 Rue de la Paix, Sétif",
    categorie: { nom: "Mobilier Ornemental" },
    option_label: "Table basse ornementale",
    mesure: "80×80 cm",
    couleur: "Or brossé + plateau verre",
    prix_revient: 22000,
    prix_total: 41500,
    tarif_livraison: 1500,
    mode_livraison: "vehicule",
    statut: "en_cours",
    date_commande: "2026-06-08",
    notes: "Plateau verre trempé 8 mm fourni par le client.",
  },
  {
    id: "cmd-007",
    prenom: "Rachid",
    nom: "Maâzouzi",
    telephone: "0770 66 77 88",
    adresse: "18 Lotissement Ennasr, Blida",
    categorie: { nom: "Portails Ferronnerie" },
    option_label: "Portillon piéton",
    mesure: "1.0×1.8 m",
    couleur: "Noir",
    prix_revient: 14000,
    prix_total: 28000,
    tarif_livraison: 0,
    mode_livraison: "aucune",
    statut: "en_attente",
    date_commande: "2026-06-14",
  },
  {
    id: "cmd-008",
    prenom: "Yasmine",
    nom: "Chouaki",
    telephone: "0560 12 98 76",
    adresse: "8 Résidence Faïza, Boumerdès",
    categorie: { nom: "Mobilier Ornemental" },
    option_label: "Étagère murale en fer forgé",
    mesure: "100×30 cm",
    couleur: "Noir + bois noyer",
    prix_revient: 9500,
    prix_total: 24500,
    tarif_livraison: 2000,
    mode_livraison: "bureau",
    statut: "terminee",
    date_commande: "2026-05-30",
    notes:
      "[BUREAU:Zaki]\nPlateau bois noyer massif traité fourni par le client.",
  },
];

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

function EditableField({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-[18px]"
        style={{ backgroundColor: "rgba(197,160,89,0.08)" }}
      >
        <Icon size={13} style={{ color: "#A8863A" }} />
      </div>
      <div className="flex-1">
        <p className="text-xs text-neutral-400 font-medium mb-0.5">{label}</p>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? `${label}...`}
          className="w-full text-sm font-medium bg-transparent pb-1 focus:outline-none transition-all duration-200 placeholder:text-neutral-300"
          style={{
            color: "#374151",
            borderBottom: `1.5px solid ${focused ? "#C5A059" : "rgba(197,160,89,0.20)"}`,
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
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
  const [rows, setRows] = useState<CommandeRow[]>(
    initialData.length > 0 ? initialData : MOCK_COMMANDES,
  );
  const [selected, setSelected] = useState<CommandeRow | null>(null);
  const [draft, setDraft] = useState<Partial<CommandeRow>>({});
  const [bureauNom, setBureauNom] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
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

  /* Sync draft when a new row is selected */
  useEffect(() => {
    if (selected) {
      /* Normalize legacy 'yalidine' → 'bureau' */
      const rawMode = selected.mode_livraison ?? "aucune";
      const normMode = rawMode === "yalidine" ? "bureau" : rawMode;
      /* Extract bureau name from [BUREAU:xxx] tag in notes */
      const bureauTag = selected.notes?.match(/\[BUREAU:([^\]]+)\]/)?.[1] ?? "";
      setBureauNom(bureauTag);
      setDraft({
        option_label: selected.option_label ?? "",
        mesure: selected.mesure ?? "",
        couleur: selected.couleur ?? "",
        mode_livraison: normMode,
        tarif_livraison: selected.tarif_livraison ?? 0,
        notes: (selected.notes ?? "")
          .replace(/\[BUREAU:[^\]]*\]\n?/, "")
          .trim(),
      });
      setHasChanges(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  const updateDraft = (key: keyof CommandeRow, value: string | number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setDraft((d) => ({ ...d, [key]: value as any }));
    setHasChanges(true);
  };

  /* Status change is IMMEDIATE — updates rows + selected state without needing explicit save */
  const handleStatusChange = (newStatut: CommandeRow["statut"]) => {
    if (!selected) return;
    setRows((prev) =>
      prev.map((r) => (r.id === selected.id ? { ...r, statut: newStatut } : r)),
    );
    setSelected((prev) => (prev ? { ...prev, statut: newStatut } : null));
  };

  const handleSave = () => {
    if (!selected) return;
    /* Re-inject [BUREAU:xxx] tag into notes when bureau mode is active */
    const baseNotes = String(draft.notes ?? "")
      .replace(/\[BUREAU:[^\]]*\]\n?/g, "")
      .trim();
    const finalNotes =
      draft.mode_livraison === "bureau" && bureauNom.trim()
        ? `[BUREAU:${bureauNom.trim()}]\n${baseNotes}`.trim()
        : baseNotes;
    setRows((prev) =>
      prev.map((r) =>
        r.id === selected.id ? { ...r, ...draft, notes: finalNotes } : r,
      ),
    );
    setSelected(null);
  };

  const handleDeleteRequest = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(null); // close quick view before opening confirm
    setDeleteTarget(id);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setRows((prev) => prev.filter((r) => r.id !== deleteTarget));
    setDeleteTarget(null);
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
          sub="tarif livraison"
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
                        {c.prenom} {c.nom}
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
                  href={`/commandes?page=${meta.page - 1}${statut ? `&statut=${statut}` : ""}`}
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
                  href={`/commandes?page=${meta.page + 1}${statut ? `&statut=${statut}` : ""}`}
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
                      {selected.prenom} {selected.nom}
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

                  {/* Product details — inline editable */}
                  <section>
                    <h3 className="label-base">Détails du produit</h3>
                    <div className="space-y-3">
                      {selected.categorie?.nom && (
                        <InfoRow
                          icon={Tag}
                          label="Catégorie"
                          value={selected.categorie.nom}
                        />
                      )}
                      <EditableField
                        icon={Package}
                        label="Modèle"
                        value={String(draft.option_label ?? "")}
                        onChange={(v) => updateDraft("option_label", v)}
                        placeholder="Modèle ou option..."
                      />
                      <EditableField
                        icon={Ruler}
                        label="Dimensions"
                        value={String(draft.mesure ?? "")}
                        onChange={(v) => updateDraft("mesure", v)}
                        placeholder="ex: 1.6×2.0 m"
                      />
                      <EditableField
                        icon={Palette}
                        label="Couleur / Finition"
                        value={String(draft.couleur ?? "")}
                        onChange={(v) => updateDraft("couleur", v)}
                        placeholder="ex: Noir époxy mat"
                      />
                    </div>
                  </section>

                  <Divider />

                  {/* Pricing */}
                  <section>
                    <h3 className="label-base">Tarification</h3>
                    <div
                      className="rounded-2xl overflow-hidden"
                      style={{ border: "1px solid rgba(197,160,89,0.12)" }}
                    >
                      {selected.prix_revient != null && (
                        <PriceRow
                          label="Prix de revient"
                          value={formatMontant(selected.prix_revient)}
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

                  {/* Livraison — always rendered */}
                  <section>
                    <h3 className="label-base flex items-center gap-2">
                      <Truck size={12} style={{ color: "#C5A059" }} />
                      Livraison
                    </h3>
                    <div className="flex gap-2">
                      {LIVRAISON_OPTIONS.map((opt) => {
                        const isOpt =
                          (draft.mode_livraison ?? "aucune") === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() =>
                              updateDraft("mode_livraison", opt.value)
                            }
                            className="flex-1 text-xs font-semibold py-2 rounded-xl transition-all duration-150"
                            style={{
                              backgroundColor: isOpt
                                ? "rgba(197,160,89,0.10)"
                                : "#F8F7F4",
                              border: `1.5px solid ${isOpt ? "#C5A059" : "rgba(197,160,89,0.12)"}`,
                              color: isOpt ? "#A8863A" : "#6B7280",
                            }}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                    <AnimatePresence>
                      {(draft.mode_livraison ?? "aucune") === "bureau" && (
                        <motion.div
                          key="bureau-fields"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.18 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 space-y-3">
                            <div>
                              <label className="label-base">
                                Nom du bureau
                              </label>
                              <input
                                type="text"
                                className="input-base text-sm"
                                placeholder="ex: DHL, Zaki, Madar…"
                                value={bureauNom}
                                onChange={(e) => {
                                  setBureauNom(e.target.value);
                                  setHasChanges(true);
                                }}
                              />
                            </div>
                            <div>
                              <label className="label-base">
                                Prix de livraison (DA)
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="1"
                                className="input-base text-sm"
                                placeholder="0"
                                value={(draft.tarif_livraison ?? 0) || ""}
                                onChange={(e) =>
                                  updateDraft(
                                    "tarif_livraison",
                                    Number(e.target.value) || 0,
                                  )
                                }
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                      {(draft.mode_livraison ?? "aucune") === "vehicule" && (
                        <motion.div
                          key="vehicule-prix"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.18 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3">
                            <label className="label-base">
                              Prix de livraison (DA)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              className="input-base text-sm"
                              placeholder="0"
                              value={(draft.tarif_livraison ?? 0) || ""}
                              onChange={(e) =>
                                updateDraft(
                                  "tarif_livraison",
                                  Number(e.target.value) || 0,
                                )
                              }
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </section>

                  <Divider />

                  {/* Notes */}
                  <section>
                    <h3 className="label-base flex items-center gap-2">
                      <FileText size={12} style={{ color: "#C5A059" }} />
                      Notes internes
                    </h3>
                    <textarea
                      className="w-full text-sm text-neutral-600 leading-relaxed rounded-xl p-4 resize-none transition-all duration-150 focus:outline-none placeholder:text-neutral-300"
                      style={{
                        backgroundColor: "#F8F7F4",
                        border: "1.5px solid rgba(197,160,89,0.10)",
                        minHeight: "76px",
                      }}
                      placeholder="Aucune note interne…"
                      value={String(draft.notes ?? "")}
                      onChange={(e) => updateDraft("notes", e.target.value)}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor =
                          "rgba(197,160,89,0.40)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor =
                          "rgba(197,160,89,0.10)";
                      }}
                    />
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
                  {hasChanges ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="btn-primary flex-1 text-sm"
                      >
                        Sauvegarder les modifications
                      </button>
                      <button
                        onClick={() => setSelected(null)}
                        className="btn-secondary text-sm"
                      >
                        Annuler
                      </button>
                    </>
                  ) : (
                    <>
                      <a
                        href={`/commandes/${selected.id}`}
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
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Print order slip — off-screen in UI, fills page during @media print */}
      {selected && (
        <div className="print-order-slip" aria-hidden="true">
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: "28px",
              paddingBottom: "20px",
              borderBottom: "2px solid #C5A059",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: 800,
                  color: "#1E293B",
                  letterSpacing: "-0.5px",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                }}
              >
                GestionGarage
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: "#94A3B8",
                  marginTop: "3px",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                }}
              >
                ERP Ferronnier
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#C5A059",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                Bon de commande
              </div>
              <div
                style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}
              >
                Date : {formatDate(selected.date_commande)}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "32px",
              marginBottom: "24px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#94A3B8",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                Client
              </div>
              <div
                style={{ fontSize: "15px", fontWeight: 700, color: "#1E293B" }}
              >
                {selected.prenom} {selected.nom}
              </div>
              <div
                style={{ fontSize: "12px", color: "#64748B", marginTop: "3px" }}
              >
                {selected.telephone}
              </div>
              {selected.adresse && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "#64748B",
                    marginTop: "3px",
                  }}
                >
                  {selected.adresse}
                </div>
              )}
            </div>
            <div>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#94A3B8",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                Produit
              </div>
              {selected.categorie?.nom && (
                <div style={{ fontSize: "11px", color: "#94A3B8" }}>
                  {selected.categorie.nom}
                </div>
              )}
              {selected.option_label && (
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#1E293B",
                    marginTop: "2px",
                  }}
                >
                  {selected.option_label}
                </div>
              )}
              {selected.mesure && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "#64748B",
                    marginTop: "3px",
                  }}
                >
                  Dimensions : {selected.mesure}
                </div>
              )}
              {selected.couleur && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "#64748B",
                    marginTop: "3px",
                  }}
                >
                  Couleur : {selected.couleur}
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              borderTop: "1px solid rgba(197,160,89,0.25)",
              paddingTop: "20px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: "#94A3B8",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              Tarification
            </div>
            {selected.prix_revient != null && selected.prix_revient > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  color: "#64748B",
                  marginBottom: "6px",
                }}
              >
                <span>Prix de revient</span>
                <span>{formatMontant(selected.prix_revient)}</span>
              </div>
            )}
            {(selected.tarif_livraison ?? 0) > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  color: "#64748B",
                  marginBottom: "6px",
                }}
              >
                <span>
                  Frais de livraison
                  {selected.mode_livraison &&
                  selected.mode_livraison !== "aucune"
                    ? ` (${selected.mode_livraison})`
                    : ""}
                </span>
                <span>{formatMontant(selected.tarif_livraison!)}</span>
              </div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "17px",
                fontWeight: 800,
                color: "#C5A059",
                marginTop: "10px",
                paddingTop: "10px",
                borderTop: "1px solid rgba(197,160,89,0.22)",
              }}
            >
              <span>Total client</span>
              <span>{formatMontant(selected.prix_total)}</span>
            </div>
          </div>

          {selected.notes && (
            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#94A3B8",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                Notes
              </div>
              <div
                style={{ fontSize: "12px", color: "#64748B", lineHeight: 1.7 }}
              >
                {selected.notes}
              </div>
            </div>
          )}

          <div
            style={{
              marginTop: "48px",
              paddingTop: "14px",
              borderTop: "1px solid rgba(197,160,89,0.18)",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                color: "#CBD5E1",
                letterSpacing: "1px",
              }}
            >
              GestionGarage — ERP Ferronnier
            </div>
            <div style={{ fontSize: "10px", color: "#CBD5E1" }}>
              Imprimé le {new Date().toLocaleDateString("fr-FR")}
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title={
          deleteTargetRow
            ? `${deleteTargetRow.prenom} ${deleteTargetRow.nom}`
            : ""
        }
        description="Cette commande sera retirée de la liste. L'action est locale et ne supprime pas les données serveur."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
