import { cn } from '@/shared/utils/cn';

type BlockBannerProps = {
  label: string;
  color: 'green' | 'amber';
  pct: number | null;
};

export function BlockBanner({ label, color, pct }: BlockBannerProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-xl px-4 py-3 font-semibold',
        color === 'green' ? 'bg-ok-100 text-ok-800' : 'bg-warn-100 text-warn-800',
      )}
    >
      <span>{label}</span>
      <span className="text-sm">{pct != null ? `${pct}%` : 'sin datos'}</span>
    </div>
  );
}
