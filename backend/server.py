from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form, Request
from fastapi.responses import Response, FileResponse
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
from datetime import datetime, timezone, timedelta
import httpx
import secrets
import base64
import cloudinary
import cloudinary.uploader

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Cloudinary configuration
cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME', ''),
    api_key=os.environ.get('CLOUDINARY_API_KEY', ''),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET', ''),
)

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
    type: Optional[str] = "contact"

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
    type: Optional[str] = "contact"
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
    background_video: str = ""
    bg_mode: str = "photo"
    overlay_opacity: int = 80
    bg_position: str = "center"
    text_color: str = "#1A1A1A"
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
    disabled_options: List[str] = []  # Individual options to hide
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
    sections: List[str] = ["hero", "models", "calculator", "gallery", "stock", "reviews", "faq", "about", "contact"]

class LayoutSettings(BaseModel):
    id: str = "layout_settings"
    section_spacing: str = "large"  # small, medium, large
    section_padding_top: int = 80  # px
    section_padding_bottom: int = 80  # px

class GalleryConfig(BaseModel):
    id: str = "gallery_config"
    hidden_api_images: List[str] = []  # List of image URLs to hide from API
    show_api_images: bool = False  # Master toggle for API images - disabled by default now

# Models showcase configuration
class ModelsConfig(BaseModel):
    id: str = "models_config"
    enabled_models: List[str] = []
    show_section: bool = True
    descriptions: Dict[str, Any] = {}  # {model_id: {description_pl: "", description_en: ""}}

class ModelsSettings(BaseModel):
    id: str = "models_settings"
    title_pl: str = "Nasze modele saun"
    title_en: str = "Our sauna models"
    subtitle_pl: str = "Wybierz model sauny i poznaj jej szczegóły. Każda sauna może być dostosowana do Twoich potrzeb."
    subtitle_en: str = "Choose a sauna model and learn its details. Each sauna can be customized to your needs."

# Button configuration
class ButtonConfig(BaseModel):
    id: str = "button_config"
    buttons: dict = {
        "hero_primary": {
            "text_pl": "Oblicz cenę",
            "text_en": "Calculate price",
            "action": "anchor",  # anchor, link, form
            "target": "#calculator",  # anchor id, url, or form name
        },
        "hero_secondary": {
            "text_pl": "Zobacz ofertę",
            "text_en": "See offer",
            "action": "anchor",
            "target": "#gallery",
        },
        "calculator_submit": {
            "text_pl": "Wyślij zapytanie",
            "text_en": "Send inquiry",
            "action": "form",
            "target": "inquiry",
        },
        "stock_cta": {
            "text_pl": "Skonfiguruj",
            "text_en": "Configure",
            "action": "anchor",
            "target": "#calculator",
        },
        "contact_submit": {
            "text_pl": "Wyślij wiadomość",
            "text_en": "Send message",
            "action": "form",
            "target": "contact",
        },
    }

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

class FaqItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question_pl: str = ""
    question_en: str = ""
    answer_pl: str = ""
    answer_en: str = ""
    image_url: str = ""
    sort_order: int = 0
    active: bool = True

class FaqSettings(BaseModel):
    id: str = "faq_settings"
    title_pl: str = "Najczęściej zadawane pytania"
    title_en: str = "Frequently Asked Questions"
    subtitle_pl: str = "Odpowiedzi na najważniejsze pytania dotyczące naszych saun."
    subtitle_en: str = "Answers to the most important questions about our saunas."
    items: List[FaqItem] = []

class BaliaFaqSettings(BaseModel):
    id: str = "balia_faq_settings"
    title_pl: str = "Najczęściej zadawane pytania"
    title_en: str = "Frequently Asked Questions"
    subtitle_pl: str = "Odpowiedzi na najważniejsze pytania dotyczące naszych balii."
    subtitle_en: str = "Answers to the most important questions about our hot tubs."
    items: List[FaqItem] = [
        FaqItem(question_pl="Jak długo nagrzewa się balia?", question_en="How long does it take to heat a hot tub?", answer_pl="Czas nagrzewania zależy od modelu i pojemności. Standardowa balia z piecem zewnętrznym nagrzewa się w 1,5–3 godziny do temperatury 38–40°C. W zimie czas może się wydłużyć o 30–60 minut.", answer_en="Heating time depends on the model and capacity. A standard hot tub with an external heater heats up in 1.5–3 hours to 38–40°C. In winter, the time may increase by 30–60 minutes.", sort_order=0),
        FaqItem(question_pl="Jak dbać o drewno balii?", question_en="How to care for the wood of a hot tub?", answer_pl="Zalecamy co roku nakładać impregnat ochronny na zewnętrzną powierzchnię. Wewnątrz balia nie wymaga impregnacji — naturalne drewno jest bezpieczne w kontakcie z wodą. Po każdym użyciu warto spuścić wodę i pozostawić balię otwartą do wyschnięcia.", answer_en="We recommend applying a protective impregnant to the exterior surface once a year. The inside doesn't need impregnation — natural wood is safe in contact with water. After each use, drain the water and leave the tub open to dry.", sort_order=1),
        FaqItem(question_pl="Czy potrzebne jest pozwolenie na budowę?", question_en="Is a building permit required?", answer_pl="Nie, balia drewniana jest traktowana jako element wyposażenia ogrodu i nie wymaga pozwolenia na budowę ani zgłoszenia. Wystarczy płaskie, stabilne podłoże — kostka brukowa, płyta betonowa lub utwardzona ziemia.", answer_en="No, a wooden hot tub is considered garden equipment and doesn't require a building permit. You just need a flat, stable surface — paving stones, concrete slab, or compacted earth.", sort_order=2),
        FaqItem(question_pl="Jaki fundament jest potrzebny pod balię?", question_en="What foundation is needed for a hot tub?", answer_pl="Wystarczy równa, utwardzona powierzchnia. Może to być kostka brukowa, płyta betonowa lub dobrze ubita ziemia. Podłoże musi wytrzymać ciężar balii napełnionej wodą (ok. 1–2 tony w zależności od modelu).", answer_en="A flat, hardened surface is sufficient. It can be paving stones, concrete slab, or well-compacted earth. The surface must support the weight of the tub filled with water (about 1–2 tonnes depending on the model).", sort_order=3),
        FaqItem(question_pl="Czy mogę korzystać z balii zimą?", question_en="Can I use the hot tub in winter?", answer_pl="Tak! Korzystanie z balii zimą to jedno z największych przyjemności. Nasze balie są zaprojektowane do użytku przez cały rok. Zimą zalecamy używanie pokrywy termicznej, która utrzymuje ciepło i przyspiesza nagrzewanie.", answer_en="Yes! Using a hot tub in winter is one of the greatest pleasures. Our tubs are designed for year-round use. In winter, we recommend using a thermal cover to retain heat and speed up heating.", sort_order=4),
        FaqItem(question_pl="Jak często trzeba zmieniać wodę?", question_en="How often should the water be changed?", answer_pl="Przy korzystaniu bez środków chemicznych — po każdym użyciu lub co 2–3 dni. Jeśli stosujesz środki do uzdatniania wody, wymiana co 1–2 tygodnie. Zawsze zależy to od częstotliwości użytkowania i liczby osób.", answer_en="Without chemical treatment — after each use or every 2–3 days. With water treatment products, every 1–2 weeks. It always depends on frequency of use and number of users.", sort_order=5),
    ]

class PromoFeaturesSettings(BaseModel):
    id: str = "promo_features_settings"
    items: List[Dict[str, Any]] = [
        {"id": "pf1", "icon": "Truck", "title_pl": "Gotowa sauna w 5-10 dni", "title_en": "Ready sauna in 5-10 days", "desc_pl": "Nie musisz nic montowac. Sauna przyjezdza w pelni zmontowana i gotowa do uzytku.", "desc_en": "No assembly required. The sauna arrives fully assembled and ready to use."},
        {"id": "pf2", "icon": "TreePine", "title_pl": "Skandynawskie drewno klasy A+", "title_en": "Class A+ Scandinavian wood", "desc_pl": "Suszone komorowo drewno bez kieszeni zywicznych. Stabilne i trwale przez lata.", "desc_en": "Kiln-dried wood without resin pockets. Stable and durable for years."},
        {"id": "pf3", "icon": "ShieldCheck", "title_pl": "Gwarancja i serwis", "title_en": "Warranty and service", "desc_pl": "Kontrola w ponad 30 punktach przed wysylka. 12 miesiecy gwarancji i serwis posprzedazowy.", "desc_en": "Inspection at over 30 points before shipment. 12-month warranty and after-sales service."},
        {"id": "pf4", "icon": "Headphones", "title_pl": "Doradca pomoze dobrac", "title_en": "Advisor helps choose", "desc_pl": "Pomagamy dobrac model do przestrzeni i stylu domu. Wycena bezplatna.", "desc_en": "We help choose the model for your space and style. Free estimate."},
    ]

