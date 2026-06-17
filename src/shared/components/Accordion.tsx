import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

type AccordionColor = 'slate' | 'green' | 'amber' | 'red';

type AccordionProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  defaultOpen?: boolean;
  color?: AccordionColor;
  children: ReactNode;
};

const headerColor: Record<AccordionColor, string> = {
  slate: 'bg-white',
  green: 'bg-ok-50',
  amber: 'bg-warn-50',
  red: 'bg-bad-50',
};

const badgeColor: Record<AccordionColor, string> = {
  slate: 'bg-slate-100 text-slate-600',
  green: 'bg-ok-100 text-ok-800',
  amber: 'bg-warn-100 text-warn-800',
  red: 'bg-bad-100 text-bad-800',
};

export function Accordion({
  title,
  subtitle,
  badge,
  defaultOpen = false,
  color = 'slate',
  children,
}: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn('flex w-full items-center gap-3 px-4 py-3 text-left', headerColor[color])}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-semibold text-slate-800">{title}</span>
            {badge && (
              <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', badgeColor[color])}>
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="mt-0.5 truncate text-sm text-slate-500">{subtitle}</p>}
        </div>
        <ChevronDown
          className={cn('h-5 w-5 shrink-0 text-slate-400 transition-transform', open && 'rotate-180')}
        />
      </button>
      <div
        className={cn(
          'grid transition-all duration-200 ease-in-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-slate-100 p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
