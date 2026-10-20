# student-activity-management

Monorepo: React + Vite + Tailwind frontend, NestJS + Prisma backend.

## Structure

- `frontend/` - React 19 + Vite + Tailwind CSS v4 (runs in Figma Make; dev server already running on `$PORT`)
  - `src/main.tsx` - entrypoint, imports `src/index.css`
  - `src/App.tsx` - routes (`react-router-dom`)
  - `src/pages/{auth,admin,staff,student}/` - pages per role
  - `src/components/layouts/` - Admin/Staff/Student layouts; `src/components/ui/` - shared UI
  - `src/lib/api.ts` - API client; `src/data/mock.ts` - mock data still used by some pages
  - `src/assets/` - images imported in code; `public/` - static files (`/logo.png`)
  - `.figma/make/` - Figma Make config, required by `vite.config.ts` (do not delete)
- `backend/` - NestJS API, one folder per module in `src/`; `prisma/` has schema and seed
- `docs/` - project documents
- `docker-compose.yml`, `render.yaml`, `frontend/vercel.json` - deploy config

## Rules

- Styling: Tailwind utility classes in JSX; global CSS in `frontend/src/index.css`.
- Use double quotes for strings with apostrophes. Close JSX tags. Export components as default.
- Secrets live in `backend/.env` (git-ignored); copy from `backend/.env.example`.
