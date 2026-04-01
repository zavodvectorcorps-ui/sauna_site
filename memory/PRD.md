# WM Group — PRD

## Architecture
- Frontend: React 19 + react-scripts 5 + CRACO + TailwindCSS 3 + Framer Motion (lazy only) + Shadcn UI
- Backend: FastAPI + MongoDB + **Cloudinary CDN** + Pillow + GPT-4.1-nano
- Media: **Cloudinary** (primary, CDN delivery) + Emergent Object Storage (legacy fallback)
- Admin: Basic Auth (admin / 220066)

## Implemented Features

### Core
- Каталог саун с калькулятором, каталог купелей с конфигуратором
- Главная WM Group, "7 фактов", админ-панель (40+ вкладок)
- Блог, B2B, WhatsApp, видео-обзоры, FAQ, процесс заказа

### Performance — FULLY OPTIMIZED (Apr 1 2026)
- **Server-side image optimization**: Pillow resize + WebP
- **Cloudinary CDN**: All images/videos, auto-migration on startup
- **Adaptive video quality**: Desktop w_1280, Mobile w_720, q_auto, f_auto
- **Video preloading**: programmatic el.load(), Cloudinary poster frames
- In-memory ImageCache (200 items, 1h TTL), GZip middleware

### PageSpeed Critical Path Optimization — DEEP REFACTOR (Apr 1 2026)
- **App.js**: ALL routes lazy-loaded via React.lazy — ZERO synchronous heavy imports
- **SaunaHomePage extracted**: Header, Hero, Footer moved to `/pages/SaunaHomePage.jsx` (lazy chunk)
- **Hero.jsx**: framer-motion REMOVED — pure CSS, explicit width/height on bg image, fetchPriority="high"
- **CookieConsentBanner**: framer-motion REMOVED — CSS transitions only
- **MainLanding BelowFold**: IntersectionObserver scroll-triggered loading — NO skeleton mismatch CLS
- **Footer inside BelowFold**: Prevents CLS (no element shifts below fold content)
- **LCP image preload**: Cloudinary URL preloaded in index.html
- **Default images**: Cloudinary production URLs (no Unsplash fallbacks)
- **Production data imported**: All 37 settings, reviews, blog, stock saunas, uploads from export
- **SettingsProvider**: Children render IMMEDIATELY with defaults
- **PostHog deferred**: requestIdleCallback
- **Google Fonts async**: media="print" onload="this.media='all'" + font-display: optional
- **Layout settings non-blocking**: Applied via requestIdleCallback, CSS defaults pre-set in :root
- **Cookie banner delayed 3.5s**: Prevents it from becoming LCP element
- **Webpack splitChunks**: react-vendor, ui-vendor (framer-motion, radix, recharts) separate chunks
- **Preconnect**: res.cloudinary.com, fonts.googleapis.com

### SEO
- Dynamic sitemap.xml: GET /api/sitemap.xml (8 static + 14 blog articles)
- robots.txt (static in public/)
- OG-картинка optimized (w=1200, q=80)

### A/B Testing System — COMPLETE
- Backend CRUD, Z-test statistical significance, apply winner button

### Stock Sauna Product Cards — COMPLETE (Apr 1 2026)
- Modal with gallery, description, specs, price, "Promocja" badge
- Configurable CTA button (5 action types) + order form

### Bug Fixes
- Mobile catalog download, PDF Polish chars, Admin upload URL double domain
- Unsplash fallback images replaced with Cloudinary production URLs

## Key API Endpoints
- GET /api/images/{id}?w=&q= — resize + WebP (302 to Cloudinary)
- GET /api/settings/bulk — all settings in one request
- GET /api/settings/main-landing — main page images/videos
- GET /api/sitemap.xml — dynamic sitemap
- POST /api/admin/settings/stock-cta-config — stock CTA config

## Backlog
- P2: Toast обработка ошибок
- P4: Рефакторинг server.py → модули (3900+ строк)
- P4: Декомпозиция Calculator.jsx
- P5: Tailwind warning `duration-[1.2s]` → `duration-[1200ms]`

## Known Issues
- 6 видео не мигрировали в Cloudinary (2 слишком больших, 4 невалидных)
