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
- `/app/frontend/src/App.js` — Main entry (HelmetProvider, all sections)
- `/app/frontend/src/components/` — All UI components
- `/app/frontend/src/pages/AdminPanel.jsx` — Admin panel (Russian UI)
- `/app/backend/server.py` — All API endpoints

## Implemented Features (All tested)
- [x] Hero section with CTAs
- [x] **Social proof counters** — animated stats after hero (500+ саун, 98%, 10+ лет, 5-10 дней)
- [x] **Models showcase** — cards from API with gallery, configure/order buttons
- [x] **Model comparison** — select up to 3 models, floating bar, side-by-side table
- [x] Interactive sauna calculator (API proxy with caching)
- [x] Gallery with custom + API photo management
- [x] Stock saunas section with **import from catalog**
- [x] Customer reviews with star ratings
- [x] **FAQ section** — accordion Q&A with JSON-LD schema for SEO
- [x] About company section
- [x] Contact form
- [x] **Sticky CTA bar** — "Oblicz cenę sauny" appears on scroll
- [x] **Floating WhatsApp/Phone button** — quick contact widget
- [x] **SEO optimization** — meta tags, OG, JSON-LD (LocalBusiness + FAQPage)
- [x] Multi-language (PL/EN)
- [x] Responsive design
- [x] Full admin panel (Russian)
- [x] **Telegram notifications** — sends to configured bot/chat on new leads
- [x] **AMO CRM OAuth2 integration** — full OAuth flow, auto token refresh, lead creation, dropdown selectors for pipelines/statuses/users/fields after connection

## Admin Panel Tabs
Сообщения, Оформление, Кнопки, Тексты, Hero, О компании, Счётчики, Модели, Галерея, Фото из API, В наличии, Калькулятор, Отзывы, FAQ, Контакты, SEO, **Интеграции**, Порядок

## AMO CRM Integration (New)
### Backend Endpoints:
- `GET /api/admin/amocrm/callback` — OAuth2 callback, exchanges code for tokens
- `GET /api/admin/amocrm/status` — Check connection status
- `GET /api/admin/amocrm/pipelines` — Fetch pipelines with statuses
- `GET /api/admin/amocrm/users` — Fetch CRM users
- `GET /api/admin/amocrm/fields?entity=leads|contacts` — Fetch custom fields
- `POST /api/admin/test-amocrm` — Test connection to AMO CRM
### Frontend Flow:
1. Step 1: Enter domain, Client ID, Client Secret, copy Redirect URI
2. Step 2: Click OAuth button → popup → auto-detect token on popup close
3. Step 3: Select pipeline/status/user from dropdowns (loaded from AMO API)
4. Step 4: Select field mapping from dropdowns (loaded from AMO API)
- Falls back to manual ID inputs when AMO is not connected

## Key DB Collections
- `settings`: Key-value store — `models_config`, `models_content`, `seo_settings`, `faq_settings`, `social_proof_settings`, `section_order`, `button_config`, `layout_settings`, `integration_settings`, etc.
- `stock_saunas`: CRUD items for in-stock section
- `messages`: Contact form submissions

## Credentials
- Admin: `/admin` | login: `admin` | password: `220066`

## Backlog
- [ ] P1: Refactor AdminPanel.jsx into smaller components (>3200 lines)
- [ ] P1: Full i18next integration for static UI strings
- [ ] P2: Improve frontend API error handling (toast notifications)
- [ ] P3: A/B testing for CTA buttons
