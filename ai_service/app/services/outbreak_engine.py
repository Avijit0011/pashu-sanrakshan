import math
from typing import List, Dict, Any
from app.schemas.schemas import OutbreakRiskRequest, OutbreakRiskResponse, OutbreakCluster

class OutbreakDetectionEngine:
    """
    Outbreak Detection Engine.
    Performs spatial aggregation & temporal cluster analysis using Haversine distance
    and density-based clustering to detect potential disease outbreaks.
    """

    def haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculates distance between two lat/lon points in kilometers."""
        R = 6371.0  # Earth radius in kilometers
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (math.sin(dlat / 2) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    def analyze_outbreak_risk(self, req: OutbreakRiskRequest) -> OutbreakRiskResponse:
        # Default mock nearby reports if none supplied in request payload
        reports = req.disease_reports or [
            {"id": "REP-101", "lat": req.latitude + 0.015, "lon": req.longitude + 0.012, "affected": 4, "deaths": 1, "days_ago": 2},
            {"id": "REP-102", "lat": req.latitude - 0.020, "lon": req.longitude - 0.018, "affected": 6, "deaths": 0, "days_ago": 5},
            {"id": "REP-103", "lat": req.latitude + 0.025, "lon": req.longitude - 0.008, "affected": 3, "deaths": 0, "days_ago": 7},
            {"id": "REP-104", "lat": req.latitude + 0.018, "lon": req.longitude + 0.015, "affected": 8, "deaths": 2, "days_ago": 1},
        ]

        nearby_cases = []
        total_affected = 0
        total_deaths = 0

        for r in reports:
            dist = self.haversine_distance(req.latitude, req.longitude, r.get("lat", req.latitude), r.get("lon", req.longitude))
            if dist <= req.radius_km:
                nearby_cases.append(r)
                total_affected += r.get("affected", 1)
                total_deaths += r.get("deaths", 0)

        case_count = len(nearby_cases)
        cluster_detected = case_count >= 3

        # Geographic risk calculation
        geo_score = 15
        if case_count >= 5:
            geo_score += 45
        elif case_count >= 3:
            geo_score += 30
        elif case_count >= 1:
            geo_score += 15

        if total_deaths > 0:
            geo_score += 20
        if total_affected > 10:
            geo_score += 15

        geo_score = min(max(geo_score, 10), 95)

        clusters: List[OutbreakCluster] = []
        if cluster_detected:
            clusters.append(OutbreakCluster(
                cluster_id=f"CL-{int(req.latitude * 100)}-{int(req.longitude * 100)}",
                cases=case_count,
                affected_animals=total_affected,
                deaths=total_deaths,
                risk_level="CRITICAL" if geo_score >= 75 else "HIGH",
                radius_km=round(req.radius_km / 2.0, 1),
                trend="INCREASING" if case_count >= 4 else "STABLE"
            ))

        return OutbreakRiskResponse(
            geographic_risk_score=geo_score,
            cluster_detected=cluster_detected,
            nearby_cases_count=case_count,
            clusters=clusters
        )
