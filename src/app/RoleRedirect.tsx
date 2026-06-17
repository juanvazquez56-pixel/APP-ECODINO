import { Navigate } from 'react-router-dom';
import { useAuth } from '@/auth/useAuth';

export function RoleRedirect() {
  const { profile } = useAuth();
  if (!profile) return null;
  switch (profile.role) {
    case 'supervisor':
      return <Navigate to="/supervisor" replace />;
    case 'segurista':
      return <Navigate to="/segurista" replace />;
    case 'auditor':
      return <Navigate to="/auditor" replace />;
    case 'admin':
      return <Navigate to="/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}
