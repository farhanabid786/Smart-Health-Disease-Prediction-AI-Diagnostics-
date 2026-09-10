import os
import json
import logging
from pathlib import Path
from typing import List
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv(dotenv_path=Path(__file__).with_name('.env'))

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Pydantic schemas for request/response validation
class Vitals(BaseModel):
    heart_rate: int = Field(..., description="Heart rate in beats per minute")
    bp_systolic: int = Field(..., description="Systolic blood pressure in mmHg")
    bp_diastolic: int = Field(..., description="Diastolic blood pressure in mmHg")
    spo2: int = Field(..., description="Oxygen saturation percentage")

class HealthCard(BaseModel):
    health_id: str = Field(..., description="Unique Smart Health ID")
    age: int = Field(..., description="Age of the patient")
    gender: str = Field(..., description="Gender of the patient")
    blood_group: str = Field(..., description="Blood group")
    chronic_conditions: List[str] = Field(default=[], description="List of chronic medical conditions")
    allergies: List[str] = Field(default=[], description="List of allergies")
    current_medications: List[str] = Field(default=[], description="List of active medications")
    vitals: Vitals

class PredictionRequest(BaseModel):
    health_card: HealthCard
    symptoms: List[str] = Field(..., description="Selected symptoms")

class PredictionResponse(BaseModel):
    condition: str = Field(..., description="Name of the predicted health risk or disease condition")
    confidence: float = Field(..., description="Confidence percentage of the prediction (0.0 to 100.0)")
    risk_level: str = Field(..., description="Risk severity level: 'Low', 'Medium', or 'High'")
    details: str = Field(..., description="Detailed clinical analysis and reasoning explaining the prediction")
    recommendations: List[str] = Field(..., description="Recommended actions, lifestyle adjustments, or triage advice")

def get_mock_prediction(request: PredictionRequest) -> PredictionResponse:
    """Fallback predictor when Gemini API Key is missing or invalid."""
    symptoms_lower = [s.lower() for s in request.symptoms]
    vitals = request.health_card.vitals
    
    # Simple rule-based mock prediction logic
    if not request.symptoms:
        return PredictionResponse(
            condition="No Symptoms Reported",
            confidence=95.0,
            risk_level="Low",
            details="Demo Mode: The patient has not reported any active symptoms. Vitals appear stable. Make sure to configure GEMINI_API_KEY in backend/.env for real AI predictions.",
            recommendations=[
                "Maintain a healthy diet and stay active.",
                "Schedule routine checkups as needed.",
                "Ensure your health card information is up to date."
            ]
        )
    
    # 1. Cardiovascular / Hypertension Risk
    if "chest pain" in symptoms_lower or "dyspnea" in symptoms_lower or vitals.bp_systolic >= 160 or vitals.heart_rate >= 110:
        return PredictionResponse(
            condition="Cardiovascular Risk / Hypertensive Crisis Warning",
            confidence=82.0,
            risk_level="High",
            details="Demo Mode: Symptoms of chest pain or shortness of breath, combined with elevated blood pressure or heart rate, indicate high cardiovascular risk. Note: Please add a real GEMINI_API_KEY in backend/.env.",
            recommendations=[
                "Rest immediately and avoid physical exertion.",
                "Monitor blood pressure every 15 minutes.",
                "Seek immediate emergency medical attention if chest pain intensifies or radiates.",
                "Avoid stimulants including caffeine and nicotine."
            ]
        )
        
    # 2. Respiratory Infection (e.g., Flu/Covid)
    elif "fever" in symptoms_lower and ("cough" in symptoms_lower or "sore throat" in symptoms_lower):
        risk = "Medium" if vitals.spo2 >= 95 else "High"
        condition = "Viral Respiratory Tract Infection (e.g., Influenza)"
        return PredictionResponse(
            condition=condition,
            confidence=78.5,
            risk_level=risk,
            details=f"Demo Mode: High fever combined with upper respiratory symptoms (cough, sore throat) suggesting influenza or similar viral infection. SpO2 level is at {vitals.spo2}%. Note: Please configure GEMINI_API_KEY for real AI analysis.",
            recommendations=[
                "Isolate and rest to prevent spreading the infection.",
                "Maintain high fluid intake (water, warm tea).",
                "Take over-the-counter fever reducers if needed, following package directions.",
                "Seek medical evaluation if SpO2 drops below 94% or breathing becomes labored."
            ]
        )
        
    # 3. Allergic Reaction
    elif "allergic reaction" in symptoms_lower or "rash" in symptoms_lower or "itching" in symptoms_lower:
        is_severe = any(med in request.health_card.allergies for med in ["penicillin", "nuts", "shellfish"])
        risk = "High" if is_severe or "dyspnea" in symptoms_lower else "Medium"
        return PredictionResponse(
            condition="Acute Allergic Reaction (Hypersensitivity)",
            confidence=85.0,
            risk_level=risk,
            details="Demo Mode: Symptoms of rash or itching indicate a hypersensitivity reaction. If allergens are in the health card or patient has difficulty breathing, risk is elevated. Note: Configure GEMINI_API_KEY to enable Gemini-based triage.",
            recommendations=[
                "Identify and remove the offending allergen immediately.",
                "Consider oral antihistamines for mild localized symptoms.",
                "Seek emergency care immediately if facial swelling, difficulty swallowing, or wheezing occurs (Anaphylaxis risk)."
            ]
        )
        
    # 4. General viral syndrome / Fatigue
    else:
        return PredictionResponse(
            condition="Acute Fatigue & Systemic Malaise",
            confidence=65.0,
            risk_level="Low",
            details="Demo Mode: General symptoms of fatigue, headache, or joint pain without critical abnormalities in vital signs. Suggestive of mild physical exhaustion or early viral syndrome. Note: Configure GEMINI_API_KEY to activate full AI diagnostics.",
            recommendations=[
                "Ensure at least 8 hours of sleep.",
                "Stay hydrated and consume balanced meals.",
                "Monitor for new or localized symptoms over the next 24-48 hours."
            ]
        )

