# Personal Dev Tracker

A personal side project for tracking tasks, goals, habits, and journal entries — with a dashboard to see it all at a glance.

🔗 **Live demo:** [personal-dev-tracker.vercel.app/login](https://personal-dev-tracker.vercel.app/login)

## Features

- ✅ **Tasks** — create, update, complete, and delete tasks
- 🎯 **Goals** — track goals with milestones (add/update/remove milestones)
- 🔁 **Habits** — daily habit tracking with logs per date
- 📓 **Journal** — write and review personal journal entries
- 📊 **Dashboard & Reports** — visual summary of progress across tasks, goals, and habits
- 🔐 **Auth** — register/login with JWT-based authentication

## Tech Stack

**Frontend**
- [Next.js](https://nextjs.org/) 15 (App Router) + React 19 + TypeScript

**Backend**
- Node.js + [Express](https://expressjs.com/) 5 + TypeScript
- [MongoDB](https://www.mongodb.com/) via Mongoose
- JWT authentication (`jsonwebtoken`, `bcryptjs`)
- Request validation with `zod`

## Project Structure

```
personal-dev-tracker/
├── frontend/     # Next.js app (UI, pages, components)
└── backend/      # Express API (routes, models, auth, db)
```

## Deployment

This project runs as two separately deployed services:

- **Frontend → Vercel**
  The Next.js app is deployed on [Vercel](https://vercel.com/), which builds and serves the UI at the live demo link above.

- **Backend → Render**
  The Express API is deployed on [Render](https://render.com/) as a web service, connected to a MongoDB Atlas database. Render handles the server process, environment variables, and auto-deploys from the backend source.

The frontend talks to the backend through the `NEXT_PUBLIC_API_URL` environment variable, which points to the Render-hosted API URL in production.

## Getting Started (Local Development)

### 1. Clone and install

```bash
git clone <repo-url>
cd personal-dev-tracker

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Environment variables

Create a `.env` file in `backend/` (see `backend/.env.example`):

```env
PORT=5000
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/?appName=app
JWT_SECRET=your-secret-key-here
NODE_ENV=development
ALLOWED_ORIGIN=http://localhost:3000
FRONTEND_URL=https://your-app.vercel.app
```

Create a `.env.local` file in `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Run locally

```bash
# Backend (from /backend)
npm run dev      # http://localhost:5000

# Frontend (from /frontend)
npm run dev      # http://localhost:3000
```

## API Overview

| Resource | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Tasks | `GET/POST /api/tasks`, `PATCH/DELETE /api/tasks/:id`, `PATCH /api/tasks/:id/complete` |
| Goals | `GET/POST /api/goals`, `GET/PATCH/DELETE /api/goals/:id`, plus milestone sub-routes |
| Habits | `GET/POST /api/habits`, `GET/PATCH/DELETE /api/habits/:id`, plus daily log sub-routes |
| Health | `GET /health`, `GET /api/health` |

---

Thanks for checking it out! 🚀
