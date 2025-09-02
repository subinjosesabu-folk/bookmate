# BookMate (Day 1 + Day 2 + Day 3)

## Overview
Full-stack booking platform with microservices (**auth-service**, **booking-service**) and a **React frontend**.

---

## Backend (Day 1)

### Quick Start (Local, without Docker)
1. Install **Postgres** and start it (default connection in `.env.example`).
2. In two shells, run for each service:

```bash
# Auth Service
cd auth-service
npm install
cp .env.example .env
npm run dev

# Booking Service
cd booking-service
npm install
cp .env.example .env
npm run dev
```

3. **Seed roles and admin** (auth-service):
```bash
cd auth-service
npm run seed
```

---

### Docker Quick Start
```bash
docker-compose up --build
```
- `auth-service` → http://3.105.188.67:4000  
- `booking-service` → http://3.105.188.67:4001  

---

### Swagger Documentation
- Auth Service → http://3.105.188.67:4000/api-docs  
- Booking Service → http://3.105.188.67:4001/api-docs  

---

### Default Admin
- **Email:** admin@example.com  
- **Password:** Admin@123  

---

### API Reference

#### Auth Service (4000)
| Endpoint | Method | Role | Description |
|----------|--------|------|-------------|
| `/auth/register` | POST | Public | Register a new user |
| `/auth/login` | POST | Public | Login and get JWT |
| `/auth/users` | GET | Admin | List all users |
| `/auth/users/:id/role` | PATCH | Admin | Update role (user/admin) |
| `/auth/users/:id/status` | PATCH | Admin | Enable/disable a user |

#### Booking Service (4001)

**Resources**
| Endpoint | Method | Role | Description |
|----------|--------|------|-------------|
| `/resources` | POST | Admin | Create resource |
| `/resources` | GET | User/Admin | List resources |
| `/resources/:id` | PATCH | Admin | Update resource |
| `/resources/:id` | DELETE | Admin | Delete resource |

**Bookings**
| Endpoint | Method | Role | Description |
|----------|--------|------|-------------|
| `/bookings` | POST | User/Admin | Create booking (≤4 hrs, no past, no overlap) |
| `/bookings` | GET | User/Admin | User → own; Admin → all |
| `/bookings/:id` | GET | User/Admin | User → own; Admin → any |
| `/bookings/:id` | PATCH | User/Admin | Update booking |
| `/bookings/:id` | DELETE | User/Admin | Cancel booking (soft delete, status=cancelled) |

---

## Frontend (Day 2)

### Quick Start (Local)
```bash
cd frontend
npm install
npm start
```
- Runs on http://3.105.188.67:3000
- Connects to backend services via `.env`:
```env
REACT_APP_AUTH_URL=http://3.105.188.67:4000
REACT_APP_BOOKING_URL=http://3.105.188.67:4001
```

### Features
- Login & Register (auth-service)
- User Dashboard:
  - View own bookings
  - Create / Edit / Cancel booking
  - Calendar view (no overlaps, ≤4 hrs, no past dates)
- Admin Dashboard:
  - Manage all bookings
  - Manage users (enable/disable, assign roles)
  - Manage resources (create/enable/disable)

### Screenshots
(Save screenshots in `/docs/screenshots/` and link here)

---

## Documentation
- Swagger docs:  
  - Auth Service → http://3.105.188.67:4000/api-docs  
  - Booking Service → http://3.105.188.67:4001/api-docs  
- SRS: [`/docs/SRS.md`](./docs/SRS.md)

---

## Deployment (Day 3)

### Docker Setup

All services are dockerized with their own `Dockerfile` and `.dockerignore`.

```bash
docker-compose up --build
```

* **Frontend** → [http://3.105.188.67:3000](http://3.105.188.67:3000)
* **Auth Service** → [http://3.105.188.67:4000](http://3.105.188.67:4000)
* **Booking Service** → [http://3.105.188.67:4001](http://3.105.188.67:4001)
* **Postgres DB** → bookmate-db:5432 (internal Docker network, not public)

### Environment Variables

Each service has its own `.env` file. Example:

**auth-service/.env**

```env
PORT=3001
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=booking_platform
JWT_SECRET=supersecret
```

**booking-service/.env**

```env
PORT=3002
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=booking_platform
AUTH_SERVICE_URL=http://3.105.188.67:4000
```

**frontend/.env**

```env
REACT_APP_AUTH_URL=http://3.105.188.67:4000
REACT_APP_BOOKING_URL=http://3.105.188.67:4001
```

### CI/CD Pipeline (GitHub Actions)

A simple pipeline for linting, building, and deploying.

**.github/workflows/ci.yml**

```yaml
name: CI/CD

on:
  push:
    branches: [ "main" ]

jobs:
  build:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        ports: ["5432:5432"]
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: booking_platform
    steps:
      - uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies (auth-service)
        run: cd auth-service && npm install

      - name: Install dependencies (booking-service)
        run: cd booking-service && npm install

      - name: Install dependencies (frontend)
        run: cd frontend && npm install

      - name: Run build
        run: |
          cd auth-service && npm run build
          cd ../booking-service && npm run build
          cd ../frontend && npm run build

      - name: Run tests
        run: |
          cd auth-service && npm test -- --watchAll=false
          cd ../booking-service && npm test -- --watchAll=false
          cd ../frontend && npm test -- --watchAll=false

      - name: Docker Build
        run: docker-compose build

      - name: Docker Push (optional)
        run: echo "Push to Docker Hub here if configured"
```

### Deployment Guide

1. Ensure Docker and Docker Compose are installed.
2. Clone the repo:

   ```bash
   git clone https://github.com/subinjosesabu-folk/bookmate
   cd bookmate
   ```
3. Create `.env` files inside each service (`auth-service`, `booking-service`, `frontend`).
4. Run:

   ```bash
   docker-compose up --build
   ```
5. Access the application:

   * Frontend → [http://3.105.188.67:3000](http://3.105.188.67:3000)
   * Backend Services → [http://3.105.188.67:4000](http://3.105.188.67:4000), [http://3.105.188.67:4001](http://3.105.188.67:4001)

### Deployment Flow (Architecture)

```
[Frontend React App] ---> [Auth Service] ----> [Postgres DB]
         |                    |
         |                    V
         +-----> [Booking Service] ----> [Postgres DB]
```

In production, these services can be hosted on **AWS ECS/EC2** or **Elastic Beanstalk**. Use **AWS Secrets Manager** or environment variables for secrets.

