import { useSyncStatus } from '@/shared/hooks/useSyncStatus';
import { cn } from '@/shared/utils/cn';

/** Badge de estado de sincronización para el header de cada pantalla. */
export function SyncBadge() {
  const { isOnline, pendingCount, syncingCount, errorCount, forceSyncNow } = useSyncStatus();

  let dot = 'bg-ok-500';
  let label = 'Sincronizado';
  let clickable = false;

  if (errorCount > 0) {
    dot = 'bg-bad-500';
    label = 'Error de sync';
    clickable = true;
  } else if (!isOnline) {
    dot = 'bg-slate-400';
    label = 'Sin conexión';
  } else if (syncingCount > 0) {
    dot = 'bg-brand-100';
    label = 'Sincronizando…';
  } else if (pendingCount > 0) {
    dot = 'bg-warn-500';
    label = `${pendingCount} pendiente${pendingCount > 1 ? 's' : ''}`;
  }

  const content = (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-white">
      <span className={cn('h-2 w-2 rounded-full', dot, syncingCount > 0 && 'animate-pulse')} />
      {label}
    </span>
  );

  if (clickable) {
    return (
      <button type="button" onClick={() => void forceSyncNow()} title="Reintentar sincronización">
        {content}
      </button>
    );
  }
  return content;
}
