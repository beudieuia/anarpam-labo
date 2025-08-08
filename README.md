# ANARPAM Labo – Next.js Frontend (Vercel-Ready)

This repository contains the Next.js frontend for the ANARPAM laboratory application.

## Quick Start (Local)

```bash
# use Node 20
nvm use 20 || echo "Use Node v20+"
cp .env.example .env.local  # adjust values

npm install
npm run dev
```

App runs at http://localhost:3000

## Deploy to Vercel

1. Push this repo to GitHub (public or private).
2. Go to Vercel → **New Project** → **Import Git Repository**.
3. Framework preset: **Next.js** (detected automatically).
4. Environment Variables: add values that match `.env.example` (e.g. `NEXT_PUBLIC_API_BASE_URL`).
5. Deploy.

> If you need server-side API routes, add them under `app/api/*` (Next.js route handlers) or host a backend separately (FastAPI) and set `NEXT_PUBLIC_API_BASE_URL` to it.

## Scripts

- `npm run dev` – Start dev server
- `npm run build` – Production build
- `npm run start` – Start production server
- `npm run lint` – Lint the project

## GitHub CI (optional)

This repo includes a minimal GitHub Actions workflow at `.github/workflows/ci.yml` that installs dependencies, lints and builds on every push/PR.

## Notes

- Do **not** commit `.env.local` or secrets.
- `node_modules/` is ignored by Git and not included in the archive.
- Vercel will install dependencies and build automatically on each push.
