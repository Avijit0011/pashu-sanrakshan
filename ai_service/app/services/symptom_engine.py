from typing import List, Dict, Any
from app.schemas.schemas import SymptomAnalyzeRequest, SymptomAnalyzeResponse, ConditionPrediction

SYMPTOM_KNOWLEDGE_BASE = {
    "fever": {"weight": 18, "conditions": ["Foot and Mouth Disease (FMD)", "Peste des Petits Ruminants (PPR)", "Anthrax", "Blackleg"]},
    "skin_lesions": {"weight": 22, "conditions": ["Lumpy Skin Disease (LSD)", "Contagious Ecthyma (Orf)"]},
    "lumps_or_nodules": {"weight": 25, "conditions": ["Lumpy Skin Disease (LSD)"]},
    "blisters_mouth_feet": {"weight": 25, "conditions": ["Foot and Mouth Disease (FMD)"]},
    "nasal_discharge": {"weight": 15, "conditions": ["Bovine Respiratory Disease", "Peste des Petits Ruminants (PPR)"]},
    "cough": {"weight": 14, "conditions": ["Bovine Respiratory Disease", "Contagious Bovine Pleuropneumonia"]},
    "difficulty_breathing": {"weight": 22, "conditions": ["Bovine Respiratory Disease", "Haemorrhagic Septicaemia"]},
    "salivation_drooling": {"weight": 18, "conditions": ["Foot and Mouth Disease (FMD)"]},
    "diarrhea": {"weight": 16, "conditions": ["Peste des Petits Ruminants (PPR)", "Coccidiosis"]},
    "loss_of_appetite": {"weight": 10, "conditions": ["General Infection / Febrile Disease"]},
    "reduced_activity": {"weight": 8, "conditions": ["General Systemic Illness"]},
    "lameness": {"weight": 16, "conditions": ["Foot and Mouth Disease (FMD)", "Blackleg"]},
    "swelling_neck_chest": {"weight": 24, "conditions": ["Haemorrhagic Septicaemia", "Blackleg"]}
}

class SymptomRiskEngine:
    """
    Symptom-based Risk Analysis Engine.
    Structures symptoms and evaluates condition likelihoods + cumulative risk score.
    """

    def analyze_symptoms(self, req: SymptomAnalyzeRequest) -> SymptomAnalyzeResponse:
        base_score = 15
        matched_conditions: Dict[str, float] = {}

        # Evaluate individual symptoms
        for symptom in req.symptoms:
            sym_key = symptom.lower().strip().replace(" ", "_")
            if sym_key in SYMPTOM_KNOWLEDGE_BASE:
                info = SYMPTOM_KNOWLEDGE_BASE[sym_key]
                base_score += info["weight"]
                for cond in info["conditions"]:
                    matched_conditions[cond] = matched_conditions.get(cond, 0.3) + 0.25
            else:
                base_score += 10

        # Duration factor
        if req.duration_days > 5:
            base_score += 15
        elif req.duration_days >= 3:
            base_score += 10

        # Vaccination factor
        if req.vaccination_status == "none":
            base_score += 15
        elif req.vaccination_status == "partial":
            base_score += 8

        # Affected animals factor
        if req.affected_animals > 5:
            base_score += 20
        elif req.affected_animals > 1:
            base_score += 12

        # Death count factor
        if req.deaths > 0:
            base_score += 25

        final_score = min(max(base_score, 10), 99)

        # Risk level determination
        risk_level = "LOW"
        if final_score >= 76:
            risk_level = "CRITICAL"
        elif final_score >= 51:
            risk_level = "HIGH"
        elif final_score >= 26:
            risk_level = "MEDIUM"

        # Format condition probabilities
        possible_conditions: List[ConditionPrediction] = []
        for cond_name, raw_prob in matched_conditions.items():
            prob = min(max(round(raw_prob, 2), 0.20), 0.92)
            possible_conditions.append(ConditionPrediction(
                condition=cond_name,
                probability=prob,
                severity_level="HIGH" if prob > 0.7 else "MODERATE"
            ))

        possible_conditions.sort(key=lambda x: x.probability, reverse=True)
        if not possible_conditions:
            possible_conditions = [ConditionPrediction(condition="Unspecified Febrile Illness", probability=0.45, severity_level="MODERATE")]

        # Calculate model confidence score based on symptom count and duration
        confidence = min(0.50 + (len(req.symptoms) * 0.08) + (0.05 if req.duration_days > 0 else 0.0), 0.95)

        return SymptomAnalyzeResponse(
            risk_score=final_score,
            risk_level=risk_level,
            possible_conditions=possible_conditions,
            confidence=round(confidence, 2)
        )
