# Передача деплоя (handoff)

Этот файл нужен, чтобы другой ИИ/исполнитель мог продолжить деплой без контекста.

## 1) Что уже сделано

### GitHub
- Репозиторий: https://github.com/DenisPolshin/nurtentan
- Код запушен в ветку: `main`
- Репозиторий сделан публичным (чтобы `git clone` работал без авторизации).

### VPS (IONOS)
- Сервер: `212.227.191.121`
- ОС: Ubuntu 24.04 LTS
- Подключение по SSH: `ssh root@212.227.191.121`

### Установлено на сервере
- `nginx` установлен и запущен (systemd status: active/running)
- Node.js установлен: `node v20.20.2`
- npm установлен: `npm 10.8.2`
- pm2 установлен: `pm2 6.0.14`

### Код на сервере
- Проект склонирован в: `/opt/nurtentan`
- Структура есть: `/opt/nurtentan/app` (Next.js проект внутри)

## 2) На какой стадии остановились

Остановились на установке зависимостей в `/opt/nurtentan/app`.

Команда `npm ci` на сервере упала с ошибкой:
- `npm ci` требует строгой синхронизации `package.json` и `package-lock.json`
- ошибка: `Missing: @swc/helpers@0.5.21 from lock file`

Решение: на сервере использовать `npm install` (а не `npm ci`), чтобы npm сам синхронизировал lock-файл.

## 3) Что нужно сделать для завершения (пошагово)

Все команды ниже выполняются на сервере под `root` по SSH.

### Шаг 1 — перейти в папку приложения
```bash
cd /opt/nurtentan/app
```

### Шаг 2 — создать .env (минимальный набор)
Сгенерировать секрет:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Создать файл `.env` (вставить сгенерированный секрет вместо `PASTE_SECRET_HERE`):
```bash
cat > .env <<'EOF'
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://212.227.191.121"
NEXTAUTH_SECRET="PASTE_SECRET_HERE"
EOF
```

Важно:
- `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` не обязательны (Google провайдер сделан опциональным).
- Пароли и секреты НЕ сохранять в репозитории.

### Шаг 3 — установить зависимости (НЕ ci)
```bash
npm install
```

Если будут ошибки сети — повторить `npm install`.

### Шаг 4 — собрать проект
```bash
npm run build
```

### Шаг 5 — запустить через PM2
В репозитории есть `app/ecosystem.config.js`, который запускает `npm start` на порту `3005`.

Запуск:
```bash
cd /opt/nurtentan/app
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root
```

Проверка:
```bash
pm2 ls
curl -I http://127.0.0.1:3005
```

### Шаг 6 — настроить Nginx как reverse proxy на 3005
Создать конфиг:
```bash
cat > /etc/nginx/sites-available/nurtentan <<'EOF'
server {
  listen 80;
  server_name _;

  client_max_body_size 20m;

  # ПРОВЕРКА ФЛАГА ТЕХНИЧЕСКИХ РАБОТ
  set $maintenance 0;
  if (-f /opt/nurtentan/maintenance.flag) {
    set $maintenance 1;
  }
  
  # Если флаг есть и мы не в папке /public, возвращаем 503
  if ($maintenance = 1) {
    return 503;
  }

  error_page 503 @maintenance;
  location @maintenance {
    root /opt/nurtentan;
    rewrite ^(.*)$ /maintenance.html break;
  }

  location / {
    proxy_pass http://127.0.0.1:3005;
    proxy_http_version 1.1;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
EOF
```

Активировать сайт и перезапустить nginx:
```bash
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/nurtentan /etc/nginx/sites-enabled/nurtentan
nginx -t && systemctl restart nginx
systemctl enable nginx
```

Проверка:
```bash
curl -I http://127.0.0.1/
```

После этого сайт должен открываться по IP:
- `http://212.227.191.121`

### Шаг 7 — домен и SSL (в конце)
Когда домен будет привязан к VPS:
1) Обновить `.env`:
   - `NEXTAUTH_URL="https://ВАШ_ДОМЕН"`
2) В nginx заменить `server_name _;` на:
   - `server_name ВАШ_ДОМЕН www.ВАШ_ДОМЕН;`
3) Поставить certbot и выпустить сертификат:
```bash
apt -y install certbot python3-certbot-nginx
certbot --nginx -d ВАШ_ДОМЕН -d www.ВАШ_ДОМЕН
```
4) Перезапустить процессы:
```bash
systemctl restart nginx
pm2 restart all
```

## 4) Быстрые команды диагностики
Если “не работает”:
```bash
pm2 ls
pm2 logs --lines 120
systemctl status nginx --no-pager -l
journalctl -u nginx --no-pager -n 120
curl -I http://127.0.0.1:3005
curl -I http://127.0.0.1/
```

