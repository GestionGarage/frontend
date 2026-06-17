'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';
import { formatMontant } from '@/lib/formatters';

/* ─── Static data ─── */
const HISTORICAL_DATA: Record<string, Array<{
  mois: string; chiffre_affaires: number; cout_matieres: number;
  depenses_vehicule: number; benefice: number; nb_commandes: number;
}>> = {
  '2026': [
    { mois: '2026-06', chiffre_affaires: 847500, cout_matieres: 398200, depenses_vehicule: 136900, benefice: 312400, nb_commandes: 24 },
    { mois: '2026-05', chiffre_affaires: 820000, cout_matieres: 380000, depenses_vehicule: 130000, benefice: 310000, nb_commandes: 22 },
    { mois: '2026-04', chiffre_affaires: 940000, cout_matieres: 450000, depenses_vehicule: 140000, benefice: 350000, nb_commandes: 28 },
    { mois: '2026-03', chiffre_affaires: 760000, cout_matieres: 310000, depenses_vehicule: 135000, benefice: 315000, nb_commandes: 19 },
    { mois: '2026-02', chiffre_affaires: 890000, cout_matieres: 410000, depenses_vehicule: 110000, benefice: 370000, nb_commandes: 26 },
    { mois: '2026-01', chiffre_affaires: 580000, cout_matieres: 260000, depenses_vehicule: 135000, benefice: 185000, nb_commandes: 15 },
  ],
  '2025': [
    { mois: '2025-12', chiffre_affaires: 730000, cout_matieres: 340000, depenses_vehicule: 140000, benefice: 250000, nb_commandes: 20 },
    { mois: '2025-11', chiffre_affaires: 620000, cout_matieres: 300000, depenses_vehicule: 110000, benefice: 210000, nb_commandes: 18 },
    { mois: '2025-10', chiffre_affaires: 710000, cout_matieres: 320000, depenses_vehicule: 125000, benefice: 265000, nb_commandes: 21 },
    { mois: '2025-09', chiffre_affaires: 680000, cout_matieres: 295000, depenses_vehicule: 120000, benefice: 265000, nb_commandes: 19 },
    { mois: '2025-08', chiffre_affaires: 560000, cout_matieres: 240000, depenses_vehicule: 115000, benefice: 205000, nb_commandes: 16 },
    { mois: '2025-07', chiffre_affaires: 490000, cout_matieres: 210000, depenses_vehicule: 105000, benefice: 175000, nb_commandes: 14 },
    { mois: '2025-06', chiffre_affaires: 630000, cout_matieres: 285000, depenses_vehicule: 118000, benefice: 227000, nb_commandes: 17 },
    { mois: '2025-05', chiffre_affaires: 720000, cout_matieres: 330000, depenses_vehicule: 122000, benefice: 268000, nb_commandes: 20 },
    { mois: '2025-04', chiffre_affaires: 810000, cout_matieres: 365000, depenses_vehicule: 130000, benefice: 315000, nb_commandes: 23 },
    { mois: '2025-03', chiffre_affaires: 690000, cout_matieres: 305000, depenses_vehicule: 128000, benefice: 257000, nb_commandes: 19 },
    { mois: '2025-02', chiffre_affaires: 520000, cout_matieres: 225000, depenses_vehicule: 112000, benefice: 183000, nb_commandes: 14 },
    { mois: '2025-01', chiffre_affaires: 480000, cout_matieres: 205000, depenses_vehicule: 108000, benefice: 167000, nb_commandes: 13 },
  ],
  '2024': [
    { mois: '2024-12', chiffre_affaires: 650000, cout_matieres: 290000, depenses_vehicule: 125000, benefice: 235000, nb_commandes: 18 },
    { mois: '2024-11', chiffre_affaires: 580000, cout_matieres: 265000, depenses_vehicule: 118000, benefice: 197000, nb_commandes: 16 },
    { mois: '2024-10', chiffre_affaires: 620000, cout_matieres: 275000, depenses_vehicule: 120000, benefice: 225000, nb_commandes: 17 },
    { mois: '2024-09', chiffre_affaires: 590000, cout_matieres: 258000, depenses_vehicule: 115000, benefice: 217000, nb_commandes: 16 },
    { mois: '2024-08', chiffre_affaires: 460000, cout_matieres: 205000, depenses_vehicule: 110000, benefice: 145000, nb_commandes: 13 },
    { mois: '2024-07', chiffre_affaires: 410000, cout_matieres: 185000, depenses_vehicule: 102000, benefice: 123000, nb_commandes: 11 },
    { mois: '2024-06', chiffre_affaires: 520000, cout_matieres: 238000, depenses_vehicule: 112000, benefice: 170000, nb_commandes: 15 },
    { mois: '2024-05', chiffre_affaires: 610000, cout_matieres: 275000, depenses_vehicule: 118000, benefice: 217000, nb_commandes: 17 },
    { mois: '2024-04', chiffre_affaires: 680000, cout_matieres: 305000, depenses_vehicule: 122000, benefice: 253000, nb_commandes: 19 },
    { mois: '2024-03', chiffre_affaires: 570000, cout_matieres: 250000, depenses_vehicule: 115000, benefice: 205000, nb_commandes: 16 },
    { mois: '2024-02', chiffre_affaires: 440000, cout_matieres: 195000, depenses_vehicule: 108000, benefice: 137000, nb_commandes: 12 },
    { mois: '2024-01', chiffre_affaires: 390000, cout_matieres: 172000, depenses_vehicule: 105000, benefice: 113000, nb_commandes: 11 },
  ],
};