class SaunaAdvantagesSettings(BaseModel):
    id: str = "sauna_advantages_settings"
    subtitle: str = "Pokazujemy na schemacie, abyś dokładnie widział, za co płacisz"
    title: str = "Siedem faktów, dzięki którym nasze sauny służą znacznie dłużej"
    description: str = "Suche skandynawskie drewno klasy A+, montaż w naszej pracowni, precyzyjne łączenia na wkręty, bezpieczny piec, trzy poziomy ochrony przed wilgocią i wygodne dopracowane wnętrze"
    image_url: str = "/api/images/sauna-cutaway-7facts"
    items: List[Dict[str, Any]] = [
        {"id": "adv_1", "num": 1, "title": "Skandynawskie drewno suszone w komorach, najwyższej jakości", "desc": "Drewno bez kieszeni żywicznych utrzymuje stabilny kształt i nie wysycha z czasem", "badge": "", "side": "left"},
        {"id": "adv_2", "num": 2, "title": "Profilowane drewno i stalowe obręcze z nierdzewki", "desc": "Montaż na mocnych wkrętach sprawia, że łączenia trzymają kształt bez przewiewów i szczelin", "badge": "", "side": "left"},
        {"id": "adv_3", "num": 3, "title": "Piec o dobranej mocy z ochroną przed przegrzaniem drewna", "desc": "Sauna nagrzewa się szybko, a rodzina ma pełne bezpieczeństwo", "badge": "Kamienie gratis", "side": "right"},
        {"id": "adv_4", "num": 4, "title": "Wybór wyposażenia i wygodna ergonomia wnętrza", "desc": "Możesz wybrać układ pomieszczeń, a wewnątrz masz równą podłogę, wygodne półki i praktyczne kratki", "badge": "", "side": "right"},
        {"id": "adv_5", "num": 5, "title": "Przemyślana wentylacja nawiewna i wywiewna", "desc": "Sprawia, że para w saunie jest świeża bez duszności i zbędnego kondensatu", "badge": "", "side": "right"},
        {"id": "adv_6", "num": 6, "title": "Montujemy saunę w naszej pracowni i sprawdzamy ją w ponad 30 punktach", "desc": "Przed wysyłką robimy pełną kontrolę. Gwarancja to 12 miesięcy i zapewniamy serwis", "badge": "", "side": "left"},
        {"id": "adv_7", "num": 7, "title": "Dwie warstwy impregnatu na zewnątrz chronią przed wilgocią i szkodnikami", "desc": "Silikonowe uszczelnienie zabezpiecza fronty ścian. Malujemy saunę na produkcji", "badge": "Malowanie w wybranym kolorze", "side": "left"},
    ]

class SocialProofSettings(BaseModel):
    id: str = "social_proof_settings"
    show_section: bool = True
    items: List[Dict[str, Any]] = [
        {"value": "500+", "label_pl": "Wyprodukowanych saun", "label_en": "Saunas produced"},
        {"value": "98%", "label_pl": "Zadowolonych klientów", "label_en": "Satisfied customers"},
        {"value": "10+", "label_pl": "Lat doświadczenia", "label_en": "Years of experience"},
        {"value": "5-10", "label_pl": "Dni czas realizacji", "label_en": "Days fulfillment time"},
    ]

class SeoSettings(BaseModel):
    id: str = "seo_settings"
    title_pl: str = "WM-Sauna | Producent Saun Drewnianych w Polsce"
    title_en: str = "WM-Sauna | Wooden Sauna Manufacturer in Poland"
    description_pl: str = "WM-Sauna - polski producent saun drewnianych premium. Sauny beczki i kwadro z drewna skandynawskiego. Konfiguracja online, dostawa w 5-10 dni."
    description_en: str = "WM-Sauna - Polish premium wooden sauna manufacturer. Barrel and square saunas from Scandinavian wood. Online configuration, delivery in 5-10 days."
    keywords_pl: str = "sauna drewniana, producent saun, sauna beczka, sauna kwadro, sauna ogrodowa, sauna polska"
    keywords_en: str = "wooden sauna, sauna manufacturer, barrel sauna, square sauna, garden sauna, sauna poland"
    og_image: str = ""
    canonical_url: str = ""

class MainLandingSettings(BaseModel):
    id: str = "main_landing_settings"
    sauna_image: str = ""
    balia_image: str = ""
    sauna_image_position: str = "center"
    balia_image_position: str = "center"
    sauna_video: str = ""
    balia_video: str = ""

class InstallmentSettings(BaseModel):
    id: str = "installment_settings"
    sauna_logo_url: str = ""
    balia_logo_url: str = ""

class SpecialOfferSettings(BaseModel):
    id: str = "special_offer_settings"
    cards: List[Dict[str, Any]] = []

class VideoReviewItem(BaseModel):
    id: str = ""
    youtube_url: str = ""
    title: str = ""
    description: str = ""
    sort_order: int = 0

class SaunaVideoReviewsSettings(BaseModel):
    id: str = "sauna_video_reviews_settings"
    title: str = "Wideo-recenzje naszych saun"
    subtitle: str = "Zobacz, jak nasze sauny wyglądają w rzeczywistości"
    items: List[VideoReviewItem] = []

class B2BSettings(BaseModel):
    id: str = "b2b_settings"
    hero_title: str = "Współpraca B2B"
    hero_subtitle: str = "Zostań partnerem WM Group i rozwijaj swój biznes"
    hero_image: str = ""
    benefits_title: str = "Dlaczego warto współpracować?"
    benefits: List[Dict[str, Any]] = [
        {"id": "b1", "icon": "TrendingUp", "title": "Atrakcyjne marże", "desc": "Oferujemy konkurencyjne ceny hurtowe i elastyczne warunki współpracy dla partnerów biznesowych."},
        {"id": "b2", "icon": "Truck", "title": "Szybka realizacja", "desc": "Gotowe produkty w 5-10 dni roboczych. Logistyka i dostawa na terenie całej Polski i Europy."},
        {"id": "b3", "icon": "Users", "title": "Wsparcie marketingowe", "desc": "Zapewniamy materiały marketingowe, zdjęcia produktów i wsparcie w sprzedaży."},
        {"id": "b4", "icon": "ShieldCheck", "title": "Gwarancja jakości", "desc": "Wszystkie produkty objęte 24-miesięczną gwarancją. Kontrola jakości w ponad 30 punktach."},
    ]
    cta_title: str = "Zainteresowany współpracą?"
    cta_description: str = "Skontaktuj się z naszym działem B2B, aby omówić warunki współpracy."
    cta_phone: str = "+48 732 099 201"
    cta_email: str = "b2b@wm-sauna.pl"

class WhatsAppSettings(BaseModel):
    id: str = "whatsapp_settings"
    enabled: bool = True
    phone_number: str = "+48732099201"
    default_message_pl: str = "Dzień dobry! Chciałbym zapytać o ofertę WM Group."
    default_message_en: str = "Hello! I would like to ask about WM Group offer."
    show_on_all_pages: bool = True

class IntegrationSettings(BaseModel):
    id: str = "integration_settings"
    # Telegram
    telegram_enabled: bool = False
    telegram_bot_token: str = ""
    telegram_chat_id: str = ""
    # AMO CRM
    amocrm_enabled: bool = False
    amocrm_domain: str = ""
    amocrm_access_token: str = ""
    # AMO CRM Lead settings
    amocrm_pipeline_id: int = 0
    amocrm_status_id: int = 0
    amocrm_responsible_user_id: int = 0
    # AMO CRM field mapping {form_field: amo_field_id}
    amocrm_field_name: int = 0
    amocrm_field_phone: int = 0
    amocrm_field_email: int = 0
    amocrm_field_model: int = 0
    amocrm_field_price: int = 0
    amocrm_field_message: int = 0

class BaliaIntegrationSettings(BaseModel):
    id: str = "balia_integration_settings"
    telegram_enabled: bool = False
    telegram_bot_token: str = ""
    telegram_chat_id: str = ""
    amocrm_enabled: bool = False
    amocrm_pipeline_id: int = 0
    amocrm_status_id: int = 0
    amocrm_responsible_user_id: int = 0
    amocrm_field_name: int = 0
    amocrm_field_phone: int = 0
    amocrm_field_email: int = 0
    amocrm_field_model: int = 0
    amocrm_field_price: int = 0
    amocrm_field_message: int = 0

# ============= Notification Helpers =============

async def send_telegram_notification(data: dict):
    """Send notification to Telegram if configured."""
    try:
        settings = await db.settings.find_one({"id": "integration_settings"}, {"_id": 0})
        if not settings or not settings.get("telegram_enabled") or not settings.get("telegram_bot_token") or not settings.get("telegram_chat_id"):
            return
        
        msg_type = data.get("type", "contact")
        if msg_type == "calculator_order":
            text = (
                f"🧮 <b>Заказ из калькулятора</b>\n\n"
                f"<b>Модель:</b> {data.get('model', '—')}\n"
                f"<b>Вариант:</b> {data.get('variant', '—')}\n"
            )
            options = data.get("options")
            if options and isinstance(options, list) and len(options) > 0:
                text += f"<b>Опции:</b> {', '.join(str(o) for o in options)}\n"
            text += (
                f"<b>Сумма:</b> {data.get('total', '—')} PLN\n\n"
                f"<b>Имя:</b> {data.get('name', '—')}\n"
                f"<b>Телефон:</b> {data.get('phone', '—')}\n"
                f"<b>Email:</b> {data.get('email', '—')}\n"
            )
            if data.get("message"):
                text += f"<b>Комментарий:</b> {data['message']}\n"
        elif msg_type == "model_inquiry":
            text = (
                f"🔔 <b>Заявка на модель</b>\n\n"
                f"<b>Модель:</b> {data.get('model', '—')}\n"
                f"<b>Сумма:</b> {data.get('total', '—')} PLN\n\n"
                f"<b>Имя:</b> {data.get('name', '—')}\n"
                f"<b>Телефон:</b> {data.get('phone', '—')}\n"
                f"<b>Email:</b> {data.get('email', '—')}\n"
            )
            if data.get("message"):
                text += f"<b>Комментарий:</b> {data['message']}\n"
        else:
            text = (
                f"📩 <b>Сообщение с сайта</b>\n\n"
                f"<b>Имя:</b> {data.get('name', '—')}\n"
                f"<b>Телефон:</b> {data.get('phone', '—')}\n"
                f"<b>Email:</b> {data.get('email', '—')}\n"
            )
            if data.get("message"):
                text += f"<b>Сообщение:</b> {data['message']}\n"
        
        token = settings["telegram_bot_token"]
        chat_id = settings["telegram_chat_id"]
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            await client.post(url, json={
                "chat_id": chat_id,
                "text": text,
                "parse_mode": "HTML"
            })
            logger.info("Telegram notification sent")
    except Exception as e:
        logger.error(f"Telegram notification error: {e}")

