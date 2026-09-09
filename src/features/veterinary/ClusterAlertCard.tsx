import React from 'react';
import { Cluster } from '@/types';
import { RiskLevelBadge } from '@/components/ui/RiskLevelBadge';
import { ShieldAlert, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ClusterAlertCardProps {
  cluster: Cluster;
}

export const ClusterAlertCard: React.FC<ClusterAlertCardProps> = ({ cluster }) => {
  return (
    <div className="bg-gradient-to-r from-red-900 via-rose-900 to-amber-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-red-700/50 space-y-4 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-red-500/30 border border-red-400/40 flex items-center justify-center shrink-0 animate-pulse">
            <ShieldAlert className="w-6 h-6 text-red-300" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-300 block">
              Outbreak Surveillance Alert
            </span>
            <h3 className="text-lg font-black text-white">Potential Disease Cluster Detected</h3>
          </div>
        </div>
        <RiskLevelBadge level={cluster.risk_level} size="md" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-black/20 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
        <div>
          <span className="text-white/60 block text-[10px] uppercase">Surveillance Zone</span>
          <span className="font-bold text-white flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-amber-400" /> {cluster.district_name || 'District Cluster'}
          </span>
        </div>
        <div>
          <span className="text-white/60 block text-[10px] uppercase">Concentrated Cases</span>
          <span className="font-bold text-white font-mono text-sm mt-0.5">{cluster.case_count} Reports</span>
        </div>
        <div>
          <span className="text-white/60 block text-[10px] uppercase">Cluster Radius</span>
          <span className="font-bold text-white font-mono text-sm mt-0.5">{cluster.radius_km} km</span>
        </div>
        <div>
          <span className="text-white/60 block text-[10px] uppercase">Verification Status</span>
          <span className="font-extrabold text-amber-300 uppercase mt-0.5 block">{cluster.status}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
        <p className="text-red-200/90 text-xs italic">
          * Suspected geographical cluster automatically flagged by spatial density algorithm. Veterinary field team verification required.
        </p>

        <Link
          to="/veterinarian/map"
          className="px-4 py-2 bg-white text-red-950 hover:bg-red-50 font-black rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shrink-0"
        >
          View Cluster on Map <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
