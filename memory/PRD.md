# WM Group — PRD

## Problem Statement
Объединение двух проектов (WM-Sauna и WM-Balia) в единую мульти-продуктовую платформу.

## Architecture
- **Frontend:** React, React Router, TailwindCSS, Framer Motion
- **Backend:** FastAPI, Pydantic, MongoDB (Motor), JWT
- **Storage:** MongoDB, Cloudinary
- **3rd Party:** wm-kalkulator.pl API, Telegram, AMO CRM, Cloudinary

## Completed Features
- [x] Объединение двух проектов, рефакторинг админки
- [x] Секции купелей: Kolory, Opcje, Budowa, Piec, Raty
- [x] Рассрочка на саунах и купелях
- [x] Промо-блоки, исключения опций, предпросмотр
- [x] Редактирование «Dlaczego WM-Balia?», порядок блоков
- [x] Редактирование схем (купель + печь) с Cloudinary upload
- [x] **Цены из heaterVariants** — карточки показывают 2 цены (с внутр./внеш. печью) или 1 если доступен только один вариант
- [x] **Полный саммари заказа** — модальное окно заявки показывает модель + цена, опции, итого
- [x] **3 стиля SVG-схем** — Классическая/Минимализм/Чертёж для купели; Классическая/Минимализм/Детальная для печи (+ своё фото)

## Admin Panel — КУПЕЛИ > Контент
1. Hero + предпросмотр
2. Карточки «Dlaczego» (CRUD)
3. Схемы (3 SVG стиля + upload)
4. Промо-блоки
5. Порядок блоков
6. Исключения опций

## Backlog
### P1 — Мультиязычность (i18next PL/RU/EN)
### P2 — Toast-уведомления об ошибках API
### P3 — A/B тестирование CTA
