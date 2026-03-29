# WM Group — PRD (Product Requirements Document)

## Problem Statement
Объединённая платформа WM Group (WM-Sauna + WM-Balia) — премиум-сайт для продажи саун и купелей. Необходим генератор органического трафика (блог), контент-маркетинг, B2B-раздел, WhatsApp-интеграция и видео-обзоры. Весь контент управляется через админку.

## Core Requirements
- Премиум-дизайн без AI-шаблонов
- Польский язык с диакритиками (ą, ć, ę, ł, ń, ó, ś, ź, ż)
- Все блоки редактируются через админку
- SEO-оптимизация

## Architecture
- Frontend: React + TailwindCSS + Framer Motion + Shadcn UI
- Backend: FastAPI + MongoDB
- Admin: Basic Auth (admin / 220066)

## What's Been Implemented

### Core Platform (Done)
- Каталог саун с калькулятором конфигурации
- Каталог купелей с конфигуратором
- Главная страница WM Group с навигацией
- Блок "7 фактов" (SaunaAdvantages) с анимацией
- Полная админ-панель (~30 вкладок)

### Content Marketing (Done — Feb 2026)
- **Блог**: 6 SEO-статей, фронтенд (react-markdown + remark-gfm), полная админка (CRUD)
- **B2B раздел**: отдельная страница /b2b с hero, преимуществами и формой для партнёров + админка
- **WhatsApp кнопка**: глобальная плавающая кнопка на всех страницах + настройки в админке (номер, сообщение, вкл/выкл)
- **Видео-обзоры**: секция на странице саун для YouTube-видео + админка для управления
- **FAQ расширен**: Сауны — 13 вопросов, Купели — 11 вопросов

### Bug Fixes (Done)
- Исправлены прозрачные PNG в "7 фактах"
- Исправлена галерея (внешние ссылки)
- Исправлены польские диакритики
- Унификация гарантии 24 мес
- Hero переход фото→видео (1000ms)

## API Endpoints (New)
- GET/PUT /api/settings/video-reviews — видео-обзоры
- GET/PUT /api/settings/b2b — B2B настройки
- GET/PUT /api/settings/whatsapp — WhatsApp настройки
- GET /api/blog/articles — статьи блога
- POST /api/contact (type='b2b') — B2B форма

## Prioritized Backlog

### P1
- Интеграция i18next для мультиязычности (PL/RU/EN)
- Расширение FAQ из базы конкурента (dreamofwood.pl/faq/)

### P2
- Улучшение обработки ошибок (toast вместо console.error)

### P3
- A/B тестирование CTA-кнопок

### P4
- Рефакторинг server.py (вынесение роутов в отдельные файлы)
- Разбиение Calculator.jsx
