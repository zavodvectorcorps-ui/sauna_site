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

### Multilingual UI (Mar 2026) — COMPLETE
- **4 языка**: Польский (PL, по умолчанию), Английский (EN), Немецкий (DE), Чешский (CS)
- **Переключатель языков** на всех страницах

### Auto-Translation of All Content (Mar 2026) — COMPLETE
- **GPT-4.1-nano** для автоматического перевода ВСЕГО контента
- **tr() функция** из `AutoTranslateContext.js`
- **MongoDB кэш**: коллекция `translations_cache`

### Hero Badges Admin (Mar 2026) — COMPLETE
- 3 текстовых бейджа ("Polska produkcja", "Gotowe w 5-10 dni", "Gwarancja 24 miesiące") редактируются в админке
- Секция "Преимущества (бейджи на Hero)" в разделе Сауны > Hero

### Performance Optimization (Mar 2026) — COMPLETE
- **Bulk Settings Endpoint**: `GET /api/settings/bulk` — возвращает все 32+ настроек + отзывы одним запросом
- **SettingsContext**: 1 запрос вместо 8 при инициализации
- **21 компонент** обновлены: используют `getSetting()` из контекста вместо индивидуальных fetch-запросов
- **Устранено ~30 HTTP запросов** при загрузке каждой страницы

## Key API Endpoints
- `GET /api/settings/bulk` — Все настройки одним запросом (MAIN)
- `POST /api/translate` — Auto-translation via GPT с MongoDB кэшированием
- `GET/PUT /api/settings/hero` (with features array)
- `GET/PUT /api/settings/site`

## Backlog
- P2: Toast обработка ошибок (глобальная)
- P3: A/B тестирование CTA
- P4: Рефакторинг server.py (>2700 строк) → отдельные роуты
- P4: Разбиение Calculator.jsx
