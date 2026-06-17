export const MAX_ITEMS_PER_PAGE = 20;

export const STATUT_CONFIG = {
  en_attente: { label: 'En attente', color: 'warning', bgClass: 'bg-yellow-100 text-yellow-800' },
  en_cours:   { label: 'En cours',   color: 'info',    bgClass: 'bg-blue-100 text-blue-800'   },
  terminee:   { label: 'Terminée',   color: 'success', bgClass: 'bg-green-100 text-green-800' },
  annulee:    { label: 'Annulée',    color: 'danger',  bgClass: 'bg-red-100 text-red-800'     },
} as const;

export const TYPE_DEPENSE_CONFIG = {
  vidange: { label: 'Vidange', color: 'bg-amber-100 text-amber-800' },
  carburant: { label: 'Carburant', color: 'bg-blue-100 text-blue-800' },
  reparation: { label: 'Réparation', color: 'bg-red-100 text-red-800' },
  assurance: { label: 'Assurance', color: 'bg-purple-100 text-purple-800' },
  controle_technique: { label: 'Contrôle technique', color: 'bg-orange-100 text-orange-800' },
  lavage: { label: 'Lavage', color: 'bg-cyan-100 text-cyan-800' },
  autre: { label: 'Autre', color: 'bg-neutral-100 text-neutral-700' },
} as const;

export const TYPE_MATERIAU_CONFIG = {
  metal: { label: 'Métal / Fer', color: 'bg-neutral-100 text-neutral-700' },
  bois: { label: 'Bois / MDF', color: 'bg-amber-100 text-amber-800' },
  peinture: { label: 'Peinture', color: 'bg-indigo-100 text-indigo-800' },
  pinceau: { label: 'Pinceaux', color: 'bg-pink-100 text-pink-800' },
  visserie: { label: 'Visserie', color: 'bg-zinc-100 text-zinc-800' },
  soudure: { label: 'Soudure', color: 'bg-orange-100 text-orange-800' },
  autre: { label: 'Autre', color: 'bg-neutral-100 text-neutral-700' },
} as const;

export const UNITE_LABELS = {
  unite: 'Unité',
  kg: 'kg',
  m: 'm',
  m2: 'm²',
  litre: 'L',
  piece: 'Pièce',
} as const;

export const CHART_COLORS = {
  revenus: '#60A5FA',
  depenses: '#F87171',
  benefice: '#34D399',
  matieres: '#60A5FA',
  vehicule: '#F59E0B',
} as const;
