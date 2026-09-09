import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { DiseaseReport, Cluster } from '@/types';
import { RiskMarker } from './RiskMarker';
import { ClusterOverlay } from './ClusterOverlay';
import { MapLegend } from './MapLegend';
import { Maximize2, RefreshCw } from 'lucide-react';

interface GISMapProps {
  reports: DiseaseReport[];
  clusters?: Cluster[];
  height?: string;
  center?: [number, number];
  zoom?: number;
  showLegend?: boolean;
}

// Controller component to adjust bounds automatically to fit all markers
const MapBoundsController: React.FC<{ reports: DiseaseReport[] }> = ({ reports }) => {
  const map = useMap();

  useEffect(() => {
    if (reports.length > 0) {
      const bounds = L.latLngBounds(reports.map((r) => [r.latitude, r.longitude]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  }, [reports, map]);

  return null;
};

export const GISMap: React.FC<GISMapProps> = ({
  reports,
  clusters = [],
  height = '550px',
  center = [22.5726, 88.3639], // Default center (or Anand, Gujarat 22.5645, 72.9289)
  zoom = 10,
  showLegend = true,
}) => {
  // Compute default center from first report if available
  const initialCenter: [number, number] =
    reports.length > 0 ? [reports[0].latitude, reports[0].longitude] : center;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-md border border-slate-200" style={{ height }}>
      <MapContainer
        center={initialCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Adjust map bounds dynamically */}
        <MapBoundsController reports={reports} />

        {/* Cluster Overlays */}
        {clusters.map((cluster) => (
          <ClusterOverlay key={cluster.id} cluster={cluster} />
        ))}

        {/* Disease Report Pins */}
        {reports.map((report) => (
          <RiskMarker key={report.id} report={report} />
        ))}
      </MapContainer>

      {/* Floating Legend */}
      {showLegend && (
        <div className="absolute bottom-4 left-4 z-20">
          <MapLegend />
        </div>
      )}
    </div>
  );
};
