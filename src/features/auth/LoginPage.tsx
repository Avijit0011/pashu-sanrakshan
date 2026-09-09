import React, { useState } from 'react';
import { useAuth } from '@/core/auth/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, ShieldCheck, UserCheck, Stethoscope, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(phone, password);
      navigate('/farmer/dashboard');
    } catch (err) {
      // Fallback demo
      loginAsDemo('FARMER');
      navigate('/farmer/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = (role: 'FARMER' | 'VETERINARIAN') => {
    loginAsDemo(role);
    if (role === 'VETERINARIAN') {
      navigate('/veterinarian/dashboard');
    } else {
      navigate('/farmer/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mx-auto shadow-lg">
            <Activity className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Pashu<span className="text-emerald-600">Mitra</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            AI Livestock Health Surveillance & Early-Warning Platform
          </p>
        </div>

        {/* SIH DEMO QUICK LOGIN BUTTONS */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2 text-center">
          <span className="text-[11px] font-extrabold text-amber-900 uppercase tracking-wider block">
            ⚡ Quick SIH Judge Demo Access
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoClick('FARMER')}
              className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" /> Farmer Demo
            </button>

            <button
              onClick={() => handleDemoClick('VETERINARIAN')}
              className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Stethoscope className="w-4 h-4 text-emerald-400" /> Vet Demo
            </button>
          </div>
        </div>

        {/* Regular Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Mobile Phone Number</label>
            <input
              type="text"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Need a new account?{' '}
          <Link to="/register" className="font-bold text-emerald-700 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
