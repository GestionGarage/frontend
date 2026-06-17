'use client';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, total, limit, onPageChange }: PaginationProps) {
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1;
    if (page <= 4) return i + 1;
    if (page >= totalPages - 3) return totalPages - 6 + i;
    return page - 3 + i;
  });

  if (totalPages <= 1) return null;

  const btnBase: React.CSSProperties = {
    backgroundColor: 'var(--forge-raised)',
    border: '1px solid var(--forge-border)',
    color: 'rgba(255,255,255,0.4)',
  };

  const btnActive: React.CSSProperties = {
    backgroundColor: '#F59E0B',
    border: '1px solid #F59E0B',
    color: '#0C0D14',
  };

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-xs text-neutral-600">
        {from}–{to} sur {total}
      </p>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all disabled:opacity-30"
          style={btnBase}
        >
          ← Précédent
        </button>

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className="w-7 h-7 text-xs font-semibold rounded-lg transition-all"
            style={p === page ? btnActive : btnBase}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all disabled:opacity-30"
          style={btnBase}
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}
