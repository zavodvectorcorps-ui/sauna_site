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
- `/app/frontend/src/context/LanguageContext.js` - Multi-language support
- `/app/backend/server.py` - API endpoints

## User Personas
1. **Polish Homeowners** - Looking for premium garden saunas
2. **Price-conscious Buyers** - Want to calculate costs before purchase
3. **International Clients** - Need EN/RU translations

## Core Requirements (Static)
- [x] Hero section with background image and CTAs
- [x] Interactive sauna calculator (API integration)
- [x] Gallery with filters (Wszystkie/Kwadro/Beczka)
- [x] Stock saunas section
- [x] Customer reviews with star ratings
- [x] About company section
- [x] Contact form with validation
- [x] Google Maps integration
- [x] Multi-language support (PL/EN/RU)
- [x] Mobile responsive design
- [x] Glassmorphism header on scroll

## What's Been Implemented (2026-02-11)

### Frontend Components
1. **Header.jsx** - Sticky navigation with glassmorphism, language switcher
2. **Hero.jsx** - Full-screen hero with animated CTAs
3. **Calculator.jsx** - Multi-step calculator wizard, API integration
4. **Gallery.jsx** - Image grid with lightbox and category filters
5. **StockSaunas.jsx** - Product cards with pricing and discounts
6. **Reviews.jsx** - Customer testimonials with avatars
7. **About.jsx** - Company info with feature highlights
8. **Contact.jsx** - Form with validation, contact info, Google Maps
9. **Footer.jsx** - Links, social media, company details

### Backend Endpoints
- `GET /api/` - Health check
- `GET /api/health` - Status
- `POST /api/contact` - Submit contact form (with validation)
- `GET /api/contact` - Get all submissions
- `GET /api/sauna/prices` - Proxy to wm-kalkulator.pl API

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

### P1 (High Priority)
- [ ] Email notifications for contact form submissions
- [ ] Telegram integration for instant notifications
- [ ] AMO CRM integration (as per user request)
- [ ] PDF generation for quotes
- [ ] SEO optimization (meta tags, sitemap)

### P2 (Medium Priority)
- [ ] Analytics integration (Google Analytics/Plausible)
- [ ] Admin panel for managing reviews
- [ ] Stock availability indicator from inventory
- [ ] Image optimization (WebP, lazy loading improvements)
- [ ] Cookie consent banner

### P3 (Low Priority)
- [ ] Blog/News section
- [ ] FAQ section
- [ ] Live chat widget
- [ ] Social proof popups

## Next Tasks
1. Configure email sending for contact form (Resend/SendGrid)
2. Set up Telegram bot for new inquiry notifications
3. Implement AMO CRM webhook integration
4. Add proper SEO meta tags and Open Graph data
5. Create sitemap.xml and robots.txt

## URLs
- **Frontend:** https://sauna-calculator-2.preview.emergentagent.com
- **Backend API:** https://sauna-calculator-2.preview.emergentagent.com/api
- **External Calculator API:** https://wm-kalkulator.pl/api/sauna/prices
