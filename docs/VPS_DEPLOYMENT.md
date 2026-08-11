# Easy Fashion Limited — VPS Production Deployment Guide

This document provides a complete, step-by-step manual guide to deploying the **Easy Fashion Limited E-Commerce Platform** on a Linux VPS using dedicated subdomains:

- **Frontend Domain**: `https://easy.elevateapparel.com.bd`
- **Backend API Domain**: `https://easyapi.elevateapparel.com.bd`

---

## 1. Deployment Architecture & Domain Mapping

### Architecture

```text
                                [ Internet / Public ]
                                          │
                                          ▼
                      ┌───────────────────────────────────────┐
                      │ Nginx Reverse Proxy (Ports 80 / 443)  │
                      └───────────────────┬───────────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
┌──────────────────────────────────┐            ┌──────────────────────────────────┐
│ Frontend Domain                  │            │ Backend API Domain               │
│ easy.elevateapparel.com.bd       │            │ easyapi.elevateapparel.com.bd    │
│ └─► Proxy: http://127.0.0.1:9977 │            │ └─► Proxy: http://127.0.0.1:9978 │
└──────────────────────────────────┘            └──────────────────────────────────┘
                                                                  │
                                                                  ▼
                                                ┌──────────────────────────────────┐
                                                │ Local PostgreSQL Instance        │
                                                │ └─► Port: 5430                   │
                                                └──────────────────────────────────┘
```

### Resource Allocation

| Service | Domain | Internal Port | Protocol | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend UI** | `easy.elevateapparel.com.bd` | `9977` | HTTP/HTTPS | ✅ Configured |
| **Backend API** | `easyapi.elevateapparel.com.bd` | `9978` | HTTP/HTTPS | ✅ Configured |
| **PostgreSQL** | `localhost` | `5430` | PostgreSQL | ✅ Configured |

---

## 2. Fast Update Workflow (Summary)

For subsequent code updates after initial deployment, run:

```bash
git pull
pnpm install
pnpm --dir backend prisma:generate
pnpm backend:build
pnpm frontend:build
pnpm --dir backend prisma:migrate:deploy
pm2 reload ecosystem.config.js
```

---

## 3. Step 1: VPS System & Package Setup

Log into your server via SSH:

```bash
ssh user@your-vps-ip
```

Update system packages and install required tools:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential nginx certbot python3-certbot-nginx ufw postgresql postgresql-contrib
```

### Install Node.js 20.x LTS & pnpm

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Enable pnpm & PM2
sudo corepack enable
sudo pnpm setup
sudo npm install -g pm2
```

---

## 4. Step 2: Local PostgreSQL Configuration (Port 5430)

### 4.1 Change PostgreSQL Port to 5430

Open `postgresql.conf` (adjust version number if using a different release, e.g. `16` or `15`):

```bash
sudo nano /etc/postgresql/16/main/postgresql.conf
```

Find the port configuration line and change it to `5430`:

```ini
port = 5430
listen_addresses = '127.0.0.1'
```

Restart PostgreSQL to apply the changes:

```bash
sudo systemctl restart postgresql
```

### 4.2 Create Database & Dedicated User

Access the PostgreSQL CLI on port `5430`:

```bash
sudo -u postgres psql -p 5430
```

Execute the following SQL statements (replace `SECURE_DB_PASSWORD` with a strong password):

```sql
CREATE USER easy_user WITH PASSWORD 'SECURE_DB_PASSWORD';
CREATE DATABASE easy_fashion_prod_db OWNER easy_user;
GRANT ALL PRIVILEGES ON DATABASE easy_fashion_prod_db TO easy_user;
\q
```

Test the connection:

```bash
psql -h 127.0.0.1 -p 5430 -U easy_user -d easy_fashion_prod_db
```

---

## 5. Step 3: Firewall Setup (UFW)

Protect internal application & database ports (`5430`, `9977`, `9978`) from public exposure. Only allow SSH (`22`), HTTP (`80`), and HTTPS (`443`).

```bash
# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Public ports
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
sudo ufw status verbose
```

---

## 6. Step 4: Repository Setup & Environment Variables

Clone your repository on the VPS:

```bash
cd /var/www
sudo git clone <YOUR_GIT_REPOSITORY_URL> easy-fashion
sudo chown -R $USER:$USER /var/www/easy-fashion
cd /var/www/easy-fashion
```

### 6.1 Backend Production `.env`

Copy the backend environment template:

