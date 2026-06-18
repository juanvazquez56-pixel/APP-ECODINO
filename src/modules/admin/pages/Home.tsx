import { useEffect, useState } from 'react';
import { ClipboardCheck, AlertTriangle, FileCheck2, Send } from 'lucide-react';
import { KpiCard } from '@/modules/admin/components/KpiCard';
import { DateRangeFilter } from '@/modules/admin/components/DateRangeFilter';
import { ComplianceLineChart } from '@/modules/admin/components/ComplianceLineChart';
import { PlantBarChart } from '@/modules/admin/components/PlantBarChart';
import { Card } from '@/shared/components/Card';
import {
  fetchHeadlineKpis,
  fetchComplianceTrend,
  fetchComplianceByPlant,
  type DateRange,
  type HeadlineKpis,
  type CompliancePoint,
  type PlantCompliance,
} from '@/db/queries/kpis';
import { fetchActivePlants } from '@/db/queries/catalogs';
import { calcSemaforo } from '@/shared/utils/calcSemaforo';

function defaultRange(): DateRange {
  const hasta = new Date();
  const desde = new Date();
  desde.setDate(desde.getDate() - 30);
  return { desde: desde.toISOString().slice(0, 10), hasta: hasta.toISOString().slice(0, 10) };
}

export function AdminDashboardHome() {
  const [range, setRange] = useState<DateRange>(defaultRange);
  const [plantId, setPlantId] = useState<string | null>(null);
  const [plants, setPlants] = useState<{ id: string; name: string }[]>([]);
  const [kpis, setKpis] = useState<HeadlineKpis | null>(null);
  const [trend, setTrend] = useState<CompliancePoint[]>([]);
  const [byPlant, setByPlant] = useState<PlantCompliance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivePlants()
      .then((p) => setPlants(p.map((x: any) => ({ id: x.id, name: x.name }))))
      .catch(() => setPlants([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchHeadlineKpis(range, plantId),
      fetchComplianceTrend(range, plantId),
      fetchComplianceByPlant(range),
    ])
      .then(([k, t, p]) => {
        setKpis(k);
        setTrend(t);
        setByPlant(p);
      })
      .catch(() => {
        setKpis(null);
        setTrend([]);
        setByPlant([]);
      })
      .finally(() => setLoading(false));
  }, [range, plantId]);

  const avg = kpis?.avg_compliance ?? null;
  const sem = avg != null ? calcSemaforo(Math.round(avg), 100 - Math.round(avg)).semaforo : 'sin-datos';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Resumen</h1>
          <p className="text-sm text-slate-500">Indicadores del periodo seleccionado</p>
        </div>
        <DateRangeFilter
          range={range}
          onChange={setRange}
          plants={plants}
          plantId={plantId}
          onPlantChange={setPlantId}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Auditorías del periodo" value={kpis?.total_audits ?? 0} loading={loading} icon={<ClipboardCheck className="h-5 w-5" />} />
        <KpiCard
          label="% cumplimiento promedio"
          value={avg != null ? `${avg}%` : '—'}
          semaforo={avg != null ? sem : undefined}
          loading={loading}
          icon={<FileCheck2 className="h-5 w-5" />}
        />
        <KpiCard label="Hallazgos abiertos" value={kpis?.findings_open ?? 0} hint={`${kpis?.findings_closed ?? 0} cerrados`} loading={loading} icon={<AlertTriangle className="h-5 w-5" />} />
        <KpiCard label="Reportes recibidos hoy" value={kpis?.reports_today ?? 0} hint="Supervisor + segurista" loading={loading} icon={<Send className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold text-slate-700">Tendencia de cumplimiento</h2>
          {loading ? <ChartSkeleton /> : <ComplianceLineChart data={trend} />}
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold text-slate-700">Cumplimiento por planta</h2>
          {loading ? <ChartSkeleton /> : <PlantBarChart data={byPlant} />}
        </Card>
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return <div className="h-[260px] animate-pulse rounded-xl bg-slate-100" />;
}
