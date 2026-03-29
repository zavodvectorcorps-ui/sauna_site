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
- **Процесс заказа**: 5 шагов на /sauny и /balie (Zostaw kontakt → Dostarczymy) + админка

### Bug Fixes
- PNG, Галерея, Диакритики, Гарантия 24 мес, Hero переход

## Key Components
- `/app/frontend/src/components/OrderProcess.jsx` — процесс заказа (sauna/balia)
- `/app/frontend/src/components/admin/OrderProcessAdmin.jsx` — админка процесса
- `/app/frontend/src/components/GlobalHeader.jsx`
- `/app/frontend/src/components/WhatsAppButton.jsx`
- `/app/frontend/src/pages/B2BPage.jsx`

## Backlog
- P1: i18next мультиязычность (PL/RU/EN)
- P2: Toast обработка ошибок
- P3: A/B тестирование CTA
- P4: Рефакторинг server.py