def predict_disease_with_gemini(request: PredictionRequest) -> PredictionResponse:
    """Predict potential health risk and details using the Gemini API."""
    api_key = os.getenv("GEMINI_API_KEY")
    
    # If no API Key, use the mock predictor
    if not api_key or api_key.strip() == "":
        logger.warning("GEMINI_API_KEY not found in environment. Falling back to Mock Predictor.")
        return get_mock_prediction(request)
        
    try:
        genai.configure(api_key=api_key.strip())
        
        # We will use gemini-3.6-flash for speed and reliability in JSON mode
        model = genai.GenerativeModel("gemini-3.6-flash")
        
        prompt = f"""
        You are an advanced medical diagnostic assistant AI. Your task is to perform a clinical risk assessment and disease prediction based on the patient's Health Card profile and reported symptoms.
        
        PATIENT HEALTH CARD:
        - Health ID: {request.health_card.health_id}
        - Age: {request.health_card.age}
        - Gender: {request.health_card.gender}
        - Blood Group: {request.health_card.blood_group}
        - Chronic Conditions: {', '.join(request.health_card.chronic_conditions) if request.health_card.chronic_conditions else 'None'}
        - Allergies: {', '.join(request.health_card.allergies) if request.health_card.allergies else 'None'}
        - Current Medications: {', '.join(request.health_card.current_medications) if request.health_card.current_medications else 'None'}
        - Current Vitals:
            * Heart Rate: {request.health_card.vitals.heart_rate} bpm (Normal: 60-100)
            * Blood Pressure: {request.health_card.vitals.bp_systolic}/{request.health_card.vitals.bp_diastolic} mmHg (Normal: 120/80)
            * SpO2: {request.health_card.vitals.spo2}% (Normal: 95-100%)
            
        PATIENT ACTIVE SYMPTOMS:
        - {', '.join(request.symptoms) if request.symptoms else 'None reported'}

        Please perform the following:
        1. Predict the most likely health condition or disease based on symptom clusters, patient demographics, and vital signs.
        2. Calculate a confidence score (0 to 100) reflecting the likelihood of this condition.
        3. Classify the overall risk severity level: 'Low' (mild self-limiting symptoms, normal vitals), 'Medium' (concerning symptoms or minor vital abnormalities requiring medical review), or 'High' (potentially life-threatening symptoms, severe vital anomalies, or anaphylactic/cardiac symptoms requiring immediate emergency care).
        4. Provide a detailed explanation summarizing the clinical reasoning, identifying how specific vitals or symptom combinations contributed to this output.
        5. Formulate a list of 3-5 specific, actionable, and safe next steps (lifestyle modifications, home monitoring, or triage advice).
        
        Remember:
        - Your tone must be professional, empathetic, and objective.
        - NEVER state that you are making a definitive medical diagnosis. Keep recommendations framed as advice, and emphasize consulting a healthcare professional.
        """
        
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                response_schema=PredictionResponse
            )
        )
        
        # Parse the JSON response
        result_json = json.loads(response.text)
        return PredictionResponse(**result_json)
        
    except Exception as e:
        logger.error(f"Error occurred during Gemini API prediction call: {str(e)}. Falling back to Mock Predictor.")
        # Attempt to clean or fallback to mock
        fallback = get_mock_prediction(request)
        fallback.details = f"Gemini API Error ({str(e)}). Falling back to local assessment. " + fallback.details
        return fallback
