import type { ReactNode } from 'react';

/**
 * Punto único para envolver la app con providers globales
 * (tema, contextos, etc.). Por ahora pasa los children tal cual.
 */
export function Providers({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
