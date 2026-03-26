# WM Group — PRD

## Problem Statement
Объединение двух проектов (WM-Sauna и WM-Balia) в единую мульти-продуктовую платформу с общей главной страницей, раздельными продуктовыми лендингами и единой панелью администратора.

## Architecture
- **Frontend:** React, React Router, TailwindCSS, Framer Motion
- **Backend:** FastAPI, Pydantic, MongoDB (Motor), JWT
- **Storage:** MongoDB, Cloudinary (купели), локальная папка (PDF)
- **3rd Party:** wm-kalkulator.pl API, Telegram, AMO CRM, Cloudinary

## Routing
- `/` — MainLanding (выбор направления)
- `/sauny` — сайт саун (лендинг с калькулятором)
- `/sauny/kalkulator` — калькулятор саун
- `/balie` — сайт купелей
- `/balie/konfigurator` — конфигуратор купелей
- `/admin` — панель администратора
- `/admin/pipeline` — воронка AMO CRM

## Completed Features
- [x] Объединение двух проектов в единую платформу
- [x] MainLanding.jsx с выбором направления
- [x] Полный перенос сайта купелей (10 продуктов, галерея, конфигуратор)
- [x] Cloudinary интеграция для медиа купелей
- [x] Обновление карточек саун (2 цены, фильтры, промо-блоки)
- [x] Единая админ-панель для обоих направлений
- [x] AMO CRM интеграция с CSV-экспортом воронки
- [x] Telegram уведомления
- [x] Точечное отключение опций калькулятора саун
- [x] **Рефакторинг AdminPanel.jsx** (3558 → 233 строк, 93.5% сокращение)
- [x] Группировка вкладок сайдбара админки (Общее / Сауны / Купели)
- [x] Секция «Kolory i Materiały» на сайте купелей (14 fiberglass, 8 acrylic, 13 spruce, 15 thermo, WPC)
- [x] Секция «Opcje i Akcesoria» на сайте купелей (10 опций с описаниями и характеристиками)
- [x] Загрузка фото цветов дерева/материалов в админке купелей (Cloudinary)
- [x] Расширенная карточка товара (фото+описание слева, опции с ценами справа, кнопки заявки и конфигуратора)
- [x] Управление отображаемыми опциями карточки из админки
- [x] Скачивание каталога PDF с формой обратной связи (hero + после отправки контактной формы)

## Admin Panel Architecture (After Refactoring — Feb 2026)
AdminPanel.jsx — тонкий оркестратор (250 строк): логин, навигация, layout.
**Сайдбар с группировкой** — 3 секции (Общее / Сауны / Купели) со сворачиваемыми группами.
Все вкладки вынесены в `/components/admin/`:
- SaunaMessagesAdmin.jsx — Сообщения
- SaunaDesignAdmin.jsx — Настройки сайта, Оформление, Кнопки
- SaunaContentAdmin.jsx — Тексты, Hero, О компании
- SaunaCalculatorAdmin.jsx — Калькулятор (модели + категории + опции)
- SaunaReviewsAdmin.jsx — Отзывы
- SaunaGalleryAdmin.jsx — Галерея, Фото из API
- SaunaModelsStockAdmin.jsx — Модели, В наличии, Счётчики
- SaunaFaqAdmin.jsx — FAQ
- SaunaSeoAdmin.jsx — SEO
- SaunaIntegrationsAdmin.jsx — Telegram + AMO CRM
- SaunaCatalogSectionsAdmin.jsx — Каталог PDF, Порядок секций
- BaliaProductsAdmin.jsx — Купели: Продукты
- BaliaTestimonialsAdmin.jsx — Купели: Отзывы
- BaliaContentAdmin.jsx — Купели: Контент
- BaliaConfiguratorAdmin.jsx — Купели: Конфигуратор

## Backlog

### P1
- Интеграция i18next для мультиязычности (PL/RU/EN)

### P2
- Улучшение обработки ошибок API (toast-уведомления в catch)

### P3
- A/B тестирование CTA-кнопок
