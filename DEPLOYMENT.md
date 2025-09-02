# Deployment Guide – Bookmate

This document explains how to deploy the **Bookmate** application (Auth Service, Booking Service, Frontend, and Postgres DB) on an EC2 instance using Docker Compose.

---

## Prerequisites

- **AWS EC2** instance (t2.micro is fine for testing).
- **Docker** and **Docker Compose** installed.
- Security Group with ports **3000, 4000, 4001, 5432** open.

---

## Steps

### 1. Clone the Repository

```bash
git clone https://github.com/subinjosesabu-folk/bookmate.git
cd bookmate
```

### 2. Environment Variables

Create `.env` files for each service.

**auth-service/.env**

```env
PORT=4000
DB_HOST=bookmate-db
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=booking_platform
JWT_SECRET=change_me
```

**booking-service/.env**

```env
PORT=4001
DB_HOST=bookmate-db
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=booking_platform
JWT_SECRET=change_me
AUTH_API_URL=http://bookmate-auth-service:4000
```

**frontend/.env**

```env
PORT=3000
NODE_ENV=production
REACT_APP_AUTH_API=http://<EC2_PUBLIC_IP>:4000
REACT_APP_BOOKING_API=http://<EC2_PUBLIC_IP>:4001
```

---

### 3. Run Docker Compose

```bash
docker-compose up --build -d
```

---

### 4. Access Services

- Frontend → `http://<EC2_PUBLIC_IP>:3000`
- Auth Service → `http://<EC2_PUBLIC_IP>:4000/api-docs`
- Booking Service → `http://<EC2_PUBLIC_IP>:4001/api-docs`

---

### 5. Default Admin

- Email: `admin@example.com`
- Password: `Admin@123`

---

## Notes

- To rebuild only frontend after code changes:

  ```bash
  docker-compose build --no-cache frontend
  docker-compose up -d frontend
  ```

- To view logs:

  ```bash
  docker logs -f bookmate-frontend
  docker logs -f bookmate-auth-service
  docker logs -f bookmate-booking-service
  ```

- Data is persisted in the Docker volume `postgres_data`.

---

