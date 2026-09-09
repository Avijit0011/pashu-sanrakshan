import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { DiseaseReport, RiskLevel } from '@/types';
import { RiskLevelBadge } from '@/components/ui/RiskLevelBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Calendar, User, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RiskMarkerProps {
  report: DiseaseReport;
  onSelect?: (report: DiseaseReport) => void;
}

// Function to create color-coded HTML DivIcon for Leaflet
const createRiskIcon = (level: RiskLevel, score: number) => {
  let colorClass = 'bg-emerald-500 border-emerald-700 text-white';
  let pulseClass = '';

  if (level === 'CRITICAL') {
    colorClass = 'bg-red-600 border-red-800 text-white';
    pulseClass = 'animate-ping opacity-75 bg-red-400';
  } else if (level === 'HIGH') {
    colorClass = 'bg-orange-500 border-orange-700 text-white';
    pulseClass = 'animate-pulse opacity-50 bg-orange-400';
  } else if (level === 'MEDIUM') {
    colorClass = 'bg-amber-500 border-amber-700 text-white';
  }

  const htmlStr = `
    <div class="relative flex items-center justify-center">
      ${pulseClass ? `<span class="absolute inline-flex h-8 w-8 rounded-full ${pulseClass}"></span>` : ''}
      <div class="relative w-8 h-8 rounded-full ${colorClass} border-2 shadow-lg flex items-center justify-center font-mono font-bold text-xs">
        ${score}
      </div>
    </div>
  `;

  return L.divIcon({
    html: htmlStr,
    className: 'custom-risk-marker-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

export const RiskMarker: React.FC<RiskMarkerProps> = ({ report }) => {
  const icon = createRiskIcon(report.risk_level, report.risk_score);

  return (
    <Marker position={[report.latitude, report.longitude]} icon={icon}>
      <Popup>
        <div className="p-3 max-w-xs space-y-2.5">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Case #{report.id.slice(-6)}
              </span>
              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                {report.animal?.species || 'Livestock'} ({report.animal?.animal_identifier || 'Animal'})
              </h4>
            </div>
            <RiskLevelBadge level={report.risk_level} score={report.risk_score} size="sm" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
            <div>
              <span className="text-slate-400 block text-[10px]">Affected / Deaths</span>
              <span className="font-bold text-slate-800">
                {report.affected_count} affected {report.death_count > 0 ? `(${report.death_count} dead)` : ''}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Status</span>
              <StatusBadge status={report.status} className="mt-0.5 text-[10px] py-0" />
            </div>
          </div>

          {report.symptoms.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Symptoms:</span>
              <p className="text-xs text-slate-700 line-clamp-2 italic">
                {report.symptoms.join(', ')}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" /> {report.reporter_name || 'Farmer'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {new Date(report.created_at).toLocaleDateString()}
            </span>
          </div>

          <Link
            to={`/veterinarian/cases/${report.id}`}
            className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm mt-2"
          >
            <Eye className="w-3.5 h-3.5" />
            View Case Details
          </Link>
        </div>
      </Popup>
    </Marker>
  );
};
