import { useEffect, useState } from 'react';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Loading } from '@/shared/components/Loading';
import { fetchAllProfiles, updateProfileRole, setProfileActive } from '@/db/queries/adminCatalogs';
import type { Role } from '@/types/domain';

const ROLES: Role[] = ['supervisor', 'segurista', 'auditor', 'admin'];

export function Personal() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchAllProfiles()
      .then(setProfiles)
      .catch(() => setProfiles([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const changeRole = async (id: string, role: Role) => {
    await updateProfileRole(id, role);
    load();
  };

  const toggleActive = async (p: any) => {
    await setProfileActive(p.id, !p.active);
    load();
  };

  if (loading) return <Loading text="Cargando personal…" />;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-slate-500">
        La gestión de contraseñas se realiza en Supabase Auth. Aquí solo administras el rol y el
        estado del registro en <code>profiles</code>.
      </p>
      {profiles.map((p) => (
        <Card key={p.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-slate-800">{p.full_name}</p>
            <p className="text-xs text-slate-500">{p.phone || 'Sin teléfono'}</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm capitalize focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={p.role}
              onChange={(e) => changeRole(p.id, e.target.value as Role)}
            >
              {ROLES.map((r) => (
                <option key={r} value={r} className="capitalize">
                  {r}
                </option>
              ))}
            </select>
            <span
              className={
                'rounded-full px-2 py-0.5 text-xs font-medium ' +
                (p.active ? 'bg-ok-100 text-ok-800' : 'bg-slate-100 text-slate-500')
              }
            >
              {p.active ? 'Activo' : 'Inactivo'}
            </span>
            <Button size="sm" variant="secondary" onClick={() => toggleActive(p)}>
              {p.active ? 'Desactivar' : 'Activar'}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
