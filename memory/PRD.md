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
- Карта на главной странице и на странице саун
- Админка принимает URL или полный iframe — автопарсинг

### Catalog Storage (Mar 2026) — COMPLETE
- PDF каталоги хранятся в Object Storage (переживают деплой)
- Локальный кеш с авто-восстановлением при обращении
- Модальное окно каталога через createPortal (центрирование)

### Video Hero Balie (Mar 2026) — COMPLETE
- Фоновое видео купелей загружается через bulk API
- balia_hero_settings добавлены в /api/settings/bulk

## Key API Endpoints
- GET /api/settings/bulk — Все настройки (вкл. balia_hero_settings)
- POST /api/analytics/event — Аналитика
- GET /api/admin/analytics/summary — Дашборд
- GET /api/catalog/info — Проверка наличия каталога (с авто-восстановлением из Object Storage)
- GET /api/catalog/download — Скачивание каталога

## Backlog
- P2: Toast обработка ошибок
- P3: A/B тестирование CTA
- P4: Рефакторинг server.py -> роуты
- P4: Декомпозиция Calculator.jsx
