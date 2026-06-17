import { cn } from '@/shared/utils/cn';
import type { Semaforo } from '@/shared/utils/calcSemaforo';

type SemaforoPillProps = {
  semaforo: Semaforo;
  pct?: number | null;
  label?: string;
  size?: 'sm' | 'lg';
};

const config: Record<Semaforo, { bg: string; text: string; defaultLabel: string }> = {
  verde: { bg: 'bg-ok-100', text: 'text-ok-800', defaultLabel: 'Verde' },
  amarillo: { bg: 'bg-warn-100', text: 'text-warn-800', defaultLabel: 'Amarillo' },
  rojo: { bg: 'bg-bad-100', text: 'text-bad-800', defaultLabel: 'Rojo' },
  'sin-datos': { bg: 'bg-slate-100', text: 'text-slate-500', defaultLabel: 'Sin datos' },
};

export function SemaforoPill({ semaforo, pct, label, size = 'sm' }: SemaforoPillProps) {
  const c = config[semaforo];
  const text =
    label ?? (pct != null ? `${pct}%` : c.defaultLabel);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold',
        c.bg,
        c.text,
        size === 'lg' ? 'px-4 py-1.5 text-base' : 'px-2.5 py-0.5 text-xs',
      )}
    >
      <span
        className={cn(
          'rounded-full',
          size === 'lg' ? 'h-2.5 w-2.5' : 'h-2 w-2',
          semaforo === 'verde' && 'bg-ok-500',
          semaforo === 'amarillo' && 'bg-warn-500',
          semaforo === 'rojo' && 'bg-bad-500',
          semaforo === 'sin-datos' && 'bg-slate-400',
        )}
      />
      {text}
    </span>
  );
}
