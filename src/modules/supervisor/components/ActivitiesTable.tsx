import { DynamicTable, type ColumnDef } from '@/shared/components/DynamicTable';
import { PhotoCapture } from '@/shared/components/PhotoCapture';
import { useSupervisorStore } from '@/modules/supervisor/store';
import type { ActivityRow, PhotoRef } from '@/types/forms';

const ACTIVITY_STATUS = [
  'Pendiente',
  'En proceso',
  'Cerrado',
  'Cerrado con observación',
  'No realizado',
  'Reprogramado',
  'Detenido',
];

function photoValue(ref: PhotoRef): Blob | string | null {
  return ref.blob ?? ref.path ?? null;
}

const columns: ColumnDef<ActivityRow>[] = [
  { key: 'activity_name', label: 'Actividad', type: 'text' },
  { key: 'area', label: 'Área', type: 'text' },
  { key: 'responsible_name', label: 'Responsable', type: 'text' },
  { key: 'start_time', label: 'Inicio', type: 'time' },
  { key: 'end_time', label: 'Fin', type: 'time' },
  { key: 'status', label: 'Estatus', type: 'select', options: ACTIVITY_STATUS },
  {
    key: 'photo_before',
    label: 'Foto antes',
    type: 'photo',
    render: (row, _i, update) => (
      <PhotoCapture
        label=""
        value={photoValue(row.photo_before)}
        onChange={(blob) => update('photo_before', { photoId: null, path: row.photo_before.path, blob })}
      />
    ),
  },
  {
    key: 'photo_after',
    label: 'Foto después',
    type: 'photo',
    render: (row, _i, update) => (
      <PhotoCapture
        label=""
        value={photoValue(row.photo_after)}
        onChange={(blob) => update('photo_after', { photoId: null, path: row.photo_after.path, blob })}
      />
    ),
  },
  { key: 'observations', label: 'Observaciones', type: 'textarea' },
];

function missingEvidence(row: ActivityRow): boolean {
  if (row.status !== 'Cerrado') return false;
  const hasBefore = !!(row.photo_before.blob || row.photo_before.path);
  const hasAfter = !!(row.photo_after.blob || row.photo_after.path);
  return !hasBefore || !hasAfter;
}

export function ActivitiesTable() {
  const { draft, addActivityRow, updateActivityRow, deleteActivityRow } = useSupervisorStore();
  return (
    <DynamicTable
      columns={columns}
      rows={draft.activities}
      onAddRow={addActivityRow}
      onUpdateRow={updateActivityRow}
      onDeleteRow={deleteActivityRow}
      addLabel="+ Agregar actividad"
      emptyMessage="Aún no agregas actividades."
      rowBadge={(row) =>
        missingEvidence(row) ? (
          <span className="rounded-full bg-warn-100 px-2 py-0.5 text-xs font-medium text-warn-800">
            ⚠ Falta evidencia
          </span>
        ) : null
      }
    />
  );
}
