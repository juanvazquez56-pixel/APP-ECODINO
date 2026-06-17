import { DynamicTable, type ColumnDef } from '@/shared/components/DynamicTable';
import { useSupervisorStore } from '@/modules/supervisor/store';
import type { AttendanceRow } from '@/types/forms';

const ATTENDANCE_STATUS = [
  'Asistió',
  'Retardo',
  'Falta justificada',
  'Falta injustificada',
  'Permiso',
  'Incapacidad',
];

const columns: ColumnDef<AttendanceRow>[] = [
  { key: 'worker_name', label: 'Nombre', type: 'text' },
  { key: 'specialty', label: 'Especialidad', type: 'text' },
  { key: 'entrada', label: 'Entrada', type: 'time' },
  { key: 'salida', label: 'Salida', type: 'time' },
  { key: 'status', label: 'Estatus', type: 'select', options: ATTENDANCE_STATUS },
  { key: 'observations', label: 'Observaciones', type: 'textarea' },
];

export function AttendanceTable() {
  const { draft, addAttendanceRow, updateAttendanceRow, deleteAttendanceRow } = useSupervisorStore();
  return (
    <DynamicTable
      columns={columns}
      rows={draft.attendance}
      onAddRow={addAttendanceRow}
      onUpdateRow={updateAttendanceRow}
      onDeleteRow={deleteAttendanceRow}
      addLabel="+ Agregar trabajador"
      emptyMessage="Aún no agregas trabajadores."
      minRows={1}
    />
  );
}
