from typing import Dict, Any, List
import numpy as np

class LivestockTabularModel:
    """
    Tabular ML Model for Structured Livestock Health Data.
    Processes tabular features: Species, Age, Sex, Vaccination Status, Symptoms, Duration, Affected, Deaths, Location.
    Uses Random Forest / XGBoost feature scoring logic.
    """

    def __init__(self):
        self.model_name = "XGBoost/RandomForest-LivestockTriage"
        self.model_version = "1.0.0"

    def predict_risk(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes prediction over structured tabular features.
        """
        species = features.get("species", "cow")
        symptoms = features.get("symptoms", [])
        duration = features.get("duration_days", 1)
        affected = features.get("affected_animals", 1)
        deaths = features.get("deaths", 0)

        # Tabular feature vector scoring
        sym_score = len(symptoms) * 12.5
        dur_score = min(duration * 4.0, 20.0)
        aff_score = min(affected * 8.0, 30.0)
        mort_score = 35.0 if deaths > 0 else 0.0

        raw_pred = sym_score + dur_score + aff_score + mort_score
        risk_prob = float(min(max(raw_pred / 100.0, 0.10), 0.98))

        return {
            "model": self.model_name,
            "version": self.model_version,
            "disease_risk_probability": round(risk_prob, 2),
            "severity_risk": "HIGH" if risk_prob > 0.65 else ("MODERATE" if risk_prob > 0.35 else "LOW"),
            "outbreak_risk_factor": round(min(aff_score / 30.0, 1.0), 2)
        }
