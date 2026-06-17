import type { HTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

type Variant = 'default' | 'success' | 'warn' | 'danger';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: Variant;
};

const variantClasses: Record<Variant, string> = {
  default: 'bg-white border-slate-200',
  success: 'bg-ok-50 border-ok-100',
  warn: 'bg-warn-50 border-warn-100',
  danger: 'bg-bad-50 border-bad-100',
};

export function Card({ variant = 'default', className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-4 shadow-sm',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
