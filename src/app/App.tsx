import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/app/router';
import { Providers } from '@/app/providers';
import { useAuth } from '@/auth/useAuth';
import { Loading } from '@/shared/components/Loading';

export function App() {
  const loading = useAuth((s) => s.loading);
  const initialize = useAuth((s) => s.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  if (loading) return <Loading text="Iniciando sesión…" />;

  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
}