async def send_balia_telegram_notification(data: dict):
    """Send notification to Telegram for balia orders."""
    try:
        settings = await db.settings.find_one({"id": "balia_integration_settings"}, {"_id": 0})
        if not settings or not settings.get("telegram_enabled") or not settings.get("telegram_bot_token") or not settings.get("telegram_chat_id"):
            return
        msg_type = data.get("type", "balia_order")
        text = (
            f"🛁 <b>Заявка WM-Balia</b>\n\n"
            f"<b>Модель:</b> {data.get('model', '—')}\n"
            f"<b>Сумма:</b> {data.get('total', '—')} PLN\n\n"
            f"<b>Имя:</b> {data.get('name', '—')}\n"
            f"<b>Телефон:</b> {data.get('phone', '—')}\n"
            f"<b>Email:</b> {data.get('email', '—')}\n"
        )
        options = data.get("options")
        if options and isinstance(options, list) and len(options) > 0:
            text += f"<b>Опции:</b> {', '.join(str(o) for o in options)}\n"
        if data.get("message"):
            text += f"<b>Комментарий:</b> {data['message']}\n"
        token = settings["telegram_bot_token"]
        chat_id = settings["telegram_chat_id"]
        async with httpx.AsyncClient(timeout=10.0) as client:
            await client.post(f"https://api.telegram.org/bot{token}/sendMessage", json={"chat_id": chat_id, "text": text, "parse_mode": "HTML"})
            logger.info("Balia Telegram notification sent")
    except Exception as e:
        logger.error(f"Balia Telegram notification error: {e}")

async def send_balia_amocrm_lead(data: dict):
    """Create a lead in AMO CRM for balia orders. Uses sauna API key but balia pipeline/fields."""
    try:
        # Get balia-specific settings
        balia_settings = await db.settings.find_one({"id": "balia_integration_settings"}, {"_id": 0})
        if not balia_settings or not balia_settings.get("amocrm_enabled"):
            return
        # Get AMO API key from sauna integration settings
        sauna_settings = await db.settings.find_one({"id": "integration_settings"}, {"_id": 0})
        if not sauna_settings or not sauna_settings.get("amocrm_domain") or not sauna_settings.get("amocrm_access_token"):
            logger.warning("Balia AMO CRM: no AMO domain/token in sauna settings")
            return
        token = sauna_settings.get("amocrm_access_token", "")
        domain = sauna_settings["amocrm_domain"].rstrip("/")
        if not domain.startswith("http"):
            domain = f"https://{domain}"
        lead_name = f"WM-Balia: {data.get('model', 'Запрос')}"
        lead_custom_fields = []
        message_parts = []
        options = data.get("options")
        if options and isinstance(options, list) and len(options) > 0:
            message_parts.append(f"Опции: {', '.join(str(o) for o in options)}")
        if data.get("message"):
            message_parts.append(data["message"])
        full_message = "\n".join(message_parts) if message_parts else ""
        field_map = {
            "amocrm_field_model": data.get("model", ""),
            "amocrm_field_price": str(data.get("total", "")),
            "amocrm_field_message": full_message,
        }
        for setting_key, value in field_map.items():
            field_id = balia_settings.get(setting_key, 0)
            if field_id and value:
                lead_custom_fields.append({"field_id": field_id, "values": [{"value": value}]})
        contact = {"first_name": data.get("name", ""), "custom_fields_values": []}
        phone_field_id = balia_settings.get("amocrm_field_phone", 0)
        email_field_id = balia_settings.get("amocrm_field_email", 0)
        if phone_field_id and data.get("phone"):
            contact["custom_fields_values"].append({"field_id": phone_field_id, "values": [{"value": data["phone"]}]})
        elif data.get("phone"):
            contact["custom_fields_values"].append({"field_code": "PHONE", "values": [{"value": data["phone"], "enum_code": "WORK"}]})
        if email_field_id and data.get("email"):
            contact["custom_fields_values"].append({"field_id": email_field_id, "values": [{"value": data["email"]}]})
        elif data.get("email"):
            contact["custom_fields_values"].append({"field_code": "EMAIL", "values": [{"value": data["email"], "enum_code": "WORK"}]})
        lead_data = [{"name": lead_name, "price": int(data.get("total", 0)) if data.get("total") else 0, "_embedded": {"contacts": [contact]}}]
        if lead_custom_fields:
            lead_data[0]["custom_fields_values"] = lead_custom_fields
        if balia_settings.get("amocrm_pipeline_id"):
            lead_data[0]["pipeline_id"] = balia_settings["amocrm_pipeline_id"]
        if balia_settings.get("amocrm_status_id"):
            lead_data[0]["status_id"] = balia_settings["amocrm_status_id"]
        if balia_settings.get("amocrm_responsible_user_id"):
            lead_data[0]["responsible_user_id"] = balia_settings["amocrm_responsible_user_id"]
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(f"{domain}/api/v4/leads/complex", json=lead_data, headers=headers)
            logger.info(f"Balia AMO CRM response: {resp.status_code} {resp.text[:200]}")
    except Exception as e:
        logger.error(f"Balia AMO CRM error: {e}")

async def get_amocrm_token(settings: dict) -> str:
    """Get AMO CRM API token from settings."""
    return settings.get("amocrm_access_token", "")

async def send_amocrm_lead(data: dict):
    """Create a lead in AMO CRM if configured."""
    try:
        settings = await db.settings.find_one({"id": "integration_settings"}, {"_id": 0})
        if not settings or not settings.get("amocrm_enabled") or not settings.get("amocrm_domain"):
            return
        
        token = await get_amocrm_token(settings)
        if not token:
            logger.warning("AMO CRM: no valid token")
            return
        
        domain = settings["amocrm_domain"].rstrip("/")
        if not domain.startswith("http"):
            domain = f"https://{domain}"
        
        msg_type = data.get("type", "contact")
        if msg_type == "calculator_order":
            variant_info = f" ({data.get('variant', '')})" if data.get('variant') else ""
            lead_name = f"WM-Sauna: {data.get('model', 'Калькулятор')}{variant_info}"
        elif msg_type == "model_inquiry":
            lead_name = f"WM-Sauna: {data.get('model', 'Запрос')}"
        else:
            lead_name = "WM-Sauna: Запрос с сайта"
        
        # Build custom fields for lead
        lead_custom_fields = []
        # Compose message with variant/options info
        message_parts = []
        if data.get("variant"):
            message_parts.append(f"Вариант: {data['variant']}")
        options = data.get("options")
        if options and isinstance(options, list) and len(options) > 0:
            message_parts.append(f"Опции: {', '.join(str(o) for o in options)}")
        if data.get("message"):
            message_parts.append(data["message"])
        full_message = "\n".join(message_parts) if message_parts else ""

        field_map = {
            "amocrm_field_model": data.get("model", ""),
            "amocrm_field_price": str(data.get("total", "")),
            "amocrm_field_message": full_message,
        }
        for setting_key, value in field_map.items():
            field_id = settings.get(setting_key, 0)
            if field_id and value:
                lead_custom_fields.append({"field_id": field_id, "values": [{"value": value}]})
        
        # Build contact custom fields
        contact_custom_fields = []
        # Phone and Email use standard field_code
        contact_fields_data = {
            "amocrm_field_name": ("first_name_override", data.get("name", "")),
            "amocrm_field_phone": ("PHONE", data.get("phone", "")),
            "amocrm_field_email": ("EMAIL", data.get("email", "")),
        }
        
        contact = {"first_name": data.get("name", ""), "custom_fields_values": []}
        
        phone_field_id = settings.get("amocrm_field_phone", 0)
        email_field_id = settings.get("amocrm_field_email", 0)
        name_field_id = settings.get("amocrm_field_name", 0)
        
        if phone_field_id and data.get("phone"):
            contact["custom_fields_values"].append({"field_id": phone_field_id, "values": [{"value": data["phone"]}]})
        elif data.get("phone"):
            contact["custom_fields_values"].append({"field_code": "PHONE", "values": [{"value": data["phone"], "enum_code": "WORK"}]})
        
        if email_field_id and data.get("email"):
            contact["custom_fields_values"].append({"field_id": email_field_id, "values": [{"value": data["email"]}]})
        elif data.get("email"):
            contact["custom_fields_values"].append({"field_code": "EMAIL", "values": [{"value": data["email"], "enum_code": "WORK"}]})
        
        lead_data = [{
            "name": lead_name,
            "price": int(data.get("total", 0)) if data.get("total") else 0,
            "_embedded": {"contacts": [contact]},
        }]
        
        if lead_custom_fields:
            lead_data[0]["custom_fields_values"] = lead_custom_fields
        if settings.get("amocrm_pipeline_id"):
            lead_data[0]["pipeline_id"] = settings["amocrm_pipeline_id"]
        if settings.get("amocrm_status_id"):
            lead_data[0]["status_id"] = settings["amocrm_status_id"]
        if settings.get("amocrm_responsible_user_id"):
            lead_data[0]["responsible_user_id"] = settings["amocrm_responsible_user_id"]
        
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(f"{domain}/api/v4/leads/complex", json=lead_data, headers=headers)
            logger.info(f"AMO CRM response: {resp.status_code} {resp.text[:200]}")
    except Exception as e:
        logger.error(f"AMO CRM error: {e}")

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
        
        # Send notifications - route balia orders to balia integrations
        notification_data = form_data.model_dump()
        is_balia = notification_data.get("type", "").startswith("balia")
        try:
            if is_balia:
                await send_balia_telegram_notification(notification_data)
            else:
                await send_telegram_notification(notification_data)
        except Exception as e:
            logger.error(f"Telegram notification failed: {e}")
        try:
            if is_balia:
                await send_balia_amocrm_lead(notification_data)
            else:
                await send_amocrm_lead(notification_data)
        except Exception as e:
            logger.error(f"AMO CRM lead failed: {e}")
        
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

