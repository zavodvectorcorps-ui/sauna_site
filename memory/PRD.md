# WM-Sauna Website - Product Requirements Document

## Project Overview
Modern responsive website for WM-Sauna - Polish wooden sauna manufacturer and seller.

**Main Goal:** Motivate customers to calculate sauna price and place an order.

**Style:** Minimalism, light wood, white background (#F9F9F7), black (#1A1A1A) and gold (#C6A87C) accents.

## Architecture

### Tech Stack
- **Frontend:** React 19, Tailwind CSS, Framer Motion, Shadcn/UI components
- **Backend:** FastAPI (Python)
- **Database:** MongoDB
- **External API:** wm-kalkulator.pl (prices and calculator data)

### Key Files
- `/app/frontend/src/App.js` - Main application entry
- `/app/frontend/src/components/` - All UI components
- `/app/frontend/src/context/LanguageContext.js` - Multi-language support (PL/EN only)
- `/app/frontend/src/pages/AdminPanel.jsx` - Admin panel (Russian UI)
- `/app/backend/server.py` - API endpoints

## User Personas
1. **Polish Homeowners** - Looking for premium garden saunas
2. **Price-conscious Buyers** - Want to calculate costs before purchase
3. **International Clients (EN)** - Need English translations

## Core Requirements (Static)
- [x] Hero section with background image and CTAs
- [x] Interactive sauna calculator (API integration)
- [x] Gallery with filters (Wszystkie/Kwadro/Beczka) - Horizontal slider
- [x] Stock saunas section - Horizontal slider on mobile
- [x] Customer reviews with star ratings
- [x] About company section
- [x] Contact form with validation
- [x] Multi-language support (PL/EN) - RU removed from public site
- [x] Mobile responsive design
- [x] Glassmorphism header on scroll
- [x] Admin panel with Russian interface

## What's Been Implemented

### Latest Updates (2026-02-11)
1. **Removed RU from site** - Language switcher now shows only PL | EN
2. **Admin panel translated to Russian** - Complete Russian interface:
   - Login: Панель администратора, Логин, Пароль, Войти
   - Menu: Сообщения, Настройки, Hero, О компании, Калькулятор, Отзывы, Галерея, Секции
   - All buttons, labels, and messages in Russian
3. **Gallery as horizontal slider** - Desktop and mobile use same horizontal slider layout
4. **Calculator improvements** - Full prices displayed (11 331 PLN instead of 11k)

### Frontend Components
1. **Header.jsx** - Sticky navigation with glassmorphism, PL/EN language switcher
2. **Hero.jsx** - Full-screen hero with animated CTAs
3. **Calculator.jsx** - Multi-step calculator wizard, API integration, full price display
4. **Gallery.jsx** - Horizontal slider with lightbox and category filters
5. **StockSaunas.jsx** - Horizontal slider on mobile, product cards with pricing
6. **Reviews.jsx** - Customer testimonials with avatars
7. **About.jsx** - Company info with feature highlights
8. **Contact.jsx** - Form with validation, contact info
9. **Footer.jsx** - Links, social media, company details

### Admin Panel (`/admin`)
- **Login:** admin / 220066
- **Features:**
  - Сообщения (Messages) - View and manage contact form submissions
  - Настройки (Settings) - Company info, contacts, social links
  - Hero - Background image, titles (PL/EN)
  - О компании (About) - Image, text paragraphs (PL/EN)
  - Калькулятор (Calculator) - Enable/disable models and options
  - Отзывы (Reviews) - CRUD for customer reviews
  - Галерея (Gallery) - Image management with upload
  - Секции (Sections) - Reorder homepage sections

### Backend Endpoints
- `GET /api/` - Health check
- `GET /api/health` - Status
- `POST /api/contact` - Submit contact form
- `GET /api/sauna/prices` - Proxy to wm-kalkulator.pl API
- `GET /api/settings/*` - Get site settings
- `POST /api/admin/*` - Admin CRUD operations

### Design System
- Colors: Gold primary (#C6A87C), Black (#1A1A1A), Off-white (#F9F9F7)
- Fonts: Montserrat (headings), Lato (body), Playfair Display (accent)
- Sharp edges (no rounded corners) for premium feel
- Generous spacing (8-12rem between sections)

## Prioritized Backlog

### P0 (Critical) - DONE
- [x] Homepage with all sections
- [x] Calculator integration
- [x] Contact form
- [x] Mobile responsiveness
- [x] Admin panel with Russian UI
- [x] Gallery horizontal slider

### P1 (High Priority)
- [ ] Error handling for external API failures (show user-friendly messages)
- [ ] Full i18n implementation (currently only language context exists)
- [ ] SEO optimization (meta tags, sitemap)
- [ ] Email notifications for contact form submissions
- [ ] Telegram integration for instant notifications

### P2 (Medium Priority)
- [ ] AMO CRM integration
- [ ] PDF generation for quotes
- [ ] Analytics integration
- [ ] Image optimization
- [ ] API response caching

### P3 (Low Priority)
- [ ] Blog/News section
- [ ] FAQ section
- [ ] Live chat widget

## Known Issues
1. **External API Dependency** - Calculator relies on wm-kalkulator.pl which can be temporarily unavailable (Cloudflare 520 errors). Currently shows generic error message.

## URLs
- **Frontend:** https://sauna-shop.preview.emergentagent.com
- **Admin Panel:** https://sauna-shop.preview.emergentagent.com/admin
- **Backend API:** https://sauna-shop.preview.emergentagent.com/api
- **External Calculator API:** https://wm-kalkulator.pl/api/sauna/prices
