import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { SemaforoPill } from '@/shared/components/SemaforoPill';
import type { Semaforo } from '@/shared/utils/calcSemaforo';

type KpiCardProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  semaforo?: Semaforo;
  loading?: boolean;
  icon?: ReactNode;
};

export function KpiCard({ label, value, hint, semaforo, loading, icon }: KpiCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        {icon && <span className="text-slate-300">{icon}</span>}
      </div>
      {loading ? (
        <div className="mt-2 flex h-9 items-center">
          <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
        </div>
      ) : (
        <div className="mt-1 flex items-center gap-2">
          <p className="text-3xl font-bold text-brand-700">{value}</p>
          {semaforo && <SemaforoPill semaforo={semaforo} />}
        </div>
      )}
      {hint && !loading && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