const YEARS = Object.keys(HISTORICAL_DATA).sort((a, b) => Number(b) - Number(a));

const MONTH_NAMES_SHORT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
const MONTH_NAMES_FULL  = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

/* ─── Week data generator ─── */
const WEEK_DIST = [0.29, 0.26, 0.24, 0.21];

interface WeekRow {
  label: string;
  ca: number;
  matieres: number;
  vehicule: number;
  benefice: number;
  commandes: number;
}

function getWeeksForMonth(row: typeof HISTORICAL_DATA['2026'][0]): WeekRow[] {
  return WEEK_DIST.map((w, i) => ({
    label: `Semaine ${i + 1}`,
    ca:        Math.round(row.chiffre_affaires   * w),
    matieres:  Math.round(row.cout_matieres      * w),
    vehicule:  Math.round(row.depenses_vehicule  * w),
    benefice:  Math.round(row.benefice           * w),
    commandes: Math.max(1, Math.round(row.nb_commandes * w)),
  }));
}

/* ─── Day breakdown generator ─── */
const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const DAY_DIST  = [0.20, 0.17, 0.16, 0.15, 0.14, 0.11, 0.07];

function getDaysForWeek(week: WeekRow): WeekRow[] {
  return DAY_NAMES.map((name, i) => ({
    label:     name,
    ca:        Math.round(week.ca       * DAY_DIST[i]),
    matieres:  Math.round(week.matieres * DAY_DIST[i]),
    vehicule:  Math.round(week.vehicule * DAY_DIST[i]),
    benefice:  Math.round(week.benefice * DAY_DIST[i]),
    commandes: i < 5 ? Math.max(0, Math.round(week.commandes * DAY_DIST[i])) : 0,
  }));
}

/* ─── Table row component ─── */
function DataRow({
  label, ca, matieres, vehicule, benefice, commandes, isExpanded, onToggle, indent, isDay,
}: WeekRow & { isExpanded?: boolean; onToggle?: () => void; indent?: boolean; isDay?: boolean }) {
  const depenses = matieres + vehicule;
  const isProfit = benefice >= 0;
  return (
    <tr
      onClick={onToggle}
      className={`transition-colors ${onToggle ? 'cursor-pointer hover:bg-neutral-50' : ''} ${isDay ? 'bg-neutral-50/50' : ''}`}
      style={{ borderTop: '1px solid rgba(197,160,89,0.07)' }}
    >
      <td className="table-td font-semibold text-neutral-700">
        <div className="flex items-center gap-2" style={indent ? { paddingLeft: '1.5rem' } : {}}>
          {onToggle && (
            <ChevronDown
              size={12}
              className="text-neutral-400 flex-shrink-0 transition-transform duration-200"
              style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}
            />
          )}
          {isDay && <span className="w-1 h-1 rounded-full bg-neutral-300 flex-shrink-0" />}
          <span className={isDay ? 'text-neutral-500 font-medium' : ''}>{label}</span>
        </div>
      </td>
      <td className="table-td text-right font-bold tabular-nums" style={{ color: '#C5A059' }}>
        {ca > 0 ? formatMontant(ca) : <span className="text-neutral-300">—</span>}
      </td>
      <td className="table-td text-right tabular-nums text-neutral-500 hidden sm:table-cell">
        {matieres > 0 ? formatMontant(matieres) : <span className="text-neutral-300">—</span>}
      </td>
      <td className="table-td text-right tabular-nums text-neutral-500 hidden md:table-cell">
        {vehicule > 0 ? formatMontant(vehicule) : <span className="text-neutral-300">—</span>}
      </td>
      <td className="table-td text-right tabular-nums text-neutral-400 hidden lg:table-cell">
        {depenses > 0 ? formatMontant(depenses) : <span className="text-neutral-300">—</span>}
      </td>
      <td className="table-td text-right">
        {benefice !== 0 ? (
          <span
            className="inline-flex items-center gap-1 font-bold tabular-nums text-sm"
            style={{ color: isProfit ? '#A8863A' : '#64748B' }}
          >
            {isProfit ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {formatMontant(benefice)}
          </span>
        ) : <span className="text-neutral-300 text-sm">—</span>}
      </td>
      <td className="table-td text-right text-neutral-500 font-semibold">
        {commandes > 0 ? commandes : <span className="text-neutral-300">—</span>}
      </td>
    </tr>
  );
}

