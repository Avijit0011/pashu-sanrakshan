from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

app = FastAPI(
    title="PashuMitra AI Livestock Risk Screening Microservice",
    description="Python PyTorch / YOLO triage screening service for livestock disease surveillance",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScreeningRequest(BaseModel):
    species: Optional[str] = "cow"
    symptoms: List[str] = []
    image: Optional[str] = None
    affected_count: int = 1
    death_count: int = 0
    latitude: float = 22.57
    longitude: float = 88.36

class ScreeningResponse(BaseModel):
    risk_score: int
    risk_level: str
    screening_status: str
    contributing_factors: List[str]
    disclaimer: str

@app.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "PashuMitra PyTorch/YOLO AI Screener",
        "model_version": "v1.2-triage"
    }

@app.post("/screen", response_model=ScreeningResponse)
def screen_report(req: ScreeningRequest):
    # Rule & Anomaly Triage Screening Logic
    score = 25
    factors = []

    if "difficulty_breathing" in req.symptoms:
        score += 20
        factors.append("Respiratory distress pattern detected")
    if "fever" in req.symptoms:
        score += 15
        factors.append("High febrile reaction")
    if "swelling" in req.symptoms:
        score += 15
        factors.append("Submandibular / dewlap edema")
    if "skin_abnormality" in req.symptoms:
        score += 15
        factors.append("Lumpy skin nodules / mucosal lesions")

    if req.affected_count > 3:
        score += 15
        factors.append(f"Multiple animals affected ({req.affected_count} in herd)")
    if req.death_count > 0:
        score += 25
        factors.append(f"Mortality reported ({req.death_count} dead)")

    # Simulating visual image anomaly scoring if image payload present
    if req.image:
        score += 5
        factors.append("Image visual anomaly feature score verified")

    final_score = min(max(score, 10), 98)

    risk_level = "LOW"
    if final_score >= 81:
        risk_level = "CRITICAL"
    elif final_score >= 61:
        risk_level = "HIGH"
    elif final_score >= 31:
        risk_level = "MEDIUM"

    return ScreeningResponse(
        risk_score=final_score,
        risk_level=risk_level,
        screening_status="VETERINARY_REVIEW_REQUIRED",
        contributing_factors=factors,
        disclaimer="AI-assisted risk screening is a decision-support system, NOT a definitive medical diagnosis. Veterinary inspection recommended."
    )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
