from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import httpx
import secrets
import base64

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

# Security
security = HTTPBasic()

# Admin credentials
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "220066"

def verify_admin(credentials: HTTPBasicCredentials = Depends(security)):
    correct_username = secrets.compare_digest(credentials.username, ADMIN_USERNAME)
    correct_password = secrets.compare_digest(credentials.password, ADMIN_PASSWORD)
    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username

# ============= Models =============

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class ContactFormCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    phone: str = Field(..., min_length=6, max_length=20)
    message: Optional[str] = Field(None, max_length=2000)
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

# Admin Models
class SiteSettings(BaseModel):
    id: str = "site_settings"
    company_name: str = "WM-Sauna"
    phone: str = "+48 732 099 201"
    email: str = "wmsauna@gmail.com"
    address: str = "ul. Boryny 3, 02-257 Warszawa"
    nip: str = "9512561195"
    regon: str = "52438914000000"
    working_hours: str = "Pon–Pt: 9:00 – 17:45"
    facebook_url: str = "https://facebook.com"
    instagram_url: str = "https://instagram.com"
    youtube_url: str = "https://youtube.com"

class HeroSettings(BaseModel):
    id: str = "hero_settings"
    background_image: str = "https://images.unsplash.com/photo-1759302353458-3c617bfd428b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDV8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBtb2Rlcm4lMjB3b29kZW4lMjBzYXVuYSUyMGludGVyaW9yJTIwcGFub3JhbWljJTIwd2luZG93JTIwbmF0dXJlJTIwdmlld3xlbnwwfHx8fDE3NzA4NDMyODh8MA&ixlib=rb-4.1.0&q=85"
    title_pl: str = "Producent Saun Drewnianych w Polsce"
    title_en: str = "Wooden Sauna Manufacturer in Poland"
    title_ru: str = "Производитель деревянных саун в Польше"
    subtitle_pl: str = "Od 2015 roku tworzymy sauny premium z najwyższej jakości drewna skandynawskiego. Gotowe do dostawy w 5-10 dni."
    subtitle_en: str = "Since 2015, we create premium saunas from the highest quality Scandinavian wood. Ready for delivery in 5-10 days."
    subtitle_ru: str = "С 2015 года создаём премиальные сауны из высококачественной скандинавской древесины. Готовы к доставке за 5-10 дней."

class AboutSettings(BaseModel):
    id: str = "about_settings"
    image: str = "https://images.unsplash.com/photo-1627750673372-ceabdbeb768c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzV8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b29kZW4lMjBzYXVuYSUyMGNhYmluJTIwZXh0ZXJpb3IlMjBnYXJkZW58ZW58MHx8fHwxNzcwODQzMzIzfDA&ixlib=rb-4.1.0&q=85"
    years_experience: int = 10
    text1_pl: str = "Jesteśmy polskim producentem saun drewnianych z siedzibą w Warszawie. Od 2015 roku tworzymy sauny premium, łącząc tradycyjne rzemiosło z nowoczesnym designem."
    text1_en: str = "We are a Polish wooden sauna manufacturer based in Warsaw. Since 2015, we create premium saunas, combining traditional craftsmanship with modern design."
    text1_ru: str = "Мы — польский производитель деревянных саун с офисом в Варшаве. С 2015 года создаём премиальные сауны, сочетая традиционное мастерство с современным дизайном."
    text2_pl: str = "Używamy tylko najwyższej jakości drewna skandynawskiego, suszonego w komorach. Każda sauna przechodzi ponad 30 punktów kontroli jakości przed wysyłką."
    text2_en: str = "We use only the highest quality Scandinavian wood, kiln-dried. Each sauna passes over 30 quality control points before shipping."
    text2_ru: str = "Используем только высококачественную скандинавскую древесину, высушенную в камерах. Каждая сауна проходит более 30 пунктов контроля качества перед отправкой."
    text3_pl: str = "Oferujemy pełny serwis — od projektu, przez produkcję, po dostawę i montaż. Gwarancja 12 miesięcy na wszystkie nasze produkty."
    text3_en: str = "We offer full service — from design, through production, to delivery and installation. 12-month warranty on all our products."
    text3_ru: str = "Предлагаем полный сервис — от проекта, через производство, до доставки и монтажа. Гарантия 12 месяцев на все наши продукты."

