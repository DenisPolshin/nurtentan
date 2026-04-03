# Deployment Guide (IONOS VPS)

This guide will help you deploy the **nurtantan** project to your IONOS VPS using GitHub, PM2, and Nginx.

## 1. Prepare your VPS

Connect to your VPS via SSH and run the following commands:

### Update system
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Node.js (LTS)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Install Git, Nginx, and Certbot
```bash
sudo apt install -y git nginx certbot python3-certbot-nginx
```

### Install PM2
```bash
sudo npm install -g pm2
```

## 2. Clone and Setup Project

### Clone the repository
```bash
# Replace with your actual repo URL
git clone https://github.com/YOUR_USERNAME/nurtantan.git
cd nurtantan/app
```

### Environment Variables
Create a `.env` file in the `app` directory:
```bash
nano .env
```
Add the following (replace values):
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-very-secret-key"
NEXTAUTH_URL="https://yourdomain.de"
# Add other variables if needed
```

### Install and Build
```bash
npm install
npx prisma generate
npm run build
```

### Initial Database Seeding
```bash
node scripts/seed-verbs.js
```

## 3. Run with PM2

The project already has an `ecosystem.config.js`. Start the app:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup # Follow the instructions on screen
```

## 4. Configure Nginx

Create a new Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/nurtantan
```

Paste this configuration (replace `yourdomain.de` with your actual domain):
```nginx
server {
    listen 80;
    server_name yourdomain.de;

    location / {
        proxy_pass http://localhost:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/nurtantan /etc/nginx/sites-enabled/
sudo nginx -t
sudo system-role restart nginx
```

## 5. Setup SSL (HTTPS)

Run Certbot to get a free SSL certificate:
```bash
sudo certbot --nginx -d yourdomain.de
```

## 6. Updating the app

Whenever you push new changes to GitHub, run this on your VPS:
```bash
cd nurtantan/app
git pull
npm install
npm run build
npx prisma db push # If schema changed
pm2 restart kp-app
```

## 7. Useful Tips

- **Check logs**: `pm2 logs kp-app`
- **Restart app**: `pm2 restart kp-app`
- **Prisma Studio** (to see DB on VPS): `npx prisma studio --port 5555` (remember to open port 5555 in IONOS Firewall)
