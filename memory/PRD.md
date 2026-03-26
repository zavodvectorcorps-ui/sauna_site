# WM Group — PRD

## Problem Statement
Объединение двух проектов (WM-Sauna и WM-Balia) в единую мульти-продуктовую платформу с общей главной страницей, раздельными продуктовыми лендингами и единой панелью администратора.

## Architecture
- **Frontend:** React, React Router, TailwindCSS, Framer Motion
- **Backend:** FastAPI, Pydantic, MongoDB (Motor), JWT
- **Storage:** MongoDB, Cloudinary (купели), локальная папка (PDF)
- **3rd Party:** wm-kalkulator.pl API, Telegram, AMO CRM, Cloudinary

## Completed Features
- [x] Объединение двух проектов в единую платформу
- [x] Рефакторинг AdminPanel.jsx (3558 → 233 строк)
- [x] Группировка вкладок сайдбара (Общее / Сауны / Купели)
- [x] Секции «Kolory», «Opcje», «Budowa», «Piec» на сайте купелей
- [x] Cloudinary загрузка фото цветов дерева
- [x] Скачивание каталога PDF с лид-формой
- [x] Схема устройства купели + схема печи (SVG + fallback на Cloudinary)
- [x] Блоки рассрочки на сайтах купелей и саун
- [x] Выбор типа печи в карточке товара (heater selector)
- [x] Промо-блоки вкл/выкл + заголовки
- [x] Исключения опций по моделям (все 6 продуктов)
- [x] Предпросмотр промо-блоков в админке
- [x] Bugfix: базовая цена fallback, disabled_options калькулятора
- [x] Редактирование блока «Dlaczego WM-Balia?» (features/options/badges CRUD)
- [x] Перемещение блоков сайта купелей (dynamic section ordering)
- [x] **Редактирование схем купели и печи** — загрузка фото через Cloudinary, редактирование заголовков, описаний, характеристик, преимуществ/недостатков

## Admin Panel — КУПЕЛИ > Контент (Sub-tabs)
1. **Hero** — badge, заголовок, подзаголовок, CTA, статистика + предпросмотр
2. **Карточки «Dlaczego»** — features, options, badges (icon/title/desc/active + add/remove)
3. **Схемы (купель + печь)** — заголовки, подзаголовки, загрузка фото (Cloudinary), пункты описания + характеристики печей
4. **Промо-блоки** — вкл/выкл + заголовки
5. **Порядок блоков** — 13 секций с перемещением стрелками
6. **Исключения опций** — все 6 продуктов

## Backlog
### P1
- Интеграция i18next для мультиязычности (PL/RU/EN)
### P2
- Улучшение обработки ошибок API (toast-уведомления)
### P3
- A/B тестирование CTA-кнопок
