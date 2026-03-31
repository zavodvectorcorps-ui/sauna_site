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

### Mobile UX
- Горизонтальный скролл, peek-эффект, автоскролл

### Object Storage & Media
- Emergent Object Storage (36 фото + 46 видео + каталоги PDF)
- Каталоги хранятся в Object Storage, локальный кеш авто-восстанавливается

### Multilingual (4 языка)
- PL, EN, DE, CS. GPT-4.1-nano автоперевод с MongoDB кэшем

### Performance (Mar 2026) — OPTIMIZED
- Sauna Bulk: GET /api/settings/bulk — 1 запрос вместо ~30
- Balie Bulk: GET /api/balia/bulk — 1 запрос вместо 10+ (asyncio.gather)
- GZip: 52KB -> 21KB
- BalieContext.js + SettingsContext.js — глобальные стейты для данных

### Hero & Button Config
- Бейджи + кнопки Hero из БД

### AmoCRM
- Отдельная воронка для каталога (amocrm_catalog_pipeline_id)

### Analytics & Ads (Mar 2026)
- Дашборд: визиты, CTA, заявки, конверсия, UTM, воронка
- GTM / GA4 / Google Ads / Facebook Pixel — из админки
- Consent-gated: скрипты грузятся только при согласии

### GDPR/RODO Compliance — COMPLETE
- Polityka prywatnosci (/privacy), Polityka cookies (/cookies)
- Cookie Consent Banner, RODO notice под формами

### Floating Contact — COMPLETE
- WhatsApp + Позвонить — квадратные иконки (стиль iPhone app)
- Тултипы при наведении, клик по телефону — только номер
- Глобально на всех страницах

### Google Maps — COMPLETE
- Карта на главной и странице саун, автопарсинг iframe в админке

### Catalog Storage — COMPLETE
- PDF каталоги в Object Storage, локальный кеш с авто-восстановлением

### SEO OG Image — COMPLETE
- OG Image сохраняется как относительный путь, SeoHead формирует абсолютный URL через canonical_url

### Catalog Modal — COMPLETE
- createPortal для центрирования модального окна каталога

## Key API Endpoints
- GET /api/settings/bulk — Все настройки саун
- GET /api/balia/bulk — Все данные купелей (1 запрос)
- POST /api/analytics/event — Аналитика
- GET /api/admin/analytics/summary — Дашборд
- GET /api/catalog/info — Проверка каталога (Object Storage fallback)

## Backlog
- P2: Toast обработка ошибок
- P3: A/B тестирование CTA
- P4: Рефакторинг server.py -> роуты
- P4: Декомпозиция Calculator.jsx
