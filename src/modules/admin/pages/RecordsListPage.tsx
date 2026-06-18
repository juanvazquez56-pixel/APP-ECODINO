import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, type Column } from '@/modules/admin/components/DataTable';
import { DateRangeFilter } from '@/modules/admin/components/DateRangeFilter';
import { SemaforoPill } from '@/shared/components/SemaforoPill';
import {
  fetchRecords,
  fetchPlantsMap,
  fetchProfilesMap,
  type RecordKind,
} from '@/db/queries/adminRecords';
import { fetchActivePlants } from '@/db/queries/catalogs';
import type { DateRange } from '@/db/queries/kpis';
import { formatDate } from '@/shared/utils/formatDate';
import type { Semaforo } from '@/shared/utils/calcSemaforo';

function wideRange(): DateRange {
  const hasta = new Date();
  const desde = new Date();
  desde.setMonth(desde.getMonth() - 6);
  return { desde: desde.toISOString().slice(0, 10), hasta: hasta.toISOString().slice(0, 10) };
}

const SEMAFOROS = ['verde', 'amarillo', 'rojo'];

export function RecordsListPage({ kind }: { kind: RecordKind }) {
  const navigate = useNavigate();
  const [range, setRange] = useState<DateRange>(wideRange);
  const [plantId, setPlantId] = useState<string | null>(null);
  const [semaforo, setSemaforo] = useState<string | null>(null);
  const [plants, setPlants] = useState<{ id: string; name: string }[]>([]);
  const [plantsMap, setPlantsMap] = useState<Record<string, string>>({});
  const [profilesMap, setProfilesMap] = useState<Record<string, string>>({});
  const [rows, setRows] = useState<any[]>([]);
  const [authorCol, setAuthorCol] = useState('profile_id');
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const pageSize = 20;

  useEffect(() => {
    fetchActivePlants().then((p) => setPlants(p.map((x: any) => ({ id: x.id, name: x.name })))).catch(() => {});
    fetchPlantsMap().then(setPlantsMap).catch(() => {});
    fetchProfilesMap().then(setProfilesMap).catch(() => {});
  }, []);

  // Reset al cambiar de pestaña (kind) o filtros.
  useEffect(() => setPage(0), [kind, range, plantId, semaforo]);

  useEffect(() => {
    setLoading(true);
    fetchRecords(kind, { ...range, plantId, semaforo: kind === 'auditoria' ? semaforo : null, page, pageSize })
      .then((res) => {
        setRows(res.rows);
        setCount(res.count);
        setAuthorCol(res.authorCol);
      })
      .catch(() => {
        setRows([]);
        setCount(0);
      })
      .finally(() => setLoading(false));
  }, [kind, range, plantId, semaforo, page]);

  const dateKey = kind === 'auditoria' ? 'audit_date' : 'report_date';

  const columns: Column<any>[] = [
    { key: 'date', label: 'Fecha', render: (r) => formatDate(r[dateKey]) },
    { key: 'plant', label: 'Planta', render: (r) => plantsMap[r.plant_id] ?? '—' },
    { key: 'author', label: 'Autor', render: (r) => profilesMap[r[authorCol]] ?? '—' },
    ...(kind === 'auditoria'
      ? [
          {
            key: 'compliance',
            label: 'Cumplimiento',
            render: (r: any) => (
              <SemaforoPill
                semaforo={(r.semaforo as Semaforo) ?? 'sin-datos'}
                pct={r.pct_cumplimiento != null ? Number(r.pct_cumplimiento) : null}
              />
            ),
          } as Column<any>,
        ]
      : []),
    {
      key: 'status',
      label: 'Estatus',
      render: (r) => <span className="capitalize text-slate-600">{r.status}</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <DateRangeFilter range={range} onChange={setRange} plants={plants} plantId={plantId} onPlantChange={setPlantId} />
        {kind === 'auditoria' && (
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Semáforo</label>
            <select
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={semaforo ?? ''}
              onChange={(e) => setSemaforo(e.target.value || null)}
            >
              <option value="">Todos</option>
              {SEMAFOROS.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        emptyMessage="Sin registros en este periodo."
        onRowClick={(r) => navigate(`/admin/registros/${kind}/${r.id}`)}
        page={page}
        pageSize={pageSize}
        total={count}
        onPageChange={setPage}
      />
    </div>
  );
}
