import React from 'react';
import { useAuth } from '@/core/auth/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Activity, MapPin, Stethoscope } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 shadow-lg px-2 py-2">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {user.role === 'FARMER' ? (
          <>
            <Link
              to="/farmer/dashboard"
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                location.pathname === '/farmer/dashboard'
                  ? 'text-emerald-700 font-bold bg-emerald-50'
                  : 'text-slate-500 font-medium'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-[10px]">Dashboard</span>
            </Link>

            <Link
              to="/farmer/reports/new"
              className="flex flex-col items-center justify-center w-12 h-12 -mt-5 rounded-full bg-emerald-600 text-white shadow-lg ring-4 ring-white active:scale-95 transition-all"
            >
              <PlusCircle className="w-6 h-6" />
            </Link>

            <Link
              to="/farmer/animals"
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                location.pathname.startsWith('/farmer/animals')
                  ? 'text-emerald-700 font-bold bg-emerald-50'
                  : 'text-slate-500 font-medium'
              }`}
            >
              <Activity className="w-5 h-5" />
              <span className="text-[10px]">My Animals</span>
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/veterinarian/dashboard"
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                location.pathname === '/veterinarian/dashboard'
                  ? 'text-emerald-700 font-bold bg-emerald-50'
                  : 'text-slate-500 font-medium'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-[10px]">Overview</span>
            </Link>

            <Link
              to="/veterinarian/map"
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                location.pathname === '/veterinarian/map'
                  ? 'text-emerald-700 font-bold bg-emerald-50'
                  : 'text-slate-500 font-medium'
              }`}
            >
              <MapPin className="w-5 h-5" />
              <span className="text-[10px]">GIS Map</span>
            </Link>

            <Link
              to="/veterinarian/cases"
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                location.pathname.startsWith('/veterinarian/cases')
                  ? 'text-emerald-700 font-bold bg-emerald-50'
                  : 'text-slate-500 font-medium'
              }`}
            >
              <Stethoscope className="w-5 h-5" />
              <span className="text-[10px]">Cases</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};
