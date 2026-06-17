import { DynamicTable, type ColumnDef } from '@/shared/components/DynamicTable';
import { useSafetyStore } from '@/modules/segurista/store';
import type { EppRow } from '@/types/forms';

const columns: ColumnDef<EppRow>[] = [
  { key: 'worker_name', label: 'Nombre', type: 'text' },
  { key: 'casco', label: 'Casco', type: 'checkbox' },
  { key: 'lentes', label: 'Lentes', type: 'checkbox' },
  { key: 'guantes', label: 'Guantes', type: 'checkbox' },
  { key: 'calzado', label: 'Calzado', type: 'checkbox' },
  { key: 'tapones', label: 'Tapones', type: 'checkbox' },
  { key: 'other_epp', label: 'Otro EPP', type: 'text' },
  { key: 'action_taken', label: 'Acción/Reposición', type: 'text' },
];

export function EppTable() {
  const { draft, addEppRow, updateEppRow, deleteEppRow } = useSafetyStore();
  return (
    <DynamicTable
      columns={columns}
      rows={draft.epp}
      onAddRow={addEppRow}
      onUpdateRow={updateEppRow}
      onDeleteRow={deleteEppRow}
      addLabel="+ Agregar trabajador"
      emptyMessage="Sin inspecciones de EPP."
    />
  );
}
