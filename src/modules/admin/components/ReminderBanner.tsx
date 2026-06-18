import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, X } from 'lucide-react';
import { useAuth } from '@/auth/useAuth';
import { db } from '@/db/dexie';
import { fetchTodayReport } from '@/db/queries/supervisorReports';
import { fetchTodaySafetyReport } from '@/db/queries/safetyReports';

/** Día hábil L–V dentro de 8:00–17:30. */
function isWorkingWindow(now = new Date()): boolean {
  const day = now.getDay(); // 0 dom … 6 sáb
  if (day === 0 || day === 6) return false;
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes >= 8 * 60 && minutes <= 17 * 60 + 30;
}

async function submittedToday(role: 'supervisor' | 'segurista', profileId: string, today: string) {
  // 1) Estado local (Dexie) — funciona offline.
  const table = role === 'supervisor' ? db.supervisorReports : db.safetyReports;
  const local = await table.toArray();
  const localDone = local.some(
    (r) => r.data?.draft?.general?.fecha === today && r.data?.draft?.status !== 'borrador',
  );
  if (localDone) return true;

  // 2) Remoto, si hay conexión.
  if (navigator.onLine) {
    try {
      const remote =
        role === 'supervisor'
          ? await fetchTodayReport(profileId, today)
          : await fetchTodaySafetyReport(profileId, today);
      if (remote && ['enviado', 'aprobado'].includes((remote as any).status)) return true;
    } catch {
      // ignoramos errores de red
    }
  }
  return false;
}

const DISMISS_KEY = 'reminder-dismissed';

export function ReminderBanner() {
  const { profile } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!profile) return;
    if (profile.role !== 'supervisor' && profile.role !== 'segurista') return;
    if (!isWorkingWindow()) return;

    const today = new Date().toISOString().slice(0, 10);
    if (sessionStorage.getItem(`${DISMISS_KEY}-${today}`)) return;

    let active = true;
    submittedToday(profile.role, profile.id, today).then((done) => {
      if (active && !done) setShow(true);
    });
    return () => {
      active = false;
    };
  }, [profile]);

  if (!show || !profile) return null;

  const target = profile.role === 'supervisor' ? '/supervisor' : '/segurista';
  const today = new Date().toISOString().slice(0, 10);

  const dismiss = () => {
    sessionStorage.setItem(`${DISMISS_KEY}-${today}`, '1');
    setShow(false);
  };

  return (
    <div className="flex items-start gap-3 rounded-xl border border-warn-100 bg-warn-50 p-3 text-warn-800">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-medium">Te falta tu reporte de hoy</p>
        <p className="text-sm">
          Aún no has enviado tu reporte del día.{' '}
          <Link to={target} className="font-semibold underline">
            Llenarlo ahora
          </Link>
          .
        </p>
      </div>
      <button onClick={dismiss} aria-label="Descartar" className="shrink-0 rounded-md p-1 hover:bg-black/5">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
