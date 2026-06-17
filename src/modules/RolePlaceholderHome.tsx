import { LogOut } from 'lucide-react';
import { useAuth } from '@/auth/useAuth';
import type { Role } from '@/auth/useAuth';
import { Header } from '@/shared/components/Header';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Banner } from '@/shared/components/Banner';
import { useOnline } from '@/shared/hooks/useOnline';

const roleLabels: Record<Role, string> = {
  supervisor: 'Supervisor',
  segurista: 'Segurista',
  auditor: 'Auditor',
  admin: 'Gerencia (Admin)',
};

type Props = {
  /** Texto que indica en qué bloque se construirá esta pantalla. */
  blockNote: string;
};

/** Pantalla placeholder compartida por todas las homes de rol del Bloque 1. */
export function RolePlaceholderHome({ blockNote }: Props) {
  const { profile, signOut } = useAuth();
  const online = useOnline();

  if (!profile) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <Header title={`Hola, ${profile.full_name}`} />

      <main className="flex flex-1 flex-col gap-4 p-4">
        {!online && (
          <Banner tone="warn" title="Estás sin conexión">
            Algunas funciones podrían no estar disponibles.
          </Banner>
        )}

        <Card>
          <p className="text-sm text-slate-500">Rol</p>
          <p className="text-lg font-semibold text-brand-700">{roleLabels[profile.role]}</p>
        </Card>

        <Card variant="warn">
          <p className="text-sm text-warn-800">{blockNote}</p>
        </Card>

        <Button variant="secondary" fullWidth icon={<LogOut className="h-5 w-5" />} onClick={() => void signOut()}>
          Cerrar sesión
        </Button>
      </main>
    </div>
  );
}
