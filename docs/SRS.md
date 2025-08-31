# System Requirement Specification (SRS)
**Project:** Booking Platform  
**Version:** 1.0  
**Date:** 2025-08-31  
**Author:** Subin Jose Sabu

---

## 1. Introduction

### 1.1 Purpose
The purpose of this project is to develop a scalable booking platform that allows users to register, authenticate, and create bookings (e.g., meeting rooms or service slots).  
The platform ensures role-based authorization where normal users can only manage their own bookings, while administrators can manage all.

### 1.2 Scope
The system is delivered as two microservices:
- **Auth Service**: Handles registration, login, JWT-based authentication, and role management.  
- **Booking Service**: Manages CRUD operations for bookings with ownership and role-based rules.  

The backend is built with Node.js, Express, and TypeORM, using PostgreSQL as the database.  
Swagger API documentation is provided for both services.

---

## 2. Overall Description

### 2.1 Users
- **Admin**: Can manage all bookings, patch or delete any booking, view all bookings.  
- **User**: Can register, login, create bookings, and manage only their own bookings.  

### 2.2 System Features
- User registration and login  
- JWT-based authentication  
- Role-based authorization  
- Booking CRUD with ownership rules  
- API documentation with Swagger  

### 2.3 Constraints
- Database: PostgreSQL  
- Backend: Node.js + Express + TypeORM  
- Authentication: JWT (HS256)  
- Deployment: Docker + docker-compose  

---

## 3. Functional Requirements

### 3.1 Auth Service
- Register new user with name, email, password, role  
- Login user with email and password  
- Generate JWT token with role and user ID  

### 3.2 Booking Service
- Create booking (authenticated user or admin)  
- List bookings  
  - User → only own bookings  
  - Admin → all bookings  
- Get booking by ID  
  - User → only own  
  - Admin → any  
- Update booking (patch)  
  - User → only own  
  - Admin → any  
- Cancel booking (soft delete)  
  - User → only own  
  - Admin → any  

---

## 4. Non-Functional Requirements
- **Security**: All endpoints protected by JWT, role-based access enforced.  
- **Logging**: Winston logger with console + file output.  
- **Scalability**: Microservice architecture, can be deployed independently.  
- **Documentation**: Swagger/OpenAPI for each service.  
- **Maintainability**: TypeScript, DTO validation, layered code structure.  

---

## 5. Deliverables
- Backend code in GitHub repository  
- API documentation (Swagger)  
- ERD diagram of schema  
- High-level architecture diagram  
- SRS document (this file)  
