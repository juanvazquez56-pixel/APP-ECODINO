import type { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

type BottomBarProps = {
  children: ReactNode;
  className?: string;
};

/** Barra inferior fija con safe-area, para acciones primarias de pantalla. */
export function BottomBar({ children, className }: BottomBarProps) {
  return (
    <div
      className={cn(
        'safe-bottom sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur',
        className,
      )}
    >
      <div className="flex items-center gap-3 px-4 py-3">{children}</div>
    </div>
  );
}