class Review(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    location: str
    rating: int = 5
    text_pl: str
    text_en: str
    text_ru: str
    image: str
    sauna: str
    active: bool = True

class CalculatorConfig(BaseModel):
    id: str = "calculator_config"
    enabled_models: List[str] = []  # Empty means all enabled
    enabled_categories: List[str] = []  # Empty means all enabled
    show_discount_badge: bool = True

class GalleryImage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    url: str
    alt: str
    category: str = "all"  # all, kwadro, beczka
    active: bool = True
    sort_order: int = 0

class StockSauna(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    image: str
    price: float
    discount: int = 0
    capacity: str = "2-4"
    steam_room_size: str = ""
    relax_room_size: str = ""
    features: List[str] = []
    active: bool = True
    sort_order: int = 0

class SectionOrder(BaseModel):
    id: str = "section_order"
    sections: List[str] = ["hero", "calculator", "gallery", "stock", "reviews", "about", "contact"]

class LayoutSettings(BaseModel):
    id: str = "layout_settings"
    section_spacing: str = "large"  # small, medium, large
    section_padding_top: int = 80  # px
    section_padding_bottom: int = 80  # px

class GalleryConfig(BaseModel):
    id: str = "gallery_config"
    hidden_api_images: List[str] = []  # List of image URLs to hide from API
    show_api_images: bool = False  # Master toggle for API images - disabled by default now

# Section Content Settings
class GallerySettings(BaseModel):
    id: str = "gallery_settings"
    title_pl: str = "Nasze realizacje"
    title_en: str = "Our Projects"
    subtitle_pl: str = "Zobacz nasze najnowsze projekty i inspiracje. Każda sauna to unikalne dzieło rzemiosła."
    subtitle_en: str = "See our latest projects and inspirations. Each sauna is a unique piece of craftsmanship."

class CalculatorSettings(BaseModel):
    id: str = "calculator_settings"
    title_pl: str = "Skonfiguruj swoją saunę"
    title_en: str = "Configure your sauna"
    subtitle_pl: str = "Wybierz model i dostosuj go do swoich potrzeb. Otrzymasz dokładną wycenę w kilka minut."
    subtitle_en: str = "Choose a model and customize it to your needs. Get an accurate quote in minutes."

class StockSettings(BaseModel):
    id: str = "stock_settings"
    title_pl: str = "Sauny dostępne od ręki"
    title_en: str = "Saunas available now"
    subtitle_pl: str = "Gotowe modele z natychmiastową dostawą. Idealne rozwiązanie, gdy nie chcesz czekać."
    subtitle_en: str = "Ready-made models with immediate delivery. Perfect solution when you don't want to wait."

class ReviewsSettings(BaseModel):
    id: str = "reviews_settings"
    title_pl: str = "Co mówią nasi klienci"
    title_en: str = "What our clients say"
    subtitle_pl: str = "Dołącz do grona zadowolonych właścicieli saun WM-Sauna."
    subtitle_en: str = "Join the group of satisfied WM-Sauna owners."

class ContactSettings(BaseModel):
    id: str = "contact_settings"
    title_pl: str = "Skontaktuj się z nami"
    title_en: str = "Contact us"
    subtitle_pl: str = "Masz pytania? Chętnie na nie odpowiemy. Skontaktuj się z nami telefonicznie lub wypełnij formularz."
    subtitle_en: str = "Have questions? We'll be happy to answer them. Contact us by phone or fill out the form."
    form_title_pl: str = "Wyślij zapytanie"
    form_title_en: str = "Send inquiry"
    form_subtitle_pl: str = "Wypełnij formularz, a oddzwonimy w ciągu 24h"
    form_subtitle_en: str = "Fill out the form and we'll call you back within 24 hours"

class FooterSettings(BaseModel):
    id: str = "footer_settings"
    tagline_pl: str = "Polski producent saun drewnianych premium od 2015 roku."
    tagline_en: str = "Polish premium wooden sauna manufacturer since 2015."
    copyright_pl: str = "Wszelkie prawa zastrzeżone."
    copyright_en: str = "All rights reserved."

# ============= Public Routes =============

@api_router.get("/")
async def root():
    return {"message": "WM-Sauna API", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Contact form endpoints
@api_router.post("/contact", response_model=ContactForm)
async def submit_contact_form(form_data: ContactFormCreate):
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

# Proxy endpoints for calculator API with caching
@api_router.get("/sauna/prices")
async def get_sauna_prices():
    cache_key = "sauna_prices_cache"
    
    try:
        # Try to fetch from external API
        async with httpx.AsyncClient(timeout=15.0) as http_client:
            response = await http_client.get(f"{CALCULATOR_API_URL}/api/sauna/prices")
            response.raise_for_status()
            data = response.json()
            
            # Save to cache on success
            await db.cache.update_one(
                {"id": cache_key},
                {
                    "$set": {
                        "id": cache_key,
                        "data": data,
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }
                },
                upsert=True
            )
            logger.info("Sauna prices fetched from API and cached")
            return data
            
    except (httpx.HTTPError, Exception) as e:
        logger.warning(f"External API unavailable: {e}. Trying cache...")
        
        # Try to get from cache
        cached = await db.cache.find_one({"id": cache_key}, {"_id": 0})
        if cached and cached.get("data"):
            logger.info(f"Returning cached data from {cached.get('updated_at', 'unknown')}")
            return cached["data"]
        
        # No cache available
        logger.error("No cached data available")
        raise HTTPException(status_code=502, detail="Calculator API unavailable and no cached data")

# Public settings endpoints
@api_router.get("/settings/site")
async def get_site_settings_public():
    settings = await db.settings.find_one({"id": "site_settings"}, {"_id": 0})
    if not settings:
        return SiteSettings().model_dump()
    return settings

@api_router.get("/settings/hero")
async def get_hero_settings_public():
    settings = await db.settings.find_one({"id": "hero_settings"}, {"_id": 0})
    if not settings:
        return HeroSettings().model_dump()
    return settings

@api_router.get("/settings/about")
async def get_about_settings_public():
    settings = await db.settings.find_one({"id": "about_settings"}, {"_id": 0})
    if not settings:
        return AboutSettings().model_dump()
    return settings

@api_router.get("/settings/calculator")
async def get_calculator_config_public():
    config = await db.settings.find_one({"id": "calculator_config"}, {"_id": 0})
    if not config:
        return CalculatorConfig().model_dump()
    return config

@api_router.get("/settings/sections")
async def get_section_order_public():
    order = await db.settings.find_one({"id": "section_order"}, {"_id": 0})
    if not order:
        return SectionOrder().model_dump()
    return order

@api_router.get("/reviews")
async def get_reviews_public():
    reviews = await db.reviews.find({"active": True}, {"_id": 0}).to_list(100)
    if not reviews:
        # Return default reviews
        return get_default_reviews()
    return reviews

@api_router.get("/gallery")
async def get_gallery_public():
    images = await db.gallery.find({"active": True}, {"_id": 0}).sort("sort_order", 1).to_list(100)
    return images

@api_router.get("/settings/gallery")
async def get_gallery_config_public():
    config = await db.settings.find_one({"id": "gallery_config"}, {"_id": 0})
    if not config:
        return GalleryConfig().model_dump()
    return config

# Section content settings endpoints
@api_router.get("/settings/gallery-content")
async def get_gallery_settings_public():
    settings = await db.settings.find_one({"id": "gallery_settings"}, {"_id": 0})
    if not settings:
        return GallerySettings().model_dump()
    return settings

@api_router.get("/settings/calculator-content")
async def get_calculator_settings_public():
    settings = await db.settings.find_one({"id": "calculator_settings"}, {"_id": 0})
    if not settings:
        return CalculatorSettings().model_dump()
    return settings

@api_router.get("/settings/stock")
async def get_stock_settings_public():
    settings = await db.settings.find_one({"id": "stock_settings"}, {"_id": 0})
    if not settings:
        return StockSettings().model_dump()
    return settings

@api_router.get("/settings/reviews-content")
async def get_reviews_settings_public():
    settings = await db.settings.find_one({"id": "reviews_settings"}, {"_id": 0})
    if not settings:
        return ReviewsSettings().model_dump()
    return settings

@api_router.get("/settings/contact")
async def get_contact_settings_public():
    settings = await db.settings.find_one({"id": "contact_settings"}, {"_id": 0})
    if not settings:
        return ContactSettings().model_dump()
    return settings

@api_router.get("/settings/footer")
async def get_footer_settings_public():
    settings = await db.settings.find_one({"id": "footer_settings"}, {"_id": 0})
    if not settings:
        return FooterSettings().model_dump()
    return settings

@api_router.get("/settings/layout")
async def get_layout_settings_public():
    settings = await db.settings.find_one({"id": "layout_settings"}, {"_id": 0})
    if not settings:
        return LayoutSettings().model_dump()
    return settings

@api_router.get("/stock-saunas")
async def get_stock_saunas_public():
    saunas = await db.stock_saunas.find({"active": True}, {"_id": 0}).sort("sort_order", 1).to_list(100)
    return saunas

# ============= Admin Routes =============

@api_router.post("/admin/login")
async def admin_login(credentials: HTTPBasicCredentials = Depends(security)):
    verify_admin(credentials)
    return {"status": "success", "message": "Logged in successfully"}

# Contact forms management
@api_router.get("/admin/contacts")
async def get_all_contacts(username: str = Depends(verify_admin)):
    forms = await db.contact_forms.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for form in forms:
        if isinstance(form.get('created_at'), str):
            form['created_at'] = datetime.fromisoformat(form['created_at'])
    return forms

@api_router.put("/admin/contacts/{contact_id}/status")
async def update_contact_status(contact_id: str, status: str, username: str = Depends(verify_admin)):
    result = await db.contact_forms.update_one(
        {"id": contact_id},
        {"$set": {"status": status}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"status": "success"}

@api_router.delete("/admin/contacts/{contact_id}")
async def delete_contact(contact_id: str, username: str = Depends(verify_admin)):
    result = await db.contact_forms.delete_one({"id": contact_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"status": "success"}

# Site settings
@api_router.put("/admin/settings/site")
async def update_site_settings(settings: SiteSettings, username: str = Depends(verify_admin)):
    await db.settings.update_one(
        {"id": "site_settings"},
        {"$set": settings.model_dump()},
        upsert=True
    )
    return {"status": "success"}

# Hero settings
@api_router.put("/admin/settings/hero")
async def update_hero_settings(settings: HeroSettings, username: str = Depends(verify_admin)):
    await db.settings.update_one(
        {"id": "hero_settings"},
        {"$set": settings.model_dump()},
        upsert=True
    )
    return {"status": "success"}

# About settings
@api_router.put("/admin/settings/about")
async def update_about_settings(settings: AboutSettings, username: str = Depends(verify_admin)):
    await db.settings.update_one(
        {"id": "about_settings"},
        {"$set": settings.model_dump()},
        upsert=True
    )
    return {"status": "success"}

# Calculator config
@api_router.put("/admin/settings/calculator")
async def update_calculator_config(config: CalculatorConfig, username: str = Depends(verify_admin)):
    await db.settings.update_one(
        {"id": "calculator_config"},
        {"$set": config.model_dump()},
        upsert=True
    )
    return {"status": "success"}

# Section order
@api_router.put("/admin/settings/sections")
async def update_section_order(order: SectionOrder, username: str = Depends(verify_admin)):
    await db.settings.update_one(
        {"id": "section_order"},
        {"$set": order.model_dump()},
        upsert=True
    )
    return {"status": "success"}

# Gallery config
@api_router.get("/admin/settings/gallery")
async def get_gallery_config(username: str = Depends(verify_admin)):
    config = await db.settings.find_one({"id": "gallery_config"}, {"_id": 0})
    if not config:
        return GalleryConfig().model_dump()
    return config

@api_router.put("/admin/settings/gallery")
async def update_gallery_config(config: GalleryConfig, username: str = Depends(verify_admin)):
    await db.settings.update_one(
        {"id": "gallery_config"},
        {"$set": config.model_dump()},
        upsert=True
    )
    return {"status": "success"}

# Section content settings (admin)
@api_router.put("/admin/settings/gallery-content")
async def update_gallery_settings(settings: GallerySettings, username: str = Depends(verify_admin)):
    await db.settings.update_one(
        {"id": "gallery_settings"},
        {"$set": settings.model_dump()},
        upsert=True
    )
    return {"status": "success"}

@api_router.put("/admin/settings/calculator-content")
async def update_calculator_settings(settings: CalculatorSettings, username: str = Depends(verify_admin)):
    await db.settings.update_one(
        {"id": "calculator_settings"},
        {"$set": settings.model_dump()},
        upsert=True
    )
    return {"status": "success"}

@api_router.put("/admin/settings/stock")
async def update_stock_settings(settings: StockSettings, username: str = Depends(verify_admin)):
    await db.settings.update_one(
        {"id": "stock_settings"},
        {"$set": settings.model_dump()},
        upsert=True
    )
    return {"status": "success"}

@api_router.put("/admin/settings/reviews-content")
async def update_reviews_settings(settings: ReviewsSettings, username: str = Depends(verify_admin)):
    await db.settings.update_one(
        {"id": "reviews_settings"},
        {"$set": settings.model_dump()},
        upsert=True
    )
    return {"status": "success"}

@api_router.put("/admin/settings/contact")
async def update_contact_settings(settings: ContactSettings, username: str = Depends(verify_admin)):
    await db.settings.update_one(
        {"id": "contact_settings"},
        {"$set": settings.model_dump()},
        upsert=True
    )
    return {"status": "success"}

@api_router.put("/admin/settings/footer")
async def update_footer_settings(settings: FooterSettings, username: str = Depends(verify_admin)):
    await db.settings.update_one(
        {"id": "footer_settings"},
        {"$set": settings.model_dump()},
        upsert=True
    )
    return {"status": "success"}

# Reviews management
@api_router.get("/admin/reviews")
async def get_all_reviews(username: str = Depends(verify_admin)):
    reviews = await db.reviews.find({}, {"_id": 0}).to_list(100)
    if not reviews:
        return get_default_reviews()
    return reviews

@api_router.post("/admin/reviews")
async def create_review(review: Review, username: str = Depends(verify_admin)):
    await db.reviews.insert_one(review.model_dump())
    return review

@api_router.put("/admin/reviews/{review_id}")
async def update_review(review_id: str, review: Review, username: str = Depends(verify_admin)):
    review.id = review_id
    result = await db.reviews.update_one(
        {"id": review_id},
        {"$set": review.model_dump()},
        upsert=True
    )
    return {"status": "success"}

@api_router.delete("/admin/reviews/{review_id}")
async def delete_review(review_id: str, username: str = Depends(verify_admin)):
    result = await db.reviews.delete_one({"id": review_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"status": "success"}

# Gallery management
@api_router.get("/admin/gallery")
async def get_all_gallery(username: str = Depends(verify_admin)):
    images = await db.gallery.find({}, {"_id": 0}).sort("sort_order", 1).to_list(100)
    return images

@api_router.post("/admin/gallery")
async def add_gallery_image(image: GalleryImage, username: str = Depends(verify_admin)):
    await db.gallery.insert_one(image.model_dump())
    return image

@api_router.put("/admin/gallery/{image_id}")
async def update_gallery_image(image_id: str, image: GalleryImage, username: str = Depends(verify_admin)):
    image.id = image_id
    await db.gallery.update_one(
        {"id": image_id},
        {"$set": image.model_dump()},
        upsert=True
    )
    return {"status": "success"}

@api_router.delete("/admin/gallery/{image_id}")
async def delete_gallery_image(image_id: str, username: str = Depends(verify_admin)):
    result = await db.gallery.delete_one({"id": image_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Image not found")
    return {"status": "success"}

# Image upload
@api_router.post("/admin/upload")
async def upload_image(
    file: UploadFile = File(...),
    username: str = Depends(verify_admin)
):
    try:
        contents = await file.read()
        # Store as base64 in MongoDB (for simplicity)
        image_id = str(uuid.uuid4())
        base64_data = base64.b64encode(contents).decode('utf-8')
        content_type = file.content_type or 'image/jpeg'
        
        image_doc = {
            "id": image_id,
            "filename": file.filename,
            "content_type": content_type,
            "data": base64_data,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.uploads.insert_one(image_doc)
        
        # Return URL that can be used to retrieve the image
        return {
            "status": "success",
            "image_id": image_id,
            "url": f"/api/images/{image_id}"
        }
    except Exception as e:
        logger.error(f"Error uploading image: {e}")
        raise HTTPException(status_code=500, detail="Error uploading image")

@api_router.get("/images/{image_id}")
async def get_uploaded_image(image_id: str):
    from fastapi.responses import Response
    image = await db.uploads.find_one({"id": image_id})
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    image_data = base64.b64decode(image["data"])
    return Response(content=image_data, media_type=image["content_type"])

# Helper functions
def get_default_reviews():
    return [
        {
            "id": "default_1",
            "name": "Marek Kowalski",
            "location": "Warszawa",
            "rating": 5,
            "text_pl": "Sauna przekroczyła moje oczekiwania. Jakość wykonania jest niesamowita, a cały proces zamówienia był prosty i przejrzysty. Polecam każdemu!",
            "text_en": "The sauna exceeded my expectations. The build quality is amazing, and the entire ordering process was simple and transparent. Highly recommend!",
            "text_ru": "Сауна превзошла мои ожидания. Качество изготовления потрясающее, а весь процесс заказа был простым и понятным. Рекомендую всем!",
            "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
            "sauna": "Sauna Beczka 3m",
            "active": True
        },
        {
            "id": "default_2",
            "name": "Anna Nowak",
            "location": "Kraków",
            "rating": 5,
            "text_pl": "Świetna obsługa klienta i profesjonalne podejście. Sauna została dostarczona w terminie i wygląda przepięknie w naszym ogrodzie.",
            "text_en": "Great customer service and professional approach. The sauna was delivered on time and looks beautiful in our garden.",
            "text_ru": "Отличное обслуживание клиентов и профессиональный подход. Сауна была доставлена вовремя и прекрасно смотрится в нашем саду.",
            "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
            "sauna": "Sauna Kwadro 4m",
            "active": True
        },
        {
            "id": "default_3",
            "name": "Piotr Wiśniewski",
            "location": "Gdańsk",
            "rating": 5,
            "text_pl": "Już trzeci sezon korzystamy z sauny i jest jak nowa. Drewno skandynawskie naprawdę robi różnicę. Gorąco polecam WM-Sauna!",
            "text_en": "This is our third season using the sauna and it's still like new. Scandinavian wood really makes a difference. Highly recommend WM-Sauna!",
            "text_ru": "Уже третий сезон пользуемся сауной, и она как новая. Скандинавская древесина действительно имеет значение. Горячо рекомендую WM-Sauna!",
            "image": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
            "sauna": "Sauna Beczka 4m",
            "active": True
        },
        {
            "id": "default_4",
            "name": "Katarzyna Lewandowska",
            "location": "Poznań",
            "rating": 5,
            "text_pl": "Najlepsza inwestycja w zdrowie i relaks. Montaż był szybki, a sauna działa bezproblemowo. Dziękuję za wspaniałą obsługę!",
            "text_en": "Best investment in health and relaxation. Installation was quick, and the sauna works flawlessly. Thank you for the wonderful service!",
            "text_ru": "Лучшая инвестиция в здоровье и отдых. Монтаж был быстрым, а сауна работает безупречно. Спасибо за прекрасное обслуживание!",
            "image": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
            "sauna": "Sauna Kwadro 3.5m",
            "active": True
        }
    ]

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
