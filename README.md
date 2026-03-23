# WM-Sauna Website

Современный адаптивный сайт для польского производителя деревянных саун.

## Технологии

- **Frontend:** React 19, Tailwind CSS, Framer Motion
- **Backend:** FastAPI (Python 3.9+)
- **База данных:** MongoDB

## Требования

- Python 3.9+
- Node.js 18+
- MongoDB 5.0+
- Git

---

## Быстрый старт (Development)

### 1. Клонировать репозиторий

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

### 2. Настроить Backend

```bash
cd backend

# Создать виртуальное окружение
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# или: venv\Scripts\activate  # Windows

# Установить зависимости
pip install -r requirements.txt

# Создать файл .env
cp .env.example .env
# Отредактировать .env (см. раздел "Переменные окружения")

# Запустить сервер
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### 3. Настроить Frontend

```bash
cd frontend

# Установить зависимости
yarn install
# или: npm install

# Создать файл .env
cp .env.example .env
# Отредактировать .env

# Запустить dev-сервер
yarn start
# или: npm start
```

Frontend будет доступен на `http://localhost:3000`  
Backend API на `http://localhost:8001`

---

## Переменные окружения

### Backend (`backend/.env`)

```env
# MongoDB подключение
MONGO_URL=mongodb://localhost:27017
DB_NAME=wm_sauna

# Внешний API калькулятора
CALCULATOR_API_URL=https://wm-kalkulator.pl

# Админ панель (измените на свои!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password_here
```

### Frontend (`frontend/.env`)

```env
# URL бэкенда (для development)
REACT_APP_BACKEND_URL=http://localhost:8001

# Для production укажите ваш домен:
# REACT_APP_BACKEND_URL=https://api.yourdomain.com
```

---

## Production Deployment

### Вариант 1: VPS / Dedicated Server

#### 1. Установить зависимости на сервере

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y python3 python3-pip python3-venv nodejs npm nginx

# Установить yarn
npm install -g yarn

# Установить MongoDB
# https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/
```

#### 2. Настроить Backend

```bash
cd /var/www/wm-sauna/backend

# Создать виртуальное окружение
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Настроить .env
nano .env
```

#### 3. Создать systemd сервис для Backend

```bash
sudo nano /etc/systemd/system/wm-sauna-backend.service
```

```ini
[Unit]
Description=WM-Sauna Backend API
After=network.target mongodb.service

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/wm-sauna/backend
Environment="PATH=/var/www/wm-sauna/backend/venv/bin"
ExecStart=/var/www/wm-sauna/backend/venv/bin/uvicorn server:app --host 127.0.0.1 --port 8001
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable wm-sauna-backend
sudo systemctl start wm-sauna-backend
```

#### 4. Собрать Frontend

```bash
cd /var/www/wm-sauna/frontend

# Установить зависимости
yarn install

# Настроить .env для production
echo "REACT_APP_BACKEND_URL=https://yourdomain.com" > .env

# Собрать production build
yarn build
```

#### 5. Настроить Nginx

```bash
sudo nano /etc/nginx/sites-available/wm-sauna
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Редирект на HTTPS (после настройки SSL)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL сертификаты (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend (React build)
    root /var/www/wm-sauna/frontend/build;
    index index.html;

    # React Router - все пути на index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
    }

    # Загруженные файлы
    location /uploads/ {
        alias /var/www/wm-sauna/backend/uploads/;
    }

    # Gzip сжатие
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

```bash
sudo ln -s /etc/nginx/sites-available/wm-sauna /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 6. SSL сертификат (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

### Вариант 2: Docker

#### docker-compose.yml

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:5
    restart: always
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_DATABASE: wm_sauna

  backend:
    build: ./backend
    restart: always
    ports:
      - "8001:8001"
    environment:
      - MONGO_URL=mongodb://mongodb:27017
      - DB_NAME=wm_sauna
      - CALCULATOR_API_URL=https://wm-kalkulator.pl
      - ADMIN_USERNAME=admin
      - ADMIN_PASSWORD=your_secure_password
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    restart: always
    ports:
      - "3000:80"
    environment:
      - REACT_APP_BACKEND_URL=https://yourdomain.com
    depends_on:
      - backend

volumes:
  mongodb_data:
```

#### backend/Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

#### frontend/Dockerfile

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Запуск

```bash
docker-compose up -d
```

---

## API Endpoints

### Публичные

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/` | Health check |
| GET | `/api/sauna/prices` | Данные калькулятора (с кешированием) |
| GET | `/api/settings/site` | Настройки сайта |
| GET | `/api/settings/hero` | Настройки Hero секции |
| GET | `/api/settings/about` | Настройки "О компании" |
| GET | `/api/settings/gallery` | Конфиг галереи |
| GET | `/api/gallery` | Список изображений галереи |
| POST | `/api/contact` | Отправка формы обратной связи |

### Админ панель (требуется авторизация)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/admin/login` | Авторизация |
| GET | `/api/admin/contacts` | Список заявок |
| PUT | `/api/admin/settings/*` | Обновление настроек |
| CRUD | `/api/admin/reviews` | Управление отзывами |
| CRUD | `/api/admin/gallery` | Управление галереей |

---

## Админ панель

- **URL:** `https://yourdomain.com/admin`
- **Логин:** задаётся в `ADMIN_USERNAME`
- **Пароль:** задаётся в `ADMIN_PASSWORD`

### Возможности:
- Просмотр заявок с сайта
- Редактирование контента (Hero, О компании, Отзывы)
- Управление галереей (свои фото + фильтр API фото)
- Настройка калькулятора (включение/отключение моделей)
- Изменение порядка секций на главной

---

## Резервное копирование

### MongoDB

```bash
# Создать бэкап
mongodump --db wm_sauna --out /backup/$(date +%Y%m%d)

# Восстановить из бэкапа
mongorestore --db wm_sauna /backup/20240101/wm_sauna
```

### Автоматический бэкап (cron)

```bash
crontab -e
```

```
# Ежедневный бэкап в 3:00
0 3 * * * mongodump --db wm_sauna --out /backup/$(date +\%Y\%m\%d) && find /backup -mtime +7 -delete
```

---

## Troubleshooting

### Backend не запускается

```bash
# Проверить логи
sudo journalctl -u wm-sauna-backend -f

# Проверить порт
sudo lsof -i :8001
```

### MongoDB ошибки подключения

```bash
# Проверить статус MongoDB
sudo systemctl status mongodb

# Проверить подключение
mongosh --eval "db.adminCommand('ping')"
```

### Frontend не отображается

```bash
# Проверить build
ls -la /var/www/wm-sauna/frontend/build

# Пересобрать
cd /var/www/wm-sauna/frontend
yarn build
```

---

## Лицензия

Этот проект создан для WM-Sauna. Все права защищены.

---

## Контакты

- **Сайт:** https://wm-sauna.pl
- **Телефон:** +48 732 099 201
