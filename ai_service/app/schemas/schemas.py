from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class AnimalInfo(BaseModel):
    species: str = Field("cow", description="Livestock species e.g. cow, buffalo, goat, sheep, poultry")
    age: Optional[float] = Field(3.0, description="Age of animal in years")
    sex: Optional[str] = Field("female", description="Sex of animal")
    health_history: Optional[List[str]] = Field(default_factory=list, description="Past health conditions")
    vaccination_status: Optional[str] = Field("partial", description="Status: full, partial, none, unknown")

class LocationCoordinates(BaseModel):
    latitude: float = Field(22.5726, description="Latitude")
    longitude: float = Field(88.3639, description="Longitude")
    region: Optional[str] = Field("West Bengal", description="Region or district name")

class ImageScreenRequest(BaseModel):
    image_base64: Optional[str] = Field(None, description="Base64 encoded image string")
    image_url: Optional[str] = Field(None, description="URL of image")
    species: Optional[str] = "cow"

class ConditionPrediction(BaseModel):
    condition: str
    probability: float = Field(..., ge=0.0, le=1.0)
    severity_level: Optional[str] = "MODERATE"

class ImageScreenResponse(BaseModel):
    status: str = Field("COMPLETED", description="COMPLETED or LOW_IMAGE_QUALITY or INVALID_IMAGE")
    needs_retake: bool = False
    image_quality: str = Field("GOOD", description="GOOD, FAIR, BLURRY, LOW_RESOLUTION, TOO_DARK, TOO_BRIGHT")
    quality_metrics: Optional[Dict[str, Any]] = None
    predictions: List[ConditionPrediction] = Field(default_factory=list)
    needs_veterinary_review: bool = True
    message: Optional[str] = None

class SymptomAnalyzeRequest(BaseModel):
    species: str = "cow"
    age: Optional[float] = 3.0
    symptoms: List[str] = Field(..., min_items=1)
    duration_days: int = Field(3, ge=0)
    vaccination_status: str = "partial"
    affected_animals: int = Field(1, ge=1)
    deaths: int = Field(0, ge=0)

class SymptomAnalyzeResponse(BaseModel):
    risk_score: int = Field(..., ge=0, le=100)
    risk_level: str = Field(..., description="LOW, MEDIUM, HIGH, CRITICAL")
    possible_conditions: List[ConditionPrediction] = Field(default_factory=list)
    confidence: float = Field(..., ge=0.0, le=1.0)

class RiskScoreRequest(BaseModel):
    animal: AnimalInfo
    symptoms: List[str] = Field(default_factory=list)
    duration_days: int = 1
    affected_animals: int = 1
    deaths: int = 0
    location: Optional[LocationCoordinates] = None
    weights: Optional[Dict[str, float]] = None

class OutbreakRiskRequest(BaseModel):
    latitude: float
    longitude: float
    radius_km: float = 10.0
    time_window_days: int = 30
    disease_reports: Optional[List[Dict[str, Any]]] = None

class OutbreakCluster(BaseModel):
    cluster_id: str
    cases: int
    affected_animals: int
    deaths: int
    risk_level: str
    radius_km: float
    trend: str = Field("INCREASING", description="INCREASING, STABLE, DECREASING")

class OutbreakRiskResponse(BaseModel):
    geographic_risk_score: int = Field(..., ge=0, le=100)
    cluster_detected: bool
    nearby_cases_count: int
    clusters: List[OutbreakCluster] = Field(default_factory=list)

class FullAssessmentRequest(BaseModel):
    animal: Optional[AnimalInfo] = None
    species: Optional[str] = "cow"
    age: Optional[float] = 3.0
    sex: Optional[str] = "female"
    symptoms: List[str] = Field(default_factory=list)
    duration_days: int = 3
    vaccination_status: str = "partial"
    affected_animals: int = 1
    deaths: int = 0
    location: Optional[LocationCoordinates] = None
    image_url: Optional[str] = None
    image_base64: Optional[str] = None
    weights: Optional[Dict[str, float]] = None

class OverallAssessment(BaseModel):
    risk_score: int = Field(..., ge=0, le=100)
    risk_level: str = Field(..., description="LOW, MEDIUM, HIGH, CRITICAL")
    confidence: float = Field(..., ge=0.0, le=1.0)

class DiagnosticItem(BaseModel):
    test_name: str
    category: str
    description: str
    priority: str = "HIGH"

class DoctorUrgency(BaseModel):
    level: str
    timeframe: str
    description: str
    warning_signs: List[str] = Field(default_factory=list)

class FullAssessmentResponse(BaseModel):
    assessment_id: str
    timestamp: str
    model_version: str = "1.0.0"
    risk_engine_version: str = "1.0"
    image_analysis: ImageScreenResponse
    symptom_analysis: SymptomAnalyzeResponse
    geographic_analysis: OutbreakRiskResponse
    overall_assessment: OverallAssessment
    possible_conditions: List[ConditionPrediction]
    recommended_diagnostics: Optional[List[DiagnosticItem]] = Field(default_factory=list)
    doctor_urgency: Optional[DoctorUrgency] = None
    clinical_judgement: Optional[str] = None
    recommended_action: str
    urgent: bool
    reason_codes: List[str]
    disclaimer: str


class ModelInfoResponse(BaseModel):
    service_name: str = "PashuMitra AI Multi-Modal Decision Support Microservice"
    version: str = "1.0.0"
    risk_engine_version: str = "1.0"
    supported_species: List[str]
    supported_conditions: List[str]
    quality_thresholds: Dict[str, Any]
    scoring_weights: Dict[str, float]
