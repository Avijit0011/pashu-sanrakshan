import React, { useState, useEffect, useMemo } from 'react';
import { DiseaseReport, Cluster, RiskLevel, AnimalSpecies, CaseStatus } from '@/types';
import { api } from '@/core/api/axiosInstance';
import { db } from '@/core/storage/dexieDb';
import { GISMap } from '@/components/maps/GISMap';
import { RiskLevelBadge } from '@/components/ui/RiskLevelBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MapPin, Search, Filter, Layers, Eye, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export const GISMapPage: React.FC = () => {
  const [reports, setReports] = useState<DiseaseReport[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'ALL'>('ALL');
  const [speciesFilter, setSpeciesFilter] = useState<AnimalSpecies | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadMapData = async () => {
      setLoading(true);
      try {
        const [repRes, clusRes] = await Promise.all([
          api.get('/reports'),
          api.get('/map/clusters'),
        ]);

        let fetchedReports = repRes.data || [];
        let fetchedClusters = clusRes.data || [];

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

    loadMapData();
  }, []);

  // Filtered reports logic
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (riskFilter !== 'ALL' && r.risk_level !== riskFilter) return false;
      if (speciesFilter !== 'ALL' && r.animal?.species !== speciesFilter) return false;
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = r.id.toLowerCase().includes(q);
        const matchSpecies = r.animal?.species?.toLowerCase().includes(q);
        const matchAnimalId = r.animal?.animal_identifier?.toLowerCase().includes(q);
        const matchSymptoms = r.symptoms.some((s) => s.toLowerCase().includes(q));
        if (!matchId && !matchSpecies && !matchAnimalId && !matchSymptoms) return false;
      }
      return true;
    });
  }, [reports, riskFilter, speciesFilter, statusFilter, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider">
            MVP Point 2 — Interactive Spatial Surveillance
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            <MapPin className="w-8 h-8 text-emerald-600" />
            GIS Risk & Outbreak Monitoring
          </h1>
        </div>

        <div className="text-xs font-bold text-slate-500 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
          <span>Active Map Pins:</span>
          <span className="text-emerald-700 font-mono text-sm font-black">{filteredReports.length} Cases</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-emerald-600" /> Filter & Search Outbreak Map:
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search ID, symptoms, species..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
            />
          </div>

          {/* Risk Filter */}
          <div>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-bold text-slate-800"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">🔴 Critical Risk (81-100)</option>
              <option value="HIGH">🟠 High Risk (61-80)</option>
              <option value="MEDIUM">🟡 Medium Risk (31-60)</option>
              <option value="LOW">🟢 Low Risk (0-30)</option>
            </select>
          </div>

          {/* Species Filter */}
          <div>
            <select
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-bold text-slate-800"
            >
              <option value="ALL">All Species</option>
              <option value="Cow">Cow (गाय)</option>
              <option value="Buffalo">Buffalo (भैंस)</option>
              <option value="Goat">Goat (बकरी)</option>
              <option value="Sheep">Sheep (भेड़)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-bold text-slate-800"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING_VET_REVIEW">Pending Vet Review</option>
              <option value="ACCEPTED">Case Accepted</option>
              <option value="FIELD_VISIT">Field Visit</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Map & Cases Drawer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaflet Map */}
        <div className="lg:col-span-2">
          <GISMap reports={filteredReports} clusters={clusters} height="600px" />
        </div>

        {/* Sidebar Case Cards List */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4 max-h-[600px] flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Mapped Cases Queue</h3>
              <p className="text-xs text-slate-500">{filteredReports.length} results matching filter</p>
            </div>
          </div>

          <div className="overflow-y-auto space-y-3 pr-1 flex-1">
            {filteredReports.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                No disease reports match the selected map filters.
              </div>
            ) : (
              filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/20 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      #{report.id.slice(-6)}
                    </span>
                    <RiskLevelBadge level={report.risk_level} score={report.risk_score} size="sm" />
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {report.animal?.species || 'Livestock'} ({report.animal?.animal_identifier || 'Animal'})
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                      {report.symptoms.join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                    <StatusBadge status={report.status} className="text-[10px] py-0" />
                    <Link
                      to={`/veterinarian/cases/${report.id}`}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all"
                    >
                      <Eye className="w-3 h-3" /> View
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
