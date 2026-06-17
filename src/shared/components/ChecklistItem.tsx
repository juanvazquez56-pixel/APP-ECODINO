import { Check, X, Minus } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export type ChecklistValue = 'C' | 'NC' | 'NA' | undefined;

type ChecklistItemProps = {
  text: string;
  suggestedTime?: string;
  value: ChecklistValue;
  onChange: (value: 'C' | 'NC' | 'NA') => void;
  variant?: 'three-state' | 'done-only';
};

export function ChecklistItem({
  text,
  suggestedTime,
  value,
  onChange,
  variant = 'three-state',
}: ChecklistItemProps) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 py-2 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-800">{text}</p>
        {suggestedTime && <p className="mt-0.5 text-xs text-slate-400">{suggestedTime}</p>}
      </div>

      {variant === 'done-only' ? (
        <button
          type="button"
          aria-pressed={value === 'C'}
          aria-label="Marcar como hecho"
          onClick={() => onChange('C')}
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 transition-colors',
            value === 'C'
              ? 'border-ok-500 bg-ok-500 text-white'
              : 'border-slate-300 bg-white text-slate-300',
          )}
        >
          <Check className="h-6 w-6" />
        </button>
      ) : (
        <div className="flex shrink-0 gap-1.5">
          <StateButton
            active={value === 'C'}
            activeClass="border-ok-500 bg-ok-500 text-white"
            onClick={() => onChange('C')}
            label="Cumple"
          >
            <Check className="h-5 w-5" />
          </StateButton>
          <StateButton
            active={value === 'NC'}
            activeClass="border-bad-500 bg-bad-500 text-white"
            onClick={() => onChange('NC')}
            label="No cumple"
          >
            <X className="h-5 w-5" />
          </StateButton>
          <StateButton
            active={value === 'NA'}
            activeClass="border-slate-500 bg-slate-500 text-white"
            onClick={() => onChange('NA')}
            label="No aplica"
          >
            <Minus className="h-5 w-5" />
          </StateButton>
        </div>
      )}
    </div>
  );
}

function StateButton({
  active,
  activeClass,
  onClick,
  label,
  children,
}: {
  active: boolean;
  activeClass: string;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        'flex h-11 w-11 items-center justify-center rounded-xl border-2 transition-colors',
        active ? activeClass : 'border-slate-200 bg-white text-slate-300',
      )}
    >
      {children}
    </button>
  );
}
