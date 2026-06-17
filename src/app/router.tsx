import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { LoginPage } from '@/auth/LoginPage';
import { ForgotPasswordPage } from '@/auth/ForgotPasswordPage';
import { SupervisorHome } from '@/modules/supervisor/HomePage';
import { SeguristaHome } from '@/modules/segurista/HomePage';
import { AuditorHome } from '@/modules/auditor/HomePage';
import { AdminHome } from '@/modules/admin/HomePage';
import { RoleRedirect } from '@/app/RoleRedirect';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <RoleRedirect />
      </ProtectedRoute>
    ),
  },
  {
    path: '/supervisor',
    element: (
      <ProtectedRoute allowedRoles={['supervisor']}>
        <SupervisorHome />
      </ProtectedRoute>
    ),
  },
  {
    path: '/segurista',
    element: (
      <ProtectedRoute allowedRoles={['segurista']}>
        <SeguristaHome />
      </ProtectedRoute>
    ),
  },
  {
    path: '/auditor',
    element: (
      <ProtectedRoute allowedRoles={['auditor']}>
        <AuditorHome />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminHome />
      </ProtectedRoute>
    ),
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
