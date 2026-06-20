import '../styles/globals.css';
import KeepAlive from '@/components/layout/KeepAlive';

export const metadata= {
  title: { default: 'GestionGarage — SIHAMDA FERRONNIER', template: '%s | GestionGarage' },
  description: 'Système de gestion financière pour artisan ferronnier',
  robots: 'noindex',
  icons: {
    icon: '/anvil.svg',
    shortcut: '/anvil.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <KeepAlive />
        {children}
      </body>
    </html>
  );
}