@api_router.get("/sauna/public-models")
async def get_public_models(lang: str = "pl"):
    cache_key = f"sauna_public_models_{lang}"
    try:
        async with httpx.AsyncClient(timeout=15.0) as http_client:
            response = await http_client.get(f"{CALCULATOR_API_URL}/api/sauna/public/models", params={"lang": lang})
            response.raise_for_status()
            data = response.json()
            await db.cache.update_one(
                {"id": cache_key},
                {"$set": {"id": cache_key, "data": data, "updated_at": datetime.now(timezone.utc).isoformat()}},
                upsert=True
            )
            logger.info(f"Public models fetched and cached (lang={lang})")
            return data
    except (httpx.HTTPError, Exception) as e:
        logger.warning(f"Public models API unavailable: {e}. Trying cache...")
        cached = await db.cache.find_one({"id": cache_key}, {"_id": 0})
        if cached and cached.get("data"):
            return cached["data"]
        raise HTTPException(status_code=502, detail="Public models API unavailable and no cached data")


@api_router.post("/sauna/generate-pdf")
async def generate_sauna_pdf(request: Request):
    """Generate a branded PDF for the sauna configuration."""
    from pdf_generator import generate_config_pdf
    try:
        body = await request.json()
        pdf_bytes = generate_config_pdf(
            model_name=body.get("modelName", ""),
            variant_name=body.get("variantName", ""),
            base_price=float(body.get("basePrice", 0)),
            variant_price=float(body.get("variantPrice", 0)),
            discount_percent=float(body.get("discountPercent", 0)),
            options=body.get("options", []),
            total_price=float(body.get("totalPrice", 0)),
            customer_name=body.get("customerName", ""),
            customer_phone=body.get("customerPhone", ""),
            customer_email=body.get("customerEmail", ""),
        )
        filename = f"WM-Sauna-{body.get('modelName', 'Config').replace(' ', '-')}.pdf"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except Exception as e:
        logger.error(f"PDF generation error: {e}")
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")


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

@api_router.get("/settings/buttons")
async def get_button_config_public():
    config = await db.settings.find_one({"id": "button_config"}, {"_id": 0})
    if not config:
        return ButtonConfig().model_dump()
    return config

@api_router.get("/settings/seo")
async def get_seo_settings_public():
    settings = await db.settings.find_one({"id": "seo_settings"}, {"_id": 0})
    if not settings:
        return SeoSettings().model_dump()
    return settings

@api_router.get("/settings/faq")
async def get_faq_settings_public():
    settings = await db.settings.find_one({"id": "faq_settings"}, {"_id": 0})
    if not settings:
        return FaqSettings().model_dump()
    return settings

@api_router.get("/settings/balia-faq")
async def get_balia_faq_settings_public():
    settings = await db.settings.find_one({"id": "balia_faq_settings"}, {"_id": 0})
    if not settings:
        return BaliaFaqSettings().model_dump()
    return settings

@api_router.get("/settings/promo-features")
async def get_promo_features_public():
    settings = await db.settings.find_one({"id": "promo_features_settings"}, {"_id": 0})
    if not settings:
        return PromoFeaturesSettings().model_dump()
    return settings


@api_router.get("/settings/sauna-advantages")
async def get_sauna_advantages_public():
    settings = await db.settings.find_one({"id": "sauna_advantages_settings"}, {"_id": 0})
    if not settings:
        return SaunaAdvantagesSettings().model_dump()
    return settings


@api_router.get("/settings/video-reviews")
async def get_video_reviews_public():
    settings = await db.settings.find_one({"id": "sauna_video_reviews_settings"}, {"_id": 0})
    if not settings:
        return SaunaVideoReviewsSettings().model_dump()
    return settings

@api_router.get("/settings/b2b")
async def get_b2b_settings_public():
    settings = await db.settings.find_one({"id": "b2b_settings"}, {"_id": 0})
    if not settings:
        return B2BSettings().model_dump()
    return settings

@api_router.get("/settings/whatsapp")
async def get_whatsapp_settings_public():
    settings = await db.settings.find_one({"id": "whatsapp_settings"}, {"_id": 0})
    if not settings:
        return WhatsAppSettings().model_dump()
    return settings

@api_router.get("/settings/social-proof")
async def get_social_proof_public():
    settings = await db.settings.find_one({"id": "social_proof_settings"}, {"_id": 0})
    if not settings:
        return SocialProofSettings().model_dump()
    return settings

@api_router.get("/settings/main-landing")
async def get_main_landing_settings_public():
    settings = await db.settings.find_one({"id": "main_landing_settings"}, {"_id": 0})
    if not settings:
        return MainLandingSettings().model_dump()
    return settings

@api_router.get("/settings/installment")
async def get_installment_settings_public():
    settings = await db.settings.find_one({"id": "installment_settings"}, {"_id": 0})
    if not settings:
        return InstallmentSettings().model_dump()
    return settings

@api_router.get("/settings/special-offer")
async def get_special_offer_settings_public():
    settings = await db.settings.find_one({"id": "special_offer_settings"}, {"_id": 0})
    if not settings:
        return SpecialOfferSettings().model_dump()
    return settings

@api_router.get("/admin/settings/integrations")
async def get_integration_settings(username: str = Depends(verify_admin)):
    settings = await db.settings.find_one({"id": "integration_settings"}, {"_id": 0})
    if not settings:
        return IntegrationSettings().model_dump()
    return settings

@api_router.get("/settings/models")
async def get_models_config_public():
    config = await db.settings.find_one({"id": "models_config"}, {"_id": 0})
    if not config:
        return ModelsConfig().model_dump()
    return config

@api_router.get("/settings/models-content")
async def get_models_settings_public():
    settings = await db.settings.find_one({"id": "models_settings"}, {"_id": 0})
    if not settings:
        return ModelsSettings().model_dump()
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

@api_router.put("/admin/settings/buttons")
async def update_button_config(config: ButtonConfig, username: str = Depends(verify_admin)):
    await db.settings.update_one(
        {"id": "button_config"},
        {"$set": config.model_dump()},
        upsert=True
    )
    return {"status": "success"}

@api_router.put("/admin/settings/seo")
async def update_seo_settings(settings: SeoSettings, username: str = Depends(verify_admin)):
    await db.settings.update_one(
        {"id": "seo_settings"},
        {"$set": settings.model_dump()},
        upsert=True
    )
    return {"status": "success"}

@api_router.put("/admin/settings/faq")
async def update_faq_settings(settings: FaqSettings, username: str = Depends(verify_admin)):
    await db.settings.update_one(
        {"id": "faq_settings"},
        {"$set": settings.model_dump()},
        upsert=True
    )
    return {"status": "success"}

@api_router.put("/admin/settings/balia-faq")
async def update_balia_faq_settings(settings: BaliaFaqSettings, username: str = Depends(verify_admin)):
    await db.settings.update_one(
        {"id": "balia_faq_settings"},
        {"$set": settings.model_dump()},
        upsert=True
    )
    return {"status": "success"}

@api_router.put("/admin/settings/promo-features")
async def update_promo_features(settings: PromoFeaturesSettings, username: str = Depends(verify_admin)):
    await db.settings.update_one(
        {"id": "promo_features_settings"},
        {"$set": settings.model_dump()},
        upsert=True
    )
    return {"status": "success"}


@api_router.put("/admin/settings/sauna-advantages")
async def update_sauna_advantages(settings: SaunaAdvantagesSettings, username: str = Depends(verify_admin)):
    await db.settings.update_one(
        {"id": "sauna_advantages_settings"},
        {"$set": settings.model_dump()},
        upsert=True
    )
    return {"status": "success"}


