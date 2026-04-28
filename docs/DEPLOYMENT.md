# Synkly ERP — Complete Deployment & API Guide

## Architecture Overview

```
synkly/
├── backend/          Node.js + Express + MongoDB
│   ├── src/
│   │   ├── config/   Database connection
│   │   ├── controllers/ Route handlers
│   │   ├── middleware/  Auth, validation, errors
│   │   ├── models/      Mongoose schemas
│   │   ├── routes/      API endpoints
│   │   └── utils/       Logger, email, seeder
│   └── Dockerfile
├── frontend/         Next.js 14 + Tailwind + ShadCN
│   ├── src/
│   │   ├── app/     App Router pages
│   │   ├── components/ Reusable UI + dashboards
│   │   ├── lib/     API client, utils, validations
│   │   └── store/   Zustand auth store
│   └── Dockerfile
├── docker/           Nginx + init scripts
├── docker-compose.yml
└── DEPLOYMENT.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your values

npm install
npm run seed        # Seed demo data
npm run dev         # Start on port 5000
```

### Frontend Setup
```bash
cd frontend
# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local

npm install
npm run dev         # Start on port 3000
```

### Access Points
- Website:    http://localhost:3000
- API:        http://localhost:5000/api
- API Docs:   http://localhost:5000/api/docs
- Health:     http://localhost:5000/health

### Demo Credentials
```
Super Admin:   admin@synkly.io   /  Admin@123456
Demo Client:   client@demo.com   /  Client@123456
```

---

## 🐳 Docker Deployment (Production)

### 1. Clone and configure
```bash
git clone https://github.com/yourorg/synkly-erp.git
cd synkly-erp

cp backend/.env.example backend/.env
# Edit backend/.env with production values
```

### 2. Set environment variables
```bash
# Create .env for docker-compose
cat > .env << 'ENV'
MONGO_ROOT_USER=admin
MONGO_ROOT_PASS=YourStrongMongoPassword2025!
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
ENV
```

### 3. Build and run
```bash
docker-compose up -d --build

# Check status
docker-compose ps
docker-compose logs -f backend

# Run seed (first time only)
docker-compose exec backend node src/utils/seeder.js
```

### 4. Useful commands
```bash
docker-compose restart backend      # Restart backend
docker-compose stop                 # Stop all services
docker-compose down -v              # Stop + remove volumes
docker-compose exec mongodb mongosh # MongoDB shell
```

---

## 🌐 VPS Deployment (Hostinger / Any VPS)

### 1. Server preparation
```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker $USER

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### 2. SSL with Let's Encrypt
```bash
apt install certbot nginx -y
certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com

# Certificates will be at:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

### 3. Configure nginx.conf for SSL
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    ssl_certificate     /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    location /api { proxy_pass http://backend:5000; ... }
    location /     { proxy_pass http://frontend:3000; ... }
}
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}
```

### 4. Deploy
```bash
git clone https://github.com/yourorg/synkly-erp.git /opt/synkly
cd /opt/synkly
# Configure .env files
docker-compose -f docker-compose.yml up -d --build
```

---

## 📡 API Reference

### Authentication

| Method | Endpoint                        | Auth | Description                |
|--------|---------------------------------|------|----------------------------|
| POST   | /api/auth/register              | No   | Create account + company   |
| POST   | /api/auth/login                 | No   | Login, returns JWT         |
| GET    | /api/auth/me                    | Yes  | Get current user           |
| POST   | /api/auth/logout                | Yes  | Logout                     |
| POST   | /api/auth/forgot-password       | No   | Send reset email           |
| PUT    | /api/auth/reset-password/:token | No   | Reset with token           |
| PUT    | /api/auth/update-password       | Yes  | Change password (logged in)|
| POST   | /api/auth/refresh-token         | No   | Refresh access token       |

### Request / Response Format
```json
// POST /api/auth/login
{ "email": "client@demo.com", "password": "Client@123456" }

