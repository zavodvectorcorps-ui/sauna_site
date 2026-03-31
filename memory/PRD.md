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
- Sauna Bulk: GET /api/settings/bulk — 1 запрос (кэш 30 сек)
- Balie Bulk: GET /api/balia/bulk — 1 запрос вместо 12+ (кэш 30 сек, 684ms->177ms)
- In-memory BulkCache с автоинвалидацией
- In-memory ImageCache (200 items, 1h TTL) — кэширует картинки из Object Storage
- Preload всех картинок купелей (цвета, продукты, галерея) в BalieContext при загрузке данных
- Skeleton-анимация в BalieColors при загрузке картинок
- Cache-Control: public, max-age=604800, immutable на /api/images/{id}
- GZip, BalieContext.js + SettingsContext.js

### Data Migration (Mar 2026) — COMPLETE
- GET /api/admin/export — экспорт всех данных (268 docs, 162 KB)
- POST /api/admin/import — импорт с upsert (не дублирует)
- Вкладка "Система → Экспорт/Импорт" в админке — TESTED, WORKING

### Catalog Storage — COMPLETE
- PDF каталоги в Object Storage, авто-восстановление при деплое
- createPortal для модального окна каталога (центрирование)

### Other Completed
- Google Maps (главная + сауны, автопарсинг iframe)
- SEO OG Image (relative path + canonical_url)
- Floating Contact (WhatsApp + Позвонить, глобально)
- Analytics, GDPR/RODO, AmoCRM, Multilingual

## Key API Endpoints
- GET /api/settings/bulk — Настройки саун (cached)
- GET /api/balia/bulk — Данные купелей (cached)
- GET /api/admin/export — Экспорт данных
- POST /api/admin/import — Импорт данных
- GET /api/images/{id} — Картинки с ImageCache + Cache-Control

## Backlog
- P2: Toast обработка ошибок
- P3: A/B тестирование CTA
- P4: Рефакторинг server.py -> модули
- P4: Декомпозиция Calculator.jsx
