import React, { useState, useEffect } from 'react';
import { DiseaseReport, Cluster } from '@/types';
import { api } from '@/core/api/axiosInstance';
import { db } from '@/core/storage/dexieDb';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RiskLevelBadge } from '@/components/ui/RiskLevelBadge';
import { ClusterAlertCard } from './ClusterAlertCard';
import { GISMap } from '@/components/maps/GISMap';
import {
  Stethoscope,
  MapPin,
  AlertTriangle,
  Activity,
  ChevronRight,
  TrendingUp,
  Eye,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const VetDashboard: React.FC = () => {
  const [reports, setReports] = useState<DiseaseReport[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVetData = async () => {
      setLoading(true);
      try {
        const [repRes, clusRes] = await Promise.all([
          api.get('/reports'),
          api.get('/map/clusters'),
        ]);

        let fetchedReports = repRes.data || [];
        let fetchedClusters = clusRes.data || [];

        // Combine offline Dexie reports
        const offlineReps = await db.offlineReports.toArray();
        if (offlineReps.length > 0) {
          fetchedReports = [...offlineReps, ...fetchedReports];
        }

        setReports(fetchedReports);
        setClusters(fetchedClusters);
      } catch (err) {
        const offlineReps = await db.offlineReports.toArray();
        setReports(offlineReps as DiseaseReport[]);
      } finally {
        setLoading(false);
      }
    };

    loadVetData();
  }, []);

  // Compute stats
  const highRiskCases = reports.filter((r) => r.risk_level === 'HIGH' || r.risk_level === 'CRITICAL');
  const mediumRiskCases = reports.filter((r) => r.risk_level === 'MEDIUM');
  const pendingReviews = reports.filter((r) => r.status === 'PENDING_VET_REVIEW' || r.status === 'SUBMITTED');

  // Chart data
  const chartData = [
    { name: 'Low Risk', count: reports.filter((r) => r.risk_level === 'LOW').length, color: '#10b981' },
    { name: 'Medium Risk', count: mediumRiskCases.length, color: '#f59e0b' },
    { name: 'High Risk', count: reports.filter((r) => r.risk_level === 'HIGH').length, color: '#f97316' },
    { name: 'Critical Risk', count: reports.filter((r) => r.risk_level === 'CRITICAL').length, color: '#ef4444' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider">
            MVP Point 2 — District Veterinary Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Surveillance & Intervention</h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/veterinarian/map"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" /> Full GIS Outbreak Map
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* High Risk Cases */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">High Risk Cases</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-red-600 font-mono">{highRiskCases.length}</div>
          <div className="text-xs text-red-700 font-semibold pt-2 border-t border-slate-100">
            Action required by district vet
          </div>
        </div>

        {/* Medium Risk Cases */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Medium Risk Cases</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600 font-mono">{mediumRiskCases.length}</div>
          <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
            Under active surveillance
          </div>
        </div>

        {/* Pending Reviews */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Reviews</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">{pendingReviews.length}</div>
          <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
            Unassigned triage queue
          </div>
        </div>

        {/* Potential Clusters */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Potential Clusters</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-600 font-mono">{clusters.length}</div>
          <div className="text-xs text-rose-700 font-semibold pt-2 border-t border-slate-100">
            Spatial Haversine Clusters
          </div>
        </div>
      </div>

      {/* Cluster Alert Banner if present */}
      {clusters.length > 0 && <ClusterAlertCard cluster={clusters[0]} />}

      {/* Charts & GIS Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Chart */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Risk Profile Breakdown</h3>
              <p className="text-xs text-slate-500">Surveillance case severity distribution</p>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Interactive GIS Map Preview */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Regional GIS Outbreak Map</h3>
              <p className="text-xs text-slate-500">Geographic distribution of reported cases & cluster zones</p>
            </div>
            <Link
              to="/veterinarian/map"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              Full Screen Map <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <GISMap reports={reports} clusters={clusters} height="300px" showLegend={false} />
        </div>
      </div>

      {/* Triage Cases Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Veterinary Triage Queue</h3>
            <p className="text-xs text-slate-500">Reports sorted by AI risk score & urgency</p>
          </div>
          <Link
            to="/veterinarian/cases"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            View All Cases ({reports.length})
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-3 px-4 rounded-l-xl">Case ID</th>
                <th className="py-3 px-4">Species & Animal</th>
                <th className="py-3 px-4">Symptoms</th>
                <th className="py-3 px-4">Affected / Dead</th>
                <th className="py-3 px-4">AI Risk Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    #{report.id.slice(-6)}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">
                    {report.animal?.species || 'Livestock'} ({report.animal?.animal_identifier || 'Animal'})
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                    {report.symptoms.join(', ')}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className="font-bold">{report.affected_count}</span> affected{' '}
                    {report.death_count > 0 && (
                      <span className="text-red-600 font-bold">({report.death_count} dead)</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <RiskLevelBadge level={report.risk_level} score={report.risk_score} size="sm" />
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={report.status} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/veterinarian/cases/${report.id}`}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-sm transition-all inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
