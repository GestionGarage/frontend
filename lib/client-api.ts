"use client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/admin";
const BACKEND_ORIGIN = API_URL.replace(/\/admin$/, "");
const REQUEST_TIMEOUT_MS = API_URL.includes("localhost") ? 15_000 : 65_000;
export const SLOW_REQUEST_THRESHOLD_MS = 5_000;

export class ClientApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly errors?: Array<{ field: string; message: string }>,
  ) {
    super(message);
    this.name = "ClientApiError";
  }
}

async function clientFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: controller.signal,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (res.status === 204) return undefined as T;

    const body = (await res.json()) as Record<string, unknown>;

    if (!res.ok) {
      throw new ClientApiError(
        res.status,
        (body.message as string) ?? "Erreur",
        body.errors as Array<{ field: string; message: string }> | undefined,
      );
    }

    return body as T;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ClientApiError(
        0,
        "Le serveur met trop de temps à répondre. Veuillez réessayer dans quelques secondes.",
      );
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function proxyFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`/api/proxy${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (res.status === 204) return undefined as T;

    const body = (await res.json()) as Record<string, unknown>;

    if (!res.ok) {
      throw new ClientApiError(
        res.status,
        (body.message as string) ?? "Erreur",
        body.errors as Array<{ field: string; message: string }> | undefined,
      );
    }

    return body as T;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ClientApiError(
        0,
        "Le serveur met trop de temps à répondre. Veuillez réessayer dans quelques secondes.",
      );
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function pingBackend(): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000); 
  try {
    await fetch(`${BACKEND_ORIGIN}/health`, {
      method: "GET",
      credentials: "omit",
      cache: "no-store",
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
  clientFetch<{
    data: { access_token: string; expires_in: number; user: object };
  }>("/login", { method: "POST", body: JSON.stringify(data) });

// Clears both the Render-domain JWT cookie (via the backend) and the
// Vercel-domain session cookie (via the Next.js API route) in parallel.
export const logout = async (): Promise<void> => {
  await Promise.allSettled([
    clientFetch("/logout", { method: "POST" }),
    fetch("/api/auth/session", { method: "DELETE" }),
  ]);
};

export const getMe = () => clientFetch("/me");

// ── Commandes ───────────────────────────────────────────────────────

export const createCommande = (data: unknown) =>
  proxyFetch("/commandes", { method: "POST", body: JSON.stringify(data) });

export const updateCommande = (id: string, data: unknown) =>
  proxyFetch(`/commandes/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const updateCommandeStatut = (id: string, statut: string) =>
  proxyFetch(`/commandes/${id}/statut`, {
    method: "PATCH",
    body: JSON.stringify({ statut }),
  });

export const deleteCommande = (id: string) =>
  proxyFetch(`/commandes/${id}`, { method: "DELETE" });

// ── Vehicule ────────────────────────────────────────────────────────

export const createVehiculeDepense = (data: unknown) =>
  proxyFetch("/vehicule/depenses", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateVehiculeDepense = (id: string, data: unknown) =>
  proxyFetch(`/vehicule/depenses/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteVehiculeDepense = (id: string) =>
  proxyFetch(`/vehicule/depenses/${id}`, { method: "DELETE" });

// ── Achats ──────────────────────────────────────────────────────────

export const createAchat = (data: unknown) =>
  proxyFetch("/achats", { method: "POST", body: JSON.stringify(data) });

export const updateAchat = (id: string, data: unknown) =>
  proxyFetch(`/achats/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteAchat = (id: string) =>
  proxyFetch(`/achats/${id}`, { method: "DELETE" });

// ── Categories ──────────────────────────────────────────────────────

export const createCategorie = (data: unknown) =>
  proxyFetch("/categories", { method: "POST", body: JSON.stringify(data) });

export const updateCategorie = (id: string, data: unknown) =>
  proxyFetch(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteCategorie = (id: string) =>
  proxyFetch(`/categories/${id}`, { method: "DELETE" });

export const createCategorieOption = (categorieId: string, data: unknown) =>
  proxyFetch(`/categories/${categorieId}/options`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateCategorieOption = (
  categorieId: string,
  optionId: string,
  data: unknown,
) =>
  proxyFetch(`/categories/${categorieId}/options/${optionId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteCategorieOption = (categorieId: string, optionId: string) =>
  proxyFetch(`/categories/${categorieId}/options/${optionId}`, {
    method: "DELETE",
  });

export const uploadCategorieImage = async (categorieId: string, file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120_000);

  try {
    const res = await fetch(`${API_URL}/categories/${categorieId}/image`, {
      method: "POST",
      credentials: "include",
      body: formData,
      signal: controller.signal,
    });
    if (!res.ok) throw new ClientApiError(res.status, "Échec upload");
    return res.json();
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ClientApiError(
        0,
        "L'upload a expiré. Vérifiez votre connexion et réessayez.",
      );
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
  dimensions: Array<{
    label: string;
    prix_base: number;
    prix_vente: number;
    prix_main_oeuvre: number;
  }>;
}

export const getProduitsParCategorie = (categorieId: string) =>
  clientFetch<{ data: CatalogueProduit[] }>(
    `/produits?categorie_id=${encodeURIComponent(categorieId)}&limit=200`,
  );

export const createProduit = (data: unknown) =>
  clientFetch("/produits", { method: "POST", body: JSON.stringify(data) });

export const updateProduit = (id: string, data: unknown) =>
  clientFetch(`/produits/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteProduit = (id: string) =>
  clientFetch(`/produits/${id}`, { method: "DELETE" });

// ── Phase 2 — Public boutique ────────────────────────────────────────

export const createPublicCommande = (data: unknown) =>
  clientFetch("/commandes/public", {
    method: "POST",
    body: JSON.stringify(data),
  });
