# WM-Sauna Website - Product Requirements Document

## Project Overview
Modern responsive website for WM-Sauna - Polish wooden sauna manufacturer and seller.
**Main Goal:** Motivate customers to calculate sauna price and place an order.
**Style:** Minimalism, light wood, white background (#F9F9F7), black (#1A1A1A) and gold (#C6A87C) accents.

## Architecture
- **Frontend:** React 19, Tailwind CSS, Framer Motion, Shadcn/UI, react-helmet-async
- **Backend:** FastAPI (Python), MongoDB (motor)
- **External API:** wm-kalkulator.pl (prices, models, calculator)

### Key Files
- `/app/frontend/src/App.js` — Main entry
- `/app/frontend/src/components/` — All UI components
- `/app/frontend/src/pages/AdminPanel.jsx` — Admin panel (Russian UI)
- `/app/backend/server.py` — All API endpoints

## Implemented Features (All tested)
- [x] Hero section with CTAs + **catalog download button**
- [x] Social proof counters
- [x] Models showcase with gallery, order buttons
- [x] Model comparison (up to 3 models)
- [x] **Two-column calculator/configurator** (models+photo left, options right)
- [x] Gallery with custom + API photo management
- [x] Stock saunas with import from catalog
- [x] Customer reviews with star ratings
- [x] FAQ section with JSON-LD schema
- [x] About company section
- [x] Contact form with notifications + **catalog download after submission**
- [x] **Sticky CTA bar** with catalog download button
- [x] Floating WhatsApp/Phone button
- [x] SEO optimization (meta tags, OG, JSON-LD)
- [x] Multi-language (PL/EN)
- [x] Responsive design
- [x] Full admin panel (Russian)
- [x] Telegram notifications (3 types: contact, model_inquiry, calculator_order)
- [x] AMO CRM integration (API key auth, pipelines, field mapping, test lead)
- [x] **PDF Catalog management** — admin upload, auto-show download buttons across site

## PDF Catalog Feature
- **Admin:** Upload/replace/delete PDF via "Каталог" tab
- **Backend:** POST /api/admin/catalog/upload, GET /api/catalog/download, GET /api/catalog/info, DELETE /api/admin/catalog
- **Frontend buttons appear automatically when catalog is uploaded:**
  - Hero section (next to OBLICZ CENĘ)
  - Sticky CTA bar (next to calculator button)
  - Contact form (after submission thank-you)
  - Models inquiry form (after submission thank-you)
  - Calculator inquiry form (after submission thank-you)

## Credentials
- Admin: `/admin` | login: `admin` | password: `220066`

## Backlog
- [ ] P1: Refactor AdminPanel.jsx into smaller components (>3400 lines)
- [ ] P1: Full i18next integration for static UI strings
- [ ] P2: Improve frontend API error handling (toast notifications)
- [ ] P3: A/B testing for CTA buttons
