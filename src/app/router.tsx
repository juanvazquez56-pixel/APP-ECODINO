import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { LoginPage } from '@/auth/LoginPage';
import { ForgotPasswordPage } from '@/auth/ForgotPasswordPage';
import { SupervisorHome } from '@/modules/supervisor/HomePage';
import { SupervisorReportFormPage } from '@/modules/supervisor/ReportFormPage';
import { SeguristaHome } from '@/modules/segurista/HomePage';
import { SafetyReportFormPage } from '@/modules/segurista/ReportFormPage';
import { AuditorHome } from '@/modules/auditor/HomePage';
import { AuditFormPage } from '@/modules/auditor/AuditFormPage';
import { AdminLayout } from '@/modules/admin/AdminLayout';
import { AdminDashboardHome } from '@/modules/admin/pages/Home';
import { RegistrosLayout } from '@/modules/admin/pages/RegistrosLayout';
import { RecordsListPage } from '@/modules/admin/pages/RecordsListPage';
import { RegistroDetalle } from '@/modules/admin/pages/RegistroDetalle';
import { Hallazgos } from '@/modules/admin/pages/Hallazgos';
import { CatalogosLayout } from '@/modules/admin/pages/CatalogosLayout';
import { Plantas } from '@/modules/admin/pages/Plantas';
import { Personal } from '@/modules/admin/pages/Personal';
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
    path: '/supervisor/reporte/:localId',
    element: (
      <ProtectedRoute allowedRoles={['supervisor']}>
        <SupervisorReportFormPage />
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
    path: '/segurista/reporte/:localId',
    element: (
      <ProtectedRoute allowedRoles={['segurista']}>
        <SafetyReportFormPage />
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
    path: '/auditor/auditoria/:localId',
    element: (
      <ProtectedRoute allowedRoles={['auditor']}>
        <AuditFormPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="home" replace /> },
      { path: 'home', element: <AdminDashboardHome /> },
      {
        path: 'registros',
        element: <RegistrosLayout />,
        children: [
          { index: true, element: <Navigate to="auditorias" replace /> },
          { path: 'auditorias', element: <RecordsListPage kind="auditoria" /> },
          { path: 'supervisor', element: <RecordsListPage kind="supervisor" /> },
          { path: 'segurista', element: <RecordsListPage kind="segurista" /> },
          { path: ':kind/:id', element: <RegistroDetalle /> },
        ],
      },
      { path: 'hallazgos', element: <Hallazgos /> },
      {
        path: 'catalogos',
        element: <CatalogosLayout />,
        children: [
          { index: true, element: <Navigate to="plantas" replace /> },
          { path: 'plantas', element: <Plantas /> },
          { path: 'personal', element: <Personal /> },
        ],
      },
    ],
  },
  // Compatibilidad: la home de admin del Bloque 1 apuntaba a /dashboard.
  { path: '/dashboard', element: <Navigate to="/admin/home" replace /> },
  { path: '*', element: <Navigate to="/" replace /> },
]);
