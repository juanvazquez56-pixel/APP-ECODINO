import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PlantCompliance } from '@/db/queries/kpis';
import { EmptyState } from '@/shared/components/EmptyState';

function colorFor(pct: number): string {
  if (pct >= 90) return '#16A34A';
  if (pct >= 75) return '#F59E0B';
  return '#DC2626';
}

export function PlantBarChart({ data }: { data: PlantCompliance[] }) {
  if (data.length === 0) {
    return <EmptyState title="Sin datos en este periodo" description="No hay auditorías por planta para graficar." />;
  }

  const chartData = data.map((d) => ({ name: d.plant_name, pct: Number(d.avg_compliance) }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
        <Tooltip formatter={(v) => [`${v}%`, 'Cumplimiento']} />
        <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
          {chartData.map((d, i) => (
            <Cell key={i} fill={colorFor(d.pct)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
