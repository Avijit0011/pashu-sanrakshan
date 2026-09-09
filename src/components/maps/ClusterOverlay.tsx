import React from 'react';
import { Circle, Popup } from 'react-leaflet';
import { Cluster } from '@/types';
import { RiskLevelBadge } from '@/components/ui/RiskLevelBadge';
import { AlertOctagon, ShieldAlert, Layers } from 'lucide-react';

interface ClusterOverlayProps {
  cluster: Cluster;
}

export const ClusterOverlay: React.FC<ClusterOverlayProps> = ({ cluster }) => {
  const getClusterColors = () => {
    switch (cluster.risk_level) {
      case 'CRITICAL':
        return { color: '#dc2626', fillColor: '#ef4444' };
      case 'HIGH':
        return { color: '#ea580c', fillColor: '#f97316' };
      default:
        return { color: '#d97706', fillColor: '#f59e0b' };
    }
  };

  const colors = getClusterColors();

  return (
    <Circle
      center={[cluster.center_latitude, cluster.center_longitude]}
      radius={cluster.radius_km * 1000} // radius in meters
      pathOptions={{
        color: colors.color,
        fillColor: colors.fillColor,
        fillOpacity: 0.18,
        weight: 2,
        dashArray: '6, 6',
      }}
    >
      <Popup>
        <div className="p-3 max-w-xs space-y-2">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-red-100">
            <span className="text-[10px] font-extrabold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              Potential Cluster
            </span>
            <RiskLevelBadge level={cluster.risk_level} size="sm" />
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900">
              {cluster.district_name || 'Spatial Surveillance Zone'}
            </h4>
            <p className="text-xs text-slate-500">
              Cluster Radius: {cluster.radius_km} km
            </p>
          </div>

          <div className="bg-amber-50 p-2 rounded-lg border border-amber-200 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Flagged Cases:</span>
              <span className="font-bold text-amber-900 font-mono text-sm">{cluster.case_count} cases</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Status:</span>
              <span className="font-semibold uppercase text-amber-800">{cluster.status}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100">
            * High geographical concentration of high-risk reports. Veterinary inspection required to confirm etiology.
          </div>
        </div>
      </Popup>
    </Circle>
  );
};
