
export const metadata= {
  title: { default: 'Boutique Ferronnier', template: '%s | Boutique Ferronnier' },
  description: 'Commandez vos meubles et aménagements en fer forgé sur mesure',
  robots: 'index, follow',
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Ferronnier Artisan</h1>
            <p className="text-xs text-neutral-500">Création sur mesure en fer forgé</p>
          </div>
          <a href="/boutique/commande" className="btn-primary text-sm">
            Passer une commande
          </a>
        </div>
      </header>
      <main>{children}</main>
      <footer className="bg-white border-t border-neutral-200 mt-16 py-8 text-center text-sm text-neutral-400">
        <p>© {new Date().getFullYear()} Ferronnier Artisan — Tous droits réservés</p>
      </footer>
    </div>
  );
}
