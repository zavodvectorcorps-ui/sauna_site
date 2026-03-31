# WM Group — PRD

## Architecture
- Frontend: React + TailwindCSS + Framer Motion + Shadcn UI
- Backend: FastAPI + MongoDB + Emergent Object Storage + Pillow (image optimization) + GPT-4.1-nano
- Admin: Basic Auth (admin / 220066)

## Implemented Features

### Core
- Каталог саун с калькулятором, каталог купелей с конфигуратором
- Главная WM Group, "7 фактов", админ-панель (40+ вкладок)
- Блог, B2B, WhatsApp, видео-обзоры, FAQ, процесс заказа

### Object Storage & Media
- Emergent Object Storage (36 фото + 46 видео + каталоги PDF + 65 миграций Cloudinary)

### Performance (Mar 2026) — FULLY OPTIMIZED
- **Server-side image optimization**: /api/images/{id}?w=500&q=75 — Pillow resize + WebP conversion (1.5MB → 51KB = 30x меньше)
- In-memory ImageCache (200 items, 1h TTL) — кэш оптимизированных + оригинальных картинок
- External API Proxy Cache: /api/sauna/public-models и /api/sauna/prices — 5 мин TTL (1s → 100ms)
- Sauna Bulk: /api/settings/bulk (cached 30s) includes _stock_saunas + _catalog_available (минус 2 запроса)
- Balie Bulk: /api/balia/bulk (cached 30s)
- Preload всех картинок (оптимизированных) в BalieContext при загрузке
- Skeleton-анимация в BalieColors
- optimizedImg() хелпер для всех фронтенд-компонентов
- GZip middleware

### Data Migration — COMPLETE
- GET /api/admin/export, POST /api/admin/import — TESTED

### Bug Fixes (Mar 2026)
- SeoHead.jsx: Fixed TDZ error (canonical before initialization)
- CORS: Fixed allow_credentials=True + wildcard origin conflict
- /api/content/calculator: Added endpoint (was 404)

### Other
- Google Maps, SEO OG Image, Floating Contact, Analytics, GDPR/RODO, AmoCRM, Multilingual

## Key API Endpoints
- GET /api/settings/bulk — cached 30s, includes stock_saunas + catalog
- GET /api/balia/bulk — cached 30s
- GET /api/images/{id}?w=&q= — server-side resize + WebP via Pillow
- GET /api/sauna/public-models — cached 5min in-memory
- GET /api/sauna/prices — cached 5min in-memory
- GET /api/content/calculator — calculator section content
- GET /api/admin/export, POST /api/admin/import

## Backlog
- P2: Toast обработка ошибок
- P3: A/B тестирование CTA
- P4: Рефакторинг server.py → модули
- P4: Декомпозиция Calculator.jsx
