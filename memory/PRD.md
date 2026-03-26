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
- [x] Рефакторинг AdminPanel.jsx (3558 → 233 строк, 93.5% сокращение)
- [x] Группировка вкладок сайдбара админки (Общее / Сауны / Купели)
- [x] Секция «Kolory i Materialy» на сайте купелей
- [x] Секция «Opcje i Akcesoria» на сайте купелей
- [x] Загрузка фото цветов дерева/материалов в админке купелей (Cloudinary)
- [x] Расширенная карточка товара (фото+описание слева, опции с ценами справа)
- [x] Управление отображаемыми опциями карточки из админки
- [x] Скачивание каталога PDF с формой обратной связи
- [x] Схема устройства купели (BalieSchematic) — SVG cross-section с 5 пунктами
- [x] Схема работы печи (BalieStoveScheme) — переключатель внутренний/внешний с SVG
- [x] Блок рассрочки на сайте купелей (BalieInstallment) — полный и компактный
- [x] Блок рассрочки на сайте саун (SaunaInstallment) — на главной и в карточках
- [x] Выбор типа печи в карточке товара — селектор internal/external с пересчётом цены
- [x] Редактирование промо-блоков купелей — вкл/выкл + заголовки через админку
- [x] Исключения опций по моделям — бэкенд + админка
- [x] **Предпросмотр промо-блоков в админке** — live preview hero и блоков
- [x] **Bugfix: базовая цена в карточке** — fallback парсинг из product.price строки
- [x] **Bugfix: disabled_options калькулятора** — поле добавлено в CalculatorConfig Pydantic модель

## Admin Panel Architecture
AdminPanel.jsx — тонкий оркестратор (296 строк): логин, навигация, layout.
**Сайдбар** — 3 секции (Общее / Сауны / Купели) со сворачиваемыми группами.

## Key API Endpoints
- `GET/POST /api/balia/content` — управление контентом (hero, promo_blocks)
- `GET/POST /api/balia/option-exclusions` — исключения опций по моделям
- `GET/POST /api/balia/card-options-settings` — настройки опций карточки
- `GET/PUT /api/settings/calculator` — конфиг калькулятора саун (вкл. disabled_options)
- `GET /api/balia/calculator/prices` — данные цен и категорий (вкл. heater_upgrade)

## Backlog

### P1
- Интеграция i18next для мультиязычности (PL/RU/EN)

### P2
- Улучшение обработки ошибок API (toast-уведомления в catch)

### P3
- A/B тестирование CTA-кнопок
