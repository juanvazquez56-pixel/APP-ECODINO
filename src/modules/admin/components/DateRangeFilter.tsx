import type { DateRange } from '@/db/queries/kpis';

type Props = {
  range: DateRange;
  onChange: (range: DateRange) => void;
  plants?: { id: string; name: string }[];
  plantId?: string | null;
  onPlantChange?: (id: string | null) => void;
};

const inputCls =
  'rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

export function DateRangeFilter({ range, onChange, plants, plantId, onPlantChange }: Props) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Desde</label>
        <input
          type="date"
          className={inputCls}
          value={range.desde}
          onChange={(e) => onChange({ ...range, desde: e.target.value })}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Hasta</label>
        <input
          type="date"
          className={inputCls}
          value={range.hasta}
          onChange={(e) => onChange({ ...range, hasta: e.target.value })}
        />
      </div>
      {plants && onPlantChange && (
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Planta</label>
          <select
            className={inputCls}
            value={plantId ?? ''}
            onChange={(e) => onPlantChange(e.target.value || null)}
          >
            <option value="">Todas</option>
            {plants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
