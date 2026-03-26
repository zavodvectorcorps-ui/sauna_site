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
- `/sauny` — сайт саун
- `/sauny/kalkulator` — калькулятор саун
- `/balie` — сайт купелей
- `/balie/konfigurator` — конфигуратор купелей
- `/admin` — панель администратора
- `/admin/pipeline` — воронка AMO CRM

## Completed Features
- [x] Объединение двух проектов в единую платформу
- [x] Рефакторинг AdminPanel.jsx (3558 → 233 строк)
- [x] Группировка вкладок сайдбара (Общее / Сауны / Купели)
- [x] Секции «Kolory i Materialy», «Opcje i Akcesoria» на сайте купелей
- [x] Cloudinary загрузка фото цветов дерева
- [x] Скачивание каталога PDF с лид-формой
- [x] Схема устройства купели (BalieSchematic)
- [x] Схема работы печи (BalieStoveScheme)
- [x] Блок рассрочки на сайте купелей и саун (BalieInstallment, SaunaInstallment)
- [x] Выбор типа печи в карточке товара (heater selector)
- [x] Промо-блоки вкл/выкл + заголовки
- [x] Исключения опций по моделям
- [x] Предпросмотр промо-блоков
- [x] Bugfix: базовая цена fallback
- [x] Bugfix: disabled_options калькулятора саун
- [x] **Редактирование блока «Dlaczego WM-Balia?»** — полный CRUD карточек features/options/badges в админке (вкладка «Карточки Dlaczego»)
- [x] **Перемещение блоков сайта купелей** — вкладка «Порядок блоков» с 13 секциями и стрелками вверх/вниз, dynamic rendering в BalieLandingPage
- [x] **Fix: все 6 моделей в исключениях опций** — ключ исключения изменён с api_model_id на product.id

## Admin Panel — КУПЕЛИ > Контент (Sub-tabs)
1. **Hero** — badge, заголовок, подзаголовок, CTA, статистика + предпросмотр
2. **Карточки «Dlaczego»** — 3 основных карточки, 4 опции, 4 бейджа (icon/title/desc/active + add/remove)
3. **Промо-блоки** — вкл/выкл + заголовки для features/installment/schematic/stove/about
4. **Порядок блоков** — 13 секций с перемещением стрелками
5. **Исключения опций** — ВСЕ 6 продуктов, привязка несовместимых опций

## Backlog

### P1
- Интеграция i18next для мультиязычности (PL/RU/EN)

### P2
- Улучшение обработки ошибок API (toast-уведомления)

### P3
- A/B тестирование CTA-кнопок
