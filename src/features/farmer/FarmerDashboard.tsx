import React, { useState, useEffect } from 'react';
import { DiseaseReport, Animal } from '@/types';
import { api } from '@/core/api/axiosInstance';
import { db } from '@/core/storage/dexieDb';
import { useAuth } from '@/core/auth/AuthContext';
import { useSyncStore } from '@/core/offline/syncManager';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RiskLevelBadge } from '@/components/ui/RiskLevelBadge';
import { AddAnimalModal } from './AddAnimalModal';
import {
  PlusCircle,
  Activity,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  Plus,
  ChevronRight,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { AIAssessmentModal } from '../ai/components/AIAssessmentModal';
import { Cpu } from 'lucide-react';

const SPECIES_EMOJI: Record<string, string> = {
  Cow: '🐄',
  Buffalo: '🦬',
  Goat: '🐐',
  Sheep: '🐑',
};

export const FarmerDashboard: React.FC = () => {
  const { user, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const { pendingCount, isSyncing, syncNow } = useSyncStore();

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [reports, setReports] = useState<DiseaseReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddAnimalOpen, setIsAddAnimalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [animalsRes, reportsRes] = await Promise.all([
          api.get('/animals'),
          api.get('/reports'),
        ]);

        let fetchedAnimals = animalsRes.data || [];
        let fetchedReports = reportsRes.data || [];

        // Combine with Dexie offline records if present
        const offlineReps = await db.offlineReports.toArray();
        const offlineAnims = await db.offlineAnimals.toArray();

        if (offlineAnims.length > 0) {
          fetchedAnimals = [...fetchedAnimals, ...offlineAnims];
        }
        if (offlineReps.length > 0) {
          fetchedReports = [...offlineReps, ...fetchedReports];
        }

        setAnimals(fetchedAnimals);
        setReports(fetchedReports);
      } catch (err) {
        // Load from Dexie completely if offline
        const offlineReps = await db.offlineReports.toArray();
        const offlineAnims = await db.offlineAnimals.toArray();

        setAnimals(offlineAnims as Animal[]);
        setReports(offlineReps as DiseaseReport[]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const highRiskCount = reports.filter(
    (r) => r.risk_level === 'HIGH' || r.risk_level === 'CRITICAL'
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-bold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Farmer Health Portal
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Welcome back, {user?.name.split(' ')[0]}!
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl">
              Monitor livestock health, perform AI disease screening, and alert regional veterinary officers.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="px-5 py-3.5 bg-emerald-500/20 border border-emerald-300/40 hover:bg-emerald-500/30 text-white rounded-2xl font-bold text-sm shadow-lg backdrop-blur-md flex items-center gap-2 transition"
            >
              <Cpu className="w-5 h-5 text-emerald-300" />
              AI Disease Screener
            </button>
            <Link
              to="/farmer/reports/new"
              className="px-6 py-4 bg-white text-emerald-950 hover:bg-emerald-50 rounded-2xl font-black text-base shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 shrink-0 group border-2 border-white/20"
            >
              <PlusCircle className="w-6 h-6 text-emerald-600 group-hover:rotate-90 transition-transform duration-300" />
              Report Sick Animal
            </Link>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Animals */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Animals</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">{animals.length}</div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-500">On Farm Inventory</span>
            <button
              onClick={() => setIsAddAnimalOpen(true)}
              className="text-emerald-700 font-bold hover:underline flex items-center gap-0.5"
            >
              <Plus className="w-3 h-3" /> Add Animal
            </button>
          </div>
        </div>

        {/* Active Reports */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active Reports</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">{reports.length}</div>
          <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
            Submitted surveillance cases
          </div>
        </div>

        {/* High Risk Alerts */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">High Risk Alerts</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-700 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-red-600 font-mono">{highRiskCount}</div>
          <div className="text-xs text-red-700 font-semibold pt-2 border-t border-slate-100">
            {highRiskCount > 0 ? 'Requires Vet Inspection' : 'No Critical Alerts'}
          </div>
        </div>

        {/* Offline Sync Status */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Sync Status</span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                pendingCount > 0 ? 'bg-orange-50 text-orange-700' : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {pendingCount > 0 ? `${pendingCount} Pending` : 'All Synced'}
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-500">IndexedDB Storage</span>
            {pendingCount > 0 && (
              <button
                onClick={() => syncNow()}
                disabled={isSyncing}
                className="text-orange-700 font-bold hover:underline"
              >
                Sync Now
              </button>
            )}
          </div>
        </div>
      </div>

      {/* REGISTERED ANIMALS ON DASHBOARD SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              Registered Farm Animals
            </h3>
            <p className="text-xs text-slate-500">Your registered livestock inventory available for disease reporting</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddAnimalOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Animal
            </button>
            <Link
              to="/farmer/animals"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
            >
              View All ({animals.length}) <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {animals.length === 0 ? (
          <div className="py-8 text-center text-slate-400 space-y-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <Activity className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No animals registered yet.</p>
            <p className="text-xs text-slate-500">Add your cows, buffaloes, goats, or sheep to start health tracking.</p>
            <button
              onClick={() => setIsAddAnimalOpen(true)}
              className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Register Animal Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {animals.slice(0, 4).map((animal) => (
              <div
                key={animal.id}
                className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 bg-slate-50/40 hover:bg-emerald-50/20 transition-all space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{SPECIES_EMOJI[animal.species] || '🐄'}</span>
                    <div>
                      <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">
                        {animal.species}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 leading-tight">
                        {animal.animal_identifier}
                      </h4>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1 text-[11px] bg-white p-2 rounded-xl border border-slate-100 font-medium">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Breed</span>
                    <span className="font-bold text-slate-800 truncate block">{animal.breed || 'Desi'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Age & Sex</span>
                    <span className="font-bold text-slate-800">{animal.age} yrs ({animal.sex.charAt(0)})</span>
                  </div>
                </div>

                <Link
                  to="/farmer/reports/new"
                  className="w-full py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1"
                >
                  <Stethoscope className="w-3.5 h-3.5" /> Report Sickness
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/farmer/reports/new"
          className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-3xl text-white shadow-md hover:shadow-xl transition-all group flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">Quick Action</span>
            <h3 className="text-xl font-extrabold">Report Sick Animal</h3>
            <p className="text-xs text-emerald-100 max-w-xs">
              Select symptoms, upload photo, and run instant AI risk screening.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
            <PlusCircle className="w-7 h-7 stroke-[2.5]" />
          </div>
        </Link>

        <Link
          to="/farmer/animals"
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Management</span>
            <h3 className="text-xl font-extrabold text-slate-900">Manage Farm Animals</h3>
            <p className="text-xs text-slate-500 max-w-xs">
              Register cattle, buffaloes, goats, or sheep to your farm inventory.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
            <Activity className="w-7 h-7 stroke-[2.5]" />
          </div>
        </Link>
      </div>

      {/* Recent Health Reports */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Recent Health Reports</h3>
            <p className="text-xs text-slate-500">Live surveillance timeline & AI screening scores</p>
          </div>
          <Link
            to="/farmer/reports/new"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            + New Report
          </Link>
        </div>

        {reports.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto opacity-40" />
            <p className="text-sm font-semibold text-slate-600">No health reports submitted yet.</p>
            <p className="text-xs">Click "Report Sick Animal" to start early disease screening.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reports.slice(0, 5).map((report) => (
              <div
                key={report.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 p-3 rounded-2xl transition-colors"
              >
                <div className="flex items-start gap-3">
                  {report.image_url ? (
                    <img
                      src={report.image_url}
                      alt="Symptom preview"
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 font-extrabold text-xs">
                      {report.animal?.species || 'COW'}
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-900">
                        {report.animal?.animal_identifier || 'Animal'} ({report.animal?.species})
                      </span>
                      <RiskLevelBadge level={report.risk_level} score={report.risk_score} size="sm" />
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1">
                      <strong>Symptoms:</strong> {report.symptoms.join(', ')}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{new Date(report.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{report.affected_count} affected</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0">
                  <StatusBadge status={report.status} />
                  <button
                    onClick={() => {
                      loginAsDemo('VETERINARIAN');
                      navigate(`/veterinarian/cases/${report.id}`);
                    }}
                    title="View report in Vet Demo Portal"
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 shadow-sm"
                  >
                    <Stethoscope className="w-3.5 h-3.5 text-amber-700" />
                    Vet View
                  </button>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Animal Modal */}
      <AddAnimalModal
        isOpen={isAddAnimalOpen}
        onClose={() => setIsAddAnimalOpen(false)}
        onSuccess={() => {
          // Refresh animal list
          api.get('/animals').then((res) => setAnimals(res.data || []));
        }}
      />

      {/* AI Multi-Modal Health Screening Modal */}
      <AIAssessmentModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
    </div>
  );
};
