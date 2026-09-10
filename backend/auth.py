import hashlib
import secrets
import uuid
from typing import Dict, Optional
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel, Field

# In-memory data store for user accounts and active tokens
# (In production, replace with PostgreSQL/MongoDB/SQLite)
USERS_DB: Dict[str, dict] = {}
TOKENS_DB: Dict[str, dict] = {}

class UserRegister(BaseModel):
    name: str = Field(..., description="Full Name of the user")
    email: str = Field(..., description="Email address")
    password: str = Field(..., min_length=6, description="Password (min 6 chars)")
    phone: Optional[str] = Field(default=None, description="Optional phone number")
    health_id: Optional[str] = Field(default=None, description="Optional custom Smart Health ID")

class UserLogin(BaseModel):
    email: str = Field(..., description="Email address")
    password: str = Field(..., description="Password")

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    health_id: str
    created_at: str

class AuthTokenResponse(BaseModel):
    token: str
    user: UserResponse
    message: str

def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    """Hash a password using PBKDF2-HMAC-SHA256 with salt."""
    if not salt:
        salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return key.hex(), salt

def verify_password(password: str, hashed_password: str, salt: str) -> bool:
    """Verify password against salt and hash."""
    computed_hash, _ = hash_password(password, salt)
    return secrets.compare_digest(computed_hash, hashed_password)

def create_session_token(user_id: str) -> str:
    """Generate a secure random session token valid for 24 hours."""
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(days=1)
    TOKENS_DB[token] = {
        "user_id": user_id,
        "expires_at": expires_at
    }
    return token

def get_user_by_token(token: str) -> Optional[dict]:
    """Retrieve user object if token is valid and not expired."""
    session = TOKENS_DB.get(token)
    if not session:
        return None
    if datetime.now(timezone.utc) > session["expires_at"]:
        del TOKENS_DB[token]
        return None
    return USERS_DB.get(session["user_id"])

def register_user(payload: UserRegister) -> tuple[dict, str]:
    """Register a new user, returning user data and auth token."""
    email_clean = payload.email.strip().lower()
    if email_clean in USERS_DB:
        raise ValueError("An account with this email address already exists.")
        
    hashed_pwd, salt = hash_password(payload.password)
    user_id = str(uuid.uuid4())
    health_id = payload.health_id or f"SH-{secrets.randbelow(89999) + 10000}-XYZ"
    now_str = datetime.now(timezone.utc).isoformat()
    
    user_record = {
        "id": user_id,
        "name": payload.name.strip(),
        "email": email_clean,
        "phone": payload.phone.strip() if payload.phone else None,
        "password_hash": hashed_pwd,
        "salt": salt,
        "health_id": health_id,
        "created_at": now_str
    }
    
    USERS_DB[email_clean] = user_record
    USERS_DB[user_id] = user_record
    
    token = create_session_token(user_id)
    return user_record, token

def login_user(payload: UserLogin) -> tuple[dict, str]:
    """Authenticate user with email/password and return user data and token."""
    email_clean = payload.email.strip().lower()
    user_record = USERS_DB.get(email_clean)
    if not user_record:
        raise ValueError("Invalid email address or password.")
        
    if not verify_password(payload.password, user_record["password_hash"], user_record["salt"]):
        raise ValueError("Invalid email address or password.")
        
    token = create_session_token(user_record["id"])
    return user_record, token

def create_guest_user() -> tuple[dict, str]:
    """Create a quick guest user for instant seamless access."""
    guest_num = secrets.randbelow(8999) + 1000
    guest_email = f"guest_{guest_num}@smarthealth.ai"
    user_id = str(uuid.uuid4())
    health_id = f"SH-GUEST-{guest_num}"
    now_str = datetime.now(timezone.utc).isoformat()
    
    hashed_pwd, salt = hash_password("guest_pass_123")
    user_record = {
        "id": user_id,
        "name": f"Guest User #{guest_num}",
        "email": guest_email,
        "password_hash": hashed_pwd,
        "salt": salt,
        "health_id": health_id,
        "created_at": now_str
    }
    
    USERS_DB[guest_email] = user_record
    USERS_DB[user_id] = user_record
    
    token = create_session_token(user_id)
    return user_record, token

# Pre-seed demo user
try:
    demo_payload = UserRegister(
        name="Dr. Alex Vance",
        email="demo@smarthealth.ai",
        password="password123",
        health_id="SH-29381-XYZ"
    )
    register_user(demo_payload)
except Exception:
    pass
