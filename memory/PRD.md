# WM Group — PRD

## Architecture
- Frontend: React 19 + react-scripts 5 + CRACO + TailwindCSS 3 + Framer Motion + Shadcn UI
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

### PageSpeed Critical Path Optimization (Apr 1 2026)
- **SettingsProvider**: Removed full-screen loading spinner — children render IMMEDIATELY with defaults
- **React.lazy ALL below-fold sections**: SocialProof, Models, Calculator, Gallery, StockSaunas, Reviews, FAQ, About, Contact, PromoFeatures, PromoBanner, SpecialOffer, SaunaInstallment, SaunaAdvantages, SaunaVideoReviews, OrderProcess, WhatsAppButton, CookieConsentBanner
- **Route-level code splitting**: MainLanding, BlogPage, BlogArticlePage, B2BPage, BalieLandingPage, BalieConfigurator, AdminPanel, PipelineView, PrivacyPolicyPage, CookiePolicyPage
- **Suspense fallback skeletons**: Fixed-height divs prevent CLS during lazy load
- **PostHog deferred**: requestIdleCallback — no longer blocks LCP
- **Google Fonts async**: media="print" onload="this.media='all'" + font-display: optional
- **Layout settings non-blocking**: Applied via requestIdleCallback, CSS defaults pre-set in :root
- **Cookie banner delayed 3.5s**: Prevents it from becoming LCP element
- **Webpack splitChunks**: react-vendor, ui-vendor (framer-motion, radix, recharts) separate chunks
- **Preconnect**: res.cloudinary.com, fonts.googleapis.com, wm-sauna-balia.emergent.host
- **LCP image**: fetchpriority="high", loading="eager", preload in HTML
- **ProductCard**: aspect-ratio instead of min-height for CLS stability
- **Hero animations disabled on first paint**: initial={false} on ProductCard
- **Playfair Display font removed**: Reduced font weight
- **Semantic HTML**: <main> landmark added

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

## Key API Endpoints
- GET /api/images/{id}?w=&q= — resize + WebP (302 to Cloudinary)
- GET /api/settings/bulk — all settings in one request
- GET /api/sitemap.xml — dynamic sitemap
- POST /api/admin/settings/stock-cta-config — stock CTA config

## Backlog
- P2: Toast обработка ошибок
- P4: Рефакторинг server.py → модули (3900+ строк)
- P4: Декомпозиция Calculator.jsx

## Known Issues
- 6 видео не мигрировали в Cloudinary (2 слишком больших, 4 невалидных)
