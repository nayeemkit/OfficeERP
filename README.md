# Office ERP System

A full-stack ERP system built with Spring Boot 3.3 + Angular 17 + PostgreSQL + Redis + MinIO.

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Java JDK | 21+ | `java --version` |
| Gradle | 8.10+ (or use gradlew) | `gradle --version` |
| Node.js | 20+ | `node --version` |
| npm | 10+ | `npm --version` |
| Docker Desktop | Latest | `docker --version` |

---

## Quick Start (Docker Compose — Full Stack)

```bash
# Clone/copy the project
cd office-erp

# Start everything
docker compose up --build

# Access:
#   Frontend  → http://localhost
#   Backend   → http://localhost:8080
#   Swagger   → http://localhost:8080/swagger-ui.html
#   MinIO     → http://localhost:9001 (minio_user / minio_pass)
```

---

## Development Setup (Run Locally)

### 1. Start Infrastructure Only

```bash
# Start Postgres, Redis, MinIO (skip backend/frontend containers)
docker compose up postgres redis minio
```

### 2. Run Backend

```bash
cd backend

# First time only — generate Gradle wrapper
gradle wrapper --gradle-version 8.10.2

# Build
./gradlew build

# Run
./gradlew bootRun
```

Backend runs on **http://localhost:8080**

### 3. Run Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm start
```

Frontend runs on **http://localhost:4200** (proxies API to 8080)

---

## Default Login Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@erp.com | Admin@123 | ADMIN |

---

## API Endpoints (Auth Module)

| Method | URL | Body | Auth |
|--------|-----|------|------|
| POST | `/api/auth/login` | `{ email, password }` | No |
| POST | `/api/auth/register` | `{ firstName, lastName, email, password }` | No |
| POST | `/api/auth/refresh` | `{ refreshToken }` | No |
| POST | `/api/auth/logout` | `{ refreshToken }` (optional) | Bearer token |

### Example: Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@erp.com","password":"Admin@123"}'
```

### Response Format

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "a1b2c3d4...",
    "userId": "uuid",
    "email": "admin@erp.com",
    "fullName": "System Admin",
    "role": "ADMIN"
  },
  "timestamp": "2025-01-01T00:00:00"
}
```

---

## Project Structure

```
office-erp/
├── backend/
│   ├── build.gradle              # Dependencies & build config
│   ├── settings.gradle           # Project name
│   ├── Dockerfile
│   ├── src/main/java/com/erp/
│   │   ├── OfficeErpApplication.java
│   │   ├── config/               # Security, CORS, JWT filter, OpenAPI, Redis
│   │   ├── auth/                 # Login, register, refresh, logout
│   │   ├── user/                 # User entity, Role enum, repository
│   │   └── common/               # BaseEntity, ApiResponse, ExceptionHandler
│   └── src/main/resources/
│       ├── application.yml
│       └── db/migration/V1__init_auth.sql
├── frontend/
│   ├── package.json
│   ├── angular.json
│   ├── src/app/
│   │   ├── core/auth/            # AuthService
│   │   ├── core/guards/          # authGuard, roleGuard
│   │   ├── core/interceptors/    # JWT interceptor (auto-attach token, refresh on 401)
│   │   ├── shared/models/        # TypeScript interfaces
│   │   └── modules/
│   │       ├── auth/             # Login & Register pages
│   │       └── dashboard/        # Post-login landing page
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
├── k8s/
└── helm/
```

---

## Build Order & Progress

| # | Milestone | Status |
|---|-----------|--------|
| 1 | Project scaffolding | ✅ Done |
| 2 | Docker Compose (Postgres + Redis + MinIO) | ✅ Done |
| 3 | Auth module (JWT, RBAC, refresh, Angular login) | ✅ Done |
| 4 | User management CRUD | ⬜ Next |
| 5 | HR — Employee & Department CRUD | ⬜ |
| 6 | HR — Leave management | ⬜ |
| 7 | HR — Attendance tracking | ⬜ |
| 8 | HR — Payroll & payslip PDF | ⬜ |
| 9 | Inventory — Items & stock | ⬜ |
| 10 | Inventory — Asset management | ⬜ |
| 11 | Finance — Expense tracking | ⬜ |
| 12 | Finance — Invoices & budget | ⬜ |
| 13 | Projects — Project & task management | ⬜ |
| 14 | Reports — Dashboard & charts | ⬜ |
| 15 | Kubernetes manifests + Helm | ⬜ |
| 16 | CI/CD pipeline (GitHub Actions) | ⬜ |
