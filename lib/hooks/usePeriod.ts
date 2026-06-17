'use client';
import { useState } from 'react';

export type Periode = 'day' | 'week' | 'month' | '6months' | 'year' | 'custom';

export interface PeriodState {
  periode: Periode;
  dateDebut?: string;
  dateFin?: string;
}

export function usePeriod(initial: Periode = 'month') {
  const [state, setState] = useState<PeriodState>({ periode: initial });

  const setPeriode = (periode: Periode) => setState({ periode });
  const setCustomRange = (dateDebut: string, dateFin: string) =>
    setState({ periode: 'custom', dateDebut, dateFin });

  const toParams = (): Record<string, string> => {
    const p: Record<string, string> = { periode: state.periode };
    if (state.periode === 'custom' && state.dateDebut && state.dateFin) {
      p.date_debut = state.dateDebut;
      p.date_fin = state.dateFin;
    }
    return p;
  };

  return { ...state, setPeriode, setCustomRange, toParams };
}
