import { useEffect, useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Field } from '@/shared/components/Field';
import { Loading } from '@/shared/components/Loading';
import {
  fetchAllPlants,
  createPlant,
  updatePlant,
  setPlantActive,
  type PlantInput,
} from '@/db/queries/adminCatalogs';

type EditState = (PlantInput & { id?: string }) | null;

const empty: PlantInput = { name: '', address: '', contact_name: '', contact_phone: '', active: true };

export function Plantas() {
  const [plants, setPlants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<EditState>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetchAllPlants()
      .then(setPlants)
      .catch(() => setPlants([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const save = async () => {
    if (!edit || !edit.name.trim()) return;
    setSaving(true);
    try {
      const { id, ...input } = edit;
      if (id) await updatePlant(id, input);
      else await createPlant(input);
      setEdit(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (p: any) => {
    await setPlantActive(p.id, !p.active);
    load();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setEdit({ ...empty })}>
          Nueva planta
        </Button>
      </div>

      {edit && (
        <Card>
          <h2 className="mb-3 font-semibold text-slate-700">{edit.id ? 'Editar planta' : 'Nueva planta'}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Nombre" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
            <Field label="Dirección" value={edit.address ?? ''} onChange={(e) => setEdit({ ...edit, address: e.target.value })} />
            <Field label="Contacto" value={edit.contact_name ?? ''} onChange={(e) => setEdit({ ...edit, contact_name: e.target.value })} />
            <Field label="Teléfono" value={edit.contact_phone ?? ''} onChange={(e) => setEdit({ ...edit, contact_phone: e.target.value })} />
          </div>
          <div className="mt-3 flex gap-2">
            <Button variant="secondary" onClick={() => setEdit(null)}>
              Cancelar
            </Button>
            <Button loading={saving} onClick={save}>
              Guardar
            </Button>
          </div>
        </Card>
      )}

      {loading ? (
        <Loading text="Cargando plantas…" />
      ) : (
        <div className="flex flex-col gap-2">
          {plants.map((p) => (
            <Card key={p.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800">{p.name}</p>
                <p className="text-xs text-slate-500">{p.address || 'Sin dirección'}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={
                    'rounded-full px-2 py-0.5 text-xs font-medium ' +
                    (p.active ? 'bg-ok-100 text-ok-800' : 'bg-slate-100 text-slate-500')
                  }
                >
                  {p.active ? 'Activa' : 'Inactiva'}
                </span>
                <Button size="sm" variant="secondary" onClick={() => toggleActive(p)}>
                  {p.active ? 'Desactivar' : 'Activar'}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Pencil className="h-4 w-4" />}
                  onClick={() =>
                    setEdit({
                      id: p.id,
                      name: p.name,
                      address: p.address,
                      contact_name: p.contact_name,
                      contact_phone: p.contact_phone,
                      active: p.active,
                    })
                  }
                >
                  Editar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
