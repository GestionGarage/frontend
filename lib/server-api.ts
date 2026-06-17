import { cookies } from 'next/headers';

const API_URL = process.env.API_URL ?? 'http://localhost:3001/api';

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function serverFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
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

// ----------------------------------------------------------------
// Vehicule
// ----------------------------------------------------------------
export async function getVehiculeDepenses(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return serverFetch<{ data: unknown[]; meta: unknown }>(`/vehicule/depenses${qs ? `?${qs}` : ''}`);
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

export async function getCategoriesPublic() {
  const res = await fetch(`${API_URL}/categories/public?include_options=true`, {
    cache: 'no-store',
  });
  return res.json() as Promise<{ data: unknown[] }>;
}
