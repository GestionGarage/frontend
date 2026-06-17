'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatMontant } from '@/lib/formatters';

interface PieSlice {
  name: string;
  value: number;
  color: string;
}

const CustomTooltip = ({ active, payload }: Record<string, unknown>) => {
  if (!(active as boolean) || !(payload as unknown[])?.length) return null;
  const entry = (payload as Array<{ name: string; value: number; payload: { color: string } }>)[0];
  return (
    <div
      className="rounded-xl px-3.5 py-2.5 text-sm"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid rgba(197,160,89,0.20)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
      }}
    >
      <p className="text-xs text-neutral-400 mb-1 font-medium">{entry.name}</p>
      <p className="text-sm font-bold tabular-nums" style={{ color: entry.payload.color }}>
        {formatMontant(entry.value)}
      </p>
    </div>
  );
};

export default function ProfitPieChart({ data }: { data: PieSlice[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (!total) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-300 text-sm">
        Aucune dépense pour cette période
      </div>
    );
  }

  return (
    <div>
      <div className="relative">
        <ResponsiveContainer width="100%" height={224}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={76}
              outerRadius={104}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-xs text-neutral-400 uppercase tracking-wider font-semibold mb-0.5">Total</p>
          <p className="text-base font-bold tabular-nums" style={{ color: '#1E293B' }}>
            {formatMontant(total)}
          </p>
        </div>
      </div>

      {/* Legend with percentages */}
      <div className="flex items-center justify-center gap-6 mt-2">
        {data.map((entry) => {
          const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0.0';
          return (
            <div key={entry.name} className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
              <div>
                <span className="text-xs font-semibold text-neutral-600">{entry.name}</span>
                <span className="text-xs text-neutral-400 ml-1.5">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
