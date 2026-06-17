import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

type HeaderProps = {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: ReactNode;
  className?: string;
};

/** Header sticky con color brand, botón regresar opcional y slot derecho. */
export function Header({ title, showBack = false, onBack, right, className }: HeaderProps) {
  const navigate = useNavigate();
  const handleBack = onBack ?? (() => navigate(-1));

  return (
    <header
      className={cn(
        'safe-top sticky top-0 z-20 bg-brand-500 text-white shadow-md',
        className,
      )}
    >
      <div className="flex h-14 items-center gap-2 px-4">
        {showBack && (
          <button
            type="button"
            onClick={handleBack}
            aria-label="Regresar"
            className="-ml-2 rounded-full p-1.5 hover:bg-white/10"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        <h1 className="min-w-0 flex-1 truncate text-lg font-semibold">{title}</h1>
        {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
      </div>
    </header>
  );
}
