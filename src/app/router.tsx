import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../core/auth/AuthContext';
import { Navbar } from '../components/layout/Navbar';
import { OfflineBanner } from '../components/layout/OfflineBanner';
import { BottomNav } from '../components/layout/BottomNav';

// Pages
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';

import { FarmerDashboard } from '../features/farmer/FarmerDashboard';
import { AnimalsList } from '../features/farmer/AnimalsList';
import { NewReportStepper } from '../features/farmer/NewReportStepper';

import { VetDashboard } from '../features/veterinary/VetDashboard';
import { GISMapPage } from '../features/veterinary/GISMapPage';
import { CaseDetailPage } from '../features/veterinary/CaseDetailPage';

// Protected Layout with Navbar, Offline Banner & Bottom Navigation
const ProtectedLayout: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 font-bold text-sm">
        Loading PashuMitra Surveillance System...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <OfflineBanner />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

// Role Guard Component
const RoleGuard: React.FC<{ role: 'FARMER' | 'VETERINARIAN'; children: React.ReactNode }> = ({
  role,
  children,
}) => {
  const { user } = useAuth();
  if (user?.role !== role) {
    return <Navigate to={user?.role === 'VETERINARIAN' ? '/veterinarian/dashboard' : '/farmer/dashboard'} replace />;
  }
  return <>{children}</>;
};

export const AppRouter: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Application Routes */}
      <Route element={<ProtectedLayout />}>
        {/* Farmer Workflow Routes */}
        <Route
          path="/farmer/dashboard"
          element={
            <RoleGuard role="FARMER">
              <FarmerDashboard />
            </RoleGuard>
          }
        />
        <Route
          path="/farmer/animals"
          element={
            <RoleGuard role="FARMER">
              <AnimalsList />
            </RoleGuard>
          }
        />
        <Route
          path="/farmer/reports/new"
          element={
            <RoleGuard role="FARMER">
              <NewReportStepper />
            </RoleGuard>
          }
        />

        {/* Veterinarian Workflow Routes */}
        <Route
          path="/veterinarian/dashboard"
          element={
            <RoleGuard role="VETERINARIAN">
              <VetDashboard />
            </RoleGuard>
          }
        />
        <Route
          path="/veterinarian/map"
          element={
            <RoleGuard role="VETERINARIAN">
              <GISMapPage />
            </RoleGuard>
          }
        />
        <Route
          path="/veterinarian/cases"
          element={
            <RoleGuard role="VETERINARIAN">
              <VetDashboard />
            </RoleGuard>
          }
        />
        <Route
          path="/veterinarian/cases/:id"
          element={
            <RoleGuard role="VETERINARIAN">
              <CaseDetailPage />
            </RoleGuard>
          }
        />

        {/* Default Landing Redirect */}
        <Route
          path="*"
          element={
            <Navigate
              to={user?.role === 'VETERINARIAN' ? '/veterinarian/dashboard' : '/farmer/dashboard'}
              replace
            />
          }
        />
      </Route>
    </Routes>
  );
};
