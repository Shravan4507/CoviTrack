import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { Spinner } from '../components/common/Spinner';

// Lazy Loaded Pages for Code Splitting and Performance Optimization
const LandingPage = lazy(() =>
  import('../pages/public/LandingPage').then((m) => ({ default: m.LandingPage }))
);
const NotFoundPage = lazy(() =>
  import('../pages/public/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);
const LoginPage = lazy(() =>
  import('../pages/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('../pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);

// Patient Pages
const PatientDashboardPage = lazy(() =>
  import('../pages/patient/PatientDashboardPage').then((m) => ({ default: m.PatientDashboardPage }))
);
const BookAppointmentPage = lazy(() =>
  import('../pages/patient/BookAppointmentPage').then((m) => ({ default: m.BookAppointmentPage }))
);
const MyAppointmentsPage = lazy(() =>
  import('../pages/patient/MyAppointmentsPage').then((m) => ({ default: m.MyAppointmentsPage }))
);
const MyReportsPage = lazy(() =>
  import('../pages/patient/MyReportsPage').then((m) => ({ default: m.MyReportsPage }))
);

// Staff Pages
const StaffDashboardPage = lazy(() =>
  import('../pages/staff/StaffDashboardPage').then((m) => ({ default: m.StaffDashboardPage }))
);
const ManageSlotsPage = lazy(() =>
  import('../pages/staff/ManageSlotsPage').then((m) => ({ default: m.ManageSlotsPage }))
);
const ManageAppointmentsPage = lazy(() =>
  import('../pages/staff/ManageAppointmentsPage').then((m) => ({ default: m.ManageAppointmentsPage }))
);
const PatientListPage = lazy(() =>
  import('../pages/staff/PatientListPage').then((m) => ({ default: m.PatientListPage }))
);
const CreateReportPage = lazy(() =>
  import('../pages/staff/CreateReportPage').then((m) => ({ default: m.CreateReportPage }))
);

// Admin Pages
const AdminDashboardPage = lazy(() =>
  import('../pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);
const ManageUsersPage = lazy(() =>
  import('../pages/admin/ManageUsersPage').then((m) => ({ default: m.ManageUsersPage }))
);
const AuditLogsPage = lazy(() =>
  import('../pages/admin/AuditLogsPage').then((m) => ({ default: m.AuditLogsPage }))
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="container" style={{ paddingTop: '4rem' }}>
          <Spinner label="Loading CoviTrack module..." />
        </div>
      }
    >
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Patient Protected Routes */}
        <Route
          path="/patient/dashboard"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/book-appointment"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <BookAppointmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/appointments"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <MyAppointmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/reports"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <MyReportsPage />
            </ProtectedRoute>
          }
        />

        {/* Staff Protected Routes */}
        <Route
          path="/staff/dashboard"
          element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <StaffDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/slots"
          element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <ManageSlotsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/appointments"
          element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <ManageAppointmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/patients"
          element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <PatientListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/create-report"
          element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <CreateReportPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Protected Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/logs"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AuditLogsPage />
            </ProtectedRoute>
          }
        />

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

