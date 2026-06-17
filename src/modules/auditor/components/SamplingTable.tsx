import { DynamicTable, type ColumnDef } from '@/shared/components/DynamicTable';
import { useAuditorStore } from '@/modules/auditor/store';
import type { SamplingRow } from '@/types/forms';

const columns: ColumnDef<SamplingRow>[] = [
  { key: 'activity_description', label: 'Actividad revisada', type: 'textarea' },
  { key: 'exists_in_site', label: 'Existe en sitio', type: 'select', options: ['Sí', 'No'] },
  { key: 'quality_ok', label: 'Calidad OK', type: 'select', options: ['Sí', 'No'] },
  { key: 'photos_match', label: 'Foto coincide', type: 'select', options: ['Sí', 'No', 'N.A.'] },
  { key: 'observation', label: 'Observación', type: 'textarea' },
];

export function SamplingTable() {
  const { draft, addSamplingRow, updateSamplingRow, deleteSamplingRow } = useAuditorStore();
  return (
    <DynamicTable
      columns={columns}
      rows={draft.sampling}
      onAddRow={addSamplingRow}
      onUpdateRow={updateSamplingRow}
      onDeleteRow={deleteSamplingRow}
      addLabel="+ Agregar muestreo"
      emptyMessage="Sin muestreos físicos."
      minRows={2}
    />
  );
}