// Response 200
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "65f...",
    "firstName": "Demo",
    "lastName": "Client",
    "email": "client@demo.com",
    "role": "client_admin",
    "companyName": "Demo Corp",
    "plan": "growth"
  }
}

// Error 401
{ "success": false, "message": "Invalid credentials" }
```

### Users

| Method | Endpoint         | Auth | Role          | Description         |
|--------|------------------|------|---------------|---------------------|
| GET    | /api/users       | Yes  | admin+        | List users          |
| GET    | /api/users/:id   | Yes  | admin+        | Get user            |
| POST   | /api/users       | Yes  | client_admin+ | Create user         |
| PUT    | /api/users/:id   | Yes  | admin+        | Update user         |
| DELETE | /api/users/:id   | Yes  | admin+        | Delete user         |

### Modules

| Method | Endpoint           | Auth | Role        | Description         |
|--------|--------------------|------|-------------|---------------------|
| GET    | /api/modules       | No   | Public      | List all modules    |
| GET    | /api/modules/:slug | No   | Public      | Get module by slug  |
| POST   | /api/modules       | Yes  | super_admin | Create module       |
| PUT    | /api/modules/:id   | Yes  | super_admin | Update module       |
| DELETE | /api/modules/:id   | Yes  | super_admin | Delete module       |

### Pricing Plans

| Method | Endpoint           | Auth | Role        | Description         |
|--------|--------------------|------|-------------|---------------------|
| GET    | /api/pricing       | No   | Public      | List active plans   |
| GET    | /api/pricing/:id   | No   | Public      | Get plan details    |
| POST   | /api/pricing       | Yes  | super_admin | Create plan         |
| PUT    | /api/pricing/:id   | Yes  | super_admin | Update plan         |
| DELETE | /api/pricing/:id   | Yes  | super_admin | Delete plan         |

### Blog

| Method | Endpoint           | Auth     | Role        | Description         |
|--------|--------------------|----------|-------------|---------------------|
| GET    | /api/blog          | Optional | Public      | List published posts|
| GET    | /api/blog/categories| No      | Public      | Get categories      |
| GET    | /api/blog/:slug    | Optional | Public      | Get post by slug    |
| POST   | /api/blog          | Yes      | super_admin | Create post         |
| PUT    | /api/blog/:id      | Yes      | super_admin | Update post         |
| DELETE | /api/blog/:id      | Yes      | super_admin | Delete post         |

### Contact

| Method | Endpoint           | Auth | Role        | Description         |
|--------|--------------------|------|-------------|---------------------|
| POST   | /api/contact       | No   | Public      | Submit inquiry      |
| GET    | /api/contact       | Yes  | super_admin | List all inquiries  |
| PUT    | /api/contact/:id   | Yes  | super_admin | Update status       |
| DELETE | /api/contact/:id   | Yes  | super_admin | Delete inquiry      |

### Client Dashboard

| Method | Endpoint                         | Auth | Description                  |
|--------|----------------------------------|------|------------------------------|
| GET    | /api/client/dashboard            | Yes  | Dashboard stats              |
| GET    | /api/client/records/:module      | Yes  | List records for module      |
| POST   | /api/client/records/:module      | Yes  | Create record                |
| PUT    | /api/client/records/:module/:id  | Yes  | Update record                |
| DELETE | /api/client/records/:module/:id  | Yes  | Soft delete record           |
| GET    | /api/client/company              | Yes  | Get company info             |
| PUT    | /api/client/company              | Yes  | Update company               |
| GET    | /api/client/reports/:module      | Yes  | Module report                |

#### Modules Available
- `finance` — Transactions (income/expense)
- `hr` — Team members
- `crm` — Contacts, leads, clients
- `inventory` — Stock items
- `projects` — Tasks
- `support` — Support tickets

#### Example: Create a Finance Record
```bash
POST /api/client/records/finance
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Client Payment — Acme Corp",
  "amount": 12400,
  "type": "income",
  "category": "Service Fee",
  "date": "2025-04-20"
}

