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

### Performance — FULLY OPTIMIZED
- **Server-side image optimization**: /api/images/{id}?w=500&q=75 — Pillow resize + WebP (30x compression)
- **Applied to ALL components**: Gallery, Products, Colors, About, FAQ, Reviews, StockSaunas, SaunaAdvantages, BalieSchematic, BalieStoveScheme, **Models, Hero, BalieHero** (Mar 31 2026)
- In-memory ImageCache (200 items, 1h TTL)
- External API Proxy Cache: models/prices — 5 мин TTL
- Settings bulk includes stock_saunas + catalog_available
- Preload all balie images in BalieContext
- GZip middleware
- **Mobile-optimized preloading**: Models.jsx preloads only card-size (w=500) instead of full-size images

### SEO / OG — FIXED (Mar 31 2026)
- OG-картинка в index.html теперь использует ?w=1200&q=80 (вместо сырого 7MB PNG)
- twitter:image также оптимизирован
- Хардкод OG-тегов в public/index.html для корректного чтения краулерами

### SEO Admin — FIXED
- Stale closure bug: handleImageUpload uses functional setState (prev => ...)
- All onChange handlers use functional updates
- type="url" → type="text" for og_image field

### Data Migration — COMPLETE
- Export/Import in admin panel — TESTED

### Bug Fixes (Mar 2026)
- SeoHead.jsx TDZ error, CORS analytics, /api/content/calculator 404

## Key API Endpoints
- GET /api/images/{id}?w=&q= — server-side resize + WebP via Pillow
- GET /api/settings/bulk — cached, includes stock_saunas + catalog
- GET /api/balia/bulk — cached
- GET /api/sauna/public-models — cached 5min
- GET /api/settings/seo — SEO settings
- PUT /api/admin/settings/seo — save SEO settings

## Backlog
- P2: Toast обработка ошибок
- P3: A/B тестирование CTA
- P4: Рефакторинг server.py → модули
- P4: Декомпозиция Calculator.jsx
