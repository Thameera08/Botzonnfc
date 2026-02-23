# NFC Business Profile App (Frontend + MongoDB API)

Full-stack NFC business profile system with a React admin/public UI and a MongoDB-backed Express API.

## Stack

- Frontend: Vite + React, React Router DOM, Tailwind CSS, Axios, react-hook-form + zod, lucide-react
- Backend: Node.js, Express, MongoDB (Mongoose), JWT auth

## Setup

1. Copy env values:

```bash
cp .env.example .env
```

2. Update `.env` values:

- `MONGODB_URI`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `VITE_API_BASE_URL` (local: `http://localhost:5050/api`)
- `FRONTEND_URL` (local: `http://localhost:5173`)

3. Install dependencies:

```bash
npm install
```

4. Run frontend + backend together:

```bash
npm run dev:all
```

Frontend: `http://localhost:5173`
API: `http://localhost:5050/api`

## Scripts

- `npm run dev` - frontend only
- `npm run server` - backend only
- `npm run dev:all` - frontend + backend
- `npm run build` - frontend production build
- `npm run lint` - lint all source files

## Deploy To Vercel

This repo is configured for Vercel with:

- Static frontend build from `dist`
- Serverless API handler at `/api/*` via `api/index.js`

Files used:

- `vercel.json`
- `api/index.js`

### Vercel environment variables

Set these in Vercel Project Settings -> Environment Variables:

- `MONGODB_URI`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `VITE_API_BASE_URL=/api`
- `FRONTEND_URL=https://your-project-name.vercel.app`

Then deploy the project. Frontend routes and API routes are served from the same domain.

## Routes

Public:

- `/:username`

Admin:

- `/admin/login`
- `/admin/dashboard`
- `/admin/profiles`
- `/admin/profiles/new`
- `/admin/profiles/:id/edit`

Admin routes are protected by `PrivateRoute` and require `nfc_admin_token` in localStorage.

## API Endpoints

- `POST /api/admin/login`
- `GET /api/admin/dashboard`
- `GET /api/admin/profiles?search=&status=&page=&limit=`
- `GET /api/admin/profiles/:id`
- `POST /api/admin/profiles`
- `PUT /api/admin/profiles/:id`
- `PATCH /api/admin/profiles/:id/status`
- `GET /api/profile/:username`

## MongoDB Model

Profiles store:

- `full_name`, `company_name`, `designation`, `username`
- `email`, `phone`, `location`, `bio`
- `profile_image_url`, social links
- `nfc_uid`, `qr_image_url`, `status`
- `created_at`, `updated_at`

## Notes

- Admin login is validated from MongoDB (`admins` collection). Run `npm run seed` to create/update the admin user from `.env` values.
- Public disabled profiles still load, but frontend blocks contact actions and shows unavailable state.
- UI has been updated to a modern glassmorphism-inspired style with improved button/card styling.
# Botzonnfc
