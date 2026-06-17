'use client';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { formatMontant, formatDateShort } from '@/lib/formatters';

interface DataPoint {
  periode: string;
  revenus: number;
  depenses: number;
  benefice: number;
}

const SERIES = [
  { key: 'revenus',  label: 'Revenus',  color: '#C5A059', gradId: 'gradRev', dash: false },
  { key: 'depenses', label: 'Dépenses', color: '#EF4444', gradId: 'gradDep', dash: false },
  { key: 'benefice', label: 'Bénéfice', color: '#16A34A', gradId: 'gradBen', dash: true  },
];

const TICK_STYLE = {
  fontSize: 11,
  fill: '#9CA3AF',
  fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
};

const ORIGIN_KEY = '__origin__';

function getXTick(period: string | undefined, value: string): string {
  if (!value) return '';
  if (value === ORIGIN_KEY) return '0';
  try {
    if (period === 'week') {
      const d = new Date(value.replace(/-/g, '/'));
      return d.toLocaleDateString('fr-FR', { weekday: 'short' });
    }
    if (period === 'month') {
      const d = new Date(value.replace(/-/g, '/'));
      return `S${Math.ceil(d.getDate() / 7)}`;
    }
    return new Date(value.replace(/-/g, '/')).toLocaleDateString('fr-FR', { month: 'short' });
  } catch {
    return formatDateShort(value);
  }
}

const CustomTooltip = ({ active, payload, label }: Record<string, unknown>) => {
  if (!(active as boolean) || !(payload as unknown[])?.length) return null;
  if ((label as string) === ORIGIN_KEY) return null;
  return (
    <div
      className="min-w-[200px] rounded-2xl p-4 text-sm"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid rgba(197,160,89,0.20)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.10)',
      }}
    >
      <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
        {formatDateShort(label as string)}
      </p>
      {(payload as Array<{ name: string; value: number; color: string }>).map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-6 mb-2 last:mb-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-neutral-500 text-xs font-medium">{entry.name}</span>
          </div>
          <span className="text-sm font-bold tabular-nums" style={{ color: entry.color }}>
            {formatMontant(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function RevenueLineChart({ data, period }: { data: DataPoint[]; period?: string }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-300 text-sm text-center px-4">
        {period === 'day'
          ? "Vue horaire non disponible — sélectionnez une autre période"
          : "Aucune donnée pour cette période"}
      </div>
    );
  }

  // Prepend a zero-origin point so every series starts from the left axis at 0
  const chartData: DataPoint[] = [
    { periode: ORIGIN_KEY, revenus: 0, depenses: 0, benefice: 0 },
    ...data,
  ];

  return (
    <div>
      <ResponsiveContainer width="100%" height={272}>
        <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 8 }}>
          <defs>
            {SERIES.map(({ gradId, color }) => (
              <linearGradient key={gradId} id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={color} stopOpacity={0.12} />
                <stop offset="100%" stopColor={color} stopOpacity={0}    />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />

          <XAxis
            dataKey="periode"
            tickFormatter={(v) => getXTick(period, v)}
            tick={TICK_STYLE}
            axisLine={false}
            tickLine={false}
            dy={6}
          />
          <YAxis
            domain={[0, 'auto']}
            allowDataOverflow={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            tick={TICK_STYLE}
            axisLine={false}
            tickLine={false}
            width={44}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: 'rgba(197,160,89,0.22)', strokeWidth: 1, strokeDasharray: '4 2' }}
          />

          {SERIES.map(({ key, label, color, gradId, dash }) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              name={label}
              stroke={color}
              strokeWidth={2}
              strokeDasharray={dash ? '6 4' : undefined}
              fill={`url(#${gradId})`}
              dot={false}
              activeDot={{ r: 4, fill: color, strokeWidth: 2, stroke: '#fff' }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-center gap-7 mt-6">
        {SERIES.map(({ key, label, color, dash }) => (
          <div key={key} className="flex items-center gap-2">
            <svg width="18" height="2" viewBox="0 0 18 2">
              {dash ? (
                <line x1="0" y1="1" x2="18" y2="1" stroke={color} strokeWidth="2" strokeDasharray="5 3" />
              ) : (
                <line x1="0" y1="1" x2="18" y2="1" stroke={color} strokeWidth="2" />
              )}
            </svg>
            <span className="text-xs font-medium text-neutral-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
