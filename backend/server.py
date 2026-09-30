from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import certifi
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from google import genai


# ---------------- ENV ----------------

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URI"]
client = AsyncIOMotorClient(mongo_url, tlsCAFile=certifi.where())
db = client["wiprofire"]


# ---------------- GEMINI ----------------

client_ai = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))


# ---------------- APP ----------------

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

ADMIN_EMAIL = os.environ["ADMIN_EMAIL"]
ADMIN_PASSWORD = os.environ["ADMIN_PASSWORD"]


# ---------------- MODELS ----------------

class ContactInquiry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: str
    message: str
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    message: str


class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    category: str
    image_url: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ProductCreate(BaseModel):
    title: str
    description: str
    category: str
    image_url: str


class AdminLogin(BaseModel):
    email: EmailStr
    password: str


class AdminToken(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ChatMessage(BaseModel):
    message: str
    session_id: str


class ChatResponse(BaseModel):
    response: str


class InquiryStatusUpdate(BaseModel):
    status: str


# ---------------- AUTH ----------------

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt


async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return email
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


# ---------------- ROOT ----------------

@api_router.get("/")
async def root():
    return {"message": "Wipro Fire & Safety API Running"}


# ---------------- CONTACT ----------------

@api_router.post("/contact", response_model=ContactInquiry)
async def create_contact_inquiry(input: ContactCreate):
    inquiry_obj = ContactInquiry(**input.model_dump())
    doc = inquiry_obj.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.contact_inquiries.insert_one(doc)
    return inquiry_obj


@api_router.get("/contact", response_model=List[ContactInquiry])
async def get_contact_inquiries(email: str = Depends(verify_token)):
    inquiries = await db.contact_inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for inquiry in inquiries:
        if isinstance(inquiry["created_at"], str):
            inquiry["created_at"] = datetime.fromisoformat(inquiry["created_at"])
    return inquiries


@api_router.patch("/contact/{inquiry_id}/status")
async def update_inquiry_status(inquiry_id: str, update: InquiryStatusUpdate, email: str = Depends(verify_token)):
    result = await db.contact_inquiries.update_one(
        {"id": inquiry_id},
        {"$set": {"status": update.status}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return {"message": "Status updated successfully"}


# ---------------- PRODUCTS ----------------

@api_router.post("/products", response_model=Product)
async def create_product(input: ProductCreate, email: str = Depends(verify_token)):
    product_obj = Product(**input.model_dump())
    doc = product_obj.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.products.insert_one(doc)
    return product_obj


@api_router.get("/products", response_model=List[Product])
async def get_products():
    products = await db.products.find({}, {"_id": 0}).to_list(1000)
    for product in products:
        if isinstance(product["created_at"], str):
            product["created_at"] = datetime.fromisoformat(product["created_at"])
    return products


@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, email: str = Depends(verify_token)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}


# ---------------- ADMIN LOGIN ----------------

@api_router.post("/admin/login", response_model=AdminToken)
async def admin_login(credentials: AdminLogin):
    if credentials.email != ADMIN_EMAIL:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if credentials.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token(data={"sub": credentials.email})
    return AdminToken(access_token=access_token)


# ---------------- AI CHATBOT ----------------

def get_smart_response(message: str) -> str:
    try:
        system_prompt = """You are a helpful customer service assistant for Wipro Fire & Safety, a fire safety company in Kurnool, Andhra Pradesh, India.

Company Details:
- CEO: V. Ramanjaneyulu
- Established: 2007 (18+ years experience)
- Phone: +91 8019918288
- Email: jashwanthsai268@gmail.com
- Address: Priya Homes, Vishnu Township, Auto Nagar, Lanjapeta, Kurnool, AP 518003

Services: Fire Installation, AMC Maintenance, Safety Compliance, Equipment Maintenance, Refilling & Testing, Safety Training
Products: Fire Extinguishers (ABC/CO2/Water/Foam), Fire Alarm Systems, Hose Reels & Hydrants, PPE, Emergency Exit Systems
Certifications: ISO Certified, Fire Department Approved, GST Registered
Clients: 1000+ clients including malls, factories, hospitals, schools, offices, warehouses

Instructions:
- Answer in 2-3 short sentences maximum
- Be friendly and professional
- For pricing always say to contact +91 8019918288
- Always answer in English"""

        prompt = system_prompt + "\n\nCustomer: " + message + "\nAssistant:"

        response = client_ai.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )

        if response.text and len(response.text.strip()) > 10:
            return response.text.strip()

    except Exception as e:
        logging.error(f"Gemini error in get_smart_response: {str(e)}")

    return None


@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(chat_input: ChatMessage):
    # Get response from Gemini via get_smart_response
    response = get_smart_response(chat_input.message)
    
    if response:
        return ChatResponse(response=response)
    
    # Final fallback
    return ChatResponse(response="Thank you for your question! For detailed information please contact us at +91 8019918288 or WhatsApp us. Our team will be happy to assist you.")
# ---------------- ROUTER ----------------

app.include_router(api_router)


# ---------------- CORS ----------------

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()