# Easy Fashion Limited — Docker VPS Deployment Guide

This guide describes how to deploy the monorepo application (**NestJS Backend + Next.js Frontend + PostgreSQL**) on a Linux VPS in the easiest possible way using **Docker Compose** and **Nginx**.

- **Frontend Domain**: `https://easy.elevateapparel.com.bd`
- **Backend API Domain**: `https://easyapi.elevateapparel.com.bd`

---

## 1. Deployment Architecture

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
┌──────────────────────────────────┐             ┌──────────────────────────────────┐
│ Frontend Subdomain               │             │ Backend API Subdomain            │
│ easy.elevateapparel.com.bd       │             │ easyapi.elevateapparel.com.bd    │
│ └─► Container Port: 9977         │             │ └─► Container Port: 9978         │
└──────────────────────────────────┘             └──────────────────────────────────┘
                 │                                                │
                 └─────────────────────────┬──────────────────────┘
                                           ▼
                         ┌──────────────────────────────────┐
                         │ PostgreSQL Container             │
                         │ └─► Port: 5430                   │
                         └──────────────────────────────────┘
```

---

## 2. One-Command Update Workflow

Whenever you push new code to Git, updating the live application on your VPS is as simple as running:

```bash
git pull && docker compose up -d --build
```

---

## 3. Step 1: Install Docker & Tools on VPS

SSH into your Linux VPS:

```bash
ssh user@your-vps-ip
```

Install Docker & Docker Compose:

```bash
# Official Docker automated installer
curl -fsSL https://get.docker.com | sudo sh

# Add current user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Nginx, Certbot & UFW
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx ufw
```

---

## 4. Step 2: Clone Repository & Configure Environment

Clone your project repository on the VPS:

```bash
cd /var/www
git clone <YOUR_GIT_REPOSITORY_URL> easy-fashion
cd /var/www/easy-fashion
```

Copy the Docker environment template to `.env`:

```bash
cp .env.example .env
nano .env
```

Set secure values for your production instance:

```ini
POSTGRES_USER=easy_user
POSTGRES_PASSWORD=YOUR_STRONG_POSTGRES_PASSWORD
POSTGRES_DB=easy_fashion_prod_db

CORS_ORIGIN=https://easy.elevateapparel.com.bd
FRONTEND_URL=https://easy.elevateapparel.com.bd
NEXT_PUBLIC_API_BASE_URL=https://easyapi.elevateapparel.com.bd/api/v1

JWT_ACCESS_SECRET=your_long_random_access_secret_key_min_32_chars
JWT_REFRESH_SECRET=your_long_random_refresh_secret_key_min_32_chars

SUPER_ADMIN_EMAIL=admin@elevateapparel.com.bd
SUPER_ADMIN_PASSWORD=your_super_admin_password
SUPER_ADMIN_FULL_NAME="System Super Admin"
```

---

## 5. Step 3: Launch Docker Containers

Start all 3 containers (`postgres`, `backend`, `frontend`) in background mode:

```bash
docker compose up -d --build
```

Check running container status:

```bash
docker compose ps
```

View live container logs:

```bash
docker compose logs -f
```

---

## 6. Step 4: Setup Nginx & HTTPS SSL (Certbot)

### 6.1 Configure Host Nginx

Copy the Nginx configuration template from `deploy/nginx.conf`:

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/easy-fashion
sudo ln -s /etc/nginx/sites-available/easy-fashion /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
```

Test and reload Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 6.2 SSL Certificate via Certbot

Obtain free Let's Encrypt SSL certificates for both subdomains:

```bash
sudo certbot --nginx -d easy.elevateapparel.com.bd -d easyapi.elevateapparel.com.bd
```

---

## 7. Step 5: Configure Firewall (UFW)

Protect container ports (`5430`, `9977`, `9978`) from public internet access, exposing only SSH (`22`), HTTP (`80`), and HTTPS (`443`):

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 8. Docker Maintenance & Commands

| Task | Command |
| :--- | :--- |
| **Update & Redeploy** | `git pull && docker compose up -d --build` |
| **Check Container Status** | `docker compose ps` |
| **View All Container Logs** | `docker compose logs -f` |
| **View Backend Logs** | `docker compose logs -f backend` |
| **View Frontend Logs** | `docker compose logs -f frontend` |
| **Restart Services** | `docker compose restart` |
| **Stop All Containers** | `docker compose down` |
| **Prune Old Unused Images** | `docker image prune -f` |
