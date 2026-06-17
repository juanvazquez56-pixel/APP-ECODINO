import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AUDIT_SUBSECTION_KEYS } from '@/catalogs/audit-criteria';
import { useAuditorStore } from '@/modules/auditor/store';

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

type Person = { id: string; full_name: string };

export function FindingsSection({ people }: { people: Person[] }) {
  const { draft, addFinding, updateFinding, deleteFinding } = useAuditorStore();

  return (
    <div className="flex flex-col gap-3">
      {draft.findings.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center text-sm text-slate-400">
          Sin hallazgos. Agrega uno si encontraste desviaciones.
        </p>
      )}

      {draft.findings.map((f, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Hallazgo #{i + 1}</span>
            <button
              type="button"
              onClick={() => deleteFinding(i)}
              aria-label="Eliminar hallazgo"
              className="rounded-md p-1 text-bad-500 hover:bg-bad-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Descripción</label>
              <textarea
                className={`${inputCls} min-h-[60px]`}
                value={f.description}
                onChange={(e) => updateFinding(i, { description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Categoría</label>
                <select
                  className={inputCls}
                  value={f.category}
                  onChange={(e) => updateFinding(i, { category: e.target.value })}
                >
                  <option value="">—</option>
                  {AUDIT_SUBSECTION_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Severidad</label>
                <select
                  className={inputCls}
                  value={f.severity}
                  onChange={(e) => updateFinding(i, { severity: e.target.value as any })}
                >
                  <option value="Alta">Alta</option>
                  <option value="Media">Media</option>
                  <option value="Baja">Baja</option>
                </select>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-2">
              <p className="mb-2 text-xs font-semibold text-slate-500">Acción correctiva</p>
              <div className="flex flex-col gap-2">
                <textarea
                  className={`${inputCls} min-h-[48px]`}
                  placeholder="Acción a realizar"
                  value={f.action.action_description}
                  onChange={(e) =>
                    updateFinding(i, { action: { ...f.action, action_description: e.target.value } })
                  }
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    className={inputCls}
                    value={f.action.responsible_id ?? ''}
                    onChange={(e) => {
                      const id = e.target.value || null;
                      const person = people.find((p) => p.id === id);
                      updateFinding(i, {
                        action: {
                          ...f.action,
                          responsible_id: id,
                          responsible_name: person?.full_name ?? f.action.responsible_name,
                        },
                      });
                    }}
                  >
                    <option value="">Responsable…</option>
                    {people.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="date"
                    className={inputCls}
                    value={f.action.due_date}
                    onChange={(e) => updateFinding(i, { action: { ...f.action, due_date: e.target.value } })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <Button variant="secondary" icon={<Plus className="h-4 w-4" />} onClick={addFinding}>
        + Agregar hallazgo
      </Button>
    </div>
  );
}
