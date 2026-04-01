# WM Group — PRD

## Architecture
- Frontend: React 19 + react-scripts 5 + CRACO + TailwindCSS 3 + Framer Motion (lazy only) + Shadcn UI
- Backend: FastAPI + MongoDB + **Cloudinary CDN** + Pillow + GPT-4.1-nano
- Media: **Cloudinary** (primary, CDN delivery) + Emergent Object Storage (legacy fallback)
- Admin: Basic Auth (admin / 220066)

## PageSpeed Critical Path — FULLY OPTIMIZED (Apr 1 2026)

### App.js (clean router)
- ALL 14 routes lazy-loaded via React.lazy
- Only 7 sync imports: React, CSS, Router, Helmet, 3 lightweight context providers
- PageSkel (dark #0C0C0C) + LightSkel (light #F9F9F7): minHeight 100vh, data-testid
- AdminPanel, BlogPage, B2BPage — strictly lazy, never in initial bundle

### index.html (production-clean)
- REMOVED: debug-monitor.js, cdn.tailwindcss.com, iframe detection
- PostHog: requestIdleCallback with setTimeout(3000) fallback
- LCP image preloaded (Cloudinary CDN URL)
- Fonts: `display=swap` (Google Fonts URL) + async via media="print" trick
- CSS variables: `--section-padding-top/bottom: 80px` pre-set in :root

### CLS Prevention
- ProductCard: aspect-ratio 4/5, width=800 height=1000, fetchPriority=high on LCP
- Hero bg image: width=1200 height=800, fetchPriority=high, decoding=async
- BelowFold (MainLanding): scroll-triggered (IntersectionObserver), 1500px skeleton
- Footer inside BelowFold: no element shifts below fold
- CookieConsentBanner: position:fixed bottom:0, CSS transitions (no framer-motion)
- CSS vars: only updated if != 80px default (prevents DOM mutation when same)
- @font-face { font-display: swap } in App.css

### LCP Prevention
- Hero.jsx: ZERO framer-motion — pure CSS, instant content render
- MainLanding: no framer-motion, Cloudinary default images (no Unsplash)
- SaunaHomePage: Header/Hero/Footer sync, all sections lazy with Skel fallbacks
- Layout settings fetched via requestIdleCallback (never blocks first paint)

### Bundle Optimization
- Framer-motion: only in lazy chunks (SaunaHomePage, overlays)
- recharts, embla-carousel, @radix-ui: ui-vendor chunk (async only)
- react + react-dom: react-vendor chunk
- Cloudinary transforms: w_800/w_1200, q_auto, f_auto

## Implemented Features
- Каталог саун с калькулятором, каталог купелей с конфигуратором
- Главная WM Group, админ-панель (40+ вкладок), блог, B2B
- A/B Testing, Stock Sauna Product Cards (modal + order form)
- Dynamic sitemap.xml, Cloudinary CDN, adaptive video quality

## Key API Endpoints
- GET /api/settings/bulk — all settings
- GET /api/settings/main-landing — main page images/videos
- GET /api/settings/layout — section padding (deferred)
- GET /api/sitemap.xml — dynamic sitemap

## Backlog
- P2: Toast обработка ошибок
- P4: Рефакторинг server.py → модули (3900+ строк)
- P4: Декомпозиция Calculator.jsx
- P5: Tailwind warning `duration-[1.2s]` → `duration-[1200ms]`
