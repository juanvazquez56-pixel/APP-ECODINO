import type { ReactNode } from 'react';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { cn } from '@/shared/utils/cn';

export type ColumnDef<T> = {
  key: keyof T;
  label: string;
  type: 'text' | 'select' | 'time' | 'date' | 'photo' | 'signature' | 'checkbox' | 'textarea' | 'number';
  options?: string[];
  width?: string;
  /** Override de render para celdas complejas (fotos, firmas). */
  render?: (row: T, index: number, update: (key: keyof T, value: any) => void) => ReactNode;
};

type DynamicTableProps<T> = {
  columns: ColumnDef<T>[];
  rows: T[];
  onAddRow: () => void;
  onUpdateRow: (index: number, key: keyof T, value: any) => void;
  onDeleteRow: (index: number) => void;
  addLabel?: string;
  minRows?: number;
  emptyMessage?: string;
  /** Badge opcional por fila (ej. "⚠ Falta evidencia"). */
  rowBadge?: (row: T, index: number) => ReactNode;
};

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

export function DynamicTable<T extends Record<string, any>>({
  columns,
  rows,
  onAddRow,
  onUpdateRow,
  onDeleteRow,
  addLabel = 'Agregar fila',
  minRows = 0,
  emptyMessage = 'Sin registros.',
  rowBadge,
}: DynamicTableProps<T>) {
  const belowMin = minRows > 0 && rows.length < minRows;

  return (
    <div className="flex flex-col gap-3">
      {belowMin && (
        <div className="flex items-center gap-2 rounded-lg bg-warn-50 px-3 py-2 text-sm text-warn-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Se requieren al menos {minRows} registros.
        </div>
      )}

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center text-sm text-slate-400">
          {emptyMessage}
        </p>
      ) : (
        rows.map((row, index) => (
          <div key={index} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">#{index + 1}</span>
                {rowBadge?.(row, index)}
              </div>
              <button
                type="button"
                onClick={() => onDeleteRow(index)}
                aria-label="Eliminar fila"
                className="rounded-md p-1 text-bad-500 hover:bg-bad-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {columns.map((col) => (
                <div key={String(col.key)} className={cn(col.type === 'textarea' && 'sm:col-span-2')}>
                  <label className="mb-1 block text-xs font-medium text-slate-600">{col.label}</label>
                  <Cell
                    col={col}
                    row={row}
                    value={row[col.key]}
                    onChange={(v) => onUpdateRow(index, col.key, v)}
                    update={(k, v) => onUpdateRow(index, k, v)}
                    index={index}
                  />
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <Button variant="secondary" icon={<Plus className="h-4 w-4" />} onClick={onAddRow}>
        {addLabel}
      </Button>
    </div>
  );
}

function Cell<T extends Record<string, any>>({
  col,
  row,
  value,
  onChange,
  update,
  index,
}: {
  col: ColumnDef<T>;
  row: T;
  value: any;
  onChange: (value: any) => void;
  update: (key: keyof T, value: any) => void;
  index: number;
}) {
  if (col.render) return <>{col.render(row, index, update)}</>;

  switch (col.type) {
    case 'select':
      return (
        <select className={inputCls} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">—</option>
          {col.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    case 'textarea':
      return (
        <textarea
          className={cn(inputCls, 'min-h-[60px]')}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'checkbox':
      return (
        <input
          type="checkbox"
          className="h-6 w-6 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
        />
      );
    case 'time':
    case 'date':
    case 'number':
      return (
        <input
          type={col.type}
          className={inputCls}
          value={value ?? ''}
          onChange={(e) => onChange(col.type === 'number' ? e.target.valueAsNumber || 0 : e.target.value)}
        />
      );
    default:
      return (
        <input
          type="text"
          className={inputCls}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}
