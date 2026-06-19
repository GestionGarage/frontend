import { cookies } from 'next/headers';

// API_URL is a server-only env var (no NEXT_PUBLIC_ prefix).
// Must be set in Vercel dashboard → Settings → Environment Variables.
const API_URL = process.env.API_URL ?? 'http://localhost:3001/admin';

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Reads the JWT stored in the Vercel-domain "admin_session" cookie by
// POST /api/auth/session after login, and forwards it to the backend as
// "Cookie: access_token=<jwt>".  This is the only way SSR Server Components
// can authenticate with the backend: the backend's own httpOnly cookie is
// scoped to Render's domain and is NOT forwarded to mobile-art.vercel.app
// requests, making cookies() from next/headers useless for that cookie.
async function serverFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const cookieStore = await cookies();
  const jwt = cookieStore.get('admin_session')?.value;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(jwt ? { Cookie: `access_token=${jwt}` } : {}),
      ...options?.headers,
    },
    cache: 'no-store',
  });

  let body: Record<string, unknown>;
  try {
    body = (await res.json()) as Record<string, unknown>;
  } catch {
    throw new ApiError(res.status, 'Réponse serveur invalide');
  }

  if (!res.ok) {
    // Log to Vercel function logs for easier remote debugging
    console.error(`[SSR] ${res.status} ${res.statusText} — ${API_URL}${path}`);
    throw new ApiError(res.status, (body.message as string) ?? 'Erreur serveur');
  }

  return body as T;
}

// ----------------------------------------------------------------
// Analytics
// ----------------------------------------------------------------
export async function getAnalyticsSummary(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return serverFetch<{ data: unknown }>(`/analytics/summary${qs ? `?${qs}` : ''}`);
}

export async function getRevenueChart(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return serverFetch<{ data: unknown[] }>(`/analytics/revenue-chart${qs ? `?${qs}` : ''}`);
}

export async function getExpensesBreakdown(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return serverFetch<{ data: unknown }>(`/analytics/expenses-breakdown${qs ? `?${qs}` : ''}`);
}

export async function getTopCategories(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return serverFetch<{ data: unknown[] }>(`/analytics/top-categories${qs ? `?${qs}` : ''}`);
}

export async function getHistoricalTable(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return serverFetch<{ data: unknown[]; meta: unknown }>(`/analytics/historical-table${qs ? `?${qs}` : ''}`);
}

// ----------------------------------------------------------------
// Commandes
// ----------------------------------------------------------------
export async function getCommandes(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return serverFetch<{ data: unknown[]; meta: unknown }>(`/commandes${qs ? `?${qs}` : ''}`);
}

export async function getCommande(id: string) {
  return serverFetch<{ data: unknown }>(`/commandes/${id}`);
}

export async function getCommandesStats(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return serverFetch<{ data: { nb_commandes: number; total_general: number; cout_total: number; benefice_net: number } }>(`/commandes/stats${qs ? `?${qs}` : ''}`);
}

// ----------------------------------------------------------------
// Vehicule
// ----------------------------------------------------------------
export async function getVehiculeDepenses(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return serverFetch<{ data: unknown[]; meta: unknown }>(`/vehicule/depenses${qs ? `?${qs}` : ''}`);
}

export async function getVehiculeStats(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return serverFetch<{ data: { total_pertes: number; livraison: number; essence: number; reparation: number } }>(`/vehicule/depenses/stats${qs ? `?${qs}` : ''}`);
}

export async function getVehiculeSummary(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return serverFetch<{ data: unknown }>(`/analytics/vehicule-summary${qs ? `?${qs}` : ''}`);
}

// ----------------------------------------------------------------
// Achats
// ----------------------------------------------------------------
export async function getAchats(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return serverFetch<{ data: unknown[]; meta: unknown }>(`/achats${qs ? `?${qs}` : ''}`);
}

export async function getAchatsStats(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return serverFetch<{ data: { total_periode: number; nb_achats: number; par_materiau: Array<{ type: string; label: string; montant: number; pct: number }> } }>(`/achats/stats${qs ? `?${qs}` : ''}`);
}

export async function getAchatsSummary(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return serverFetch<{ data: unknown }>(`/analytics/achats-summary${qs ? `?${qs}` : ''}`);
}

// ----------------------------------------------------------------
// Categories
// ----------------------------------------------------------------
export async function getCategories(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return serverFetch<{ data: unknown[]; meta: unknown }>(`/categories${qs ? `?${qs}` : ''}`);
}

export async function getCategorie(id: string) {
  return serverFetch<{ data: unknown }>(`/categories/${id}`);
}

// ----------------------------------------------------------------
// Produits
// ----------------------------------------------------------------
export async function getProduits(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return serverFetch<{ data: unknown[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(`/produits${qs ? `?${qs}` : ''}`);
}

export async function getProduit(id: string) {
  return serverFetch<{ data: unknown }>(`/produits/${id}`);
}

export async function getCategoriesPublic() {
  const res = await fetch(`${API_URL}/categories/public?include_options=true`, {
    cache: 'no-store',
  });
  return res.json() as Promise<{ data: unknown[] }>;
}
