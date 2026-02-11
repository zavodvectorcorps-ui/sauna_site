from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# External API URL
CALCULATOR_API_URL = "https://wm-kalkulator.pl"

# Create the main app
app = FastAPI(title="WM-Sauna API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============= Models =============

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class ContactFormCreate(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: str
    message: Optional[str] = None
    model: Optional[str] = None
    variant: Optional[str] = None
    options: Optional[List[str]] = None
    total: Optional[float] = None

class ContactForm(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: Optional[str] = None
    phone: str
    message: Optional[str] = None
    model: Optional[str] = None
    variant: Optional[str] = None
    options: Optional[List[str]] = None
    total: Optional[float] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "new"

# ============= Routes =============

@api_router.get("/")
async def root():
    return {"message": "WM-Sauna API", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Contact form endpoints
@api_router.post("/contact", response_model=ContactForm)
async def submit_contact_form(form_data: ContactFormCreate):
    """Submit a contact/inquiry form"""
    try:
        contact = ContactForm(**form_data.model_dump())
        doc = contact.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        
        await db.contact_forms.insert_one(doc)
        
        logger.info(f"New contact form submitted: {contact.name} - {contact.phone}")
        
        return contact
    except Exception as e:
        logger.error(f"Error submitting contact form: {e}")
        raise HTTPException(status_code=500, detail="Error submitting form")

@api_router.get("/contact", response_model=List[ContactForm])
async def get_contact_forms():
    """Get all contact form submissions"""
    forms = await db.contact_forms.find({}, {"_id": 0}).to_list(1000)
    
    for form in forms:
        if isinstance(form.get('created_at'), str):
            form['created_at'] = datetime.fromisoformat(form['created_at'])
    
    return forms

# Proxy endpoints for calculator API
@api_router.get("/sauna/prices")
async def get_sauna_prices():
    """Proxy to get sauna prices from calculator API"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(f"{CALCULATOR_API_URL}/api/sauna/prices")
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        logger.error(f"Error fetching sauna prices: {e}")
        raise HTTPException(status_code=502, detail="Error fetching prices from calculator")

# Status check endpoints (existing)
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Include the router
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
