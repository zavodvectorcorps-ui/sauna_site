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
- Emergent Object Storage (36 фото + 46 видео)

### Multilingual (4 языка)
- PL, EN, DE, CS. GPT-4.1-nano автоперевод с MongoDB кэшем

### Performance
- Bulk Settings: 1 запрос вместо ~30 (GET /api/settings/bulk)
- GZip: 52KB -> 21KB

### Hero & Button Config
- Бейджи + кнопки Hero из БД

### AmoCRM
- Отдельная воронка для каталога (amocrm_catalog_pipeline_id)

### Analytics & Ads (Mar 2026)
- Дашборд: визиты, CTA, заявки, конверсия, UTM, воронка
- GTM / GA4 / Google Ads / Facebook Pixel — из админки
- Consent-gated: скрипты грузятся только при согласии

### GDPR/RODO Compliance (Mar 2026) — COMPLETE
- Polityka prywatnosci (/privacy), Polityka cookies (/cookies)
- Cookie Consent Banner, RODO notice под формами
- Consent-gated analytics

### Floating Contact (Mar 2026) — COMPLETE
- WhatsApp + Позвонить — квадратные иконки (стиль iPhone app)
- Тултипы при наведении, клик по телефону — только номер
- Глобально на всех страницах

### Google Maps (Mar 2026) — COMPLETE
- Карта на главной странице (под формой контактов)
- Карта на странице саун (секция контакт)
- Админка принимает как чистый URL, так и полный iframe — автопарсинг src
- Дефолтная ссылка указывает на WM Group в Варшаве

## Key API Endpoints
- GET /api/settings/bulk — Все настройки
- POST /api/analytics/event — Аналитика
- GET /api/admin/analytics/summary — Дашборд
- GET/PUT /api/settings/tracking — Коды трекинга

## Backlog
- P2: Toast обработка ошибок
- P3: A/B тестирование CTA
- P4: Рефакторинг server.py -> роуты
- P4: Декомпозиция Calculator.jsx
