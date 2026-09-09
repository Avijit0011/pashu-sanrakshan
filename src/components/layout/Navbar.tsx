import React from 'react';
import { useAuth, DEMO_USERS } from '@/core/auth/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, UserCheck, LogOut, Activity, MapPin, PlusCircle, LayoutDashboard, Stethoscope } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useOnlineStatus } from '@/core/offline/useOnlineStatus';
import { useSyncStore } from '@/core/offline/syncManager';

export const Navbar: React.FC = () => {
  const { user, logout, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isOnline = useOnlineStatus();
  const { pendingCount } = useSyncStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const switchRole = () => {
    if (user?.role === 'FARMER') {
      loginAsDemo('VETERINARIAN');
      navigate('/veterinarian/dashboard');
    } else {
      loginAsDemo('FARMER');
      navigate('/farmer/dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to={user?.role === 'VETERINARIAN' ? '/veterinarian/dashboard' : '/farmer/dashboard'} className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1">
              Pashu<span className="text-emerald-600">Mitra</span>
            </span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase block -mt-1">
              AI Livestock Surveillance
            </span>
          </div>
        </Link>

        {/* Navigation Desktop Links */}
        {user && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
            {user.role === 'FARMER' ? (
              <>
                <Link
                  to="/farmer/dashboard"
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                    location.pathname === '/farmer/dashboard'
                      ? 'bg-white text-emerald-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                  Dashboard
                </Link>
                <Link
                  to="/farmer/animals"
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                    location.pathname.startsWith('/farmer/animals')
                      ? 'bg-white text-emerald-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Activity className="w-4 h-4 text-emerald-600" />
                  My Animals
                </Link>
                <Link
                  to="/farmer/reports/new"
                  className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  Report Sick Animal
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/veterinarian/dashboard"
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                    location.pathname === '/veterinarian/dashboard'
                      ? 'bg-white text-emerald-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                  Vet Overview
                </Link>
                <Link
                  to="/veterinarian/map"
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                    location.pathname === '/veterinarian/map'
                      ? 'bg-white text-emerald-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  GIS Outbreak Map
                </Link>
                <Link
                  to="/veterinarian/cases"
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                    location.pathname.startsWith('/veterinarian/cases')
                      ? 'bg-white text-emerald-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Stethoscope className="w-4 h-4 text-emerald-600" />
                  Case Surveillance
                </Link>
              </>
            )}
          </nav>
        )}

        {/* User profile & Role switcher */}
        {user ? (
          <div className="flex items-center gap-3">
            {/* Status Pill */}
            <div className="hidden sm:block">
              <StatusBadge
                status={
                  !isOnline
                    ? 'OFFLINE'
                    : pendingCount > 0
                    ? 'PENDING_SYNC'
                    : 'ONLINE'
                }
              />
            </div>

            {/* Quick Role Switcher Button */}
            <button
              onClick={switchRole}
              title="Switch Demo Role for SIH Judges"
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">Role:</span>
              <span className="uppercase text-[11px] bg-amber-200/80 px-1.5 py-0.5 rounded">
                {user.role}
              </span>
            </button>

            {/* User badge */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-300">
                {user.name.charAt(0)}
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
