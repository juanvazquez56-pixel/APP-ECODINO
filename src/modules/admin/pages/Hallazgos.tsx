import { useCallback, useEffect, useState } from 'react';
import { Card } from '@/shared/components/Card';
import { Loading } from '@/shared/components/Loading';
import { EmptyState } from '@/shared/components/EmptyState';
import { DateRangeFilter } from '@/modules/admin/components/DateRangeFilter';
import {
  fetchFindings,
  updateActionStatus,
  createCorrectiveAction,
  type FindingTracking,
} from '@/db/queries/adminFindings';
import { fetchActivePlants } from '@/db/queries/catalogs';
import { fetchProfilesMap } from '@/db/queries/adminRecords';
import type { DateRange } from '@/db/queries/kpis';
import { formatDate } from '@/shared/utils/formatDate';
import { cn } from '@/shared/utils/cn';

const STATUSES = ['abierto', 'en_proceso', 'cerrado', 'cancelado'];
const SEVERITIES = ['Alta', 'Media', 'Baja'];

function wideRange(): DateRange {
  const hasta = new Date();
  const desde = new Date();
  desde.setMonth(desde.getMonth() - 12);
  return { desde: desde.toISOString().slice(0, 10), hasta: hasta.toISOString().slice(0, 10) };
}

function isOverdue(f: FindingTracking): boolean {
  if (!f.due_date || f.tracking_status === 'cerrado' || f.tracking_status === 'cancelado') return false;
  return new Date(f.due_date) < new Date(new Date().toISOString().slice(0, 10));
}

export function Hallazgos() {
  const [range, setRange] = useState<DateRange>(wideRange);
  const [plantId, setPlantId] = useState<string | null>(null);
  const [severity, setSeverity] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [plants, setPlants] = useState<{ id: string; name: string }[]>([]);
  const [plantsMap, setPlantsMap] = useState<Record<string, string>>({});
  const [profilesMap, setProfilesMap] = useState<Record<string, string>>({});
  const [findings, setFindings] = useState<FindingTracking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivePlants()
      .then((p) => {
        setPlants(p.map((x: any) => ({ id: x.id, name: x.name })));
        const m: Record<string, string> = {};
        p.forEach((x: any) => (m[x.id] = x.name));
        setPlantsMap(m);
      })
      .catch(() => {});
    fetchProfilesMap().then(setProfilesMap).catch(() => {});
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    fetchFindings({ ...range, plantId, severity, status })
      .then(setFindings)
      .catch(() => setFindings([]))
      .finally(() => setLoading(false));
  }, [range, plantId, severity, status]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusChange = async (f: FindingTracking, newStatus: string) => {
    if (f.action_id) {
      await updateActionStatus(f.action_id, newStatus);
    } else {
      // Sin acción todavía: creamos una placeholder y luego fijamos su estado.
      await createCorrectiveAction(f.finding_id, {
        action_description: '(Pendiente de definir)',
      });
    }
    load();
  };

  const handleAddAction = async (f: FindingTracking) => {
    const desc = window.prompt('Describe la acción correctiva:');
    if (!desc) return;
    await createCorrectiveAction(f.finding_id, { action_description: desc });
    load();
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Hallazgos</h1>
        <p className="text-sm text-slate-500">Seguimiento de hallazgos y acciones correctivas</p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <DateRangeFilter range={range} onChange={setRange} plants={plants} plantId={plantId} onPlantChange={setPlantId} />
        <FilterSelect label="Severidad" value={severity} onChange={setSeverity} options={SEVERITIES} />
        <FilterSelect label="Estado" value={status} onChange={setStatus} options={STATUSES} />
      </div>

      {loading ? (
        <Loading text="Cargando hallazgos…" />
      ) : findings.length === 0 ? (
        <EmptyState title="Sin hallazgos" description="No hay hallazgos con estos filtros." />
      ) : (
        <div className="flex flex-col gap-3">
          {findings.map((f) => (
            <Card key={f.finding_id} variant={isOverdue(f) ? 'danger' : 'default'}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-semibold',
                        f.severity === 'Alta' ? 'bg-bad-100 text-bad-800' : f.severity === 'Media' ? 'bg-warn-100 text-warn-800' : 'bg-slate-100 text-slate-600',
                      )}
                    >
                      {f.severity}
                    </span>
                    <span className="text-xs text-slate-500">
                      {plantsMap[f.plant_id] ?? '—'} · {formatDate(f.audit_date)}
                    </span>
                    {isOverdue(f) && (
                      <span className="rounded-full bg-bad-500 px-2 py-0.5 text-xs font-semibold text-white">Vencido</span>
                    )}
                  </div>
                  <p className="mt-1 font-medium text-slate-800">{f.description}</p>
                  {f.category && <p className="text-xs text-slate-500">Categoría: {f.category}</p>}

                  <div className="mt-2 rounded-lg bg-slate-50 p-2 text-sm">
                    {f.action_id ? (
                      <>
                        <p className="text-slate-700">{f.action_description}</p>
                        <p className="text-xs text-slate-500">
                          Responsable: {f.responsible_name ?? (f.responsible_id ? profilesMap[f.responsible_id] : '—') ?? '—'}
                          {f.due_date ? ` · Vence: ${formatDate(f.due_date)}` : ''}
                        </p>
                      </>
                    ) : (
                      <button onClick={() => handleAddAction(f)} className="text-sm font-medium text-brand-600 hover:underline">
                        + Asignar acción correctiva
                      </button>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  <label className="mb-1 block text-xs font-medium text-slate-500">Estado</label>
                  <select
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm capitalize focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={f.tracking_status}
                    onChange={(e) => handleStatusChange(f, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s} className="capitalize">
                        {s.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500">{label}</label>
      <select
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm capitalize focus:outline-none focus:ring-2 focus:ring-brand-500"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
      >
        <option value="">Todos</option>
        {options.map((o) => (
          <option key={o} value={o} className="capitalize">
            {o.replace('_', ' ')}
          </option>
        ))}
      </select>
    </div>
  );
}
