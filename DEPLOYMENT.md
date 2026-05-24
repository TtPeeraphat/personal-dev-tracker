# Personal Dev Tracker - Vercel Deployment Guide

## Overview

This full-stack TypeScript project is optimized for Vercel deployment with separate frontend (Next.js) and backend (Express) services. The frontend deploys to Vercel, while the backend can be hosted on any Node.js provider.

## Project Structure

```
/
├── frontend/           # Next.js 15 App Router
├── backend/           # Express.js API server
├── vercel.json        # Vercel configuration
├── .env.example       # Example environment variables
└── next.config.js     # Next.js production config
```

## Quick Start

### Install Dependencies
```bash
npm install --prefix backend && npm install --prefix frontend
```

### Development

**Start both services (from root):**
```bash
npm run dev
```

This runs:
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`

**Or run individually:**
```bash
cd backend && npm run dev      # Backend only
cd frontend && npm run dev     # Frontend only
```

### Production Build

**Build frontend only (for Vercel):**
```bash
cd frontend && npm run build
```

**Build backend:**
```bash
cd backend && npm run build
```

**Start production server (after build):**
```bash
cd backend && npm run start
cd frontend && npm run start
```

## Environment Configuration

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Frontend (.env.production)
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Backend (.env)
```
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=your-secret-key
NODE_ENV=production
ALLOWED_ORIGIN=https://your-app.vercel.app
FRONTEND_URL=https://your-app.vercel.app
```

## Vercel Deployment

### Setup

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_API_URL` (public, accessible to frontend)

### Build Command
```
cd frontend && npm run build
```

### Output Directory
```
frontend/.next
```

### Runtime
- **Framework Preset:** Next.js
- **Node.js Version:** 20.x or higher
- **Memory:** 1024 MB (default)

## Architecture

### Frontend (Vercel)
- **Framework:** Next.js 15 with App Router
- **Deployment:** Vercel (serverless)
- **Build Output:** Static HTML/CSS + JavaScript bundles
- **Automatic optimizations:** SWR, image optimization, code splitting

### Backend (External Provider)
- **Framework:** Express.js with TypeScript
- **Database:** MongoDB Atlas
- **Authentication:** JWT with HttpOnly cookies
- **Rate Limiting:** express-rate-limit
- **Input Validation:** Zod

## Type System

### Shared Types
- All models defined in `frontend/types/index.ts`
- Backend models mirror frontend types
- Strong type inference across stack

### Truncated TypeScript
The `@/` path alias simplifies imports:
```typescript
// Instead of:
import { Task } from "../../../backend/types/models";

// Use:
import type { Task } from "@/types";
```

## API Integration

### Base URL Configuration
- **Development:** `http://localhost:5000`
- **Production:** Environment variable `NEXT_PUBLIC_API_URL`

### API Client (`frontend/lib/api.ts`)
- Generic request wrapper with automatic token management
- Automatic 401 handling (redirect to login)
- Field-level error reporting from Zod validation

### Usage
```typescript
import { tasksApi } from "@/lib/api";

const tasks = await tasksApi.getAll();
const newTask = await tasksApi.create({ title: "..." });
```

## Building & Testing Locally

### Verify Build Works
```bash
cd frontend
npm run build      # Creates .next/ directory
npm run start      # Starts Next.js server on :3000

cd ../backend
npm run build      # Creates dist/ directory
npm run start      # Starts Express server on :5000
```

### Type Checking
```bash
cd frontend && npm run type-check
cd backend && npm run lint
```

## Common Issues & Solutions

### 1. Build Fails: "Cannot find module 'next/navigation'"
**Solution:** Ensure dependencies are installed:
```bash
cd frontend && npm install
```

### 2. Environment Variables Not Loading
**Vercel:**
- Check "Environment Variables" in project settings
- Ensure `NEXT_PUBLIC_` prefix for client-side variables
- Rebuild after changing env vars

**Local:**
- Create `.env.local` in frontend directory
- Restart dev server after changes

### 3. CORS Errors
**Backend .env:**
```
ALLOWED_ORIGIN=https://your-vercel-domain.vercel.app
FRONTEND_URL=https://your-vercel-domain.vercel.app
```

### 4. TypeScript Errors in Build
Run locally to catch errors before deployment:
```bash
cd frontend && npm run type-check
```

## Performance Optimizations

- **Next.js SWC compiler:** Faster TypeScript/Babel
- **Image optimization:** Automatic via Next.js Image component
- **Dynamic imports:** Code splitting for routes
- **Source maps disabled:** Reduces bundle size in production
- **Strict TypeScript:** Catches errors early

## Security Considerations

✅ **Implemented:**
- JWT authentication with expiry
- HTTP-only cookies support
- CORS properly configured per environment
- Rate limiting on API routes
- Input validation via Zod
- Password hashing with bcryptjs

⚠️ **TODO Before Production:**
- Set strong `JWT_SECRET` (minimum 32 characters)
- Enable HTTPS everywhere
- Configure MongoDB connection string securely
- Set up database backups
- Monitor API logs for suspicious activity

## Monitoring & Logs

### Vercel
- View logs: Vercel Dashboard → Deployments → Logs
- Frontend errors appear in browser console
- Build logs available in deployment history

### Backend
- Check application logs from your hosting provider
- Implement centralized logging (e.g., LogRocket, Sentry)
- Monitor database query performance

## File Structure Changes

### Before Optimization
```
⚠️ Files scattered across multiple directories
⚠️ TypeScript rootDir mismatch
⚠️ Unused dependencies in package.json
```

### After Optimization
```
✅ Clean separation: frontend/ and backend/
✅ Proper TypeScript configuration
✅ Production-ready environment handling
✅ Next.js App Router properly configured
✅ Type-safe imports throughout
```

## Next Steps

1. **Deploy to Vercel:**
   - Push to GitHub
   - Connect repo in Vercel dashboard
   - Set environment variables
   - Deployment happens automatically on push

2. **Deploy Backend:**
   - Choose provider (Render, Railway, Heroku, AWS)
   - Set `FRONTEND_URL` to your Vercel domain
   - Update frontend `NEXT_PUBLIC_API_URL` to backend URL

3. **Custom Domain:**
   - Add domain in Vercel settings
   - Update CORS origins in backend
   - DNS configuration per provider

## Support & Troubleshooting

- **Next.js Docs:** https://nextjs.org/docs
- **Vercel Deployment:** https://vercel.com/docs
- **Express.js Docs:** https://expressjs.com
- **TypeScript:** https://www.typescriptlang.org/docs

---

**Last Updated:** May 2026  
**Version:** 1.0.0