```bash
cp deploy/.env.backend.production.example backend/.env
nano backend/.env
```

Set appropriate values in `backend/.env`:

```ini
NODE_ENV=production
PORT=9978
API_PREFIX=/api/v1
APP_NAME="Easy Fashion API"

DATABASE_URL=postgresql://easy_user:SECURE_DB_PASSWORD@127.0.0.1:5430/easy_fashion_prod_db?schema=public

CORS_ORIGIN=https://easy.elevateapparel.com.bd

BODY_LIMIT=10mb
THROTTLE_TTL=60000
THROTTLE_LIMIT=100

# Generate keys using: openssl rand -base64 48
JWT_ACCESS_SECRET=your_long_random_access_secret_key_min_32_chars
JWT_REFRESH_SECRET=your_long_random_refresh_secret_key_min_32_chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12

SUPER_ADMIN_EMAIL=admin@elevateapparel.com.bd
SUPER_ADMIN_PASSWORD=your_super_admin_password
SUPER_ADMIN_FULL_NAME="System Super Admin"

FRONTEND_URL=https://easy.elevateapparel.com.bd
```

### 6.2 Frontend Production `.env.local`

Copy the frontend environment template:

```bash
cp deploy/.env.frontend.production.example frontend/.env.local
nano frontend/.env.local
```

Set appropriate values in `frontend/.env.local`:

```ini
NEXT_PUBLIC_API_BASE_URL=https://easyapi.elevateapparel.com.bd/api/v1
```

---

## 7. Step 5: Install Dependencies, Build, & Run Migrations

Run installation and production builds from the workspace root:

```bash
# 1. Install Node modules
pnpm install

# 2. Generate Prisma Client
pnpm --dir backend prisma:generate

# 3. Build Backend & Frontend
pnpm backend:build
pnpm frontend:build

# 4. Deploy Database Migrations
pnpm --dir backend prisma:migrate:deploy

# 5. Seed Super Admin Account & Initial Catalog Data
pnpm --dir backend prisma:seed
```

---

## 8. Step 6: Process Management with PM2

Start both services using the pre-configured `ecosystem.config.js`:

```bash
# Start backend and frontend processes
pm2 start ecosystem.config.js

# Save process list for server reboot survival
pm2 save

# Generate and configure PM2 startup script
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp /home/$USER
```

Verify PM2 process status:

```bash
pm2 status
```

---

## 9. Step 7: Nginx & SSL Setup (Certbot)

### 9.1 Configure Nginx

Copy the Nginx configuration template:

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/easy-fashion
```

Enable the site by creating a symlink:

```bash
sudo ln -s /etc/nginx/sites-available/easy-fashion /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
```

Test configuration syntax:

```bash
sudo nginx -t
```

Reload Nginx:

```bash
sudo systemctl reload nginx
```

### 9.2 HTTPS Certificate via Certbot

Generate a single SSL certificate for both subdomains:

```bash
sudo certbot --nginx -d easy.elevateapparel.com.bd -d easyapi.elevateapparel.com.bd
```

Test automatic renewal:

```bash
sudo certbot renew --dry-run
```

---

## 10. Server Monitoring & Log Commands

### PM2 Application Logs

```bash
# Live stream for all applications
pm2 logs

# Live stream for backend only
pm2 logs easy-fashion-backend

# Live stream for frontend only
pm2 logs easy-fashion-frontend

# Flush old log files
pm2 flush
```

### System & Server Logs

```bash
# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-16-main.log
```

---

## 11. Production Troubleshooting

| Symptom | Probable Cause | Resolution |
| :--- | :--- | :--- |
| **502 Bad Gateway** | PM2 services not running or listening on wrong port | Run `pm2 status` and check `pm2 logs`. Verify Next.js is on `9977` and NestJS is on `9978`. |
| **Database Connection Refused** | PostgreSQL is down or not running on port `5430` | Check `sudo systemctl status postgresql` and verify `port = 5430` in `postgresql.conf`. |
| **CORS Network Error on Frontend** | `CORS_ORIGIN` mismatch in `backend/.env` | Update `CORS_ORIGIN=https://easy.elevateapparel.com.bd` in `backend/.env` and run `pm2 reload easy-fashion-backend`. |
| **Prisma Migration Error** | Pending schema changes or missing credentials | Verify `DATABASE_URL` in `backend/.env` and execute `pnpm --dir backend prisma:migrate:deploy`. |
