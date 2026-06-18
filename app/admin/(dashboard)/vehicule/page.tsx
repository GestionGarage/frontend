import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import VehiculePageClient from './VehiculePageClient';

export const metadata: Metadata = { title: 'Véhicule — MOBILE ART ERP' };

export default function VehiculePage() {
  return (
    <>
      <Header
        title="Suivi Véhicule"
        breadcrumb={[{ label: 'Véhicule' }]}
      />
      <VehiculePageClient />
    </>
  );
}
