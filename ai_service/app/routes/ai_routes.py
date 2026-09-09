import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.schemas import (
    ImageScreenRequest, ImageScreenResponse,
    SymptomAnalyzeRequest, SymptomAnalyzeResponse,
    RiskScoreRequest, OutbreakRiskRequest, OutbreakRiskResponse,
    FullAssessmentRequest, FullAssessmentResponse, OverallAssessment,
    ModelInfoResponse, ConditionPrediction
)
from app.services.image_screener import ImageScreeningEngine
from app.services.symptom_engine import SymptomRiskEngine
from app.services.environmental_provider import DefaultEnvironmentalDataProvider
from app.services.outbreak_engine import OutbreakDetectionEngine
from app.services.risk_engine import MultiModalRiskEngine, DEFAULT_WEIGHTS
from app.services.decision_engine import DecisionEngine

router = APIRouter(prefix="/ai", tags=["PashuMitra AI Microservice"])

image_engine = ImageScreeningEngine()
symptom_engine = SymptomRiskEngine()
env_provider = DefaultEnvironmentalDataProvider()
outbreak_engine = OutbreakDetectionEngine()
risk_engine = MultiModalRiskEngine()
decision_engine = DecisionEngine()

@router.post("/screen-image", response_model=ImageScreenResponse)
def screen_image(req: ImageScreenRequest):
    return image_engine.screen_image(image_base64=req.image_base64, image_url=req.image_url, species=req.species)

@router.post("/analyze-symptoms", response_model=SymptomAnalyzeResponse)
def analyze_symptoms(req: SymptomAnalyzeRequest):
    return symptom_engine.analyze_symptoms(req)

@router.post("/outbreak-risk", response_model=OutbreakRiskResponse)
def outbreak_risk(req: OutbreakRiskRequest):
    return outbreak_engine.analyze_outbreak_risk(req)

@router.post("/risk-score")
def calculate_risk_score(req: RiskScoreRequest):
    symptom_res = symptom_engine.analyze_symptoms(SymptomAnalyzeRequest(
        species=req.animal.species,
        age=req.animal.age,
        symptoms=req.symptoms,
        duration_days=req.duration_days,
        vaccination_status=req.animal.vaccination_status or "partial",
        affected_animals=req.affected_animals,
        deaths=req.deaths
    ))
    
    lat = req.location.latitude if req.location else 22.5726
    lon = req.location.longitude if req.location else 88.3639

    geo_res = outbreak_engine.analyze_outbreak_risk(OutbreakRiskRequest(latitude=lat, longitude=lon))
    env_res = env_provider.get_environmental_factors(lat, lon)

    score, level, conf = risk_engine.calculate_overall_risk(
        image_score=0.0,
        symptom_score=float(symptom_res.risk_score),
        has_health_history=bool(req.animal.health_history),
        vaccination_status=req.animal.vaccination_status or "partial",
        affected_count=req.affected_animals,
        death_count=req.deaths,
        geographic_score=float(geo_res.geographic_risk_score),
        environmental_delta=float(env_res["environmental_risk_delta"]),
        custom_weights=req.weights
    )

    return {
        "risk_score": score,
        "risk_level": level,
        "confidence": conf
    }

