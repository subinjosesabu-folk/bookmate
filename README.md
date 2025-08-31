# Booking Platform - Day 1 (Auth + Booking Services)

This is a Day 1 deliverable: two small microservices (auth-service, booking-service)
built with Express + TypeORM + TypeScript.

Quick start (local, without Docker):

1. Install Postgres and start it (default connection in .env.example).
2. In two shells, run for each service:

    cd auth-service
    npm install
    cp .env.example .env
    npm run dev

    cd booking-service
    npm install
    cp .env.example .env
    npm run dev

Seed roles and admin (auth-service):
    cd auth-service
    npm run seed

Docker quick start:
    docker-compose up --build
    # services: auth-service on 3001, booking-service on 3002

Swagger:
- http://localhost:3001/api-docs
- http://localhost:3002/api-docs

Default admin:
- email: admin@example.com
- password: Admin@123
