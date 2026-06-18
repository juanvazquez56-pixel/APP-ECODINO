import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/shared/utils/cn';

const tabs = [
  { to: '/admin/registros/auditorias', label: 'Auditorías' },
  { to: '/admin/registros/supervisor', label: 'Supervisor' },
  { to: '/admin/registros/segurista', label: 'Segurista' },
];

export function RegistrosLayout() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Registros</h1>
        <p className="text-sm text-slate-500">Auditorías y reportes operativos</p>
      </div>

      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              cn(
                '-mb-px border-b-2 px-4 py-2 text-sm font-medium',
                isActive ? 'border-brand-500 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700',
              )
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
}
