# Booking Platform - Frontend (Day 2)

This is the **Day 2 deliverable**: a React frontend for the booking platform.

---

## Quick Start (Local)
```bash
cd frontend
npm install
npm start
```
Runs on: http://localhost:3000

---

## Features
- **Authentication**
  - Login, Register (via auth-service)
- **User Dashboard**
  - View personal bookings
  - Create / Edit / Cancel booking
  - Calendar view (overlap validation, ≤4 hrs, no past dates)
- **Admin Dashboard**
  - View all bookings
  - Manage users (enable/disable, assign roles)
  - Manage resources (add/enable/disable)

---

## Environment Variables
Create `.env` in `/frontend`:
```env
REACT_APP_AUTH_URL=http://localhost:3001
REACT_APP_BOOKING_URL=http://localhost:3002
```

---

## Screenshots
Add screenshots under `/docs/screenshots/` and link them in the docs.

---
