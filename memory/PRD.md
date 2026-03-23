# WM-Sauna Website - Product Requirements Document

## Project Overview
Modern responsive website for WM-Sauna - Polish wooden sauna manufacturer and seller.

**Main Goal:** Motivate customers to calculate sauna price and place an order.

**Style:** Minimalism, light wood, white background (#F9F9F7), black (#1A1A1A) and gold (#C6A87C) accents.

## Architecture

### Tech Stack
- **Frontend:** React 19, Tailwind CSS, Framer Motion, Shadcn/UI, react-helmet-async
- **Backend:** FastAPI (Python)
- **Database:** MongoDB
- **External API:** wm-kalkulator.pl (prices and calculator data)

### Key Files
- `/app/frontend/src/App.js` - Main application entry (HelmetProvider)
- `/app/frontend/src/components/` - All UI components
- `/app/frontend/src/components/SeoHead.jsx` - SEO meta tags + JSON-LD
- `/app/frontend/src/components/Models.jsx` - Models showcase section
- `/app/frontend/src/context/LanguageContext.js` - Multi-language support (PL/EN only)
- `/app/frontend/src/pages/AdminPanel.jsx` - Admin panel (Russian UI)
- `/app/backend/server.py` - API endpoints

## User Personas
1. **Polish Homeowners** - Looking for premium garden saunas
2. **Price-conscious Buyers** - Want to calculate costs before purchase
3. **International Clients (EN)** - Need English translations

## Core Requirements
- [x] Hero section with background image and CTAs
- [x] **Models showcase section** - Cards from API with gallery, configure/order buttons
- [x] Interactive sauna calculator (API integration)
- [x] Gallery with custom + API photo management
- [x] Stock saunas section with **import from catalog** feature
- [x] Customer reviews with star ratings
- [x] About company section
- [x] Contact form with validation
- [x] Multi-language support (PL/EN)
- [x] Mobile responsive design
- [x] Glassmorphism header on scroll
- [x] Admin panel with Russian interface
- [x] **SEO optimization** (meta tags, OG, JSON-LD, admin management)

## Admin Panel Features
- [x] Messages management
- [x] Layout/spacing settings
- [x] Button configuration (anchors, links, forms)
- [x] Section text editing (PL/EN) for all sections
- [x] Hero section editing
- [x] About section editing
- [x] **Models showcase management** (toggle, texts PL/EN, model selection)
- [x] Gallery management (custom uploads + API photo toggle)
- [x] **Stock saunas CRUD + Import from catalog**
- [x] Calculator settings
- [x] Reviews management
- [x] Contact info management
- [x] **SEO settings** (title, description, keywords PL/EN, OG image, canonical URL)
- [x] Section order management

## Key DB Collections
- `settings`: Key-value store for all configs
  - `models_config`: enabled_models[], show_section
  - `models_content`: title/subtitle PL/EN
  - `seo_settings`: title/description/keywords PL/EN, og_image, canonical_url
  - `section_order`: sections array (includes "models")
  - `button_config`, `layout_settings`, `section_texts`, `gallery_settings_v2`, etc.
- `stock_saunas`: CRUD items for "in stock" section
- `messages`: Contact form submissions

## Key API Endpoints
- `GET /api/settings/models` - Models config (public)
- `GET /api/settings/models-content` - Models texts (public)
- `GET /api/settings/seo` - SEO settings (public)
- `PUT /api/admin/settings/models` - Update models config
- `PUT /api/admin/settings/models-content` - Update models texts
- `PUT /api/admin/settings/seo` - Update SEO settings
- `POST /api/admin/stock-saunas` - Create stock sauna (used by import)

## Credentials
- Admin: `/admin` | login: `admin` | password: `220066`

## Backlog
- [ ] P1: Full i18next integration for UI strings
- [ ] P2: Email/Telegram notifications for new inquiries
- [ ] P3: AMO CRM integration
- [ ] P3: Refactor AdminPanel.jsx into smaller components
