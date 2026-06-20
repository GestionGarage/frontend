'use client';

// Direct backend URL — only used for auth endpoints (login/logout/refresh/me)
// and the warm-up health ping, which need to interact with Render's cookie jar.
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/admin';

// Derive the root origin for health checks (strips the /admin path segment)
const BACKEND_ORIGIN = API_URL.replace(/\/admin$/, '');

// Render free-tier cold starts can take up to ~50 s — use 65 s in prod.
// Local dev uses 15 s to avoid long hangs during development.
const REQUEST_TIMEOUT_MS = API_URL.includes('localhost') ? 15_000 : 65_000;

// After this many ms with no server response, the login form shows a
// "server is waking up" notice to reassure the user.
export const SLOW_REQUEST_THRESHOLD_MS = 5_000;

// ── Error class ────────────────────────────────────────────────────

export class ClientApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly errors?: Array<{ field: string; message: string }>,
  ) {
    super(message);
    this.name = 'ClientApiError';
  }
}

// ── Auth/direct fetch (login, logout, refresh, me, ping) ────────────
// These go straight to the backend so that the Render-domain httpOnly
// cookie (access_token) is properly set/cleared by the browser.

async function clientFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: controller.signal,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (res.status === 204) return undefined as T;

    const body = (await res.json()) as Record<string, unknown>;

    if (!res.ok) {
      throw new ClientApiError(
        res.status,
        (body.message as string) ?? 'Erreur',
        body.errors as Array<{ field: string; message: string }> | undefined,
      );
    }

    return body as T;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ClientApiError(
        0,
        'Le serveur met trop de temps à répondre. Veuillez réessayer dans quelques secondes.',
      );
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ── Proxy fetch (all non-auth CRUD) ────────────────────────────────
// Routes through /api/proxy/[...path] — a Next.js route handler that reads
// the Vercel-domain admin_session cookie and forwards the JWT to the backend.
// This eliminates the dependency on cross-site cookie delivery for mutations.

async function proxyFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`/api/proxy${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (res.status === 204) return undefined as T;

    const body = (await res.json()) as Record<string, unknown>;

    if (!res.ok) {
      throw new ClientApiError(
        res.status,
        (body.message as string) ?? 'Erreur',
        body.errors as Array<{ field: string; message: string }> | undefined,
      );
    }

    return body as T;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ClientApiError(
        0,
        'Le serveur met trop de temps à répondre. Veuillez réessayer dans quelques secondes.',
      );
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ── Warm-up ping ────────────────────────────────────────────────────

/**
 * Fires a lightweight GET /health request so Render's free-tier instance
 * has time to boot before the user clicks "Se connecter".
 * Called on login page mount — response is ignored, only timing matters.
 */
export async function pingBackend(): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 65_000);
  try {
    await fetch(`${BACKEND_ORIGIN}/health`, {
      method: 'GET',
      credentials: 'omit',
      signal: controller.signal,
    });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ── Auth ────────────────────────────────────────────────────────────

export const login = (data: { username: string; password: string }) =>
  clientFetch<{ data: { access_token: string; expires_in: number; user: object } }>(
    '/login', { method: 'POST', body: JSON.stringify(data) },
  );

// Clears both the Render-domain JWT cookie (via the backend) and the
// Vercel-domain session cookie (via the Next.js API route) in parallel.
export const logout = async (): Promise<void> => {
  await Promise.allSettled([
    clientFetch('/logout', { method: 'POST' }),
    fetch('/api/auth/session', { method: 'DELETE' }),
  ]);
};

export const getMe = () =>
  clientFetch('/me');

// ── Commandes ───────────────────────────────────────────────────────

export const createCommande = (data: unknown) =>
  proxyFetch('/commandes', { method: 'POST', body: JSON.stringify(data) });

export const updateCommande = (id: string, data: unknown) =>
  proxyFetch(`/commandes/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const updateCommandeStatut = (id: string, statut: string) =>
  proxyFetch(`/commandes/${id}/statut`, { method: 'PATCH', body: JSON.stringify({ statut }) });

export const deleteCommande = (id: string) =>
  proxyFetch(`/commandes/${id}`, { method: 'DELETE' });

// ── Vehicule ────────────────────────────────────────────────────────

export const createVehiculeDepense = (data: unknown) =>
  proxyFetch('/vehicule/depenses', { method: 'POST', body: JSON.stringify(data) });

export const updateVehiculeDepense = (id: string, data: unknown) =>
  proxyFetch(`/vehicule/depenses/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteVehiculeDepense = (id: string) =>
  proxyFetch(`/vehicule/depenses/${id}`, { method: 'DELETE' });

// ── Achats ──────────────────────────────────────────────────────────

export const createAchat = (data: unknown) =>
  proxyFetch('/achats', { method: 'POST', body: JSON.stringify(data) });

export const updateAchat = (id: string, data: unknown) =>
  proxyFetch(`/achats/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteAchat = (id: string) =>
  proxyFetch(`/achats/${id}`, { method: 'DELETE' });

// ── Categories ──────────────────────────────────────────────────────

export const createCategorie = (data: unknown) =>
  proxyFetch('/categories', { method: 'POST', body: JSON.stringify(data) });

export const updateCategorie = (id: string, data: unknown) =>
  proxyFetch(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteCategorie = (id: string) =>
  proxyFetch(`/categories/${id}`, { method: 'DELETE' });

export const createCategorieOption = (categorieId: string, data: unknown) =>
  proxyFetch(`/categories/${categorieId}/options`, { method: 'POST', body: JSON.stringify(data) });

export const updateCategorieOption = (categorieId: string, optionId: string, data: unknown) =>
  proxyFetch(`/categories/${categorieId}/options/${optionId}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteCategorieOption = (categorieId: string, optionId: string) =>
  proxyFetch(`/categories/${categorieId}/options/${optionId}`, { method: 'DELETE' });

export const uploadCategorieImage = async (categorieId: string, file: File) => {
  const formData = new FormData();
  formData.append('image', file);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120_000);

  try {
    const res = await fetch(`${API_URL}/categories/${categorieId}/image`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
      signal: controller.signal,
    });
    if (!res.ok) throw new ClientApiError(res.status, 'Échec upload');
    return res.json();
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ClientApiError(0, 'L\'upload a expiré. Vérifiez votre connexion et réessayez.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};

// ── Produits ────────────────────────────────────────────────────────

export interface CatalogueProduit {
  id: string;
  nom: string;
  categorie_id: string | null;
  prix_base: number;
  prix_vente: number;
  prix_main_oeuvre: number;
  dimensions: Array<{ label: string; prix_base: number; prix_vente: number; prix_main_oeuvre: number }>;
}

export const getProduitsParCategorie = (categorieId: string) =>
  clientFetch<{ data: CatalogueProduit[] }>(`/produits?categorie_id=${encodeURIComponent(categorieId)}&limit=200`);

export const createProduit = (data: unknown) =>
  clientFetch('/produits', { method: 'POST', body: JSON.stringify(data) });

export const updateProduit = (id: string, data: unknown) =>
  clientFetch(`/produits/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const deleteProduit = (id: string) =>
  clientFetch(`/produits/${id}`, { method: 'DELETE' });

// ── Phase 2 — Public boutique ────────────────────────────────────────

export const createPublicCommande = (data: unknown) =>
  clientFetch('/commandes/public', { method: 'POST', body: JSON.stringify(data) });
