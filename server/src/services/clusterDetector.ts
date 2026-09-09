import { DiseaseReport, Cluster } from '../../src/types/index';

// Haversine formula to calculate distance in km between two lat/long points
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Spatial clustering algorithm for outbreak detection
export function detectSpatialClusters(reports: DiseaseReport[], maxRadiusKm = 15): Cluster[] {
  const highRiskReports = reports.filter(
    (r) => r.risk_level === 'HIGH' || r.risk_level === 'CRITICAL'
  );

  if (highRiskReports.length < 2) return [];

  const clusters: Cluster[] = [];
  const visited = new Set<string>();

  for (let i = 0; i < highRiskReports.length; i++) {
    const current = highRiskReports[i];
    if (visited.has(current.id)) continue;

    const group = [current];
    visited.add(current.id);

    for (let j = i + 1; j < highRiskReports.length; j++) {
      const neighbor = highRiskReports[j];
      if (visited.has(neighbor.id)) continue;

      const dist = calculateHaversineDistance(
        current.latitude,
        current.longitude,
        neighbor.latitude,
        neighbor.longitude
      );

      if (dist <= maxRadiusKm) {
        group.push(neighbor);
        visited.add(neighbor.id);
      }
    }

    if (group.length >= 2) {
      // Calculate center lat/long
      const avgLat = group.reduce((sum, r) => sum + r.latitude, 0) / group.length;
      const avgLon = group.reduce((sum, r) => sum + r.longitude, 0) / group.length;

      const maxDist = Math.max(
        ...group.map((r) => calculateHaversineDistance(avgLat, avgLon, r.latitude, r.longitude))
      );

      const hasCritical = group.some((r) => r.risk_level === 'CRITICAL');

      clusters.push({
        id: `cluster-auto-${Date.now()}-${i}`,
        center_latitude: Number(avgLat.toFixed(6)),
        center_longitude: Number(avgLon.toFixed(6)),
        radius_km: Number(Math.max(maxDist + 2, 5).toFixed(1)),
        case_count: group.length,
        risk_level: hasCritical ? 'CRITICAL' : 'HIGH',
        status: 'SUSPECTED',
        related_case_ids: group.map((g) => g.id),
        district_name: 'Anand District Surveillance Zone',
        created_at: new Date().toISOString(),
      });
    }
  }

  return clusters;
}
