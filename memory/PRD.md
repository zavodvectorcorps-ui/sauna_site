# WM Group — PRD

## Architecture
- Frontend: React + TailwindCSS + Framer Motion + Shadcn UI
- Backend: FastAPI + MongoDB
- Admin: Basic Auth (admin / 220066)

## Implemented Features

### Core
- Каталог саун с калькулятором, каталог купелей с конфигуратором
- Главная WM Group, "7 фактов", админ-панель (35+ вкладок)

### Content Marketing (Feb 2026)
- Блог: 14 SEO-статей, react-markdown, CRUD админка
- B2B: /b2b — hero, 8 преимуществ, финансы, лизинг, "Почему WM Group", галерея фото/видео, форма + админка
- WhatsApp: глобальная кнопка + админка
- Видео-обзоры: YouTube секция на /sauny + админка
- FAQ: Сауны 13, Купели 11 вопросов
- GlobalHeader на Blog/B2B/Article страницах
- **Процесс заказа**: 5 шагов на /sauny и /balie + админка

### Mobile UX (Mar 2026)
- **Горизонтальный скролл на мобильных** для 4 блоков: Спецпредложение, Преимущества, Видео-обзоры, Отзывы
- Навигация стрелками (< >) под каждой каруселью
- Snap-точки для плавного свайпа

### Section Visibility System (Mar 2026)
- **Видимость секций Desktop/Mobile** — тумблеры в админке для саун (17 блоков) и купелей (15 блоков)
- API: GET/PUT /api/settings/visibility
- Применение CSS-классов `hidden md:block` / `block md:hidden` / `hidden` на фронтенде

### Media URL Portability (Mar 2026)
- **resolveMediaUrl** хелпер — автоматическое преобразование относительных путей (/api/images/xxx) в полные URL
- Миграция всех старых абсолютных URL в БД на относительные пути
- Компоненты: Hero, BalieHero, MainLanding, SaunaInstallment обновлены

### Bug Fixes
- PNG, Галерея, Диакритики, Гарантия 24 мес, Hero переход
- Фоновые медиа: миграция хардкод-URL из БД на относительные

## Key Components
- `/app/frontend/src/lib/utils.js` — resolveMediaUrl helper
- `/app/frontend/src/components/OrderProcess.jsx` — процесс заказа
- `/app/frontend/src/components/admin/OrderProcessAdmin.jsx` — админка процесса
- `/app/frontend/src/components/GlobalHeader.jsx`
- `/app/frontend/src/components/WhatsAppButton.jsx`
- `/app/frontend/src/pages/B2BPage.jsx`
- `/app/frontend/src/components/admin/SaunaCatalogSectionsAdmin.jsx` — порядок + видимость саун
- `/app/frontend/src/components/admin/BaliaContentAdmin.jsx` — контент + видимость купелей

## Key API Endpoints
- GET/PUT `/api/settings/visibility` — видимость секций
- GET/PUT `/api/admin/settings/sections` — порядок секций
- GET/PUT `/api/admin/settings/visibility` — обновление видимости (admin)

## Backlog
- P1: i18next мультиязычность (PL/RU/EN)
- P2: Toast обработка ошибок (глобальная)
- P3: A/B тестирование CTA
- P4: Рефакторинг server.py (>2500 строк) — вынесение в отдельные роуты
- P4: Разбиение Calculator.jsx
