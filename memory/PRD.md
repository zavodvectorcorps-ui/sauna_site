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
- GZip: 52KB → 21KB

### Hero & Button Config
- Бейджи + кнопки Hero из БД

### AmoCRM
- Отдельная воронка для каталога (amocrm_catalog_pipeline_id)

### Analytics & Ads (Mar 2026)
- Дашборд: визиты, CTA, заявки, конверсия, UTM, воронка
- GTM / GA4 / Google Ads / Facebook Pixel — из админки
- Consent-gated: скрипты грузятся только при согласии
- Совет "Быстрый старт" в админке

### GDPR/RODO Compliance (Mar 2026) — COMPLETE
- **Polityka prywatności** (/privacy): 10 секций на польском, данные из БД
- **Polityka cookies** (/cookies): 7 секций, Google Analytics, управление cookies
- **Cookie Consent Banner**: 2 кнопки (Akceptuję wszystkie / Tylko niezbędne)
- **RODO notice**: строка под формами контакта (Contact, BalieContact, CatalogFormGate)
- **"Ustawienia cookies"**: кнопка в футере — сброс согласия
- **Consent-gated analytics**: GA/GTM/FB Pixel загружаются ТОЛЬКО с согласия
- Данные компании (company_name, address, NIP, email) из siteSettings

### WhatsApp Button (Mar 2026) — COMPLETE
- Квадратная иконка (стиль iPhone app icon) с закруглёнными углами
- Надпись "WhatsApp" всегда видна рядом с иконкой
- Пульсирующая анимация при загрузке

## Key API Endpoints
- GET /api/settings/bulk — Все настройки
- POST /api/analytics/event — Аналитика
- GET /api/admin/analytics/summary — Дашборд
- GET/PUT /api/settings/tracking — Коды трекинга

## Backlog
- P2: Toast обработка ошибок
- P3: A/B тестирование CTA
- P4: Рефакторинг server.py → роуты
- P4: Декомпозиция Calculator.jsx
