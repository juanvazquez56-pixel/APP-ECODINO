import { DynamicTable, type ColumnDef } from '@/shared/components/DynamicTable';
import { useSafetyStore } from '@/modules/segurista/store';
import type { PermitRow } from '@/types/forms';

const PERMIT_TYPES = [
  'Trabajo en altura',
  'Trabajo en caliente',
  'Espacios confinados',
  'Eléctrico (LOTO)',
  'Izaje',
  'Excavación',
  'General',
];

const columns: ColumnDef<PermitRow>[] = [
  { key: 'activity_area', label: 'Actividad/Área', type: 'text' },
  { key: 'permit_type', label: 'Tipo de permiso', type: 'select', options: PERMIT_TYPES },
  { key: 'ats_elaborated', label: 'ATS elaborado', type: 'checkbox' },
  { key: 'client_signed', label: 'Firmado por cliente', type: 'select', options: ['Sí', 'No', 'N.A.'] },
  { key: 'archived', label: 'Archivado', type: 'checkbox' },
  { key: 'observation', label: 'Observación', type: 'textarea' },
];

export function PermitsTable() {
  const { draft, addPermitRow, updatePermitRow, deletePermitRow } = useSafetyStore();
  return (
    <DynamicTable
      columns={columns}
      rows={draft.permits}
      onAddRow={addPermitRow}
      onUpdateRow={updatePermitRow}
      onDeleteRow={deletePermitRow}
      addLabel="+ Agregar permiso"
      emptyMessage="Sin permisos registrados."
    />
  );
}
