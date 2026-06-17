import { computeSummary, useSupervisorStore } from '@/modules/supervisor/store';

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

export function SummarySection() {
  const { draft, updateSummary } = useSupervisorStore();
  const computed = computeSummary(draft);

  const autoCard = (label: string, value: number) => (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-brand-700">{value}</p>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border border-slate-200 p-3">
        <label className="text-xs text-slate-500">Personal programado</label>
        <input
          type="number"
          className={inputCls}
          value={draft.summary.personal_programado}
          onChange={(e) => updateSummary({ personal_programado: e.target.valueAsNumber || 0 })}
        />
      </div>
      <div className="rounded-xl border border-slate-200 p-3">
        <label className="text-xs text-slate-500">Asistencias (auto, editable)</label>
        <input
          type="number"
          className={inputCls}
          value={draft.summary.asistencias || computed.asistencias}
          onChange={(e) => updateSummary({ asistencias: e.target.valueAsNumber || 0 })}
        />
      </div>
      {autoCard('Faltas', computed.faltas)}
      {autoCard('Retardos', computed.retardos)}
      {autoCard('Actividades asignadas', computed.actividades_asignadas)}
      {autoCard('Cerradas', computed.actividades_cerradas)}
      {autoCard('Pendientes', computed.actividades_pendientes)}
      {autoCard('Con evidencia', computed.actividades_con_evidencia)}
    </div>
  );
}
