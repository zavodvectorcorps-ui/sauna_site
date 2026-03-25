# WM Group — PRD

## Original Problem Statement
Объединённый сайт для WM Group (WM-Sauna + WM-Balia). Общая главная страница с выбором продуктовой линейки, отдельные страницы для саун и купелей с полным функционалом. Панель управления для обоих продуктовых линеек.

## Architecture
```
/               → MainLanding (About + Contact + выбор: Sauny / Balie)
/sauny          → Полный сайт саун
/balie          → Страница купелей (Hero, Features, Products, Testimonials, Contact)
/balie/konfigurator → Конфигуратор купелей
/admin          → Единая админ-панель (Sauny + Balie management)
/admin/pipeline → Воронка AMO CRM
```

## Core Features
### Main Landing (/)
- About block: Polish manufacturer, Warsaw, quality materials, health & comfort
- Contact form with phone, email, address
- Two product cards: Sauny / Balie

### Sauny (/sauny)
- All sections: Hero, Models (with filters), Calculator, Gallery, etc.
- PromoFeatures, PromoBanner, SpecialOffer sections
- Dual pricing (electric + wood heater), VAT, ready-sauna badges
- PDF generation, catalog download

### Balie (/balie + /balie/konfigurator)
- Hero, Features, Products (MongoDB), Testimonials, Contact
- Full configurator with model selection, heater types, options, PDF
- Dark theme (bg-[#0F1218], gold #D4AF37)

### Admin Panel (/admin)
- Sauna management: all existing tabs (Messages, Design, Content, Models, Gallery, Calculator, Reviews, FAQ, SEO, Integrations, Catalog, Section Order)
- Balia management: Products, Testimonials, Content, Configurator settings

## Integrations
- Telegram notifications
- AMO CRM (API key)
- Cloudinary (cloud_name: dhyj13jgs) — for Balia gallery
- wm-kalkulator.pl API — prices for both saunas and hot tubs

## Backend API — Balia
- GET/POST /api/balia/products, DELETE /api/balia/products/{id}
- GET/POST /api/balia/testimonials, DELETE /api/balia/testimonials/{id}
- GET/POST /api/balia/content
- GET/POST /api/balia/configurator-settings
- GET /api/balia/calculator/prices
- POST /api/balia/calculator/generate-pdf
- GET /api/balia/gallery, POST /api/balia/gallery/upload, DELETE /api/balia/gallery/{id}

## Admin Credentials
- Login: admin | Password: 220066

## Backlog
### P1
- Refactor AdminPanel.jsx (still large, but now has separate Balia components)
- i18next integration (PL/RU/EN)
- Balia gallery section on /balie page (Cloudinary configured, endpoint ready)

### P2
- Frontend API error handling (toasts)

### P3
- A/B testing CTA buttons
