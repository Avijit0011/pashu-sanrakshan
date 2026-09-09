import pytest
from app.services.image_screener import ImageScreeningEngine
from app.services.symptom_engine import SymptomRiskEngine
from app.services.outbreak_engine import OutbreakDetectionEngine
from app.services.risk_engine import MultiModalRiskEngine
from app.services.decision_engine import DecisionEngine
from app.schemas.schemas import SymptomAnalyzeRequest, OutbreakRiskRequest

def test_image_screening_no_image():
    engine = ImageScreeningEngine()
    res = engine.screen_image(image_base64=None, image_url=None)
    assert res.status == "NO_IMAGE_PROVIDED"
    assert res.needs_veterinary_review is False

def test_symptom_risk_scoring():
    engine = SymptomRiskEngine()
    
    # Low risk test
    req_low = SymptomAnalyzeRequest(
        species="cow",
        symptoms=["reduced_activity"],
        duration_days=1,
        vaccination_status="full",
        affected_animals=1,
        deaths=0
    )
    res_low = engine.analyze_symptoms(req_low)
    assert res_low.risk_score < 50
    assert res_low.risk_level in ["LOW", "MEDIUM"]

    # Critical risk test
    req_crit = SymptomAnalyzeRequest(
        species="cow",
        symptoms=["fever", "skin_lesions", "difficulty_breathing", "swelling_neck_chest"],
        duration_days=6,
        vaccination_status="none",
        affected_animals=7,
        deaths=2
    )
    res_crit = engine.analyze_symptoms(req_crit)
    assert res_crit.risk_score >= 76
    assert res_crit.risk_level == "CRITICAL"

def test_outbreak_clustering():
    engine = OutbreakDetectionEngine()
    req = OutbreakRiskRequest(latitude=22.57, longitude=88.36, radius_km=10.0)
    res = engine.analyze_outbreak_risk(req)
    assert res.cluster_detected is True
    assert res.geographic_risk_score > 0
    assert len(res.clusters) > 0

def test_multi_modal_risk_engine():
    engine = MultiModalRiskEngine()
    score, level, conf = engine.calculate_overall_risk(
        image_score=75.0,
        symptom_score=80.0,
        has_health_history=True,
        vaccination_status="none",
        affected_count=4,
        death_count=1,
        geographic_score=80.0,
        environmental_delta=15.0
    )
    assert score >= 76
    assert level == "CRITICAL"
    assert 0.0 <= conf <= 1.0

def test_decision_engine_recommendations():
    engine = DecisionEngine()
    action, urgent, codes = engine.generate_decision(
        risk_score=85,
        risk_level="CRITICAL",
        affected_count=5,
        death_count=1,
        cluster_detected=True,
        symptom_score=80,
        vaccination_status="none",
        is_flooding=True
    )
    assert action == "URGENT_VETERINARY_REVIEW"
    assert urgent is True
    assert "MULTIPLE_AFFECTED_ANIMALS" in codes
    assert "MORTALITY_REPORTED" in codes
    assert "LOCAL_CASE_CLUSTER" in codes
