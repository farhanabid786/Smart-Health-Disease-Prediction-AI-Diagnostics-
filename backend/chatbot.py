import os
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv(dotenv_path=Path(__file__).with_name('.env'))

# Setup logging
logger = logging.getLogger(__name__)

class ChatMessage(BaseModel):
    role: str = Field(..., description="Role of the speaker: 'user' or 'assistant'/'model'")
    content: str = Field(..., description="Text content of the message")

class ChatContext(BaseModel):
    health_card: Dict[str, Any] = Field(..., description="Full Smart Health Card details")
    symptoms: List[str] = Field(..., description="Active symptoms selected")
    prediction: Optional[Dict[str, Any]] = Field(default=None, description="Active disease prediction results")

class ChatRequest(BaseModel):
    message: str = Field(..., description="Current user input query")
    chat_history: List[ChatMessage] = Field(default=[], description="Previous conversation history")
    context: Optional[ChatContext] = Field(default=None, description="Patient's contextual medical profile")

class ChatResponse(BaseModel):
    response: str = Field(..., description="Medical chatbot reply")

SYSTEM_INSTRUCTION_TEMPLATE = """
You are an empathetic, professional medical assistant AI. 
Utilize the provided user health context below to answer follow-up queries, explain the prediction, and suggest natural lifestyle or triage advice without giving a definitive medical diagnosis.

---
HEALTH CONTEXT DETAILS:
[Insert Context JSON]
---

Guidelines:
1. Always maintain a supportive, empathetic, and calm clinical tone.
2. If the user asks general health questions, answer them, but relate it to their current symptoms/vitals if relevant.
3. NEVER state that you are making a definitive medical diagnosis. Keep recommendations framed as advice, and suggest consulting a real healthcare provider if conditions warrant.
4. If they ask about symptoms not shown in the health card, advise them to check their vitals or update their symptoms.
5. If the patient asks questions completely unrelated to medicine or health, politely guide them back to health topics.
"""

def get_mock_chat_response(request: ChatRequest) -> ChatResponse:
    """Fallback conversational bot for demo mode when Gemini API is unavailable."""
    msg = request.message.lower()
    
    health_card = {}
    prediction = {}
    symptoms = []
    
    if request.context:
        health_card = request.context.health_card
        prediction = request.context.prediction or {}
        symptoms = request.context.symptoms
        
    age = health_card.get("age", "unknown")
    gender = health_card.get("gender", "unknown")
    vitals = health_card.get("vitals", {})
    predicted_cond = prediction.get("condition", "No active prediction")
    risk_level = prediction.get("risk_level", "Low")
    
    # Custom rule-based bot answers
    if "hello" in msg or "hi" in msg:
        reply = (
            f"Hello! I am your Smart Health Assistant (Demo Mode). I see you are a {age}-year-old {gender} "
            f"and currently have a prediction for: **{predicted_cond}** ({risk_level} Risk). How can I assist you with "
            f"your health concerns today?"
        )
    elif "dangerous" in msg or "risk" in msg or "severe" in msg:
        if risk_level == "High":
            reply = (
                f"Based on your vitals (BP: {vitals.get('bp_systolic')}/{vitals.get('bp_diastolic')}, Heart Rate: {vitals.get('heart_rate')}) "
                f"and symptoms ({', '.join(symptoms)}), your current risk is evaluated as **HIGH** for {predicted_cond}. "
                "In a real clinical setting, this warrants immediate medical advice or an emergency department visit. "
                "Please do not delay consulting a professional."
            )
        elif risk_level == "Medium":
            reply = (
                f"Your risk level is **MEDIUM** for {predicted_cond}. This means your symptoms or vitals are slightly outside "
                "the normal range. While it may not be an immediate emergency, we recommend scheduling an appointment "
                "with your primary care physician to discuss these readings and symptoms soon."
            )
        else:
            reply = (
                "Your health risk is currently evaluated as **LOW**. Continue monitoring your symptoms and vitals. "
                "If you develop new symptoms or if your readings worsen, let me know or consult a doctor."
            )
    elif "bp" in msg or "blood pressure" in msg:
        systolic = vitals.get("bp_systolic", 120)
        diastolic = vitals.get("bp_diastolic", 80)
        reply = (
            f"Your current Blood Pressure is registered as **{systolic}/{diastolic} mmHg**. Normal BP is typically "
            "around 120/80 mmHg. "
            + ("This is elevated. We recommend resting, reducing sodium, and consulting a physician." if systolic > 130 or diastolic > 85 else "This is in the normal range. Continue maintaining a healthy lifestyle.")
        )
    elif "spo2" in msg or "oxygen" in msg:
        spo2 = vitals.get("spo2", 98)
        reply = (
            f"Your SpO2 (Oxygen Saturation) is **{spo2}%**. Normal values range between 95% and 100%. "
            + ("This is low, indicating possible respiratory strain. Please seek medical assessment." if spo2 < 95 else "This is healthy and in the normal range.")
        )
    elif "medication" in msg or "pill" in msg or "drug" in msg:
        meds = health_card.get("current_medications", [])
        allergies = health_card.get("allergies", [])
        med_str = ", ".join(meds) if meds else "None"
        allergy_str = ", ".join(allergies) if allergies else "None"
        reply = (
            f"I see you are currently taking: **{med_str}** and have allergies to: **{allergy_str}**. "
            "Always consult your pharmacist or doctor before taking new over-the-counter medications to avoid "
            "potential adverse drug-drug interactions or allergic reactions."
        )
    else:
        reply = (
            f"I'm here to help you understand your health readings (Demo Mode). I note that your current prediction is "
            f"**{predicted_cond}** with a **{risk_level}** risk profile. If you have questions about your vitals, chronic conditions, "
            f"or general health tips, feel free to ask! (Note: Please configure GEMINI_API_KEY in backend/.env to activate Gemini API responses)."
        )
        
    return ChatResponse(response=reply)

