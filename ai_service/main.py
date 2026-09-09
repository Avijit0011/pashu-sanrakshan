from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from app.routes.ai_routes import router as ai_router

app = FastAPI(
    title="PashuMitra AI Livestock Risk Screening Microservice",
    description="Multi-modal PyTorch/YOLO + Structured Data + GIS Decision Support Engine for Livestock Disease Surveillance",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai_router)

@app.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "PashuMitra AI Decision Support Microservice",
        "model_version": "v1.0.0",
        "risk_engine_version": "1.0"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
