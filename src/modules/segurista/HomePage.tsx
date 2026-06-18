import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, LogOut, ShieldAlert } from 'lucide-react';
import { Header } from '@/shared/components/Header';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { EmptyState } from '@/shared/components/EmptyState';
import { SyncBadge } from '@/shared/components/SyncBadge';
import { useAuth } from '@/auth/useAuth';
import { db } from '@/db/dexie';
import { formatDate } from '@/shared/utils/formatDate';
import { SAFETY_CHECKLIST_TOTAL } from '@/catalogs/safety-checklist';
import { useSafetyStore } from '@/modules/segurista/store';
import { ReminderBanner } from '@/modules/admin/components/ReminderBanner';

function checklistPct(responses: Record<string, boolean> | undefined): number {
  if (!responses) return 0;
  const n = Object.values(responses).filter(Boolean).length;
  return Math.round((n / SAFETY_CHECKLIST_TOTAL) * 100);
}

export function SeguristaHome() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const newDraft = useSafetyStore((s) => s.newDraft);

  const reports = useLiveQuery(
    () => db.safetyReports.orderBy('lastModified').reverse().limit(10).toArray(),
    [],
    [],
  );

  const today = new Date().toISOString().slice(0, 10);
  const todayReport = reports?.find((r) => r.data?.draft?.general?.fecha === today);

  const handleNew = () => {
    const id = newDraft();
    navigate(`/segurista/reporte/${id}`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        title="Mis reportes"
        right={
          <div className="flex items-center gap-2">
            <SyncBadge />
            <button onClick={() => void signOut()} aria-label="Cerrar sesión" className="rounded-full p-1.5 hover:bg-white/10">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        }
      />

      <main className="flex flex-1 flex-col gap-4 p-4">
        <ReminderBanner />
        <p className="text-sm text-slate-500">Hola, {profile?.full_name}</p>

        {todayReport ? (
          <Card variant={todayReport.data?.draft?.status === 'borrador' ? 'warn' : 'success'}>
            <p className="text-sm text-slate-500">Reporte de seguridad de hoy</p>
            <p className="font-semibold text-slate-800">
              {todayReport.data?.draft?.status === 'borrador' ? 'Borrador en curso' : 'Enviado'}
            </p>
            <Button className="mt-3" size="sm" onClick={() => navigate(`/segurista/reporte/${todayReport.localId}`)}>
              {todayReport.data?.draft?.status === 'borrador' ? 'Continuar llenando' : 'Ver reporte'}
            </Button>
          </Card>
        ) : (
          <Button size="lg" fullWidth icon={<Plus className="h-5 w-5" />} onClick={handleNew}>
            Nuevo reporte del día
          </Button>
        )}

        <h2 className="mt-2 text-sm font-semibold text-slate-600">Últimos reportes</h2>
        {!reports || reports.length === 0 ? (
          <EmptyState
            icon={<ShieldAlert className="h-12 w-12" />}
            title="Sin reportes aún"
            description="Crea tu primer reporte de seguridad con el botón de arriba."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {reports.map((r) => {
              const d = r.data?.draft;
              const pct = checklistPct(d?.checklistResponses);
              return (
                <button
                  key={r.localId}
                  onClick={() => navigate(`/segurista/reporte/${r.localId}`)}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-left"
                >
                  <div>
                    <p className="font-medium text-slate-800">
                      {d?.general?.fecha ? formatDate(d.general.fecha) : 'Sin fecha'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {d?.status ?? 'borrador'} · checklist {pct}%
                    </p>
                  </div>
                  <span
                    className={
                      'rounded-full px-2.5 py-0.5 text-xs font-semibold ' +
                      (pct >= 90 ? 'bg-ok-100 text-ok-800' : pct >= 50 ? 'bg-warn-100 text-warn-800' : 'bg-slate-100 text-slate-500')
                    }
                  >
                    {pct}%
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
