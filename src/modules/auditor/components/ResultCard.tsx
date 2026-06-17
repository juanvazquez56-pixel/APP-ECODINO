import { Card } from '@/shared/components/Card';
import { SemaforoPill } from '@/shared/components/SemaforoPill';
import { auditResult, useAuditorStore } from '@/modules/auditor/store';

export function ResultCard() {
  const responses = useAuditorStore((s) => s.draft.responses);
  const { c, nc, na, pct, semaforo } = auditResult(responses);

  const variant = semaforo === 'verde' ? 'success' : semaforo === 'rojo' ? 'danger' : semaforo === 'amarillo' ? 'warn' : 'default';

  return (
    <Card variant={variant}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Cumplimiento</p>
          <p className="text-4xl font-bold text-brand-700">{pct != null ? `${pct}%` : '—'}</p>
        </div>
        <SemaforoPill semaforo={semaforo} pct={pct} size="lg" />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-ok-50 py-2">
          <p className="text-lg font-bold text-ok-800">{c}</p>
          <p className="text-xs text-ok-800">Cumple</p>
        </div>
        <div className="rounded-lg bg-bad-50 py-2">
          <p className="text-lg font-bold text-bad-800">{nc}</p>
          <p className="text-xs text-bad-800">No cumple</p>
        </div>
        <div className="rounded-lg bg-slate-100 py-2">
          <p className="text-lg font-bold text-slate-600">{na}</p>
          <p className="text-xs text-slate-600">N.A.</p>
        </div>
      </div>
    </Card>
  );
}
