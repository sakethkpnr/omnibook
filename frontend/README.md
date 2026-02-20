# EventFlow — React Frontend

Modern React Event Booking System with glassmorphism UI, dark/light theme, and full user + admin flows.

## Stack

- React 18 (functional components)
- React Router v6
- Axios
- Context API (Auth, Theme)
- Tailwind CSS
- Vite 5

## Folder structure

```
src/
  components/   # Reusable UI (Navbar, Footer, EventCard, GlassCard, etc.)
  pages/        # Route pages (Home, Login, Register, EventDetail, Payment, Admin…)
  services/     # API client (axios)
  context/      # AuthContext, ThemeContext
  layouts/      # MainLayout (navbar + outlet + footer)
  hooks/        # useEvents
  utils/        # formatters (date, price)
```

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173. Set Vite proxy to your backend (e.g. `/api` → `http://127.0.0.1:8000`) in `vite.config.js`.

## Features

- **Auth:** Register, Login, JWT in localStorage, protected routes
- **User:** Home (hero + events), event cards, event detail, ticket selector, book, payment simulation, booking history
- **Admin:** Dashboard, add/edit/delete event, view bookings
- **UI:** Glassmorphism, dark/light toggle, gradient buttons, smooth animations, responsive layout
