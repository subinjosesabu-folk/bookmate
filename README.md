# BookMate (Day 1 + Day 2)

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
- `auth-service` → http://localhost:3001  
- `booking-service` → http://localhost:3002  

---

### Swagger Documentation
- Auth Service → http://localhost:3001/api-docs  
- Booking Service → http://localhost:3002/api-docs  

---

### Default Admin
- **Email:** admin@example.com  
- **Password:** Admin@123  

---

### API Reference

#### Auth Service (3001)
| Endpoint | Method | Role | Description |
|----------|--------|------|-------------|
| `/auth/register` | POST | Public | Register a new user |
| `/auth/login` | POST | Public | Login and get JWT |
| `/auth/users` | GET | Admin | List all users |
| `/auth/users/:id/role` | PATCH | Admin | Update role (user/admin) |
| `/auth/users/:id/status` | PATCH | Admin | Enable/disable a user |

#### Booking Service (3002)

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
- Runs on http://localhost:3000  
- Connects to backend services via `.env`:
```env
REACT_APP_AUTH_URL=http://localhost:3001
REACT_APP_BOOKING_URL=http://localhost:3002
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
  - Auth Service → http://localhost:3001/api-docs  
  - Booking Service → http://localhost:3002/api-docs  
- SRS: [`/docs/SRS.md`](./docs/SRS.md)

---
