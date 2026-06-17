export interface DimensionModel {
  label: string;
  prix_base: number;
  prix_vente: number;
}

export interface Produit {
  id: string;
  nom: string;
  categorie_id: string;
  categorie_nom: string;
  prix_base: number;
  prix_vente: number;
  image_url: string;
  gallery_urls: string[];
  dimensions: DimensionModel[];
  created_at: string;
}

const KEY = 'forge_produits_v1';

type StoredProduit = Omit<Produit, 'dimensions'> & {
  dimensions?: Array<DimensionModel | string>;
};

function read(): Produit[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]') as StoredProduit[];
    return raw.map((p) => ({
      ...p,
      dimensions: (p.dimensions ?? []).map((d): DimensionModel =>
        typeof d === 'string'
          ? { label: d, prix_base: p.prix_base, prix_vente: p.prix_vente }
          : d
      ),
    }));
  } catch {
    return [];
  }
}

function write(list: Produit[]): void {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function getProduits(): Produit[] {
  return read();
}

export function addProduit(data: Omit<Produit, 'id' | 'created_at'>): Produit {
  const list = read();
  const item: Produit = {
    ...data,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  write([item, ...list]);
  return item;
}

export function deleteProduit(id: string): void {
  write(read().filter((p) => p.id !== id));
}

export function updateProduit(id: string, data: Partial<Omit<Produit, 'id' | 'created_at'>>): Produit | null {
  const list = read();
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const updated: Produit = { ...list[idx], ...data };
  list[idx] = updated;
  write(list);
  return updated;
}
