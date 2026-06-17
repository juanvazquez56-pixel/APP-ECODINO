import { Loader2 } from 'lucide-react';

type LoadingProps = {
  text?: string;
};

/** Pantalla completa con spinner centrado y texto opcional. */
export function Loading({ text = 'Cargando…' }: LoadingProps) {
  return (
    <div className="flex h-full min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-slate-600">
      <Loader2 className="h-8 w-8 animate-spin text-brand-500" aria-hidden />
      {text && <p className="text-sm">{text}</p>}
    </div>
  );
}