@router.post("/full-assessment", response_model=FullAssessmentResponse)
def full_assessment(req: FullAssessmentRequest):
    assessment_id = f"AI-{uuid.uuid4().hex[:8].upper()}"
    ts = datetime.now(timezone.utc).isoformat()

    species = req.species or (req.animal.species if req.animal else "cow")
    
    # 1. Image Screening
    image_res = image_engine.screen_image(image_base64=req.image_base64, image_url=req.image_url, species=species)
    image_score = 0.0
    if image_res.status == "COMPLETED" and image_res.predictions:
        image_score = max(p.probability for p in image_res.predictions) * 100.0

    # 2. Symptom Analysis
    symptoms = req.symptoms or []
    symptom_res = symptom_engine.analyze_symptoms(SymptomAnalyzeRequest(
        species=species,
        age=req.age or (req.animal.age if req.animal else 3.0),
        symptoms=symptoms,
        duration_days=req.duration_days,
        vaccination_status=req.vaccination_status or (req.animal.vaccination_status if req.animal else "partial"),
        affected_animals=req.affected_animals,
        deaths=req.deaths
    ))

    # 3. Geographic & Environmental Risk
    lat = req.location.latitude if req.location else 22.5726
    lon = req.location.longitude if req.location else 88.3639
    geo_res = outbreak_engine.analyze_outbreak_risk(OutbreakRiskRequest(latitude=lat, longitude=lon))
    env_res = env_provider.get_environmental_factors(lat, lon)

    # 4. Multi-Modal Score Calculation
    has_history = bool(req.animal.health_history) if req.animal and req.animal.health_history else False
    score, level, conf = risk_engine.calculate_overall_risk(
        image_score=image_score,
        symptom_score=float(symptom_res.risk_score),
        has_health_history=has_history,
        vaccination_status=req.vaccination_status or "partial",
        affected_count=req.affected_animals,
        death_count=req.deaths,
        geographic_score=float(geo_res.geographic_risk_score),
        environmental_delta=float(env_res["environmental_risk_delta"]),
        custom_weights=req.weights
    )

    # 5. Action Recommendation & Reason Codes
    recommended_action, urgent, reason_codes = decision_engine.generate_decision(
        risk_score=score,
        risk_level=level,
        affected_count=req.affected_animals,
        death_count=req.deaths,
        cluster_detected=geo_res.cluster_detected,
        symptom_score=symptom_res.risk_score,
        vaccination_status=req.vaccination_status or "partial",
        is_flooding=env_res.get("is_flooding", False)
    )

    # Consolidate possible condition predictions
    combined_conditions = list(image_res.predictions) + list(symptom_res.possible_conditions)
    # Deduplicate conditions by name, keeping highest probability
    cond_map = {}
    for c in combined_conditions:
        if c.condition not in cond_map or c.probability > cond_map[c.condition].probability:
            cond_map[c.condition] = c

    sorted_conditions = sorted(cond_map.values(), key=lambda x: x.probability, reverse=True)

    return FullAssessmentResponse(
        assessment_id=assessment_id,
        timestamp=ts,
        model_version="1.0.0",
        risk_engine_version="1.0",
        image_analysis=image_res,
        symptom_analysis=symptom_res,
        geographic_analysis=geo_res,
        overall_assessment=OverallAssessment(
            risk_score=score,
            risk_level=level,
            confidence=conf
        ),
        possible_conditions=sorted_conditions,
        recommended_action=recommended_action,
        urgent=urgent,
        reason_codes=reason_codes,
        disclaimer="AI screening is for decision support only and does NOT replace veterinary diagnosis. Never prescribe medication without veterinarian examination."
    )

@router.get("/model-info", response_model=ModelInfoResponse)
def model_info():
    return ModelInfoResponse(
        service_name="PashuMitra AI Multi-Modal Decision Support Microservice",
        version="1.0.0",
        risk_engine_version="1.0",
        supported_species=["cow", "buffalo", "goat", "sheep", "poultry"],
        supported_conditions=[
            "Lumpy Skin Disease (LSD)",
            "Foot and Mouth Disease (FMD)",
            "Bovine Respiratory Disease",
            "Peste des Petits Ruminants (PPR)",
            "Haemorrhagic Septicaemia",
            "Avian Influenza",
            "Contagious Ecthyma (Orf)"
        ],
        quality_thresholds={
            "blur_laplacian_var_threshold": 45.0,
            "min_resolution_px": 80,
            "min_brightness": 35.0,
            "max_brightness": 230.0
        },
        scoring_weights=DEFAULT_WEIGHTS
    )
