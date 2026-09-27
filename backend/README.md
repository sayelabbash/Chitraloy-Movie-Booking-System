# 🎬 Movie Booking Application

A backend application for managing movies, theatres, shows, seats, bookings and online payments.

The application is built using Spring Boot and follows a layered backend architecture with Spring Data JPA, MySQL, Spring Security and JWT authentication.

---

## 🚀 Features

### 👤 Authentication & Authorization

- Normal user registration
- Admin registration through protected admin endpoint
- User login
- JWT-based authentication
- Role-based authorization
- `USER` and `ADMIN` roles
- Protected admin APIs
- Current authenticated user information

### 🎥 Movie Management

- Add movie
- Get all movies
- Search movies by title
- Search movies by genre
- Search movies by language
- Update movie
- Delete movie
- Pagination and sorting support

### 🏢 Theatre Management

- Add theatre
- Get all theatres
- Search theatres by location
- Update theatre
- Delete theatre

### 🎞️ Show Management

- Create shows
- Get all shows
- Get show by ID
- Get shows by movie
- Get shows by theatre
- Update shows
- Delete shows
- Prevent overlapping shows in the same theatre

### 💺 Seat Management

- Create seats for a show
- Get seats for a show
- Seat availability management
- Seat locking during booking
- Seat release after booking timeout
- Seat state transitions between `AVAILABLE`, `LOCKED` and `BOOKED`

### 🎟️ Booking Management

- Create booking
- Select multiple seats
- Seat availability validation
- Maximum seats per booking limit
- Active pending booking limit
- Booking attempt rate limiting
- Booking cancellation
- User booking history
- Admin booking management
- Booking lifecycle using booking statuses

### 💳 Payment

- Razorpay payment order creation
- Razorpay payment verification
- Payment signature verification
- Payment status tracking
- Payment retry after failed payment
- Booking confirmation after successful payment
- Seat conversion from `LOCKED` to `BOOKED`

### ⏰ Scheduled Operations

- Automatically release expired pending bookings
- Automatically make locked seats available again
- Cleanup old booking-attempt records

### 📧 Email

- Booking confirmation email after successful payment

### 🛡️ Exception Handling

- Global exception handling
- Resource not found handling
- Duplicate user handling
- Booking access validation
- Booking limit validation
- Too many booking attempts handling

---

# 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Java 17 | Programming language |
| Spring Boot 3.5.x | Backend framework |
| Spring Web | REST APIs |
| Spring Data JPA | Database access |
| Hibernate | ORM |
| Spring Security | Authentication & authorization |
| JWT | Stateless authentication |
| MySQL | Relational database |
| Maven | Build & dependency management |
| Razorpay | Payment integration |
| JavaMailSender | Email service |
| Lombok | Boilerplate reduction |
| JUnit / Spring Boot Test | Testing |

---

# 🏗️ Architecture

The application follows a layered architecture:

