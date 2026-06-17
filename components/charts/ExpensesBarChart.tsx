'use client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { formatMontant } from '@/lib/formatters';

interface MonthlyData {
  mois: string;
  chiffre_affaires: number;
  depenses: number;
  benefice: number;
}

const COLORS = {
  ca:       '#2563EB',
  depenses: '#DC2626',
  benefice: '#059669',
};

const LEGEND_ITEMS = [
  { key: 'ca',       label: 'CA',       color: COLORS.ca },
  { key: 'depenses', label: 'Dépenses', color: COLORS.depenses },
  { key: 'benefice', label: 'Bénéfice', color: COLORS.benefice },
];

const TICK_STYLE = { fontSize: 11, fill: '#9CA3AF', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' };

const CustomTooltip = ({ active, payload, label }: Record<string, unknown>) => {
  if (!(active as boolean) || !(payload as unknown[])?.length) return null;
  return (
    <div
      className="rounded-xl p-3.5 text-sm"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid rgba(197,160,89,0.18)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
      }}
    >
      <p className="font-display text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">{label as string}</p>
      {(payload as Array<{ name: string; value: number; color: string }>).map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: entry.color }} />
            <span className="text-neutral-500 text-xs font-display">{entry.name}</span>
          </div>
          <span className="font-mono text-xs font-semibold" style={{ color: entry.color }}>
            {formatMontant(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function ExpensesBarChart({ data }: { data: MonthlyData[] }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-300 text-sm">
        Aucune donnée disponible
      </div>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={248}>
        <BarChart data={data} margin={{ top: 10, right: 12, left: 4, bottom: 4 }} barGap={4}>
          <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.05)" vertical={false} />
          <XAxis
            dataKey="mois"
            tick={TICK_STYLE}
            axisLine={false}
            tickLine={false}
            dy={6}
          />
          <YAxis
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            tick={TICK_STYLE}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(197,160,89,0.04)' }} />
          <Bar dataKey="chiffre_affaires" name="CA"       fill={COLORS.ca}       radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="depenses"         name="Dépenses" fill={COLORS.depenses} radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="benefice"         name="Bénéfice" fill={COLORS.benefice} radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-center gap-5 mt-2">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.key} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
            <span className="text-xs font-display text-neutral-400">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
