'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/admin';

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

async function clientFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
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
}

// Auth — controller is mounted at root so paths are /login, /logout, /me
export const login = (data: { username: string; password: string }) =>
  clientFetch('/login', { method: 'POST', body: JSON.stringify(data) });

export const logout = () =>
  clientFetch('/logout', { method: 'POST' });

export const getMe = () =>
  clientFetch('/me');

// Commandes
export const createCommande = (data: unknown) =>
  clientFetch('/commandes', { method: 'POST', body: JSON.stringify(data) });

export const updateCommande = (id: string, data: unknown) =>
  clientFetch(`/commandes/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const updateCommandeStatut = (id: string, statut: string) =>
  clientFetch(`/commandes/${id}/statut`, { method: 'PATCH', body: JSON.stringify({ statut }) });

export const deleteCommande = (id: string) =>
  clientFetch(`/commandes/${id}`, { method: 'DELETE' });

// Vehicule
export const createVehiculeDepense = (data: unknown) =>
  clientFetch('/vehicule/depenses', { method: 'POST', body: JSON.stringify(data) });

export const updateVehiculeDepense = (id: string, data: unknown) =>
  clientFetch(`/vehicule/depenses/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteVehiculeDepense = (id: string) =>
  clientFetch(`/vehicule/depenses/${id}`, { method: 'DELETE' });

// Achats
export const createAchat = (data: unknown) =>
  clientFetch('/achats', { method: 'POST', body: JSON.stringify(data) });

export const updateAchat = (id: string, data: unknown) =>
  clientFetch(`/achats/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteAchat = (id: string) =>
  clientFetch(`/achats/${id}`, { method: 'DELETE' });

// Categories
export const createCategorie = (data: unknown) =>
  clientFetch('/categories', { method: 'POST', body: JSON.stringify(data) });

export const updateCategorie = (id: string, data: unknown) =>
  clientFetch(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteCategorie = (id: string) =>
  clientFetch(`/categories/${id}`, { method: 'DELETE' });

export const createCategorieOption = (categorieId: string, data: unknown) =>
  clientFetch(`/categories/${categorieId}/options`, { method: 'POST', body: JSON.stringify(data) });

export const updateCategorieOption = (categorieId: string, optionId: string, data: unknown) =>
  clientFetch(`/categories/${categorieId}/options/${optionId}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteCategorieOption = (categorieId: string, optionId: string) =>
  clientFetch(`/categories/${categorieId}/options/${optionId}`, { method: 'DELETE' });

export const uploadCategorieImage = async (categorieId: string, file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch(`${API_URL}/categories/${categorieId}/image`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  if (!res.ok) throw new ClientApiError(res.status, 'Échec upload');
  return res.json();
};

// Produits
export const createProduit = (data: unknown) =>
  clientFetch('/produits', { method: 'POST', body: JSON.stringify(data) });

export const updateProduit = (id: string, data: unknown) =>
  clientFetch(`/produits/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const deleteProduit = (id: string) =>
  clientFetch(`/produits/${id}`, { method: 'DELETE' });

// Phase 2 — Public boutique
export const createPublicCommande = (data: unknown) =>
  clientFetch('/commandes/public', { method: 'POST', body: JSON.stringify(data) });
