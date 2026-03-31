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
- Emergent Object Storage (36 фото + 46 видео + каталоги PDF + 65 миграций Cloudinary)
- Все картинки купелей в Object Storage, 0 внешних зависимостей

### Performance (Mar 2026) — OPTIMIZED
- Sauna Bulk: GET /api/settings/bulk — 1 запрос (кэш 30 сек), включает _stock_saunas и _catalog_available
- Balie Bulk: GET /api/balia/bulk — 1 запрос (кэш 30 сек)
- External API Proxy Cache: /api/sauna/public-models и /api/sauna/prices — in-memory кэш 5 мин (1016ms → 104ms)
- In-memory ImageCache (200 items, 1h TTL) — кэш картинок из Object Storage
- BulkCache с поддержкой per-key TTL
- Preload всех картинок: купелей (цвета, продукты, галерея) в BalieContext, моделей саун в Models.jsx
- Skeleton-анимация в BalieColors при загрузке картинок
- Cache-Control: public, max-age=604800, immutable на /api/images/{id}
- StockSaunas и catalogAvailable из SettingsContext (0 дополнительных запросов)
- GZip, BalieContext.js + SettingsContext.js

### Data Migration (Mar 2026) — COMPLETE
- GET /api/admin/export — экспорт всех данных
- POST /api/admin/import — импорт с upsert
- Вкладка "Система → Экспорт/Импорт" в админке — TESTED, WORKING

### Catalog Storage — COMPLETE
- PDF каталоги в Object Storage, авто-восстановление при деплое
- createPortal для модального окна каталога

### Bug Fixes (Mar 2026)
- SeoHead.jsx: Fixed TDZ error (canonical used before declaration in production build)

### Other Completed
- Google Maps, SEO OG Image, Floating Contact, Analytics, GDPR/RODO, AmoCRM, Multilingual

## Key API Endpoints
- GET /api/settings/bulk — Настройки саун + stock_saunas + catalog_available (cached 30s)
- GET /api/balia/bulk — Данные купелей (cached 30s)
- GET /api/sauna/public-models — Модели (cached 5min in-memory)
- GET /api/sauna/prices — Цены (cached 5min in-memory)
- GET /api/images/{id} — Картинки с ImageCache + Cache-Control
- GET /api/admin/export — Экспорт данных
- POST /api/admin/import — Импорт данных

## Backlog
- P2: Toast обработка ошибок
- P3: A/B тестирование CTA
- P4: Рефакторинг server.py -> модули
- P4: Декомпозиция Calculator.jsx
- Minor: /api/content/calculator endpoint 404 (pre-existing, silently caught)