@api_router.put("/admin/settings/video-reviews")
async def update_video_reviews(settings: SaunaVideoReviewsSettings, username: str = Depends(verify_admin)):
    await db.settings.update_one(
        {"id": "sauna_video_reviews_settings"},
        {"$set": settings.model_dump()},
        upsert=True
    )
    return {"status": "success"}

@api_router.put("/admin/settings/b2b")
async def update_b2b_settings(settings: B2BSettings, username: str = Depends(verify_admin)):
    await db.settings.update_one(
        {"id": "b2b_settings"},
        {"$set": settings.model_dump()},
        upsert=True
    )
    return {"status": "success"}

@api_router.put("/admin/settings/whatsapp")
async def update_whatsapp_settings(settings: WhatsAppSettings, username: str = Depends(verify_admin)):
    await db.settings.update_one(
        {"id": "whatsapp_settings"},
        {"$set": settings.model_dump()},
        upsert=True
    )
    return {"status": "success"}

@api_router.get("/admin/settings/video-reviews")
async def get_admin_video_reviews(username: str = Depends(verify_admin)):
    settings = await db.settings.find_one({"id": "sauna_video_reviews_settings"}, {"_id": 0})
    if not settings:
        return SaunaVideoReviewsSettings().model_dump()
    return settings

@api_router.get("/admin/settings/b2b")
async def get_admin_b2b_settings(username: str = Depends(verify_admin)):
    settings = await db.settings.find_one({"id": "b2b_settings"}, {"_id": 0})
    if not settings:
        return B2BSettings().model_dump()
    return settings

@api_router.get("/admin/settings/whatsapp")
async def get_admin_whatsapp_settings(username: str = Depends(verify_admin)):
    settings = await db.settings.find_one({"id": "whatsapp_settings"}, {"_id": 0})
    if not settings:
        return WhatsAppSettings().model_dump()
    return settings


@api_router.put("/admin/settings/social-proof")
async def update_social_proof(settings: SocialProofSettings, username: str = Depends(verify_admin)):
    await db.settings.update_one(
        {"id": "social_proof_settings"},
        {"$set": settings.model_dump()},
        upsert=True
    )
    return {"status": "success"}

@api_router.get("/admin/settings/balia-integrations")
async def get_balia_integration_settings(username: str = Depends(verify_admin)):
    settings = await db.settings.find_one({"id": "balia_integration_settings"}, {"_id": 0})
    if not settings:
        return BaliaIntegrationSettings().model_dump()
    return settings

@api_router.put("/admin/settings/balia-integrations")
async def update_balia_integration_settings(settings: BaliaIntegrationSettings, username: str = Depends(verify_admin)):
    await db.settings.update_one(
        {"id": "balia_integration_settings"},
        {"$set": settings.model_dump()},
        upsert=True
    )
    return {"status": "success"}

@api_router.post("/admin/test-balia-telegram")
async def test_balia_telegram(username: str = Depends(verify_admin)):
    settings = await db.settings.find_one({"id": "balia_integration_settings"}, {"_id": 0})
    if not settings or not settings.get("telegram_bot_token") or not settings.get("telegram_chat_id"):
        raise HTTPException(status_code=400, detail="Telegram не настроен для купелей")
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"https://api.telegram.org/bot{settings['telegram_bot_token']}/sendMessage",
                json={"chat_id": settings["telegram_chat_id"], "text": "🛁 Тестовое сообщение WM-Balia\nИнтеграция работает корректно!", "parse_mode": "HTML"}
            )
            if resp.status_code == 200:
                return {"message": "Тестовое сообщение отправлено в Telegram (Balia)"}
            raise HTTPException(status_code=400, detail=f"Telegram error: {resp.text[:200]}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/admin/test-balia-amocrm-lead")
async def test_balia_amocrm_lead(username: str = Depends(verify_admin)):
    await send_balia_amocrm_lead({
        "type": "balia_order", "name": "Test Balia", "phone": "+48000000000",
        "email": "test@wm-balia.pl", "model": "Balia testowa", "total": 15000,
        "message": "Тестовая сделка WM-Balia"
    })
    return {"message": "Тестовая сделка отправлена в AMO CRM (Balia)"}

@api_router.put("/admin/settings/integrations")
async def update_integration_settings(settings: IntegrationSettings, username: str = Depends(verify_admin)):
    await db.settings.update_one(
        {"id": "integration_settings"},
        {"$set": settings.model_dump()},
        upsert=True
    )
    return {"status": "success"}

@api_router.put("/admin/settings/main-landing")
async def update_main_landing_settings(settings: MainLandingSettings, username: str = Depends(verify_admin)):
    await db.settings.update_one(
        {"id": "main_landing_settings"},
        {"$set": settings.model_dump()},
        upsert=True
    )
    return {"status": "success"}

@api_router.put("/admin/settings/installment")
async def update_installment_settings(settings: InstallmentSettings, username: str = Depends(verify_admin)):
    await db.settings.update_one(
        {"id": "installment_settings"},
        {"$set": settings.model_dump()},
        upsert=True
    )
    return {"status": "success"}

@api_router.put("/admin/settings/special-offer")
async def update_special_offer_settings(settings: SpecialOfferSettings, username: str = Depends(verify_admin)):
    await db.settings.update_one(
        {"id": "special_offer_settings"},
        {"$set": settings.model_dump()},
        upsert=True
    )
    return {"status": "success"}

@api_router.post("/admin/test-telegram")
async def test_telegram(username: str = Depends(verify_admin)):
    """Send a test message to verify Telegram configuration."""
    settings = await db.settings.find_one({"id": "integration_settings"}, {"_id": 0})
    if not settings or not settings.get("telegram_bot_token") or not settings.get("telegram_chat_id"):
        raise HTTPException(status_code=400, detail="Telegram не настроен")
    try:
        token = settings["telegram_bot_token"]
        chat_id = settings["telegram_chat_id"]
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json={
                "chat_id": chat_id,
                "text": "✅ WM-Sauna: тестовое уведомление. Telegram подключён!",
                "parse_mode": "HTML"
            })
            if resp.status_code == 200:
                return {"status": "success", "message": "Тестовое сообщение отправлено"}
            else:
                error_data = resp.json()
                raise HTTPException(status_code=400, detail=f"Ошибка Telegram: {error_data.get('description', resp.status_code)}")
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Ошибка подключения: {str(e)}")

@api_router.post("/admin/test-amocrm")
async def test_amocrm(username: str = Depends(verify_admin)):
    """Test AMO CRM connection."""
    settings = await db.settings.find_one({"id": "integration_settings"}, {"_id": 0})
    if not settings or not settings.get("amocrm_domain") or not settings.get("amocrm_access_token"):
        raise HTTPException(status_code=400, detail="AMO CRM не настроен. Сначала пройдите авторизацию.")
    try:
        token = await get_amocrm_token(settings)
        domain = settings["amocrm_domain"].rstrip("/")
        if not domain.startswith("http"):
            domain = f"https://{domain}"
        headers = {"Authorization": f"Bearer {token}"}
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(f"{domain}/api/v4/account", headers=headers)
            if resp.status_code == 200:
                account = resp.json()
                return {"status": "success", "message": f"Подключено к: {account.get('name', domain)}"}
            else:
                raise HTTPException(status_code=400, detail=f"AMO CRM ошибка: {resp.status_code}")
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Ошибка подключения: {str(e)}")

@api_router.post("/admin/test-amocrm-lead")
async def test_amocrm_lead(username: str = Depends(verify_admin)):
    """Send a test lead to AMO CRM with pre-filled data."""
    settings = await db.settings.find_one({"id": "integration_settings"}, {"_id": 0})
    if not settings or not settings.get("amocrm_domain") or not settings.get("amocrm_access_token"):
        raise HTTPException(status_code=400, detail="AMO CRM не настроен. Сначала пройдите авторизацию.")
    try:
        token = await get_amocrm_token(settings)
        if not token:
            raise HTTPException(status_code=400, detail="Нет валидного токена. Авторизуйтесь повторно.")
        domain = settings["amocrm_domain"].rstrip("/")
        if not domain.startswith("http"):
            domain = f"https://{domain}"

        test_data = {
            "name": "Тест WM-Sauna",
            "phone": "+48000000000",
            "email": "test@wm-sauna.pl",
            "model": "Sauna testowa",
            "total": 15000,
            "message": "Это тестовая заявка из админ-панели WM-Sauna. Можно удалить.",
            "type": "model_inquiry",
        }

        lead_name = f"WM-Sauna [ТЕСТ]: {test_data['model']}"
        lead_custom_fields = []
        field_map = {
            "amocrm_field_model": test_data["model"],
            "amocrm_field_price": str(test_data["total"]),
            "amocrm_field_message": test_data["message"],
        }
        for setting_key, value in field_map.items():
            field_id = settings.get(setting_key, 0)
            if field_id and value:
                lead_custom_fields.append({"field_id": field_id, "values": [{"value": value}]})

        contact = {"first_name": test_data["name"], "custom_fields_values": []}
        phone_field_id = settings.get("amocrm_field_phone", 0)
        email_field_id = settings.get("amocrm_field_email", 0)
        if phone_field_id:
            contact["custom_fields_values"].append({"field_id": phone_field_id, "values": [{"value": test_data["phone"]}]})
        else:
            contact["custom_fields_values"].append({"field_code": "PHONE", "values": [{"value": test_data["phone"], "enum_code": "WORK"}]})
        if email_field_id:
            contact["custom_fields_values"].append({"field_id": email_field_id, "values": [{"value": test_data["email"]}]})
        else:
            contact["custom_fields_values"].append({"field_code": "EMAIL", "values": [{"value": test_data["email"], "enum_code": "WORK"}]})

        lead_data = [{
            "name": lead_name,
            "price": test_data["total"],
            "_embedded": {"contacts": [contact]},
        }]
        if lead_custom_fields:
            lead_data[0]["custom_fields_values"] = lead_custom_fields
        if settings.get("amocrm_pipeline_id"):
            lead_data[0]["pipeline_id"] = settings["amocrm_pipeline_id"]
        if settings.get("amocrm_status_id"):
            lead_data[0]["status_id"] = settings["amocrm_status_id"]
        if settings.get("amocrm_responsible_user_id"):
            lead_data[0]["responsible_user_id"] = settings["amocrm_responsible_user_id"]

        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(f"{domain}/api/v4/leads/complex", json=lead_data, headers=headers)
            if resp.status_code in (200, 201):
                return {"status": "success", "message": "Тестовая сделка создана! Проверьте AMO CRM."}
            else:
                error_text = resp.text[:300]
                raise HTTPException(status_code=400, detail=f"AMO CRM вернул ошибку ({resp.status_code}): {error_text}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Ошибка отправки: {str(e)}")



