import { useState } from 'react';
import type { ReactNode } from 'react';
import { Info, AlertTriangle, XCircle, X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

type Tone = 'info' | 'warn' | 'error';

type BannerProps = {
  tone?: Tone;
  title: string;
  children?: ReactNode;
  dismissible?: boolean;
};

const toneConfig: Record<Tone, { wrap: string; icon: ReactNode }> = {
  info: { wrap: 'bg-brand-50 text-brand-700 border-brand-100', icon: <Info className="h-5 w-5" /> },
  warn: { wrap: 'bg-warn-50 text-warn-800 border-warn-100', icon: <AlertTriangle className="h-5 w-5" /> },
  error: { wrap: 'bg-bad-50 text-bad-800 border-bad-100', icon: <XCircle className="h-5 w-5" /> },
};

export function Banner({ tone = 'info', title, children, dismissible = false }: BannerProps) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  const cfg = toneConfig[tone];

  return (
    <div className={cn('flex items-start gap-3 rounded-xl border p-3', cfg.wrap)} role="status">
      <span className="mt-0.5 shrink-0">{cfg.icon}</span>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{title}</p>
        {children && <div className="mt-0.5 text-sm opacity-90">{children}</div>}
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Cerrar"
          className="shrink-0 rounded-md p-1 hover:bg-black/5"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
