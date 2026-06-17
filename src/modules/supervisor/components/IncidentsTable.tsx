import { DynamicTable, type ColumnDef } from '@/shared/components/DynamicTable';
import { useSupervisorStore } from '@/modules/supervisor/store';
import type { SupervisorIncidentRow } from '@/types/forms';

const CAUSES = ['Material', 'Cliente', 'Personal', 'Clima', 'Acceso', 'Otro'];

const columns: ColumnDef<SupervisorIncidentRow>[] = [
  { key: 'description', label: 'Descripción', type: 'textarea' },
  { key: 'cause', label: 'Causa', type: 'select', options: CAUSES },
  { key: 'action_taken', label: 'Acción tomada', type: 'textarea' },
];

export function IncidentsTable() {
  const { draft, addIncidentRow, updateIncidentRow, deleteIncidentRow } = useSupervisorStore();
  return (
    <DynamicTable
      columns={columns}
      rows={draft.incidents}
      onAddRow={addIncidentRow}
      onUpdateRow={updateIncidentRow}
      onDeleteRow={deleteIncidentRow}
      addLabel="+ Agregar incidencia"
      emptyMessage="Sin incidencias registradas."
    />
  );
}
