# ShowTime — Movie Ticket Booking Frontend

A fresh, BookMyShow-inspired frontend for the Spring Boot movie booking backend, built with **React + Vite + Tailwind CSS**.

## Features

- ☀️/🌙 Light and premium cinematic dark theme, toggleable from the navbar, persisted in `localStorage`
- 🎬 Home page with an auto-rotating hero banner, genre chips, and a horizontally scrolling "Recommended Movies" rail
- 🔍 Movie search + a compact filter popover (desktop) / bottom sheet (mobile) for genre/language, with removable active-filter chips
- 🎟️ Movie details page grouping showtimes by date and theater
- 💺 Cinema-style seat map (curved screen indicator, seat silhouettes, center aisle, live availability, 6-seat limit, 5-minute hold countdown)
- 💳 Razorpay checkout integration (order creation + signature verification)
- 🧾 Printable booking confirmation ("ticket") — dedicated print layout that always prints clean and light, even when the app is in dark theme
- 👤 Auth (JWT) — register, login, profile with booking history + cancellation
- 🛠️ Full Admin dashboard — Movies / Theaters / Shows CRUD, seat-layout generation, bookings by status, admin user creation
- 📱 Fully responsive, both themes styled consistently across every screen

## Getting started

```bash
npm install
cp .env.example .env   # then edit .env with your values
npm run dev
```

The app runs at `http://localhost:5173` by default — this **must** match `app.cors.allowed-origins` on the backend (`http://localhost:5173` by default).

### Environment variables (`.env`)

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the Spring Boot backend, e.g. `http://localhost:8081` |
| `VITE_RAZORPAY_KEY_ID` | Your Razorpay **Key ID** (public, safe for the browser). Must match the `razorpay.key` configured on the backend. |

## Running the backend alongside

1. Start MySQL and create the `cinemabookingApp` database (or update `spring.datasource.url`).
2. Set the required backend env vars: `DB_PASSWORD`, `JWT_SECRET`, `RAZORPAY_KEY`, `RAZORPAY_SECRET`, mail credentials, etc.
3. `./mvnw spring-boot:run` from the backend folder (runs on port `8081`).
4. `npm run dev` here (runs on port `5173`).

## Becoming an admin

The backend has no public "make me admin" endpoint. Use one of:
- The `ADMIN_BOOTSTRAP_USERNAME` / `ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD` env vars on the backend to seed an admin on startup, then log in with those credentials, or
- Have an existing admin use **Admin → Admin Users** in this app to register another admin (`POST /api/admin/registeradminuser`).

## Project structure

```
src/
  api/        Thin wrappers around every backend endpoint
  components/ Reusable UI (Navbar, SeatMap, MovieCard, Modal, etc.)
  context/    AuthContext (JWT session, login/register/logout)
  lib/        axios instance + formatting helpers
  pages/      Route-level pages
  pages/admin Admin dashboard pages
```

## Notes on backend quirks this frontend works around

- There is no `GET /api/movies/{id}` endpoint. Movie details are resolved from the movie embedded in any of its shows, falling back to a scan of the public paginated movie list if the movie has no shows yet.
- A booking starts as `PENDING` and is held for `booking.limits.seat-hold-minutes` (5 min by default) — the seat-selection and payment pages reflect this with a live countdown.
- Only one `PENDING` booking is allowed per user at a time (`booking.limits.max-active-pending-bookings`), so a stale pending booking should be paid or left to expire before starting a new one.

## Printing tickets

"Print Ticket" uses the browser's own `window.print()` — no PDF library is bundled. The app's
own CSS (`@media print` in `src/index.css`) hides the navbar, footer and every other on-screen
control so only the ticket prints, and forces a clean light layout even if the app is currently
in dark theme. The page header/footer some browsers add (page URL, date) is controlled by the
browser's print dialog, not by this app — turn it off via the dialog's "Headers and footers"
option (usually under "More settings") if you don't want it on the page.
