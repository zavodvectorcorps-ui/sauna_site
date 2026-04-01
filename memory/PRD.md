# WM Group — PRD

## Architecture
- Frontend: React + TailwindCSS + Framer Motion + Shadcn UI
- Backend: FastAPI + MongoDB + **Cloudinary CDN** (images + videos) + Pillow (fallback image optimization) + GPT-4.1-nano
- Media: **Cloudinary** (primary, CDN delivery) + Emergent Object Storage (legacy fallback)
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
- **Video streaming optimization** (Apr 1 2026): Disk caching + Range requests (HTTP 206) for progressive playback. Mobile lazy-load via IntersectionObserver, preload="metadata"
- **Video preloading on MainLanding** (Apr 1 2026): `preload="auto"` + programmatic `el.load()` on mount + `<link rel="preload" as="video">` injection + Cloudinary poster (first frame as JPG via `so_0` transformation). Instant playback on hover/tap.
- **Adaptive video quality** (Apr 1 2026): Cloudinary CDN transformations per device — Desktop: `w_1280,q_auto,f_auto` (1280p, auto quality, WebM/MP4 auto-format). Mobile: `w_720,q_auto,f_auto` (720p). Applied to MainLanding.jsx, Hero.jsx, BalieHero.jsx. Utility functions `optimizedVideo()` and `videoPoster()` in utils.js.

### Cloudinary CDN — COMPLETE
- All images and videos migrated to Cloudinary CDN
- Admin uploads go directly to Cloudinary
- Old `/api/images/{id}` and `/api/videos/{filename}` do 302 redirects to Cloudinary URLs
- **Auto-migration on startup** (Apr 1 2026): `_auto_cloudinary_migration()` runs as background task in `startup_init`, non-blocking. Migrates any remaining Object Storage media to Cloudinary automatically on deployment.

### SEO / OG — FIXED (Mar 31 2026)
- OG-картинка в index.html теперь использует ?w=1200&q=80 (вместо сырого 7MB PNG)
- twitter:image также оптимизирован
- Хардкод OG-тегов в public/index.html для корректного чтения краулерами
- **Sitemap.xml** (Apr 1 2026): Динамический `GET /api/sitemap.xml` — 8 статических + все блог-статьи из БД. `GET /api/robots.txt` указывает на sitemap. Домен: `https://wm-spa.pl`

### A/B Testing System — COMPLETE (Mar 31 2026)
- Backend: CRUD API for tests (`/api/admin/ab/tests`), public endpoints for active tests and event tracking
- Frontend: ABTestContext + useABTest hook (cookie-based visitor assignment, deterministic variant allocation)
- Applied to 6 CTA buttons: Hero primary/secondary, Balie primary/secondary, Model details, Model configure
- Admin UI: полноценная панель во вкладке "A/B Тесты" с формой создания, управлением (пауза/запуск/удаление) и статистикой конверсий
- **Z-test статистическая значимость**: автоматический расчёт p-value, z-score, уверенности (%)
- **Кнопка "Применить победителя"**: обновляет button_config текстом/цветом победителя, завершает тест

### Bug Fixes (Mar-Apr 2026)
- SeoHead.jsx TDZ error, CORS analytics, /api/content/calculator 404
- **Mobile catalog download**: Заменён window.open/link.click на window.location.href (popup blocking fix)
- **PDF Polish chars**: Шрифт Helvetica → Inter TTF (полная поддержка ł, ą, ę, ż, ź, ć, ń)
- **Admin upload URL fix** (Apr 1 2026): Исправлен двойной домен в URL при загрузке через админку (14 мест в 10 компонентах)

## Key API Endpoints
- GET /api/images/{id}?w=&q= — server-side resize + WebP via Pillow (302 redirect to Cloudinary if available)
- GET /api/videos/{filename} — 302 redirect to Cloudinary if available
- GET /api/settings/bulk — cached, includes stock_saunas + catalog
- GET /api/settings/main-landing — returns sauna/balia images, videos, positions
- GET /api/balia/bulk — cached
- GET /api/sauna/public-models — cached 5min
- GET /api/settings/seo — SEO settings
- POST /api/admin/run-cloudinary-migration — manual migration trigger
- POST /api/admin/ab/tests/{test_id}/apply-winner — apply A/B test winner

## Backlog
- P2: Toast обработка ошибок
- P4: Рефакторинг server.py → модули (3800+ строк)
- P4: Декомпозиция Calculator.jsx

## Known Issues
- 6 видео не мигрировали в Cloudinary (2 слишком больших — 413, 4 невалидных формата). Требуется ручная загрузка через панель Cloudinary.
