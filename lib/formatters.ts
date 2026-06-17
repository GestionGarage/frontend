const FR_LOCALE = 'fr-DZ';
const CURRENCY = 'DZD';

export function formatMontant(value: number, currency = CURRENCY): string {
  return new Intl.NumberFormat(FR_LOCALE, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat(FR_LOCALE).format(value);
}

export function formatPct(value: number): string {
  return `${Math.round(value * 100) / 100} %`;
}

export function formatDate(dateStr: string | Date, includeTime = false): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(date);
}

export function formatDateShort(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
  }).format(date);
}

export function formatMois(moisStr: string): string {
  const [year, month] = moisStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(date);
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}
