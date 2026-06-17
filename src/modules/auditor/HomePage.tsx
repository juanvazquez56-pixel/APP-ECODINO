import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, LogOut, ClipboardCheck } from 'lucide-react';
import { Header } from '@/shared/components/Header';
import { Button } from '@/shared/components/Button';
import { EmptyState } from '@/shared/components/EmptyState';
import { SyncBadge } from '@/shared/components/SyncBadge';
import { SemaforoPill } from '@/shared/components/SemaforoPill';
import { useAuth } from '@/auth/useAuth';
import { db } from '@/db/dexie';
import { formatDate } from '@/shared/utils/formatDate';
import { auditResult, useAuditorStore } from '@/modules/auditor/store';

export function AuditorHome() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const newDraft = useAuditorStore((s) => s.newDraft);

  const audits = useLiveQuery(
    () => db.audits.orderBy('lastModified').reverse().limit(10).toArray(),
    [],
    [],
  );

  const handleNew = () => {
    const id = newDraft();
    navigate(`/auditor/auditoria/${id}`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        title="Mis auditorías"
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
        <p className="text-sm text-slate-500">Hola, {profile?.full_name}</p>

        <Button size="lg" fullWidth icon={<Plus className="h-5 w-5" />} onClick={handleNew}>
          Nueva auditoría
        </Button>

        <h2 className="mt-2 text-sm font-semibold text-slate-600">Auditorías recientes</h2>
        {!audits || audits.length === 0 ? (
          <EmptyState
            icon={<ClipboardCheck className="h-12 w-12" />}
            title="Sin auditorías aún"
            description="Crea tu primera auditoría con el botón de arriba."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {audits.map((a) => {
              const d = a.data?.draft;
              const { pct, semaforo } = auditResult(d?.responses ?? {});
              return (
                <button
                  key={a.localId}
                  onClick={() => navigate(`/auditor/auditoria/${a.localId}`)}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-left"
                >
                  <div>
                    <p className="font-medium text-slate-800">
                      {d?.general?.fecha ? formatDate(d.general.fecha) : 'Sin fecha'}
                    </p>
                    <p className="text-xs text-slate-500">{d?.status ?? 'borrador'}</p>
                  </div>
                  <SemaforoPill semaforo={semaforo} pct={pct} />
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