# Response 201
{
  "success": true,
  "message": "Record created",
  "data": {
    "_id": "65f...",
    "companyId": "65e...",
    "module": "finance",
    "data": { "description": "Client Payment…", "amount": 12400, ... },
    "createdAt": "2025-04-20T10:30:00.000Z"
  }
}
```

### Admin

| Method | Endpoint               | Auth | Role        | Description         |
|--------|------------------------|------|-------------|---------------------|
| GET    | /api/admin/stats       | Yes  | super_admin | Platform statistics |
| GET    | /api/admin/companies   | Yes  | super_admin | All companies       |
| GET    | /api/admin/audit-logs  | Yes  | super_admin | Audit trail         |

### Settings

| Method | Endpoint             | Auth | Role        | Description         |
|--------|----------------------|------|-------------|---------------------|
| GET    | /api/settings        | No   | Public      | Public settings     |
| GET    | /api/settings/all    | Yes  | super_admin | All settings        |
| PUT    | /api/settings        | Yes  | super_admin | Bulk update         |

---

## 🔐 RBAC Roles

| Role         | Access                                      |
|--------------|---------------------------------------------|
| super_admin  | Full platform access, all companies         |
| client_admin | Own company: full CRUD, user management     |
| staff        | Own company: read + limited write           |
| viewer       | Own company: read-only                      |

---

## ✅ Form Validation Rules

All forms validate with Zod on frontend + express-validator on backend:

| Field     | Rules                                                         |
|-----------|---------------------------------------------------------------|
| Name      | Required, 2–100 chars                                         |
| Email     | Required, valid format (regex)                                |
| Phone     | Required, 10–20 digits, allows +, spaces, dashes              |
| Password  | Min 8 chars, at least 1 number, 1 special character           |
| Message   | Min 10, max 2000 chars                                        |
| URL       | Must start with https://                                      |
| Amount    | Must be numeric, min 0.01                                     |

---

## 🔄 Environment Variables

### Backend (.env)
```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://...
JWT_SECRET=<random 64-char string>
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=<random 64-char string>
JWT_REFRESH_EXPIRE=30d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@synkly.io
FROM_NAME=Synkly ERP
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
STRIPE_SECRET_KEY=sk_test_...
FRONTEND_URL=https://yourdomain.com
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_SITE_NAME=Synkly ERP
```

---

## 📦 Technology Stack

| Layer       | Technology                              |
|-------------|-----------------------------------------|
| Frontend    | Next.js 14 (App Router), TypeScript     |
| Styling     | Tailwind CSS, ShadCN UI (Radix)         |
| State       | Zustand, React Query (TanStack)         |
| Forms       | React Hook Form + Zod validation        |
| Backend     | Node.js, Express.js                     |
| Database    | MongoDB, Mongoose ORM                   |
| Auth        | JWT + Refresh tokens + RBAC             |
| Email       | Nodemailer (SMTP)                       |
| Deployment  | Docker, Nginx, VPS / Hostinger          |
| API Docs    | Swagger / OpenAPI 3.0                   |
| Logging     | Winston                                 |
| Security    | Helmet, CORS, rate-limiting, sanitize   |

---

## 🌱 Sample Data Credentials

After running `npm run seed`:

```
Super Admin  →  admin@synkly.io   / Admin@123456
Demo Client  →  client@demo.com   / Client@123456
```

The seeder creates:
- 2 users (super admin + client admin)
- 2 companies
- 6 ERP modules
- 3 pricing plans (Starter / Growth / Enterprise)
- 3 sample blog posts
- Default platform settings

---

## 🚢 CI/CD (GitHub Actions — optional)

```yaml
# .github/workflows/deploy.yml
name: Deploy to VPS
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v0.1.10
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_KEY }}
          script: |
            cd /opt/synkly
            git pull origin main
            docker-compose up -d --build
```
