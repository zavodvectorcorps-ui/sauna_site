# WM Group — PRD

## Architecture
- Frontend: React + TailwindCSS + Framer Motion + Shadcn UI
- Backend: FastAPI + MongoDB + Emergent Object Storage + GPT-4.1-nano (translation)
- Admin: Basic Auth (admin / 220066)

## Implemented Features

### Core
- Каталог саун с калькулятором, каталог купелей с конфигуратором
- Главная WM Group, "7 фактов", админ-панель (40+ вкладок)

### Content Marketing
- Блог: 14 SEO-статей, react-markdown, CRUD админка
- B2B: /b2b — hero, 8 преимуществ, финансы, лизинг, галерея фото/видео, форма + админка
- WhatsApp: глобальная кнопка + админка
- Видео-обзоры: YouTube секция на /sauny + админка
- FAQ: Сауны 13, Купели 11 вопросов
- Процесс заказа: 5 шагов на /sauny и /balie + админка

### Mobile UX
- Горизонтальный скролл, peek-эффект, автоскролл карточек

### Section Visibility System
- Тумблеры Desktop/Mobile в админке для саун (17 блоков) и купелей (15 блоков)

### Object Storage
- Emergent Object Storage для персистентного хранения медиа (36 фото + 46 видео)

### Multilingual UI
- 4 языка: PL, EN, DE, CS. GPT-4.1-nano автоперевод с MongoDB кэшем

### Performance Optimization
- **Bulk Settings Endpoint**: `GET /api/settings/bulk` — все 32+ настройки одним запросом
- **GZip Middleware**: сжатие ответов >500 байт (52KB → 21KB)
- **21 компонент** используют `getSetting()` из контекста (было ~30 HTTP запросов → 1)

### Hero Badges & Button Config
- 3 бейджа редактируются в админке (Сауны > Hero)
- Кнопки Hero читают action/target/text из `button_config` в БД

### AmoCRM Catalog Pipeline
- Отдельная воронка для заявок на скачивание каталога
- `amocrm_catalog_pipeline_id` и `amocrm_catalog_status_id`

### Analytics & Conversion Tracking (Mar 2026) — COMPLETE
- **Встроенная аналитика**: page_view, click_cta, generate_lead, catalog_download
- **Дашборд**: визиты, клики CTA, заявки, конверсия %, график по дням, воронка конверсий
- **Разбивка заявок**: контакт, калькулятор, запрос модели, каталог
- **UTM-трекинг**: автоматический захват utm_source/medium/campaign, таблица источников
- **Google Tag Manager**: инъекция GTM-контейнера из админки
- **Google Analytics 4**: standalone GA4 или через GTM
- **Google Ads**: конверсии отправляются автоматически при generate_lead/catalog_download
- **Facebook/Meta Pixel**: Lead-события при отправке форм, PageView при навигации
- **Custom head code**: произвольный HTML/JS в <head> (верификация домена и т.д.)
- **Настройка в админке**: АНАЛИТИКА → Дашборд / Коды трекинга

### CatalogFormGate Modal Fix
- z-index: 9999, overflow-y-auto, my-auto для корректного центрирования

## Key API Endpoints
- `GET /api/settings/bulk` — Все настройки одним запросом
- `POST /api/analytics/event` — Сбор событий аналитики
- `GET /api/admin/analytics/summary` — Дашборд аналитики (auth)
- `GET /api/settings/tracking` / `PUT /api/admin/settings/tracking` — Настройки трекинга
- `POST /api/translate` — Auto-translation
- `POST /api/contact` — Обработка заявок (contact, catalog_request, calculator_order, model_inquiry)

## Backlog
- P2: Toast обработка ошибок (глобальная)
- P3: A/B тестирование CTA
- P4: Рефакторинг server.py (>2800 строк) → отдельные роуты
- P4: Разбиение Calculator.jsx
