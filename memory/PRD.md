# WM-Sauna & WM-Balia — PRD

## Original Problem Statement
Объединённый сайт для WM Group (WM-Sauna + WM-Balia). Общая главная страница с выбором продуктовой линейки, отдельные страницы для саун и купелей с полным функционалом.

## Architecture
```
/               → MainLanding (выбор: Sauny / Balie)
/sauny          → Полный сайт саун (Hero, Models, Calculator, etc.)
/balie          → Страница купелей (Hero, Features, Products, Testimonials, Contact)
/balie/konfigurator → Конфигуратор купелей
/admin          → Админ-панель
/admin/pipeline → Воронка AMO CRM
```

## Core Features
### Sauny (existing)
- Все ранее реализованные функции (калькулятор, PDF, фильтры, промо-блоки, специальное предложение)
- Интеграции: Telegram, AMO CRM

### Balie (new)
- Hero section с динамическим контентом из БД
- Features section (гарантия, ручная работа, эко, доставка)
- Products section (из MongoDB, управляется через API)
- Testimonials (из MongoDB, карусель с навигацией)
- Contact form (отправляет заявки через /api/contact)
- Конфигуратор (модели из wm-kalkulator.pl API, опции, sticky price bar)

## Backend API — Balia endpoints
- GET/POST /api/balia/products — CRUD продуктов
- DELETE /api/balia/products/{id}
- GET/POST /api/balia/testimonials — CRUD отзывов
- DELETE /api/balia/testimonials/{id}
- GET/POST /api/balia/content — Контент страницы
- GET/POST /api/balia/configurator-settings — Настройки конфигуратора
- GET /api/balia/calculator/prices — Прокси к wm-kalkulator.pl
- POST /api/balia/calculator/generate-pdf — Генерация PDF

## MongoDB Collections (Balia)
- balia_products
- balia_testimonials
- balia_content
- balia_configurator_settings

## Admin Credentials
- Login: admin | Password: 220066

## Implemented (Latest Session)
- Fixed PipelineView auth bug (login form + localStorage)
- Added CSV export for pipeline
- Added model filters, dual pricing, VAT text, ready-sauna badges
- Added PromoFeatures, PromoBanner, SpecialOffer sections
- **Merged Balia project**: MainLanding, BalieLandingPage, BalieConfigurator, all backend endpoints
- Added demo products and testimonials for Balie

## Backlog
### P1
- Refactor AdminPanel.jsx (add Balia management tabs)
- i18next integration (PL/RU/EN)
- Cloudinary integration for Balie gallery

### P2
- Frontend API error handling (toasts)
- Balie admin panel (products, testimonials, configurator settings management)

### P3
- A/B testing CTA buttons
