import { DynamicTable, type ColumnDef } from '@/shared/components/DynamicTable';
import { PhotoCapture } from '@/shared/components/PhotoCapture';
import { useSafetyStore } from '@/modules/segurista/store';
import type { SafetyIncidentRow } from '@/types/forms';

const INCIDENT_TYPES = [
  'Accidente',
  'Incidente',
  'Near-miss',
  'Condición insegura',
  'Acto inseguro',
  'Observación de mejora',
];

const columns: ColumnDef<SafetyIncidentRow>[] = [
  { key: 'occurrence_time', label: 'Hora', type: 'time' },
  { key: 'type', label: 'Tipo', type: 'select', options: INCIDENT_TYPES },
  { key: 'description', label: 'Descripción', type: 'textarea' },
  { key: 'affected_area', label: 'Área/personas afectadas', type: 'text' },
  { key: 'immediate_action', label: 'Acción inmediata', type: 'textarea' },
  {
    key: 'photo',
    label: 'Foto',
    type: 'photo',
    render: (row, _i, update) => (
      <PhotoCapture
        label=""
        required={row.type === 'Accidente'}
        value={row.photo.blob ?? row.photo.path ?? null}
        onChange={(blob) => update('photo', { photoId: null, path: row.photo.path, blob })}
      />
    ),
  },
];

export function SafetyIncidentsTable() {
  const { draft, addIncidentRow, updateIncidentRow, deleteIncidentRow } = useSafetyStore();
  return (
    <DynamicTable
      columns={columns}
      rows={draft.incidents}
      onAddRow={addIncidentRow}
      onUpdateRow={updateIncidentRow}
      onDeleteRow={deleteIncidentRow}
      addLabel="+ Agregar incidente"
      emptyMessage="Sin incidentes registrados."
      rowBadge={(row) =>
        row.type === 'Accidente' ? (
          <span className="rounded-full bg-bad-100 px-2 py-0.5 text-xs font-medium text-bad-800">
            Accidente: foto y descripción ≥ 50 caract.
          </span>
        ) : null
      }
    />
  );
}
