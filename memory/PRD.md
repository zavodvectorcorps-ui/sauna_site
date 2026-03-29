# WM Group — PRD

## Architecture
- Frontend: React + TailwindCSS + Framer Motion + Shadcn UI
- Backend: FastAPI + MongoDB + Emergent Object Storage
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
- **Горизонтальный скролл** для: Спецпредложение (w-72vw), Видео-обзоры (w-68vw), Отзывы (w-72vw), Преимущества/PromoFeatures (w-55vw)
- **Peek-эффект**: видны краешки соседних карточек (snap-start + vw-единицы)
- **Автоскролл**: карточки переключаются каждые 3.5-5 сек, пауза при касании
- **Точечные индикаторы** + рабочие кнопки навигации (< >)
- **7 фактов (SaunaAdvantages)** — вертикальный список на мобильных (НЕ карусель)
- Хук `useAutoScroll` с querySelectorAll для надёжного скролла

### Section Visibility System (Mar 2026)
- Тумблеры Desktop/Mobile в админке для саун (17 блоков) и купелей (15 блоков)
- API: GET/PUT /api/settings/visibility

### Object Storage (Mar 2026)
- Emergent Object Storage для персистентного хранения медиа
- 36 изображений + 46 видео мигрированы в облако
- Медиа переживают деплой на любой домен

### Full Admin Coverage (Mar 2026)
- **PromoBanner** — заголовок, описание, текст кнопки (GET/PUT /api/settings/promo-banner)
- **BalieAbout** — заголовок, описание, счётчики (/api/settings/balie-about)
- **BalieContact** — телефон, email, адрес (/api/settings/balie-contact)
- **BalieInstallment** — карточки рассрочки (/api/settings/balie-installment)
- **BalieGallery** — загрузка/удаление фото (/api/balia/gallery)
- Теперь ВСЕ блоки на сайте полностью редактируются через админку

### Media URL Portability
- resolveMediaUrl хелпер — относительные пути /api/images/xxx → полные URL
- Все URL в БД — относительные

### Multilingual UI (Mar 2026)
- **4 языка**: Польский (PL, по умолчанию), Английский (EN), Немецкий (DE), Чешский (CS)
- **Переключатель языков** на всех страницах: MainLanding, Sauny, Balie, Blog, B2B
- **Переведённые секции**: навигация, герой, калькулятор, галерея, склад, отзывы, о компании, контакт, футер
- **Общий компонент** `LanguageSwitcher.jsx` (dropdown с иконкой Globe)
- **Хранение**: localStorage ключ `wm-sauna-lang`
- Статьи блога и динамический контент из БД остаются на польском

## Key API Endpoints
- GET/PUT `/api/settings/promo-banner`
- GET/PUT `/api/settings/balie-about`
- GET/PUT `/api/settings/balie-contact`
- GET/PUT `/api/settings/balie-installment`
- GET/PUT `/api/settings/section_visibility`

## Backlog
- P2: Toast обработка ошибок (глобальная)
- P3: A/B тестирование CTA
- P4: Рефакторинг server.py (>2600 строк) → отдельные роуты
- P4: Разбиение Calculator.jsx
