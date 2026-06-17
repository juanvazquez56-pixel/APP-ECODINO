import { DynamicTable, type ColumnDef } from '@/shared/components/DynamicTable';
import { useSupervisorStore } from '@/modules/supervisor/store';
import type { MaterialRow } from '@/types/forms';

const columns: ColumnDef<MaterialRow>[] = [
  { key: 'material_name', label: 'Material', type: 'text' },
  { key: 'quantity', label: 'Cantidad', type: 'text' },
  { key: 'used_in', label: 'Usado en', type: 'text' },
  { key: 'was_missing', label: '¿Faltó?', type: 'checkbox' },
];

export function MaterialsTable() {
  const { draft, addMaterialRow, updateMaterialRow, deleteMaterialRow } = useSupervisorStore();
  return (
    <DynamicTable
      columns={columns}
      rows={draft.materials}
      onAddRow={addMaterialRow}
      onUpdateRow={updateMaterialRow}
      onDeleteRow={deleteMaterialRow}
      addLabel="+ Agregar material"
      emptyMessage="Sin materiales registrados."
    />
  );
}
