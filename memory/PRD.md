# WM Group — PRD

## Architecture
- Frontend: React + TailwindCSS + Framer Motion + Shadcn UI
- Backend: FastAPI + MongoDB + Emergent Object Storage
- Admin: Basic Auth (admin / 220066)

## Implemented Features

### Core
- Каталог саун с калькулятором, каталог купелей с конфигуратором
- Главная WM Group, "7 фактов", админ-панель (35+ вкладок)

### Content Marketing
- Блог: 14 SEO-статей, react-markdown, CRUD админка
- B2B: /b2b — hero, 8 преимуществ, финансы, лизинг, "Почему WM Group", галерея фото/видео, форма + админка
- WhatsApp: глобальная кнопка + админка
- Видео-обзоры: YouTube секция на /sauny + админка
- FAQ: Сауны 13, Купели 11 вопросов
- GlobalHeader на Blog/B2B/Article страницах
- Процесс заказа: 5 шагов на /sauny и /balie + админка

### Mobile UX (Mar 2026)
- **Горизонтальный скролл на мобильных** для 4 блоков: Спецпредложение, Преимущества, Видео-обзоры, Отзывы
- **Peek-эффект**: видны краешки соседних карточек (min-w-[72%])
- **Автоскролл**: карточки переключаются автоматически каждые 3.5-5 сек, пауза при касании
- **Точечные индикаторы** (dots) текущей позиции
- Хук `useAutoScroll` для переиспользования логики

### Section Visibility System (Mar 2026)
- **Видимость секций Desktop/Mobile** — тумблеры в админке для саун (17 блоков) и купелей (15 блоков)
- API: GET/PUT /api/settings/visibility
- Применение CSS-классов `hidden md:block` / `block md:hidden` / `hidden` на фронтенде

### Object Storage (Mar 2026)
- **Emergent Object Storage** интеграция для персистентного хранения медиа
- Все изображения (36) и видео (46) мигрированы в облако
- Загрузка через `/api/admin/upload-image` и `/api/admin/upload-video` — автоматически в object storage
- Отдача через `/api/images/{id}` и `/api/videos/{filename}` — из object storage с fallback
- Медиа переживают деплой на любой домен

### Media URL Portability
- **resolveMediaUrl** хелпер — относительные пути `/api/images/xxx` → полные URL
- Все URL в БД — относительные, не привязаны к конкретному домену

## Key Components
- `/app/frontend/src/hooks/useAutoScroll.js` — хук автоскролла каруселей
- `/app/frontend/src/lib/utils.js` — resolveMediaUrl helper
- `/app/backend/object_storage.py` — модуль объектного хранилища
- `/app/backend/migrate_to_storage.py` — скрипт миграции файлов в хранилище

## Key API Endpoints
- GET/PUT `/api/settings/visibility` — видимость секций
- GET/PUT `/api/admin/settings/visibility` — обновление видимости (admin)
- POST `/api/admin/upload-image` — загрузка изображения в object storage
- POST `/api/admin/upload-video` — загрузка видео в object storage
- GET `/api/images/{id}` — отдача изображения из object storage
- GET `/api/videos/{filename}` — отдача видео из object storage

## Backlog
- P1: i18next мультиязычность (PL/RU/EN)
- P2: Toast обработка ошибок (глобальная)
- P3: A/B тестирование CTA
- P4: Рефакторинг server.py (>2500 строк) — вынесение в отдельные роуты
- P4: Разбиение Calculator.jsx
