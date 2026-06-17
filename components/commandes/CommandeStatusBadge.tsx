import type { CommandeStatut } from '@gestion-garage/shared-validators';

/* Gold-neutral palette — aligns with brand identity */
const STATUT_STYLES: Record<CommandeStatut, { label: string; color: string; bg: string; dot: string }> = {
  en_attente: { label: 'En attente', color: '#A8863A', bg: 'rgba(197,160,89,0.10)',  dot: '#C5A059' },
  en_cours:   { label: 'En cours',   color: '#475569', bg: 'rgba(71,85,105,0.09)',   dot: '#64748B' },
  terminee:   { label: 'Terminée',   color: '#374151', bg: 'rgba(55,65,81,0.08)',    dot: '#374151' },
  annulee:    { label: 'Annulée',    color: '#78716C', bg: 'rgba(120,113,108,0.08)', dot: '#9CA3AF' },
};

export default function CommandeStatusBadge({ statut }: { statut: CommandeStatut }) {
  const s = STATUT_STYLES[statut];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ color: s.color, backgroundColor: s.bg }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.dot }} />
      {s.label}
    </span>
  );
}
