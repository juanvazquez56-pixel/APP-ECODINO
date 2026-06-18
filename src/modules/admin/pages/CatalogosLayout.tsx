import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/shared/utils/cn';

const tabs = [
  { to: '/admin/catalogos/plantas', label: 'Plantas' },
  { to: '/admin/catalogos/personal', label: 'Personal' },
];

export function CatalogosLayout() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Catálogos</h1>
        <p className="text-sm text-slate-500">Administración de plantas y personal</p>
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
