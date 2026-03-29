# WM Group — PRD (Product Requirements Document)

## Problem Statement
Объединённая платформа WM Group (WM-Sauna + WM-Balia) — премиум-сайт для продажи саун и купелей. Генератор органического трафика (блог), контент-маркетинг, B2B-раздел, WhatsApp-интеграция и видео-обзоры.

## Architecture
- Frontend: React + TailwindCSS + Framer Motion + Shadcn UI
- Backend: FastAPI + MongoDB
- Admin: Basic Auth (admin / 220066)

## What's Been Implemented

### Core Platform (Done)
- Каталог саун с калькулятором конфигурации
- Каталог купелей с конфигуратором
- Главная страница WM Group с навигацией
- Блок "7 фактов" (SaunaAdvantages) с анимацией
- Админ-панель (~30+ вкладок)

### Content Marketing (Done — Feb 2026)
- **Блог**: 14 SEO-статей (7 Sauny, 4 B2B, 3 Balie), react-markdown, полная админка CRUD
- **B2B раздел**: /b2b — hero, 8 преимуществ, финансовая секция, лизинг, "Почему WM Group", форма + админка
- **WhatsApp кнопка**: глобальная на всех страницах + админка настроек
- **Видео-обзоры**: секция YouTube на /sauny + админка
- **FAQ**: Сауны 13 вопросов, Купели 11 вопросов
- **GlobalHeader**: единый хедер на Blog, B2B, Article страницах (навигация + телефон + стрелка назад)
- **B2B ссылка**: выделена зелёным (#34D399) на главной "(Dla hoteli i pensjonatów)"

### Bug Fixes (Done)
- PNG в "7 фактах", Галерея, Диакритики, Гарантия 24 мес, Hero переход

## Key Components
- `/app/frontend/src/components/GlobalHeader.jsx` — общий хедер
- `/app/frontend/src/components/WhatsAppButton.jsx` — WhatsApp
- `/app/frontend/src/components/SaunaVideoReviews.jsx` — видео
- `/app/frontend/src/pages/B2BPage.jsx` — B2B страница
- `/app/frontend/src/pages/BlogPage.jsx` — блог
- `/app/frontend/src/components/admin/` — все админ-компоненты

## Prioritized Backlog

### P1
- Интеграция i18next для мультиязычности (PL/RU/EN)

### P2
- Улучшение обработки ошибок API (toast)

### P3
- A/B тестирование CTA-кнопок

### P4
- Рефакторинг server.py (>2400 строк)
- Разбиение Calculator.jsx
