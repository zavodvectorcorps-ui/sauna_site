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
- GlobalHeader на Blog/B2B/Article страницах
- Процесс заказа: 5 шагов на /sauny и /balie + админка

### Mobile UX (Mar 2026)
- Горизонтальный скролл для: Спецпредложение, Видео-обзоры, Отзывы, Преимущества/PromoFeatures
- Peek-эффект: видны краешки соседних карточек
- Автоскролл: карточки переключаются каждые 3.5-5 сек

### Section Visibility System (Mar 2026)
- Тумблеры Desktop/Mobile в админке для саун (17 блоков) и купелей (15 блоков)

### Object Storage (Mar 2026)
- Emergent Object Storage для персистентного хранения медиа
- 36 изображений + 46 видео мигрированы в облако

### Full Admin Coverage (Mar 2026)
- PromoBanner, BalieAbout, BalieContact, BalieInstallment, BalieGallery — все редактируются через админку

### Multilingual UI (Mar 2026)
- 4 языка: PL, EN, DE, CS с переключателем

### Auto-Translation (Mar 2026)
- GPT-4.1-nano через emergentintegrations с MongoDB кэшем

### Hero Badges Admin (Mar 2026)
- 3 текстовых бейджа редактируются в админке (Сауны > Hero)

### Performance Optimization (Mar 2026)
- **Bulk Settings Endpoint**: `GET /api/settings/bulk` — все 32+ настройки одним запросом
- **GZip Middleware**: сжатие ответов >500 байт (52KB → 21KB для bulk)
- **21 компонент** обновлены: используют `getSetting()` из контекста
- **~30 HTTP запросов** при загрузке сокращены до 1

### Button Config System (Mar 2026)
- Hero кнопки читают action/target/text из `button_config` в БД
- Админка: настройка действий (якорь/ссылка/форма) и текстов кнопок

### AmoCRM Catalog Pipeline (Mar 2026)
- Заявки на скачивание каталога (`type: catalog_request`) идут в отдельную воронку AMO CRM
- Настройка `amocrm_catalog_pipeline_id` и `amocrm_catalog_status_id` в админке интеграций
- Telegram уведомление с иконкой каталога

### CatalogFormGate Modal Fix (Mar 2026)
- z-index: 9999, overflow-y-auto, my-auto для корректного центрирования

## Key API Endpoints
- `GET /api/settings/bulk` — Все настройки + дефолты одним запросом (MAIN)
- `POST /api/translate` — Auto-translation via GPT
- `GET/PUT /api/settings/hero`, `/api/settings/site`, `/api/settings/buttons`
- `POST /api/contact` — обработка заявок (contact, catalog_request, calculator_order)

## Backlog
- P2: Toast обработка ошибок (глобальная)
- P3: A/B тестирование CTA
- P4: Рефакторинг server.py (>2700 строк) → отдельные роуты
- P4: Разбиение Calculator.jsx
