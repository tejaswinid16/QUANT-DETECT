from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from hybrid_prediction import hybrid_predict


# ==========================================
# CREATE FASTAPI APP
# ==========================================

app = FastAPI(
    title="Hybrid Quantum Machine Learning API",
    description="Early disease detection using classical ML and VQC",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# INPUT DATA MODEL
# ==========================================

class PatientData(BaseModel):

    mean_radius: float
    mean_perimeter: float
    mean_area: float
    mean_concave_points: float

    worst_radius: float
    worst_perimeter: float
    worst_area: float
    worst_concave_points: float


# ==========================================
# HOME ENDPOINT
# ==========================================

@app.get("/")
def home():

    return {
        "message": "Hybrid Quantum-Classical Disease Detection API is running"
    }


# ==========================================
# PREDICTION ENDPOINT
# ==========================================

@app.post("/predict")
def predict(patient: PatientData):

    features = [
        patient.mean_radius,
        patient.mean_perimeter,
        patient.mean_area,
        patient.mean_concave_points,
        patient.worst_radius,
        patient.worst_perimeter,
        patient.worst_area,
        patient.worst_concave_points
    ]

    result = hybrid_predict(features)

    return result
@app.get("/evaluation")
def evaluation():
    return evaluate_models()
