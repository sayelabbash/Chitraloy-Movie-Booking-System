# 🎬 Chitraloy — Movie Booking System

A full-stack movie ticket booking application built with **Java 17, Spring Boot, Spring Data JPA/Hibernate, MySQL, Spring Security + JWT, Razorpay, React, Vite and Tailwind CSS**.

Chitraloy provides a complete movie-booking workflow from browsing movies and selecting seats to booking, online payment verification, ticket generation and admin management.

---

## ✨ Features

### 👤 User Features
- User registration and login
- JWT-based authentication
- Browse movies
- Search movies by title
- Filter movies by genre and language
- View movie details
- Browse theatres and shows
- Real-time seat availability from the backend
- Select multiple seats
- Create a pending booking
- Five-minute seat hold
- Razorpay payment integration
- Payment verification
- Booking confirmation
- My Bookings
- Booking status filters
- Booking cancellation where supported
- Premium e-ticket view
- Browser print / Save as PDF
- Light / Dark theme

### 🛡️ Security
- Spring Security
- JWT authentication
- Role-based authorization
- `USER` and `ADMIN` roles
- Protected admin routes
- Booking ownership validation
- Payment ownership validation
- CORS configuration
- Backend secrets kept outside source control

### 🎟️ Booking & Seat Management
- Maximum seats per booking
- Duplicate-seat validation
- Pending booking limits
- Booking attempt rate limiting
- Pessimistic locking for concurrent seat selection
- Show-specific seat generation
- Automatic expiry of pending bookings
- Automatic release of locked seats
- Separate seat states:
  - AVAILABLE
  - LOCKED
  - BOOKED

### 💳 Payment
- Razorpay order creation
- Payment verification
- Payment amount handling
- Booking ownership checks
- Confirm booking only after successful payment verification

### 👨‍💼 Admin Features
- Admin authentication
- Dashboard
- Movie CRUD
- Theatre CRUD
- Show CRUD
- Seat generation
- Booking management
- User management
- Pagination
- Validation and user-friendly error handling

---

## 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │     React + Vite    │
                    │  Tailwind Frontend  │
                    └──────────┬──────────┘
                               │
                         REST API / JWT
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Spring Boot      │
                    │      Backend        │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        Spring Security   Service Layer     Controllers
            + JWT              │
                               ▼
                         Spring Data JPA
                               │
                               ▼
                         ┌───────────┐
                         │   MySQL   │
                         └───────────┘

External Integration:
        Spring Boot ───────► Razorpay
        Spring Boot ───────► Gmail SMTP
```

---

## 🛠️ Tech Stack

### Backend

| Technology | Usage |
|---|---|
| Java 17 | Programming language |
| Spring Boot | Backend framework |
| Spring Data JPA | Data access |
| Hibernate | ORM |
| Spring Security | Authentication & authorization |
| JWT | Stateless authentication |
| MySQL | Relational database |
| Maven | Build tool |
| Razorpay | Payment integration |
| JavaMailSender | Booking email |
| Scheduler | Expired booking cleanup |

### Frontend

| Technology | Usage |
|---|---|
| React | UI |
| Vite | Frontend tooling |
| Tailwind CSS | Styling |
| Axios | API communication |
| React Router | Routing |
| Lucide React | Icons |
| React Hot Toast | Notifications |

---

## 📁 Project Structure

```text
Chitraloy-Movie-Booking-System/
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/sayel/MovieBookingApplication/
│   │   │   │       ├── config/
│   │   │   │       ├── controller/
│   │   │   │       ├── dto/
│   │   │   │       ├── exception/
│   │   │   │       ├── jwt/
│   │   │   │       ├── model/
│   │   │   │       ├── repository/
│   │   │   │       ├── security/
│   │   │   │       └── service/
│   │   │   └── resources/
│   │   └── test/
│   ├── pom.xml
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── lib/
│   │   └── pages/
│   ├── package.json
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

## 🔄 Booking Flow

```text
Browse Movie
     ↓
Movie Details
     ↓
Select Theatre / Show
     ↓
Load Show-Specific Seats
     ↓
Select Available Seats
     ↓
Create Booking
     ↓
PENDING
     ↓
Seats LOCKED
     ↓
Create Razorpay Order
     ↓
Complete Payment
     ↓
Verify Payment
     ↓
CONFIRMED
     ↓
Seats BOOKED
     ↓
Generate / View E-Ticket
```

If payment fails or a pending booking expires:

```text
PENDING
   ↓
Payment Failed / Timeout
   ↓
CANCELLED
   ↓
Seats Released
```

---

## 🔐 Environment Variables

### Backend

Copy:

```text
backend/.env.example
```

to your local environment configuration and provide the required values.

Typical variables include:

