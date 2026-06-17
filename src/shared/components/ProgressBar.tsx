import { cn } from '@/shared/utils/cn';

type ProgressBarProps = {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
};

export function ProgressBar({ value, className, showLabel = true }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/30">
        <div
          className="h-full rounded-full bg-white transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && <span className="text-xs font-medium text-white">{pct}%</span>}
    </div>
  );
}
