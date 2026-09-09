from typing import Dict, Any, Tuple

DEFAULT_WEIGHTS = {
    "image_evidence": 0.20,
    "symptom_evidence": 0.25,
    "health_history": 0.10,
    "vaccination": 0.10,
    "affected_animals": 0.10,
    "mortality": 0.10,
    "geographic_risk": 0.10,
    "environmental_factors": 0.05
}

class MultiModalRiskEngine:
    """
    PashuMitra Multi-Modal AI Risk Engine.
    Combines image, symptom, health history, vaccination, affected animals, mortality,
    geographic risk, and environmental data using fully configurable component weights.
    """

    def calculate_overall_risk(
        self,
        image_score: float,
        symptom_score: float,
        has_health_history: bool,
        vaccination_status: str,
        affected_count: int,
        death_count: int,
        geographic_score: float,
        environmental_delta: float,
        custom_weights: Dict[str, float] = None
    ) -> Tuple[int, str, float]:

        # Merge custom weights if provided
        weights = dict(DEFAULT_WEIGHTS)
        if custom_weights:
            for k, v in custom_weights.items():
                if k in weights:
                    weights[k] = v

        # Normalize total weights to sum to 1.0
        weight_sum = sum(weights.values())
        if weight_sum > 0:
            weights = {k: v / weight_sum for k, v in weights.items()}

        # Compute individual feature component scores (0 - 100)
        c_image = image_score
        c_symptoms = symptom_score

        c_history = 65.0 if has_health_history else 20.0

        c_vax = 80.0 if vaccination_status == "none" else (50.0 if vaccination_status == "partial" else 15.0)

        c_affected = 90.0 if affected_count >= 5 else (65.0 if affected_count > 1 else 25.0)

        c_mortality = 95.0 if death_count > 0 else 10.0

        c_geo = geographic_score

        c_env = min(max(20.0 + (environmental_delta * 3.0), 0.0), 100.0)

        # Weighted calculation
        total_score = (
            c_image * weights["image_evidence"] +
            c_symptoms * weights["symptom_evidence"] +
            c_history * weights["health_history"] +
            c_vax * weights["vaccination"] +
            c_affected * weights["affected_animals"] +
            c_mortality * weights["mortality"] +
            c_geo * weights["geographic_risk"] +
            c_env * weights["environmental_factors"]
        )

        final_score = int(round(min(max(total_score, 0.0), 100.0)))

        # Risk level determination
        if final_score >= 76:
            risk_level = "CRITICAL"
        elif final_score >= 51:
            risk_level = "HIGH"
        elif final_score >= 26:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        # Model confidence estimation (representing model certainty in its data signals)
        confidence = round(0.70 + (0.05 if image_score > 0 else 0.0) + (0.10 if symptom_score > 40 else 0.05), 2)
        confidence = min(max(confidence, 0.40), 0.95)

        return final_score, risk_level, confidence