export default function HistoriqueMensuelClient() {
  const [selectedYear,  setSelectedYear]  = useState(YEARS[0]);
  const [selectedMonth, setSelectedMonth] = useState('06');
  const [expandedWeek,  setExpandedWeek]  = useState<number | null>(null);

  const availableMonths = useMemo(() =>
    new Set(HISTORICAL_DATA[selectedYear]?.map((r) => r.mois.split('-')[1]) ?? []),
    [selectedYear],
  );

  const monthKey = `${selectedYear}-${selectedMonth}`;
  const monthRow = useMemo(() =>
    HISTORICAL_DATA[selectedYear]?.find((r) => r.mois === monthKey),
    [selectedYear, selectedMonth, monthKey],
  );

  const weeks = useMemo(() => (monthRow ? getWeeksForMonth(monthRow) : []), [monthRow]);

  const handleMonthSelect = (monthNum: string) => {
    if (!availableMonths.has(monthNum)) return;
    setSelectedMonth(monthNum);
    setExpandedWeek(null);
  };

  const toggleWeek = (idx: number) =>
    setExpandedWeek((prev) => (prev === idx ? null : idx));

  const monthIdx = parseInt(selectedMonth, 10) - 1;

  return (
    <div className="space-y-6">
      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-4">
        {/* Year selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Année</span>
          <div
            className="flex items-center rounded-xl p-1 gap-0.5"
            style={{ backgroundColor: '#F8F7F4', border: '1px solid rgba(197,160,89,0.12)' }}
          >
            {YEARS.map((year) => {
              const isActive = selectedYear === year;
              return (
                <button
                  key={year}
                  onClick={() => { setSelectedYear(year); setExpandedWeek(null); }}
                  className="relative px-4 py-1.5 text-sm font-semibold rounded-lg transition-all duration-150"
                  style={{ color: isActive ? '#FFFFFF' : '#6B7280' }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="hist-year-pill"
                      className="absolute inset-0 rounded-lg"
                      style={{ backgroundColor: '#A8863A' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{year}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Month grid */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Mois</span>
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1">
            {MONTH_NAMES_SHORT.map((name, i) => {
              const monthNum  = String(i + 1).padStart(2, '0');
              const isActive  = selectedMonth === monthNum;
              const available = availableMonths.has(monthNum);
              return (
                <button
                  key={monthNum}
                  onClick={() => handleMonthSelect(monthNum)}
                  disabled={!available}
                  className="relative px-2 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150"
                  style={{
                    color:           isActive ? '#FFFFFF' : available ? '#374151' : '#D1D5DB',
                    backgroundColor: isActive ? '#C5A059' : 'transparent',
                    cursor:          available ? 'pointer' : 'not-allowed',
                  }}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      {monthRow ? (
        <motion.div
          key={monthKey}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(197,160,89,0.12)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
        >
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(197,160,89,0.10)', backgroundColor: '#F8F7F4' }}
          >
            <div>
              <h3 className="font-bold text-sm text-neutral-700 uppercase tracking-wider">
                {MONTH_NAMES_FULL[monthIdx]} {selectedYear}
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Cliquez sur une semaine pour voir le détail jour par jour
              </p>
            </div>
            <div
              className="text-right text-xs text-neutral-500 font-medium px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: 'rgba(197,160,89,0.06)', border: '1px solid rgba(197,160,89,0.12)' }}
            >
              {monthRow.nb_commandes} commandes
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: '#FAFAFA', borderBottom: '1px solid rgba(197,160,89,0.08)' }}>
                  {['Période', 'CA', 'Matières', 'Véhicule', 'Dép. totales', 'Bénéfice', 'Cmds'].map((h, i) => (
                    <th
                      key={h}
                      className="table-th"
                      style={{ textAlign: i === 0 ? 'left' : 'right' }}
                    >
                      <span className={i === 2 ? 'hidden sm:inline' : i === 3 ? 'hidden md:inline' : i === 4 ? 'hidden lg:inline' : ''}>
                        {h}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeks.map((week, wIdx) => (
                  <>
                    <DataRow
                      key={`week-${wIdx}`}
                      {...week}
                      isExpanded={expandedWeek === wIdx}
                      onToggle={() => toggleWeek(wIdx)}
                    />
                    <AnimatePresence>
                      {expandedWeek === wIdx && (
                        getDaysForWeek(week).map((day, dIdx) => (
                          <motion.tr
                            key={`day-${wIdx}-${dIdx}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.12, delay: dIdx * 0.02 }}
                            className="bg-neutral-50/50"
                            style={{ borderTop: '1px solid rgba(197,160,89,0.05)' }}
                          >
                            <td className="table-td" style={{ paddingLeft: '2.25rem' }}>
                              <div className="flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-neutral-300 flex-shrink-0" />
                                <span className="text-neutral-500 font-medium text-xs">{day.label}</span>
                              </div>
                            </td>
                            <td className="table-td text-right tabular-nums text-xs" style={{ color: day.ca > 0 ? '#C5A059' : '#D1D5DB' }}>
                              {day.ca > 0 ? formatMontant(day.ca) : '—'}
                            </td>
                            <td className="table-td text-right tabular-nums text-xs text-neutral-400 hidden sm:table-cell">
                              {day.matieres > 0 ? formatMontant(day.matieres) : '—'}
                            </td>
                            <td className="table-td text-right tabular-nums text-xs text-neutral-400 hidden md:table-cell">
                              {day.vehicule > 0 ? formatMontant(day.vehicule) : '—'}
                            </td>
                            <td className="table-td text-right tabular-nums text-xs text-neutral-300 hidden lg:table-cell">
                              {(day.matieres + day.vehicule) > 0 ? formatMontant(day.matieres + day.vehicule) : '—'}
                            </td>
                            <td className="table-td text-right tabular-nums text-xs" style={{ color: day.benefice >= 0 ? '#A8863A' : '#64748B' }}>
                              {day.benefice !== 0 ? formatMontant(day.benefice) : '—'}
                            </td>
                            <td className="table-td text-right text-xs text-neutral-400">
                              {day.commandes > 0 ? day.commandes : '—'}
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </AnimatePresence>
                  </>
                ))}
              </tbody>

              <tfoot>
                <tr style={{ backgroundColor: 'rgba(197,160,89,0.04)', borderTop: '2px solid rgba(197,160,89,0.15)' }}>
                  <td className="table-td font-bold text-neutral-700">
                    Total {MONTH_NAMES_SHORT[monthIdx]}
                  </td>
                  <td className="table-td text-right font-bold tabular-nums" style={{ color: '#C5A059' }}>
                    {formatMontant(monthRow.chiffre_affaires)}
                  </td>
                  <td className="table-td text-right tabular-nums font-semibold text-neutral-600 hidden sm:table-cell">
                    {formatMontant(monthRow.cout_matieres)}
                  </td>
                  <td className="table-td text-right tabular-nums font-semibold text-neutral-600 hidden md:table-cell">
                    {formatMontant(monthRow.depenses_vehicule)}
                  </td>
                  <td className="table-td text-right tabular-nums font-semibold text-neutral-600 hidden lg:table-cell">
                    {formatMontant(monthRow.cout_matieres + monthRow.depenses_vehicule)}
                  </td>
                  <td className="table-td text-right font-bold tabular-nums" style={{ color: '#A8863A' }}>
                    <span className="inline-flex items-center gap-1">
                      <TrendingUp size={11} />
                      {formatMontant(monthRow.benefice)}
                    </span>
                  </td>
                  <td className="table-td text-right font-semibold text-neutral-700">
                    {monthRow.nb_commandes}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </motion.div>
      ) : (
        <div
          className="rounded-2xl p-16 flex flex-col items-center justify-center text-center"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(197,160,89,0.12)' }}
        >
          <p className="text-sm font-semibold text-neutral-500">Aucune donnée pour ce mois</p>
          <p className="text-xs text-neutral-400 mt-1">Sélectionnez un mois disponible dans la grille ci-dessus.</p>
        </div>
      )}
    </div>
  );
}