```env
DB_PASSWORD=your_database_password
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY=your_razorpay_key
RAZORPAY_SECRET=your_razorpay_secret

MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_gmail_app_password

APP_CORS_ORIGINS=http://localhost:5173

ADMIN_BOOTSTRAP_USERNAME=admin
ADMIN_BOOTSTRAP_EMAIL=admin@example.com
ADMIN_BOOTSTRAP_PASSWORD=your_admin_password
```

### Frontend

Copy:

```text
frontend/.env.example
```

and configure:

```env
VITE_API_BASE_URL=http://localhost:8081
VITE_RAZORPAY_KEY_ID=your_razorpay_public_key
```

> Never commit real `.env` files, passwords, API secrets, JWT secrets or Gmail App Passwords.

---

## 🚀 Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/sayelabbash/Chitraloy-Movie-Booking-System.git
cd Chitraloy-Movie-Booking-System
```

### 2. Configure MySQL

Create the database:

```sql
CREATE DATABASE cinemabookingApp;
```

Configure your database credentials through the backend environment variables.

### 3. Start the Backend

```bash
cd backend
```

Windows:

```bash
mvnw.cmd spring-boot:run
```

Or with Maven installed:

```bash
mvn spring-boot:run
```

Backend:

```text
http://localhost:8081
```

### 4. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## 🧪 Testing

The project includes backend tests for application context, booking DTO validation and JWT service behavior.

Recommended end-to-end verification:

```text
User Registration
       ↓
Login
       ↓
Browse Movies
       ↓
Search / Filter
       ↓
Movie Details
       ↓
Show Selection
       ↓
Seat Selection
       ↓
Booking Creation
       ↓
Razorpay Payment
       ↓
Payment Verification
       ↓
Booking Confirmation
       ↓
E-Ticket / Print
       ↓
My Bookings
```

Admin verification:

```text
Admin Login
     ↓
Dashboard
     ↓
Movie CRUD
     ↓
Theatre CRUD
     ↓
Show CRUD
     ↓
Seat Generation
     ↓
Booking Management
     ↓
User Management
```

---

## 🧠 Concurrency & Booking Safety

The booking service uses database-level pessimistic locking while selecting seats.

Conceptually:

```text
User A ──┐
         ├──► Database Seat Lock ──► Seat validation ──► Booking
User B ──┘
```

This helps prevent two concurrent booking requests from successfully locking the same show seat.

Additional safeguards include:

- Maximum seats per booking
- Duplicate-seat validation
- Pending-booking limits
- Booking-attempt limits
- Expired booking cleanup
- Seat release scheduling

---

## 🗄️ Core Domain Model

```text
User
 │
 └── Booking
       │
       ├── Show
       │     ├── Movie
       │     └── Theatre
       │
       ├── Seat
       │
       └── Payment

Show
 │
 └── Seats
```

The application uses **show-specific seats**, so each show has its own seat inventory based on the theatre capacity.

---

## 📡 Main API Groups

### Authentication

```text
/api/auth/**
```

### Movies

```text
/api/movies/**
```

### Theatres

```text
/api/theater/**
```

### Shows

```text
/api/show/**
```

### Seats

```text
/api/seats/**
```

### Bookings

```text
/api/booking/**
```

### Payments

```text
/api/payment/**
```

### Admin

```text
/api/admin/**
```

---

## 🎫 Ticket

The application provides a reusable premium booking-ticket component shared across booking-related screens.

The ticket includes available booking information such as:

- Movie
- Poster
- Theatre
- Location
- Date
- Time
- Seats
- Number of tickets
- Total price
- Booking ID
- Booking status

It also supports browser-based printing / Save as PDF without requiring a heavy PDF-generation library.

---

## 🌗 UI & UX

The frontend focuses on:

- Cinematic movie-booking experience
- Responsive design
- Light theme
- Dark theme
- Premium ticket UI
- Clear booking states
- Seat-map visualization
- Loading skeletons
- Empty states
- Friendly API error messages
- Responsive admin interface
- Accessible interactive controls

---

## 🔒 Security Notes

This repository intentionally does **not** contain real credentials.

Before deploying:

1. Configure production environment variables.
2. Use a strong JWT secret.
3. Use a production database password.
4. Use Razorpay production credentials only in the backend environment.
5. Use a Gmail App Password rather than a Gmail account password for SMTP.
6. Configure production CORS origins.
7. Never expose backend secrets to the React frontend.

---

## 📌 Current Status

**Project:** Chitraloy Movie Booking System

**Status:** Production-ready project structure / deployment preparation

The application has been developed as a full-stack movie-booking project with authentication, role-based administration, show-specific seat management, booking lifecycle management, payment integration and responsive UI.

---

## 👨‍💻 Author

**Sk Sayel Abbash**

B.Tech — Computer Science & Engineering

GitHub:  
https://github.com/sayelabbash

---

## 📄 License

This project is intended primarily as a portfolio / educational full-stack application.

Add an explicit open-source license if you decide to distribute the project under one.
