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
- Хук `useAutoScroll` с querySelectorAll

### Section Visibility System (Mar 2026)
- Тумблеры Desktop/Mobile в админке для саун (17 блоков) и купелей (15 блоков)

### Object Storage (Mar 2026)
- Emergent Object Storage для персистентного хранения медиа
- 36 изображений + 46 видео мигрированы в облако

### Full Admin Coverage (Mar 2026)
- PromoBanner, BalieAbout, BalieContact, BalieInstallment, BalieGallery — все редактируются через админку

### Multilingual UI (Mar 2026) — COMPLETE
- **4 языка**: Польский (PL, по умолчанию), Английский (EN), Немецкий (DE), Чешский (CS)
- **Статический UI**: навигация, герой, калькулятор, галерея, склад, отзывы, о компании, контакт, футер — переводы из словаря `LanguageContext.js`
- **Переключатель языков** на всех страницах: MainLanding, Sauny, Balie, Blog, B2B
- **Общий компонент** `LanguageSwitcher.jsx` (dropdown с Globe иконкой)

### Auto-Translation of All Content (Mar 2026) — COMPLETE
- **GPT-4.1-nano** для автоматического перевода ВСЕГО контента на страницах
- **Бэкенд API**: `POST /api/translate` — принимает массив текстов + target_lang, возвращает переводы
- **MongoDB кэш**: коллекция `translations_cache` — повторные запросы мгновенные
- **Frontend кэш**: `localStorage` ключ `wm-translations-cache`
- **tr() функция** из `AutoTranslateContext.js` — оборачивает любой текст, автоматически отправляет на перевод при переключении языка
- **Покрытие**: MainLanding, Hero, PromoBanner, PromoFeatures, SpecialOffer, SaunaAdvantages, SaunaVideoReviews, OrderProcess, SaunaInstallment, SocialProof, FAQ, BalieHero, BalieProducts, BalieFeatures, BalieAbout, BalieContact, BalieGallery, BalieTestimonials, BalieInstallment, BalieFaq, BalieLandingPage nav

## Key API Endpoints
- `POST /api/translate` — Auto-translation via GPT с MongoDB кэшированием
- `GET/PUT /api/settings/promo-banner`
- `GET/PUT /api/settings/balie-about`
- `GET/PUT /api/settings/balie-contact`
- `GET/PUT /api/settings/section_visibility`

## Backlog
- P2: Toast обработка ошибок (глобальная)
- P3: A/B тестирование CTA
- P4: Рефакторинг server.py (>2700 строк) → отдельные роуты
- P4: Разбиение Calculator.jsx
