# Booking Platform - Frontend (Day 2)

This is the **Day 2 deliverable**: a React frontend for the booking platform.

---

## Quick Start (Local)
```bash
cd frontend
npm install
npm start
```
Runs on: http://3.105.188.67:3000

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
REACT_APP_AUTH_URL=http://3.105.188.67:4000
REACT_APP_BOOKING_URL=http://3.105.188.67:4001
```

---

## Screenshots
Add screenshots under `/docs/screenshots/` and link them in the docs.

---
