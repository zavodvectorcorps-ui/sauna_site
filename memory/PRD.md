# WM-Sauna — PRD (Product Requirements Document)

## Original Problem Statement
Создание современного адаптивного сайта для польского производителя деревянных саун WM-Sauna. Основная цель — продажа саун через калькулятор и формы заявок.

## Core Features (Implemented)
- Адаптивный сайт со всеми ключевыми разделами (Hero, Models, Calculator, Gallery, Stock Saunas, Reviews, FAQ, About, Contact)
- Панель администратора `/admin` с аутентификацией (Basic Auth)
- Интеграция с Telegram для уведомлений о заявках
- Интеграция с AMO CRM (API-ключ) для создания сделок
- Продвинутый калькулятор (двухколоночный дизайн, кастомный dropdown с миниатюрами)
- Генерация PDF-конфигураций (reportlab)
- Загрузка/скачивание PDF-каталога через админку
- Скачивание каталога через форму-гейт (CatalogFormGate)
- Страница просмотра воронки AMO CRM `/admin/pipeline` (канбан-доска)
- SEO-настройки через админку
- Управление контентом всех секций через админку

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
│   │   ├── components/       # All site components
│   │   ├── pages/
│   │   │   ├── AdminPanel.jsx  # Admin panel (~3500 lines, needs refactoring)
│   │   │   └── PipelineView.jsx # AMO CRM pipeline viewer
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

## Admin Credentials
- Login: admin
- Password: 220066

## What's Been Done (Latest Session - Feb 2026)
- Fixed auth bug: PipelineView now has its own login form
- Added localStorage persistence for admin auth (shared between AdminPanel and PipelineView)
- Session restore on page reload

## Backlog (Prioritized)
### P0
- Clarify "copy pipeline" requirement (viewing vs export vs duplication)

### P1
- Refactor AdminPanel.jsx (~3500 lines → split into sub-components)
- i18next integration for static UI strings (PL/RU/EN)

### P2
- Improve frontend API error handling (toast notifications)

### P3
- A/B testing for CTA buttons
