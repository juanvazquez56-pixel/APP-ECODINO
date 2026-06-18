import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, FileStack, AlertTriangle, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/auth/useAuth';
import { cn } from '@/shared/utils/cn';

const navItems = [
  { to: '/admin/home', label: 'Home', icon: LayoutDashboard },
  { to: '/admin/registros', label: 'Registros', icon: FileStack },
  { to: '/admin/hallazgos', label: 'Hallazgos', icon: AlertTriangle },
  { to: '/admin/catalogos', label: 'Catálogos', icon: Settings },
];

export function AdminLayout() {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      {/* Sidebar (desktop) / topbar (mobile) */}
      <aside className="safe-top sticky top-0 z-20 bg-brand-500 text-white md:flex md:h-screen md:w-60 md:flex-col">
        <div className="hidden px-5 py-5 md:block">
          <p className="text-lg font-bold">Auditoría Operativa</p>
          <p className="text-xs text-white/70">Panel de gerencia</p>
        </div>

        <nav className="flex justify-around overflow-x-auto px-2 py-2 md:flex-1 md:flex-col md:justify-start md:gap-1 md:px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium md:flex-row md:gap-3 md:text-sm',
                  isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10',
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden border-t border-white/10 p-3 md:block">
          <p className="mb-2 truncate text-xs text-white/70">{profile?.full_name}</p>
          <button
            onClick={() => void signOut()}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-6xl p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
