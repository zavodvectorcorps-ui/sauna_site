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
- [x] Social proof counters
- [x] Models showcase with gallery, configure/order buttons
- [x] Model comparison (up to 3 models)
- [x] Interactive sauna calculator (API proxy with caching)
- [x] Gallery with custom + API photo management
- [x] Stock saunas section with import from catalog
- [x] Customer reviews with star ratings
- [x] FAQ section with JSON-LD schema for SEO
- [x] About company section
- [x] Contact form with notifications
- [x] Sticky CTA bar
- [x] Floating WhatsApp/Phone button
- [x] SEO optimization (meta tags, OG, JSON-LD)
- [x] Multi-language (PL/EN)
- [x] Responsive design
- [x] Full admin panel (Russian)
- [x] **Telegram notifications** — 3 types: contact, model_inquiry, calculator_order
- [x] **AMO CRM integration** — API key auth, pipeline/status selection, field mapping, test lead
- [x] **Notification system** — all forms (contact, models, calculator) send to Telegram + AMO CRM with type badges in admin

## Notification Types
| Source | type | Telegram Format | AMO CRM Lead Name |
|---|---|---|---|
| Contact form | `contact` | Сообщение с сайта | WM-Sauna: Запрос с сайта |
| Model card | `model_inquiry` | Заявка на модель | WM-Sauna: {model} |
| Calculator | `calculator_order` | Заказ из калькулятора (+ variant, options) | WM-Sauna: {model} ({variant}) |

## Admin Panel Tabs
Сообщения (with type badges), Оформление, Кнопки, Тексты, Hero, О компании, Счётчики, Модели, Галерея, Фото из API, В наличии, Калькулятор, Отзывы, FAQ, Контакты, SEO, Интеграции, Порядок

## AMO CRM Integration
- Auth: Long-lived API key (no OAuth)
- Steps: Domain + Key → Pipeline/Status → Field Mapping → Test Lead
- Backend: `/api/admin/amocrm/status`, `/pipelines`, `/users`, `/fields`, `/test-amocrm`, `/test-amocrm-lead`

## Key DB Collections
- `settings`: Key-value store for all config
- `stock_saunas`: CRUD items for in-stock section
- `contact_forms`: Contact submissions (with `type` field)

## Credentials
- Admin: `/admin` | login: `admin` | password: `220066`

## Backlog
- [ ] P1: Refactor AdminPanel.jsx into smaller components (>3300 lines)
- [ ] P1: Full i18next integration for static UI strings
- [ ] P2: Improve frontend API error handling (toast notifications)
- [ ] P3: A/B testing for CTA buttons
