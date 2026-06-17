import { computeSafetySummary, useSafetyStore } from '@/modules/segurista/store';

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

export function SafetySummarySection() {
  const { draft, updateSummary } = useSafetyStore();
  const computed = computeSafetySummary(draft);

  const autoCard = (label: string, value: number) => (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-brand-700">{value}</p>
    </div>
  );

  const editCard = (label: string, value: number, onChange: (n: number) => void) => (
    <div className="rounded-xl border border-slate-200 p-3">
      <label className="text-xs text-slate-500">{label}</label>
      <input
        type="number"
        className={inputCls}
        value={value}
        onChange={(e) => onChange(e.target.valueAsNumber || 0)}
      />
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-3">
      {autoCard('Personal con EPP completo', computed.personal_epp_completo)}
      {autoCard('Permisos vigentes', computed.permisos_vigentes)}
      {editCard('Días sin accidente', draft.summary.dias_sin_accidente, (n) =>
        updateSummary({ dias_sin_accidente: n }),
      )}
      {editCard('Charlas impartidas', draft.summary.charlas_impartidas, (n) =>
        updateSummary({ charlas_impartidas: n }),
      )}
      {autoCard('Incidentes hoy', computed.incidentes_dia)}
      {autoCard('Near-misses', computed.near_misses)}
    </div>
  );
}
