# WM-Sauna — PRD (Product Requirements Document)

## Original Problem Statement
Создание современного адаптивного сайта для польского производителя деревянных саун WM-Sauna. Основная цель — продажа саун через калькулятор и формы заявок.

## Core Features (Implemented)
- Адаптивный сайт со всеми ключевыми разделами (Hero, Models, Calculator, Gallery, Stock Saunas, Reviews, FAQ, About, Contact)
- Панель администратора `/admin` с аутентификацией (Basic Auth + localStorage persistence)
- Интеграция с Telegram для уведомлений о заявках
- Интеграция с AMO CRM (API-ключ) для создания сделок
- Продвинутый калькулятор (двухколоночный дизайн, кастомный dropdown с миниатюрами)
- Генерация PDF-конфигураций (reportlab)
- Загрузка/скачивание PDF-каталога через админку
- Скачивание каталога через форму-гейт (CatalogFormGate)
- Страница просмотра воронки AMO CRM `/admin/pipeline` (канбан-доска + CSV экспорт)
- SEO-настройки через админку
- Управление контентом всех секций через админку
- **Фильтр моделей** (Все / Бочки / Квадро / Викинг)
- **Две цены на карточках**: с электропечкой и с дровяной печкой
- **Промо-блоки**: USP-полоса + баннер со скидкой до 10% перед калькулятором
- **Секция "Специальное предложение"** — подарки при заказе (бочка, LED, двери)
- **Информация на карточках**: цена с НДС, готовая собранная саура

## Tech Stack
- **Backend:** FastAPI, Pydantic, MongoDB (motor), JWT, HTTPX, reportlab
- **Frontend:** React, React Router, TailwindCSS, Framer Motion, react-helmet-async
- **External APIs:** wm-kalkulator.pl, Telegram Bot API, AMO CRM API

## Architecture
```
/app/
├── backend/
│   ├── server.py             # Main FastAPI server
│   ├── pdf_generator.py      # PDF generation for calculator configs
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Models.jsx          # Model cards with filters, dual pricing
│   │   │   ├── PromoFeatures.jsx   # USP features strip (4 blocks)
│   │   │   ├── PromoBanner.jsx     # Pre-calculator promo banner (10% discount)
│   │   │   ├── SpecialOffer.jsx    # Special offer section (gifts with order)
│   │   │   ├── Calculator.jsx      # Two-column calculator
│   │   │   ├── CatalogFormGate.jsx # Catalog download form gate
│   │   │   ├── Hero.jsx
│   │   │   └── StickyCTA.jsx
│   │   ├── pages/
│   │   │   ├── AdminPanel.jsx  # Admin panel (~3500 lines, needs refactoring)
│   │   │   └── PipelineView.jsx # AMO CRM pipeline viewer + CSV export
│   │   ├── context/          # LanguageContext, SettingsContext
│   │   └── App.js
```

## Key API Endpoints
- POST /api/contact — Submit contact/lead form
- POST /api/admin/login — Admin authentication
- POST /api/admin/catalog/upload — Upload PDF catalog
- GET /api/catalog/download — Download PDF catalog
- GET /api/catalog/info — Check catalog availability
- POST /api/sauna/generate-pdf — Generate PDF config
- GET /api/admin/amocrm/pipeline/{pipeline_id}/full — Get pipeline data from AMO CRM
- GET /api/sauna/prices — Sauna prices with heater options

## Admin Credentials
- Login: admin
- Password: 220066

## What's Been Done (Latest Session - Feb 2026)
- Fixed auth bug: PipelineView login form + localStorage session
- Added CSV export for pipeline (all fields including custom fields)
- Added PromoFeatures (4 USP blocks) and PromoBanner (10% discount promo) 
- Added model filter tabs (Wszystkie/Beczki/Kwadro/Wiking)
- Removed discounts from model cards (managers handle discounts)
- Added two prices on cards: model+electric heater, model+wood heater
- Added "Cena zawiera VAT" and "Gotowa, zmontowana sauna" text
- Added SpecialOffer section with 3 gift cards (cooling tub, LED, glass doors)
- All changes tested: 15/15 tests passed (iteration_5)

## Notes
- Catalog download button appears only when PDF catalog is uploaded via admin panel
- Current catalog status: not uploaded (available: false)

## Backlog (Prioritized)
### P1
- Refactor AdminPanel.jsx (~3500 lines → split into sub-components)
- i18next integration for static UI strings (PL/RU/EN)

### P2
- Improve frontend API error handling (toast notifications)

### P3
- A/B testing for CTA buttons