def chat_with_gemini(request: ChatRequest) -> ChatResponse:
    """Process user health query, injecting dynamic medical history as system prompt context."""
    api_key = os.getenv("GEMINI_API_KEY")
    
    # Fallback to mock if API key is not set
    if not api_key or api_key.strip() == "":
        logger.warning("GEMINI_API_KEY not set. Falling back to Mock Chatbot.")
        return get_mock_chat_response(request)
        
    try:
        genai.configure(api_key=api_key.strip())
        
        # Build dynamic context representation
        formatted_context = "No clinical profile provided yet."
        if request.context:
            hc = request.context.health_card
            vitals = hc.get("vitals", {})
            pred = request.context.prediction or {}
            
            formatted_context = (
                f"Patient Health Card Profile:\n"
                f"- Health ID: {hc.get('health_id')}\n"
                f"- Age/Gender: {hc.get('age')} years old, {hc.get('gender')}\n"
                f"- Blood Group: {hc.get('blood_group')}\n"
                f"- Chronic Conditions: {', '.join(hc.get('chronic_conditions', [])) or 'None'}\n"
                f"- Allergies: {', '.join(hc.get('allergies', [])) or 'None'}\n"
                f"- Current Medications: {', '.join(hc.get('current_medications', [])) or 'None'}\n"
                f"- Current Vitals: Heart Rate {vitals.get('heart_rate')} bpm, BP {vitals.get('bp_systolic')}/{vitals.get('bp_diastolic')} mmHg, SpO2 {vitals.get('spo2')}%\n"
                f"- Active Symptoms: {', '.join(request.context.symptoms) or 'None'}\n"
                f"- AI Predicted Condition: {pred.get('condition', 'None')}\n"
                f"- AI Risk Evaluation: {pred.get('risk_level', 'Low')} ({pred.get('confidence', 0)}% confidence)\n"
                f"- AI Reasonings: {pred.get('details', 'None')}\n"
            )
            
        full_instruction = SYSTEM_INSTRUCTION_TEMPLATE.replace("[Insert Context JSON]", formatted_context)
        
        # Configure Gemini Model with System Instruction
        model = genai.GenerativeModel(
            model_name="gemini-3.6-flash",
            system_instruction=full_instruction
        )
        
        # Reconstruct chat history in Gemini format
        contents = []
        for msg in request.chat_history:
            # Map roles: gemini uses "user" and "model"
            role = "user" if msg.role == "user" else "model"
            contents.append({
                "role": role,
                "parts": [msg.content]
            })
            
        # Append the new user message
        contents.append({
            "role": "user",
            "parts": [request.message]
        })
        
        # Call API
        response = model.generate_content(contents)
        return ChatResponse(response=response.text.strip())
        
    except Exception as e:
        logger.error(f"Error occurred during Gemini chatbot API call: {str(e)}")
        fallback = get_mock_chat_response(request)
        fallback.response = f"Gemini API Error ({str(e)}). Entering local mode.\n\n" + fallback.response
        return fallback
