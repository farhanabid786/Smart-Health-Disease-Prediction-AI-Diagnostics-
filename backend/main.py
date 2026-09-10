import os
import uvicorn
from pathlib import Path
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Import engines & auth
# Predictor imports moved inside endpoint to avoid import errors during startup

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    # Import for type checking only; actual import occurs lazily in endpoint to avoid runtime errors when google.generativeai is unavailable.
    from predictor import PredictionRequest, PredictionResponse, predict_disease_with_gemini
from chatbot import ChatRequest, ChatResponse, chat_with_gemini
from auth import (
    UserRegister, 
    UserLogin, 
    UserResponse, 
    AuthTokenResponse,
    register_user, 
    login_user, 
    create_guest_user,
    get_user_by_token
)

load_dotenv(dotenv_path=Path(__file__).with_name('.env'))

# Lazy import of predictor models (avoids heavy dependencies on startup)
from predictor import PredictionRequest, PredictionResponse, predict_disease_with_gemini

app = FastAPI(
    title="Smart Health Disease Prediction API",
    description="Python FastAPI backend managing Gemini-based disease predictions, clinical chatbots, and authentication.",
    version="1.1.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_current_user_optional(authorization: str = Header(default=None)):
    """Helper to extract user from Authorization Bearer token header if present."""
    if not authorization:
        return None
    try:
        parts = authorization.split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            token = parts[1]
            return get_user_by_token(token)
    except Exception:
        pass
    return None

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Smart Health Disease Prediction API",
        "gemini_enabled": bool(os.getenv("GEMINI_API_KEY"))
    }

# --- Authentication Endpoints ---

@app.post("/api/auth/register", response_model=AuthTokenResponse)
def api_register(payload: UserRegister):
    try:
        user_record, token = register_user(payload)
        user_resp = UserResponse(
            id=user_record["id"],
            name=user_record["name"],
            email=user_record["email"],
            phone=user_record.get("phone"),
            health_id=user_record["health_id"],
            created_at=user_record["created_at"]
        )
        return AuthTokenResponse(token=token, user=user_resp, message="Registration successful!")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration error: {str(e)}")

@app.post("/api/auth/login", response_model=AuthTokenResponse)
def api_login(payload: UserLogin):
    try:
        user_record, token = login_user(payload)
        user_resp = UserResponse(
            id=user_record["id"],
            name=user_record["name"],
            email=user_record["email"],
            phone=user_record.get("phone"),
            health_id=user_record["health_id"],
            created_at=user_record["created_at"]
        )
        return AuthTokenResponse(token=token, user=user_resp, message="Login successful!")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login error: {str(e)}")

@app.post("/api/auth/guest", response_model=AuthTokenResponse)
def api_guest():
    try:
        user_record, token = create_guest_user()
        user_resp = UserResponse(
            id=user_record["id"],
            name=user_record["name"],
            email=user_record["email"],
            phone=user_record.get("phone"),
            health_id=user_record["health_id"],
            created_at=user_record["created_at"]
        )
        return AuthTokenResponse(token=token, user=user_resp, message="Guest session initialized!")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Guest login error: {str(e)}")

@app.get("/api/auth/me", response_model=UserResponse)
def api_me(authorization: str = Header(default=None)):
    user = get_current_user_optional(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired authentication token.")
    return UserResponse(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        phone=user.get("phone"),
        health_id=user["health_id"],
        created_at=user["created_at"]
    )

# --- Core Health Endpoints ---

@app.post("/api/predict-disease", response_model=PredictionResponse)
def predict_disease(payload: PredictionRequest):
    try:
        return predict_disease_with_gemini(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

@app.post("/api/chat", response_model=ChatResponse)
def chat_endpoint(payload: ChatRequest):
    try:
        return chat_with_gemini(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chatbot connection error: {str(e)}")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "127.0.0.1")
    uvicorn.run("main:app", host=host, port=port, reload=True)
