import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { CompliancePoint } from '@/db/queries/kpis';
import { formatDate } from '@/shared/utils/formatDate';
import { EmptyState } from '@/shared/components/EmptyState';

export function ComplianceLineChart({ data }: { data: CompliancePoint[] }) {
  if (data.length === 0) {
    return <EmptyState title="Sin datos en este periodo" description="No hay auditorías para graficar la tendencia." />;
  }

  const chartData = data.map((d) => ({
    label: formatDate(d.periodo, 'd MMM'),
    pct: Number(d.avg_compliance),
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
        <Tooltip formatter={(v) => [`${v}%`, 'Cumplimiento']} />
        <Line type="monotone" dataKey="pct" stroke="#1F3864" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