async def _amocrm_api_get(path: str) -> dict:
    """Helper: make authenticated GET to AMO CRM API."""
    settings = await db.settings.find_one({"id": "integration_settings"}, {"_id": 0})
    if not settings or not settings.get("amocrm_domain"):
        raise HTTPException(status_code=400, detail="AMO CRM не настроен")
    token = await get_amocrm_token(settings)
    if not token:
        raise HTTPException(status_code=400, detail="Нет валидного токена AMO CRM. Пройдите авторизацию.")
    domain = settings["amocrm_domain"].rstrip("/")
    if not domain.startswith("http"):
        domain = f"https://{domain}"
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(f"{domain}{path}", headers={"Authorization": f"Bearer {token}"})
        if resp.status_code == 401:
            raise HTTPException(status_code=401, detail="Токен AMO CRM истёк. Авторизуйтесь повторно.")
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=f"AMO CRM ошибка: {resp.text[:300]}")
        return resp.json()


@api_router.get("/admin/amocrm/pipelines")
async def get_amocrm_pipelines(username: str = Depends(verify_admin)):
    """Fetch pipelines with statuses from AMO CRM."""
    try:
        data = await _amocrm_api_get("/api/v4/leads/pipelines")
        pipelines = []
        for p in data.get("_embedded", {}).get("pipelines", []):
            statuses = []
            for s in p.get("_embedded", {}).get("statuses", []):
                statuses.append({"id": s["id"], "name": s["name"], "sort": s.get("sort", 0)})
            pipelines.append({
                "id": p["id"],
                "name": p["name"],
                "statuses": sorted(statuses, key=lambda x: x["sort"]),
            })
        return {"pipelines": pipelines}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Ошибка получения воронок: {str(e)}")


@api_router.get("/admin/amocrm/users")
async def get_amocrm_users(username: str = Depends(verify_admin)):
    """Fetch users from AMO CRM."""
    try:
        data = await _amocrm_api_get("/api/v4/users")
        users = []
        for u in data.get("_embedded", {}).get("users", []):
            users.append({"id": u["id"], "name": u.get("name", ""), "email": u.get("email", "")})
        return {"users": users}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Ошибка получения пользователей: {str(e)}")


@api_router.get("/admin/amocrm/fields")
async def get_amocrm_fields(entity: str = "leads", username: str = Depends(verify_admin)):
    """Fetch custom fields from AMO CRM for leads or contacts."""
    if entity not in ("leads", "contacts"):
        entity = "leads"
    try:
        data = await _amocrm_api_get(f"/api/v4/{entity}/custom_fields")
        fields = []
        for f in data.get("_embedded", {}).get("custom_fields", []):
            fields.append({
                "id": f["id"],
                "name": f.get("name", ""),
                "type": f.get("type", ""),
                "code": f.get("code", ""),
            })
        return {"fields": fields, "entity": entity}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Ошибка получения полей: {str(e)}")


@api_router.get("/admin/amocrm/status")
async def get_amocrm_status(username: str = Depends(verify_admin)):
    """Check AMO CRM connection status."""
    settings = await db.settings.find_one({"id": "integration_settings"}, {"_id": 0})
    if not settings:
        return {"connected": False}
    has_token = bool(settings.get("amocrm_access_token"))
    return {
        "connected": has_token and bool(settings.get("amocrm_domain")),
        "has_token": has_token,
        "domain": settings.get("amocrm_domain", ""),
    }


@api_router.get("/admin/amocrm/pipeline/{pipeline_id}/full")
async def get_pipeline_full(pipeline_id: int, username: str = Depends(verify_admin)):
    """Fetch pipeline stages and ALL leads grouped by stage from AMO CRM."""
    settings = await db.settings.find_one({"id": "integration_settings"}, {"_id": 0})
    if not settings or not settings.get("amocrm_domain") or not settings.get("amocrm_access_token"):
        raise HTTPException(status_code=400, detail="AMO CRM не настроен")
    token = settings.get("amocrm_access_token", "")
    domain = settings["amocrm_domain"].rstrip("/")
    if not domain.startswith("http"):
        domain = f"https://{domain}"
    headers = {"Authorization": f"Bearer {token}"}

    async with httpx.AsyncClient(timeout=30.0) as client:
        # 1. Fetch pipeline info with stages
        pipe_resp = await client.get(f"{domain}/api/v4/leads/pipelines/{pipeline_id}", headers=headers)
        if pipe_resp.status_code != 200:
            raise HTTPException(status_code=pipe_resp.status_code, detail=f"Воронка не найдена: {pipe_resp.text[:200]}")
        pipe_data = pipe_resp.json()
        pipeline_name = pipe_data.get("name", "")
        statuses_raw = pipe_data.get("_embedded", {}).get("statuses", [])
        statuses = []
        for s in statuses_raw:
            statuses.append({"id": s["id"], "name": s["name"], "sort": s.get("sort", 0), "color": s.get("color", "")})
        statuses.sort(key=lambda x: x["sort"])

        # 2. Fetch ALL leads from this pipeline (paginate)
        all_leads = []
        page = 1
        while True:
            leads_resp = await client.get(
                f"{domain}/api/v4/leads",
                params={"filter[pipe_id]": pipeline_id, "with": "contacts", "limit": 250, "page": page},
                headers=headers,
            )
            if leads_resp.status_code != 200:
                break
            leads_data = leads_resp.json()
            embedded_leads = leads_data.get("_embedded", {}).get("leads", [])
            if not embedded_leads:
                break
            for lead in embedded_leads:
                contacts = []
                for c in lead.get("_embedded", {}).get("contacts", []):
                    contacts.append({"id": c.get("id"), "name": c.get("name", "")})
                custom_fields = []
                for cf in (lead.get("custom_fields_values") or []):
                    vals = [v.get("value", "") for v in cf.get("values", [])]
                    custom_fields.append({"name": cf.get("field_name", ""), "values": vals})
                all_leads.append({
                    "id": lead["id"],
                    "name": lead.get("name", ""),
                    "price": lead.get("price", 0),
                    "status_id": lead.get("status_id"),
                    "responsible_user_id": lead.get("responsible_user_id"),
                    "created_at": lead.get("created_at"),
                    "updated_at": lead.get("updated_at"),
                    "contacts": contacts,
                    "custom_fields": custom_fields,
                    "loss_reason": lead.get("loss_reason"),
                })
            # Check if there are more pages
            next_link = leads_data.get("_links", {}).get("next")
            if not next_link:
                break
            page += 1

        # 3. Group leads by status
        leads_by_status = {}
        for lead in all_leads:
            sid = lead["status_id"]
            if sid not in leads_by_status:
                leads_by_status[sid] = []
            leads_by_status[sid].append(lead)

        return {
            "pipeline_id": pipeline_id,
            "pipeline_name": pipeline_name,
            "statuses": statuses,
            "leads_by_status": {str(k): v for k, v in leads_by_status.items()},
            "total_leads": len(all_leads),
        }


@api_router.put("/admin/settings/models")
async def update_models_config(config: ModelsConfig, username: str = Depends(verify_admin)):
    await db.settings.update_one(
        {"id": "models_config"},
        {"$set": config.model_dump()},
        upsert=True
    )
    return {"status": "success"}

