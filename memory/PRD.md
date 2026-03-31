# WM Group — PRD

## Architecture
- Frontend: React + TailwindCSS + Framer Motion + Shadcn UI
- Backend: FastAPI + MongoDB + Emergent Object Storage + GPT-4.1-nano (translation)
- Admin: Basic Auth (admin / 220066)

## Implemented Features

### Core
- Каталог саун с калькулятором, каталог купелей с конфигуратором
- Главная WM Group, "7 фактов", админ-панель (40+ вкладок)
- Блог, B2B, WhatsApp, видео-обзоры, FAQ, процесс заказа

### Object Storage & Media
- Emergent Object Storage (36 фото + 46 видео + каталоги PDF)
- Каталоги в Object Storage с локальным кешем и авто-восстановлением

### Multilingual (4 языка)
- PL, EN, DE, CS. GPT-4.1-nano автоперевод с MongoDB кэшем

### Performance (Mar 2026) — OPTIMIZED
- Sauna Bulk: GET /api/settings/bulk — 1 запрос (кэш 30 сек)
- Balie Bulk: GET /api/balia/bulk — 1 запрос вместо 10+ (кэш 30 сек, 684ms->177ms)
- In-memory BulkCache с автоинвалидацией при admin write операциях
- GZip: 52KB -> 21KB
- BalieContext.js + SettingsContext.js — глобальные стейты

### AmoCRM
- Отдельная воронка для каталога

### Analytics & Ads
- Дашборд, GTM/GA4/FB Pixel, consent-gated

### GDPR/RODO — COMPLETE
### Floating Contact — COMPLETE
### Google Maps — COMPLETE
### SEO OG Image — COMPLETE
### Catalog Modal (createPortal) — COMPLETE

## Key API Endpoints
- GET /api/settings/bulk — Все настройки саун (cached 30s)
- GET /api/balia/bulk — Все данные купелей (cached 30s)
- POST /api/analytics/event — Аналитика
- GET /api/catalog/info — Каталог (Object Storage fallback)

## Backlog
- P2: Toast обработка ошибок
- P3: A/B тестирование CTA
- P4: Рефакторинг server.py -> модули
- P4: Декомпозиция Calculator.jsx
