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
**App.js** (clean, validated):
- ALL 14 routes lazy-loaded via React.lazy
- Only 7 sync imports: React, CSS, Router, Helmet, 3 context providers
- PageSkel (dark) + LightSkel (light) — valid JSX with data-testid, fixed minHeight
- AdminPanel, BlogPage, B2BPage — strictly lazy, never in initial bundle

**index.html** (production-clean):
- REMOVED: debug-monitor.js, cdn.tailwindcss.com, iframe detection code
- KEPT: emergent-main.js (platform required), PostHog via requestIdleCallback
- LCP image preloaded (Cloudinary CDN URL)
- Fonts async (media="print" trick, font-display: optional)
- CSS variables for layout spacing pre-set in :root

**Hero.jsx**: framer-motion REMOVED — pure CSS, fetchPriority="high", width/height on bg image
**CookieConsentBanner**: framer-motion REMOVED — CSS transitions (translate-y + opacity)
**MainLanding BelowFold**: IntersectionObserver scroll-triggered, 1500px skeleton fallback
**Footer inside BelowFold**: Prevents CLS (no element shifts below fold content)
**Default images**: Cloudinary production URLs (no Unsplash fallbacks)

### SEO
- Dynamic sitemap.xml: GET /api/sitemap.xml (8 static + 14 blog articles)
- robots.txt (static in public/)
- OG-картинка optimized (w=1200, q=80)

### A/B Testing System — COMPLETE
### Stock Sauna Product Cards — COMPLETE

## Key API Endpoints
- GET /api/images/{id}?w=&q= — resize + WebP (302 to Cloudinary)
- GET /api/settings/bulk — all settings in one request
- GET /api/settings/main-landing — main page images/videos
- GET /api/sitemap.xml — dynamic sitemap

## Backlog
- P2: Toast обработка ошибок
- P4: Рефакторинг server.py → модули (3900+ строк)
- P4: Декомпозиция Calculator.jsx
- P5: Tailwind warning `duration-[1.2s]` → `duration-[1200ms]`

## Known Issues
- 6 видео не мигрировали в Cloudinary (2 слишком больших, 4 невалидных)