@api_router.put("/admin/settings/models-content")
async def update_models_settings(settings: ModelsSettings, username: str = Depends(verify_admin)):
    await db.settings.update_one(
        {"id": "models_settings"},
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

# Stock Saunas management
@api_router.get("/admin/stock-saunas")
async def get_all_stock_saunas(username: str = Depends(verify_admin)):
    saunas = await db.stock_saunas.find({}, {"_id": 0}).sort("sort_order", 1).to_list(100)
    return saunas

@api_router.post("/admin/stock-saunas")
async def add_stock_sauna(sauna: StockSauna, username: str = Depends(verify_admin)):
    await db.stock_saunas.insert_one(sauna.model_dump())
    return sauna

@api_router.put("/admin/stock-saunas/{sauna_id}")
async def update_stock_sauna(sauna_id: str, sauna: StockSauna, username: str = Depends(verify_admin)):
    sauna.id = sauna_id
    await db.stock_saunas.update_one(
        {"id": sauna_id},
        {"$set": sauna.model_dump()},
        upsert=True
    )
    return {"status": "success"}

@api_router.delete("/admin/stock-saunas/{sauna_id}")
async def delete_stock_sauna(sauna_id: str, username: str = Depends(verify_admin)):
    result = await db.stock_saunas.delete_one({"id": sauna_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Sauna not found")
    return {"status": "success"}

# Layout settings
@api_router.get("/admin/settings/layout")
async def get_layout_settings(username: str = Depends(verify_admin)):
    settings = await db.settings.find_one({"id": "layout_settings"}, {"_id": 0})
    if not settings:
        return LayoutSettings().model_dump()
    return settings

@api_router.put("/admin/settings/layout")
async def update_layout_settings(settings: LayoutSettings, username: str = Depends(verify_admin)):
    await db.settings.update_one(
        {"id": "layout_settings"},
        {"$set": settings.model_dump()},
        upsert=True
    )
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


# Video upload
VIDEO_DIR = Path("/app/backend/uploads/videos")
VIDEO_DIR.mkdir(parents=True, exist_ok=True)

@api_router.post("/admin/upload-video")
async def upload_video(file: UploadFile = File(...), username: str = Depends(verify_admin)):
    if not file.content_type or not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="Only video files are allowed")
    try:
        import shutil, subprocess, threading
        video_id = str(uuid.uuid4())
        out_path = VIDEO_DIR / f"{video_id}.mp4"
        contents = await file.read()
        original_size = len(contents)
        # Save original immediately so URL works right away
        with open(out_path, "wb") as f:
            f.write(contents)

        # Compress in background thread
        def compress_video():
            ffmpeg_path = shutil.which("ffmpeg")
            if not ffmpeg_path:
                try:
                    import static_ffmpeg
                    static_ffmpeg.add_paths()
                    ffmpeg_path = shutil.which("ffmpeg")
                except ImportError:
                    return
            if not ffmpeg_path:
                return
            tmp_path = VIDEO_DIR / f"{video_id}_compressed.mp4"
            try:
                result = subprocess.run([
                    ffmpeg_path, "-y", "-i", str(out_path),
                    "-vf", "scale='min(1280,iw)':-2",
                    "-c:v", "libx264", "-crf", "28", "-preset", "fast",
                    "-an", "-movflags", "+faststart",
                    str(tmp_path)
                ], capture_output=True, timeout=300)
                if result.returncode == 0 and tmp_path.exists():
                    tmp_path.replace(out_path)
                    compressed_size = out_path.stat().st_size
                    logger.info(f"Video compressed: {original_size//1024}KB -> {compressed_size//1024}KB")
                else:
                    tmp_path.unlink(missing_ok=True)
                    logger.warning("ffmpeg compression failed, keeping original")
            except Exception as e:
                tmp_path.unlink(missing_ok=True)
                logger.warning(f"Video compression error: {e}")

        threading.Thread(target=compress_video, daemon=True).start()

        return {"status": "success", "url": f"/api/videos/{video_id}.mp4", "original_kb": original_size // 1024, "compressed_kb": original_size // 1024}
    except Exception as e:
        logger.error(f"Error uploading video: {e}")
        raise HTTPException(status_code=500, detail="Error uploading video")

@api_router.get("/videos/{filename}")
async def get_video(filename: str):
    from fastapi.responses import FileResponse
    filepath = VIDEO_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Video not found")
    return FileResponse(filepath, media_type="video/mp4")


CATALOG_DIR = Path("/app/backend/uploads")
CATALOG_DIR.mkdir(exist_ok=True)


@api_router.post("/admin/catalog/upload")
async def upload_catalog(file: UploadFile = File(...), username: str = Depends(verify_admin)):
    """Upload a PDF catalog file."""
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Только PDF-файлы")
    try:
        contents = await file.read()
        if len(contents) > 50 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Файл слишком большой (макс 50 МБ)")
        catalog_path = CATALOG_DIR / "catalog.pdf"
        catalog_path.write_bytes(contents)
        await db.settings.update_one(
            {"id": "catalog_settings"},
            {"$set": {"id": "catalog_settings", "filename": file.filename, "size": len(contents), "uploaded_at": datetime.now(timezone.utc).isoformat()}},
            upsert=True,
        )
        return {"status": "success", "filename": file.filename, "size": len(contents)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка загрузки: {str(e)}")


@api_router.get("/catalog/download")
async def download_catalog():
    """Download the catalog PDF."""
    from fastapi.responses import FileResponse
    catalog_path = CATALOG_DIR / "catalog.pdf"
    if not catalog_path.exists():
        raise HTTPException(status_code=404, detail="Каталог не загружен")
    settings = await db.settings.find_one({"id": "catalog_settings"}, {"_id": 0})
    filename = settings.get("filename", "WM-Sauna-Katalog.pdf") if settings else "WM-Sauna-Katalog.pdf"
    return FileResponse(str(catalog_path), media_type="application/pdf", filename=filename)


@api_router.get("/catalog/info")
async def catalog_info():
    """Check if catalog is available."""
    catalog_path = CATALOG_DIR / "catalog.pdf"
    if not catalog_path.exists():
        return {"available": False}
    settings = await db.settings.find_one({"id": "catalog_settings"}, {"_id": 0})
    return {"available": True, "filename": settings.get("filename", ""), "size": settings.get("size", 0)} if settings else {"available": True}


@api_router.delete("/admin/catalog")
async def delete_catalog(username: str = Depends(verify_admin)):
    """Delete the catalog."""
    catalog_path = CATALOG_DIR / "catalog.pdf"
    if catalog_path.exists():
        catalog_path.unlink()
    await db.settings.delete_one({"id": "catalog_settings"})
    return {"status": "deleted"}

@api_router.post("/admin/balia-catalog/upload")
async def upload_balia_catalog(file: UploadFile = File(...), username: str = Depends(verify_admin)):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Только PDF-файлы")
    try:
        contents = await file.read()
        if len(contents) > 50 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Файл слишком большой (макс 50 МБ)")
        catalog_path = CATALOG_DIR / "balia-catalog.pdf"
        catalog_path.write_bytes(contents)
        await db.settings.update_one(
            {"id": "balia_catalog_settings"},
            {"$set": {"id": "balia_catalog_settings", "filename": file.filename, "size": len(contents), "uploaded_at": datetime.now(timezone.utc).isoformat()}},
            upsert=True,
        )
        return {"status": "success", "filename": file.filename, "size": len(contents)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка загрузки: {str(e)}")

@api_router.get("/balia-catalog/download")
async def download_balia_catalog():
    from fastapi.responses import FileResponse
    catalog_path = CATALOG_DIR / "balia-catalog.pdf"
    if not catalog_path.exists():
        raise HTTPException(status_code=404, detail="Каталог купелей не загружен")
    settings = await db.settings.find_one({"id": "balia_catalog_settings"}, {"_id": 0})
    filename = settings.get("filename", "WM-Balia-Katalog.pdf") if settings else "WM-Balia-Katalog.pdf"
    return FileResponse(str(catalog_path), media_type="application/pdf", filename=filename)

@api_router.get("/balia-catalog/info")
async def balia_catalog_info():
    catalog_path = CATALOG_DIR / "balia-catalog.pdf"
    if not catalog_path.exists():
        return {"available": False}
    settings = await db.settings.find_one({"id": "balia_catalog_settings"}, {"_id": 0})
    return {"available": True, "filename": settings.get("filename", ""), "size": settings.get("size", 0)} if settings else {"available": True}

@api_router.delete("/admin/balia-catalog")
async def delete_balia_catalog(username: str = Depends(verify_admin)):
    catalog_path = CATALOG_DIR / "balia-catalog.pdf"
    if catalog_path.exists():
        catalog_path.unlink()
    await db.settings.delete_one({"id": "balia_catalog_settings"})
    return {"status": "deleted"}


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

# ========== BALIA SECTION ==========
# Balia products
@api_router.get("/balia/products")
async def get_balia_products():
    products = await db.balia_products.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return products

@api_router.post("/balia/products")
async def save_balia_product(request: Request, username: str = Depends(verify_admin)):
    data = await request.json()
    data["id"] = data.get("id", str(uuid.uuid4()))
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.balia_products.update_one({"id": data["id"]}, {"$set": data}, upsert=True)
    return {"status": "ok", "id": data["id"]}

@api_router.delete("/balia/products/{product_id}")
async def delete_balia_product(product_id: str, username: str = Depends(verify_admin)):
    await db.balia_products.delete_one({"id": product_id})
    return {"status": "deleted"}

# Balia testimonials
@api_router.get("/balia/testimonials")
async def get_balia_testimonials():
    testimonials = await db.balia_testimonials.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return testimonials

@api_router.post("/balia/testimonials")
async def save_balia_testimonial(request: Request, username: str = Depends(verify_admin)):
    data = await request.json()
    data["id"] = data.get("id", str(uuid.uuid4()))
    await db.balia_testimonials.update_one({"id": data["id"]}, {"$set": data}, upsert=True)
    return {"status": "ok", "id": data["id"]}

@api_router.delete("/balia/testimonials/{testimonial_id}")
async def delete_balia_testimonial(testimonial_id: str, username: str = Depends(verify_admin)):
    await db.balia_testimonials.delete_one({"id": testimonial_id})
    return {"status": "deleted"}

# Balia content (hero, features, etc.)
@api_router.get("/balia/content")
async def get_balia_content():
    content = await db.balia_content.find_one({"type": "main"}, {"_id": 0})
    return content or {}

@api_router.post("/balia/content")
async def save_balia_content(request: Request, username: str = Depends(verify_admin)):
    data = await request.json()
    data["type"] = "main"
    await db.balia_content.update_one({"type": "main"}, {"$set": data}, upsert=True)
    return {"status": "ok"}

# Balia configurator settings
@api_router.get("/balia/configurator-settings")
async def get_balia_configurator_settings():
    settings = await db.balia_configurator_settings.find_one({"type": "main"}, {"_id": 0})
    return settings or {"hiddenModels": [], "hiddenCategories": [], "hiddenOptions": [], "categoryDescriptions": {}}

@api_router.post("/balia/configurator-settings")
async def save_balia_configurator_settings(request: Request, username: str = Depends(verify_admin)):
    data = await request.json()
    data["type"] = "main"
    await db.balia_configurator_settings.update_one({"type": "main"}, {"$set": data}, upsert=True)
    return {"status": "ok"}

# Balia calculator proxy (same external API)
@api_router.get("/balia/calculator/prices")
async def get_balia_calculator_prices():
    async with httpx.AsyncClient(timeout=30.0) as client_http:
        response = await client_http.get(f"{CALCULATOR_API_URL}/api/prices")
        return response.json()

@api_router.post("/balia/calculator/generate-pdf")
async def generate_balia_pdf(request: Request):
    data = await request.json()
    async with httpx.AsyncClient(timeout=30.0) as client_http:
        response = await client_http.post(
            f"{CALCULATOR_API_URL}/api/generate-pdf",
            json=data,
            headers={"Content-Type": "application/json"}
        )
        return Response(
            content=response.content,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="oferta-balia.pdf"'}
        )

# Balia gallery (Cloudinary)
@api_router.get("/balia/gallery")
async def get_balia_gallery():
    images = await db.balia_gallery.find({}, {"_id": 0}).sort("order", 1).to_list(200)
    return images

@api_router.post("/balia/gallery/upload")
async def upload_balia_gallery_image(file: UploadFile = File(...), username: str = Depends(verify_admin)):
    try:
        contents = await file.read()
        result = cloudinary.uploader.upload(
            contents,
            folder="wm-balia/gallery",
            resource_type="image",
        )
        image_data = {
            "id": str(uuid.uuid4()),
            "url": result["secure_url"],
            "public_id": result["public_id"],
            "width": result.get("width"),
            "height": result.get("height"),
            "order": 0,
            "uploaded_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.balia_gallery.insert_one(image_data)
        del image_data["_id"]
        return image_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/balia/gallery/{image_id}")
async def delete_balia_gallery_image(image_id: str, username: str = Depends(verify_admin)):
    image = await db.balia_gallery.find_one({"id": image_id})
    if image and image.get("public_id"):
        try:
            cloudinary.uploader.destroy(image["public_id"])
        except Exception:
            pass
    await db.balia_gallery.delete_one({"id": image_id})
    return {"status": "deleted"}

# Balia color swatches (Cloudinary)
@api_router.get("/balia/colors")
async def get_balia_colors():
    colors = await db.balia_colors.find({}, {"_id": 0}).sort("order", 1).to_list(500)
    return colors

@api_router.post("/balia/colors")
async def save_balia_color(request: Request, username: str = Depends(verify_admin)):
    data = await request.json()
    await db.balia_colors.update_one({"id": data["id"]}, {"$set": data}, upsert=True)
    return {"status": "ok"}

@api_router.post("/balia/colors/upload")
async def upload_balia_color_image(file: UploadFile = File(...), category: str = "fiberglass", username: str = Depends(verify_admin)):
    try:
        contents = await file.read()
        result = cloudinary.uploader.upload(
            contents,
            folder=f"wm-balia/colors/{category}",
            resource_type="image",
        )
        return {"url": result["secure_url"], "public_id": result["public_id"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/balia/colors/{color_id}")
async def delete_balia_color(color_id: str, username: str = Depends(verify_admin)):
    color = await db.balia_colors.find_one({"id": color_id})
    if color and color.get("public_id"):
        try:
            cloudinary.uploader.destroy(color["public_id"])
        except Exception:
            pass
    await db.balia_colors.delete_one({"id": color_id})
    return {"status": "deleted"}

# Balia product card options settings
@api_router.get("/balia/card-options-settings")
async def get_balia_card_options():
    settings = await db.settings.find_one({"id": "balia_card_options"}, {"_id": 0})
    return settings or {"id": "balia_card_options", "enabled_categories": []}

@api_router.post("/balia/card-options-settings")
async def save_balia_card_options(request: Request, username: str = Depends(verify_admin)):
    data = await request.json()
    data["id"] = "balia_card_options"
    await db.settings.update_one({"id": "balia_card_options"}, {"$set": data}, upsert=True)
    return {"status": "ok"}

@api_router.get("/balia/option-exclusions")
async def get_balia_option_exclusions():
    settings = await db.settings.find_one({"id": "balia_option_exclusions"}, {"_id": 0})
    return settings or {"id": "balia_option_exclusions", "exclusions": {}}

@api_router.post("/balia/option-exclusions")
async def save_balia_option_exclusions(request: Request, username: str = Depends(verify_admin)):
    data = await request.json()
    data["id"] = "balia_option_exclusions"
    await db.settings.update_one({"id": "balia_option_exclusions"}, {"$set": data}, upsert=True)
    return {"status": "ok"}

@api_router.post("/balia/schematic/upload")
async def upload_balia_schematic_image(file: UploadFile = File(...), username: str = Depends(verify_admin)):
    try:
        contents = await file.read()
        result = cloudinary.uploader.upload(
            contents,
            folder="wm-balia/schematic",
            resource_type="image",
        )
        return {"status": "ok", "url": result["secure_url"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




# ============ BLOG ENDPOINTS ============

class BlogArticle(BaseModel):
    slug: str = ""
    title: str = ""
    meta_description: str = ""
    category: str = "sauny"
    tags: List[str] = []
    cover_image: str = ""
    content: str = ""
    excerpt: str = ""
    author: str = "WM Group"
    published: bool = False
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


def slugify(text: str) -> str:
    text = text.lower().strip()
    for k, v in {'ą':'a','ć':'c','ę':'e','ł':'l','ń':'n','ó':'o','ś':'s','ź':'z','ż':'z'}.items():
        text = text.replace(k, v)
    import re as _re
    text = _re.sub(r'[^a-z0-9\s-]', '', text)
    text = _re.sub(r'[\s]+', '-', text)
    return _re.sub(r'-+', '-', text).strip('-')


@api_router.get("/blog/articles")
async def get_blog_articles(category: Optional[str] = None):
    query = {"published": True}
    if category:
        query["category"] = category
    articles = []
    async for doc in db.blog_articles.find(query, {"_id": 0, "content": 0}).sort("created_at", -1):
        articles.append(doc)
    return articles


@api_router.get("/blog/articles/{slug}")
async def get_blog_article(slug: str):
    article = await db.blog_articles.find_one({"slug": slug}, {"_id": 0})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article


@api_router.get("/blog/categories")
async def get_blog_categories():
    pipeline = [
        {"$match": {"published": True}},
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    cats = []
    async for doc in db.blog_articles.aggregate(pipeline):
        cats.append({"id": doc["_id"], "count": doc["count"]})
    return cats


@api_router.post("/admin/blog/articles")
async def create_blog_article(article: BlogArticle, username: str = Depends(verify_admin)):
    if not article.slug:
        article.slug = slugify(article.title)
    existing = await db.blog_articles.find_one({"slug": article.slug})
    if existing:
        raise HTTPException(status_code=400, detail="Article with this slug already exists")
    now = datetime.now(timezone.utc).isoformat()
    data = article.model_dump()
    data["created_at"] = now
    data["updated_at"] = now
    await db.blog_articles.insert_one(data)
    return {"status": "success", "slug": article.slug}


@api_router.put("/admin/blog/articles/{slug}")
async def update_blog_article(slug: str, article: BlogArticle, username: str = Depends(verify_admin)):
    data = article.model_dump()
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.blog_articles.update_one({"slug": slug}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"status": "success"}


@api_router.delete("/admin/blog/articles/{slug}")
async def delete_blog_article(slug: str, username: str = Depends(verify_admin)):
    result = await db.blog_articles.delete_one({"slug": slug})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"status": "success"}


@api_router.get("/admin/blog/articles")
async def admin_get_blog_articles(username: str = Depends(verify_admin)):
    articles = []
    async for doc in db.blog_articles.find({}, {"_id": 0}).sort("created_at", -1):
        articles.append(doc)
    return articles


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
