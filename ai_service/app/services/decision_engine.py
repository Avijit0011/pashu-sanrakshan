from typing import List, Tuple

class DecisionEngine:
    """
    AI Decision & Action Recommendation Engine.
    Evaluates multi-modal signals to produce actionable workflow recommendations
    and machine-readable reason codes for explainability.
    
    IMPORTANT SAFETY RULE: Never prescribe medication or replace a qualified veterinarian.
    """

    def generate_decision(
        self,
        risk_score: int,
        risk_level: str,
        affected_count: int,
        death_count: int,
        cluster_detected: bool,
        symptom_score: int,
        vaccination_status: str,
        is_flooding: bool
    ) -> Tuple[str, bool, List[str]]:
        
        reason_codes = []

        if affected_count > 1:
            reason_codes.append("MULTIPLE_AFFECTED_ANIMALS")
        if death_count > 0:
            reason_codes.append("MORTALITY_REPORTED")
        if cluster_detected:
            reason_codes.append("LOCAL_CASE_CLUSTER")
        if symptom_score >= 50:
            reason_codes.append("HIGH_SYMPTOM_RISK")
        if vaccination_status in ["none", "partial"]:
            reason_codes.append("LOW_VACCINATION")
        if is_flooding:
            reason_codes.append("ENVIRONMENTAL_RISK_HIGH")

        # Action recommendation map
        if risk_level == "CRITICAL":
            recommended_action = "URGENT_VETERINARY_REVIEW"
            urgent = True
        elif risk_level == "HIGH":
            recommended_action = "VETERINARY_REVIEW"
            urgent = True
        elif risk_level == "MEDIUM":
            recommended_action = "SUBMIT_VETERINARY_REPORT"
            urgent = False
        else:
            recommended_action = "CONTINUE_MONITORING"
            urgent = False

        if not reason_codes:
            reason_codes = ["ROUTINE_HEALTH_CHECK"]

        return recommended_action, urgent, reason_codes