```text
                    Client
                      |
                      v
                Controller Layer
                      |
                      v
                Service Interface
                      |
                      v
                 ServiceImpl
                      |
                      v
                Repository Layer
                      |
                      v
                  Hibernate
                      |
                      v
                    MySQL

Security-related requests additionally pass through the JWT authentication filter:

Client
  |
  | JWT Token
  v
JWT Authentication Filter
  |
  v
Spring Security
  |
  v
Controller
  |
  v
Service
  |
  v
Repository
  |
  v
MySQL
📁 Project Structure
src/
├── main/
│   ├── java/
│   │   └── com/sayel/MovieBookingApplication/
│   │       │
│   │       ├── config/
│   │       │   ├── BookingLimitsProperties.java
│   │       │   └── CorsConfig.java
│   │       │
│   │       ├── controller/
│   │       │   ├── AdminController.java
│   │       │   ├── AuthenticationController.java
│   │       │   ├── BookingController.java
│   │       │   ├── MovieController.java
│   │       │   ├── PaymentController.java
│   │       │   ├── SeatController.java
│   │       │   ├── ShowController.java
│   │       │   └── TheaterController.java
│   │       │
│   │       ├── dto/
│   │       │
│   │       ├── exception/
│   │       │
│   │       ├── jwt/
│   │       │   ├── JWTAuthenticationFilter.java
│   │       │   └── JwtService.java
│   │       │
│   │       ├── model/
│   │       │
│   │       ├── repository/
│   │       │
│   │       ├── security/
│   │       │   └── SecurityConfig.java
│   │       │
│   │       ├── service/
│   │       │   ├── AuthenticationService.java
│   │       │   ├── AuthenticationServiceImpl.java
│   │       │   ├── BookingService.java
│   │       │   ├── BookingServiceImpl.java
│   │       │   ├── MovieService.java
│   │       │   ├── MovieServiceImpl.java
│   │       │   ├── PaymentService.java
│   │       │   ├── PaymentServiceImpl.java
│   │       │   ├── SeatService.java
│   │       │   ├── SeatServiceImpl.java
│   │       │   ├── ShowService.java
│   │       │   ├── ShowServiceImpl.java
│   │       │   ├── TheaterService.java
│   │       │   ├── TheaterServiceImpl.java
│   │       │   ├── CustomUserDetailsService.java
│   │       │   ├── EmailService.java
│   │       │   └── SeatReleaseScheduler.java
│   │       │
│   │       ├── AdminBootstrapSeeder.java
│   │       └── MovieBookingApplication.java
│   │
│   └── resources/
│       └── application.properties
│
└── test/
    └── java/
        └── com/sayel/MovieBookingApplication/
🗄️ Main Domain Models

The application contains the following major entities:

User
  |
  └── Booking
        |
        ├── Show
        │    ├── Movie
        │    └── Theater
        │
        └── Seat

Booking
  |
  └── Payment

Main models:

User
Movie
Theater
Show
Seat
Booking
Payment
BookingAttempt
🎟️ Booking Flow

The main booking workflow is:

1. User selects a show
        ↓
2. User selects seats
        ↓
3. Backend validates requested seats
        ↓
4. Selected seat rows are locked
        ↓
5. Booking is created with PENDING status
        ↓
6. Seats become LOCKED
        ↓
7. User creates Razorpay payment order
        ↓
8. User completes payment
        ↓
9. Backend verifies Razorpay signature
        ↓
10. Payment becomes SUCCESS
        ↓
11. Booking becomes CONFIRMED
        ↓
12. Seats become BOOKED
        ↓
13. Confirmation email is sent
⏳ Booking Expiration

A pending booking has a limited seat-hold period.

The current configuration uses:

booking.limits.seat-hold-minutes=5

If payment is not completed within the configured hold period, the scheduled cleanup process releases the seats and changes the booking state.

PENDING
   |
   | timeout
   v
CANCELLED

LOCKED seats
   |
   | timeout
   v
AVAILABLE

Payment verification also checks the booking expiry rather than relying only on the scheduler.

🔒 Concurrency & Seat Locking

The application uses database pessimistic locking for critical seat-booking operations.

The purpose is to prevent two concurrent booking requests from successfully selecting the same available seat.

Conceptually:

Request A
   |
   | lock seat row
   v
Seat A
   |
   | AVAILABLE → LOCKED
   v
Booking A


Request B
   |
   | tries to access same row
   v
waits according to database locking behavior

The application also uses transactions around important booking state changes.

💳 Payment Flow

Razorpay is used for payment processing.

Client
  |
  v
Create Booking
  |
  v
PENDING Booking
  |
  v
Create Razorpay Order
  |
  v
Razorpay Checkout
  |
  v
Payment Completed
  |
  v
Send payment details to backend
  |
  v
Verify Razorpay Signature
  |
  +--------------------+
  |                    |
Valid                Invalid
  |                    |
  v                    v
SUCCESS              FAILED
  |                    |
  v                    v
CONFIRMED            CANCELLED
  |
  v
Seats → BOOKED

The backend does not consider a payment successful only because the client reports success. The Razorpay signature is verified on the backend.

🔐 Authentication Flow

The application uses JWT-based stateless authentication.

User
 |
 | Login
 v
AuthenticationController
 |
 v
AuthenticationService
 |
 v
AuthenticationManager
 |
 v
User authentication
 |
 v
JwtService
 |
 v
JWT Token
 |
 v
Client

For protected requests:

Client
 |
 | Authorization: Bearer <JWT>
 v
JWTAuthenticationFilter
 |
 v
Validate JWT
 |
 v
SecurityContext
 |
 v
Controller
👥 Roles

The application supports:

USER
ADMIN

Admin-only endpoints are protected using Spring Security authorization rules and @PreAuthorize.

Examples of admin operations include:

Adding/updating/deleting movies
Managing theatres
Managing shows
Creating seats
Accessing administrative booking information
Registering an admin user through the protected admin endpoint
👑 Admin Bootstrap

The application contains an AdminBootstrapSeeder.

On application startup, it can create an initial admin account using environment variables.

The seeder checks whether the configured username already exists before creating the account.

Therefore, restarting the application does not continuously create duplicate admin users.

Admin bootstrap configuration:

ADMIN_BOOTSTRAP_USERNAME=admin
ADMIN_BOOTSTRAP_EMAIL=admin@example.com
ADMIN_BOOTSTRAP_PASSWORD=change_this_password

These values should be provided through environment variables and should not contain real credentials in source control.

🚦 Booking Protection

The application contains configurable booking limits.

Current configuration:

booking.limits.max-seats-per-booking=6
booking.limits.max-attempts=3
booking.limits.attempt-window-minutes=15
booking.limits.seat-hold-minutes=5
booking.limits.max-active-pending-bookings=1

These controls help limit:

Number of seats per booking
Repeated booking attempts
Active pending bookings
Duration of seat holds
📡 API Overview
Authentication
POST /api/auth/registernormaluser
POST /api/auth/login
GET  /api/auth/me
Admin
POST /api/admin/registeradminuser
Movies
POST   /api/movies/addMovie
GET    /api/movies/getallmovies
GET    /api/movies/getmoviebytitle
GET    /api/movies/getmoviebygenre
GET    /api/movies/getmoviebylanguage
PUT    /api/movies/updateMovie/{id}
DELETE /api/movies/deletemovie/{id}
Theatres
POST   /api/theater/addTheater
GET    /api/theater/getall
GET    /api/theater/getTheaterByLocation
PUT    /api/theater/updateTheater/{id}
DELETE /api/theater/deleteTheater/{id}
Shows
POST   /api/show/createshow
GET    /api/show/getallshows
GET    /api/show/{id}
GET    /api/show/getshowsbymovie/{id}
GET    /api/show/getshowsbytheater/{id}
PUT    /api/show/updateshow/{id}
DELETE /api/show/deleteshow/{id}
Seats
POST /api/seats/create
GET  /api/seats/show/{showId}
Bookings
POST /api/booking/createbooking
GET  /api/booking/mybookings
GET  /api/booking/getuserbookings/{id}
GET  /api/booking/getshowbookings/{id}
PUT  /api/booking/{id}/cancel
GET  /api/booking/getbookingbystatus/{bookingStatus}
Payments
POST /api/payment/create/{bookingId}
POST /api/payment/verify/{bookingId}
⚙️ Configuration

The application uses environment variables for sensitive configuration.

Create your local environment variables using .env.example as a reference.

Required variables include:

DB_PASSWORD=your_mysql_password

JWT_SECRET=your_long_random_jwt_secret

RAZORPAY_KEY=your_razorpay_test_key
RAZORPAY_SECRET=your_razorpay_test_secret

MAIL_USERNAME=your_email
MAIL_PASSWORD=your_gmail_app_password

APP_CORS_ORIGINS=http://localhost:5173

ADMIN_BOOTSTRAP_USERNAME=admin
ADMIN_BOOTSTRAP_EMAIL=admin@example.com
ADMIN_BOOTSTRAP_PASSWORD=change_this_password

Never commit real credentials, API secrets, database passwords, JWT secrets or mail app passwords to Git.

🗃️ Database Setup

The application uses MySQL.

Create the database:

CREATE DATABASE cinemabookingApp;

The application connects using the database configuration defined in application.properties.

Hibernate is currently configured with:

spring.jpa.hibernate.ddl-auto=update

This allows Hibernate to update the database schema based on the entity model during development.

▶️ Running the Application Locally
Prerequisites

Make sure you have:

Java 17
MySQL
Maven or Maven Wrapper
Razorpay test credentials
Gmail SMTP credentials/app password if email functionality is required
1. Clone the repository
git clone <your-github-repository-url>
cd MovieBookingApplication
2. Create the database
CREATE DATABASE cinemabookingApp;
3. Configure environment variables

Use .env.example as the template.

Configure the required environment variables in your IDE or operating system.

Do not commit .env.

4. Run the application

Using Maven:

mvn spring-boot:run

Or using the Maven wrapper:

Windows
mvnw.cmd spring-boot:run
Linux / macOS
./mvnw spring-boot:run

The application runs on:

http://localhost:8081
🧪 Testing

The project contains automated tests using Spring Boot Test and JUnit.

Current test areas include:

Spring Boot application context
Booking DTO validation
JWT service

Run tests with:

mvn test

or:

./mvnw test

On Windows:

mvnw.cmd test
📮 API Testing

The APIs can be tested using tools such as:

Postman
IntelliJ HTTP Client
curl

For protected endpoints, first authenticate and obtain the JWT token.

Then send:

Authorization: Bearer <your-jwt-token>
🔄 Booking State

The application uses booking states to represent the booking lifecycle.

Conceptually:

PENDING
   |
   +---- Payment Success ----> CONFIRMED
   |
   +---- Payment Failure ----> CANCELLED
   |
   +---- Timeout ------------> CANCELLED
   |
   +---- User Cancellation --> CANCELLED

Confirmed bookings are not treated as pending bookings.

📈 Future Improvements

Potential future improvements include:

Database migrations using Flyway or Liquibase
Production database configuration
More comprehensive integration tests
Testcontainers for database testing
Improved API response DTOs
API documentation using OpenAPI / Swagger
Centralized structured logging
Production-grade distributed scheduler coordination
Improved observability and monitoring
Redis-based distributed caching
Distributed rate limiting
CI/CD pipeline
Docker-based deployment
Cloud deployment
Improved payment webhook handling
📌 Project Status

This project is primarily a backend-focused Movie Booking Application built to demonstrate:

Spring Boot
REST API development
Spring Data JPA
Hibernate
MySQL
Spring Security
JWT authentication
Role-based authorization
Database transactions
Pessimistic locking
Booking lifecycle management
Razorpay integration
Scheduled background processing
Email integration
Validation
Exception handling
Service-layer architecture
👨‍💻 Author

Sk Sayel Abbash

Backend-focused Java / Spring Boot developer.