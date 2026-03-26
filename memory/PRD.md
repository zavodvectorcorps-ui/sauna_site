# WM Group — PRD

## Описание
Объединённая платформа WM-Sauna + WM-Balia с общим лендингом, калькулятором, каталогом и админ-панелью.

## Архитектура
- **Frontend:** React, TailwindCSS, Framer Motion
- **Backend:** FastAPI, Pydantic
- **Database:** MongoDB
- **Uploads:** Cloudinary + локальный upload (каталоги)
- **CRM:** AmoCRM
- **Notifications:** Telegram

## Реализовано

### Фаза 1 — Ядро
- Мультипродуктовый сайт (/sauny, /balie)
- Калькулятор саун с категориями, вариантами, опциями
- Каталог моделей саун и купелей
- Админ-панель с авторизацией
- Интеграция AmoCRM, PDF-генерация, SEO

### Фаза 2 — Блоки контента
- Промо-блоки (Hero, Dlaczego, Отзывы, Контакт)
- Блок рассрочки для саун и купелей
- Блок спецпредложения (Specjalna oferta)
- Схемы устройства купели и печи (SVG + кастомные фото)
- Drag & Drop сортировка секций купелей
- Предпросмотр в админке купелей

### Фаза 3 — Расширения
- Исключения несовместимых опций для 6 моделей купелей
- Два ценника (интегрированная/внешняя печь) на основе heaterVariants
- Редактирование блока "Dlaczego WM-Balia"
- Выбор стоковых SVG-стилей (default, minimal, blueprint)

### Фаза 4 — Улучшения (2026-03-26)
- Фикс чекбоксов конфигуратора саун (множественный выбор OPCJE DODATKOWE)
- Удаление скидок из расчёта калькулятора, CTA "Zbierz zamowienie teraz i zafixuj swoja indywidualna znizke!"
- Блок рассрочки в карточках моделей саун и калькуляторе
- Загрузка логотипа партнёра по рассрочке (админка)
- Загрузка фотографий для карточек спецпредложения (админка)

### Фаза 5 — Купели: Конфигуратор и интеграции (2026-03-26)
- **Убран отдельный конфигуратор купелей** — кнопки "Skonfiguruj wlasna balie" и "Skonfiguruj wlasny wariant" удалены, BalieConfiguratorCTA убран. Калькулятор остался только в карточках продуктов.
- **Отдельный каталог купелей (PDF)** — загрузка/удаление через админку, кнопка "Pobierz katalog" в Hero использует отдельный файл.
- **Интеграции купелей (AMO + Telegram)** — отдельный Telegram-бот и воронка AMO CRM для заявок с купелей. API-ключ AMO берётся из настроек саун. Все заявки с type "balia_*" маршрутизируются на balia-настройки.

## Бэклог
### P1 — Мультиязычность
- Интеграция i18next (PL/RU/EN)

### P2 — Обработка ошибок
- Глобальные toast-уведомления при ошибках API

### P3 — A/B тестирование CTA

## Ключевые API
- GET/PUT /api/settings/installment — Настройки рассрочки (логотипы)
- GET/PUT /api/settings/special-offer — Карточки спецпредложения
- GET/PUT /api/admin/settings/balia-integrations — Интеграции купелей
- POST /api/admin/test-balia-telegram — Тест Telegram купелей
- POST /api/admin/test-balia-amocrm-lead — Тест AMO CRM купелей
- POST/GET/DELETE /api/admin/balia-catalog — Каталог купелей
- GET /api/balia-catalog/info — Информация о каталоге
- GET /api/balia-catalog/download — Скачивание каталога
- PUT /api/admin/settings/calculator — Настройки калькулятора
- POST /api/admin/upload — Загрузка файлов (Cloudinary)
- GET/POST /api/balia/content — Контент купелей

## Рефакторинг
- Calculator.jsx (~550 строк) → разбить на подкомпоненты
