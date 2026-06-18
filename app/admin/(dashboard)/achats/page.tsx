import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import AchatsPageClient from './AchatsPageClient';

export const metadata: Metadata = { title: 'Achats & Fournitures — MOBILE ART ERP' };

export default function AchatsPage() {
  return (
    <>
      <Header
        title="Achats & Fournitures"
        breadcrumb={[{ label: 'Achats' }]}
      />
      <AchatsPageClient />
    </>
  );
}
