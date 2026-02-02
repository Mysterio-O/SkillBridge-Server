# Skill Bridge — Server

Server-side application for the Skill Bridge project (API + auth + database).

## Overview

- Language: TypeScript
- Framework: Express
- Auth: better-auth (with Prisma adapter)
- ORM: Prisma (PostgreSQL via `pg`)
- Build: `tsup`
- Runtime tooling: `tsx` for local dev

Source layout (important paths):

- `src/` — application source
  - `src/server.ts` — entry for dev and server start
  - `src/app.ts` — express app configuration
  - `src/lib/prisma.ts` — Prisma client initialization
  - `src/lib/auth.ts` — authentication configuration (email, social)
  - `src/config/config.ts` — seed admin env values
  - `src/scripts/seedAdmin.ts` — seed admin user script
- `prisma/` — prisma schema and migrations
- `generated/prisma/` — generated Prisma client used by runtime

## Prerequisites

- Node.js (v18+ recommended)
- npm (or yarn/pnpm) — commands below use `npm`
- A PostgreSQL database instance and a connection string

## Important environment variables

Create a `.env` file at the project root with at least the following:

```
DATABASE_URL=postgresql://user:password@host:5432/dbname

# SMTP account used to send verification emails
APP_USER=youremail@example.com
APP_PASSWORD=your-smtp-password
APP_URL=http://localhost:3000

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Values used by the seed admin script
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@example.com
ADMIN_ROLE=admin
ADMIN_PASS=supersecurepassword
SEED_ADMIN_URL=http://localhost:3000
```

Adjust values as needed for production.

## Install

Clone the repo and install dependencies:

```bash
npm install
```

Note: `postinstall` runs `prisma generate` automatically (see `package.json`).

## Database setup

The project uses Prisma migrations stored in `prisma/migrations/`.

Run migrations against your `DATABASE_URL`:

```bash
npx prisma migrate deploy      # for production (applies migrations)
# or for development
npx prisma migrate dev
```

Generate the Prisma client (usually run automatically by `postinstall`):

```bash
npx prisma generate
```

## Seed admin user

There is a seed script to create an admin user using env values in `src/config/config.ts`.

```bash
npm run seedAdmin
# which executes: npx tsx src/scripts/seedAdmin.ts
```

## Scripts

- `npm run dev` — start development watcher using `tsx` (runs `npx tsx watch src/server.ts`)
- `npm run build` — runs `prisma generate` then builds with `tsup`
- `npm run seedAdmin` — seeds admin user

These come from `package.json`.

## Running locally (development)

1. Ensure `.env` is configured and migrations have been applied.
2. Start the app in dev mode:

```bash
npm run dev
```

The dev server uses `npx tsx watch src/server.ts` and will reload on TypeScript changes.

## Running production build

```bash
npm run build
# then run the built output (tsup output), for example:
# node dist/server.js
```

Adjust the run command to match the built output file.

## Email and Auth notes

- The SMTP transporter in `src/lib/auth.ts` is configured to use Gmail SMTP by default (`smtp.gmail.com`).
- Email verification links are built using `APP_URL`.
- Social login via Google uses `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

## Deployment notes

- The repo includes `vercel.json` and an `api/` folder used for deployment on Vercel.
- Ensure environment variables are set in your hosting provider (DATABASE_URL, APP_USER, APP_PASSWORD, APP_URL, etc.).
- Prisma migrations should be applied in the deployment environment or use `prisma migrate deploy` in CI.

## Key files to inspect

- `src/server.ts`
- `src/app.ts`
- `src/lib/prisma.ts`
- `src/lib/auth.ts`
- `src/config/config.ts`
- `prisma/schema.prisma` and `prisma/migrations/`

## Troubleshooting

- If Prisma client import errors occur, run `npx prisma generate` and ensure `generated/prisma` exists.
- If emails fail, verify SMTP credentials and less-secure-app settings (Gmail may require app passwords or OAuth).

## Contributing

- Follow the existing code style in `src/` and add migrations under `prisma/migrations/` for schema changes.

---

If you'd like, I can also:

- add a `.env.example` file populated with the variables above,
- add a short Windows-specific run script, or
- update `package.json` scripts to include a `start` script for production.

## API Endpoints

Below are the main API endpoints exposed by the server (base url assumed at your host, e.g. `http://localhost:3000`). Routes are mounted as configured in `src/app.ts`.

- **Admin (manage users)**
  - Base: `/api/admin/users`
  - `GET /api/admin/users` — List users. Query params: `search`, `page`, `limit`. Auth: `ADMIN`.
  - `PATCH /api/admin/users/:id` — Update user status (`status` required in body, optionally `banReason`). Auth: `ADMIN`.
  - Files: `src/modules/admin/admin.route.ts`, `src/modules/admin/admin.controller.ts`, `src/modules/admin/admin.service.ts`.

- **Authentication (current user)**
  - Base: `/api/authentication`
  - `GET /api/authentication/me` — Get currently authenticated user's profile. Auth: `ADMIN`, `TUTOR`, `STUDENT` (must be authenticated and email verified).
  - Files: `src/modules/auth/auth.route.ts`, `src/modules/auth/auth.controller.ts`, `src/modules/auth/auth.service.ts`.

- **Tutors**
  - Base: `/api/tutor`
  - `GET /api/tutor` — Search/list tutor profiles. Query params: `search`, `page`, `limit`. Public.
  - `GET /api/tutor/:id` — Get tutor profile by id. Public.
  - `POST /api/tutor` — Create tutor application/profile. Body: `{ id: string, data: { ...tutorProfile fields... } }`. Public (expects payload with `id` of user and `data`).
  - `PUT /api/tutor/profile` — Update tutor profile for the logged-in tutor. Body: fields to update. Auth: `TUTOR`.
  - `PUT /api/tutor/availability` — Update tutor availability. Body: `{ status: 'available' | 'not_available' }`. Auth: `TUTOR`.
  - `PATCH /api/tutor/:id/update` — Admin updates tutor application status. Body: `{ status: 'active' | 'cancelled' | ... }`. Auth: `ADMIN`.
  - Files: `src/modules/tutors/tutors.route.ts`, `src/modules/tutors/tutors.controller.ts`, `src/modules/tutors/tutors.service.ts`.

- **Categories**
  - Base: `/api/categories`
  - `GET /api/categories` — Retrieve all categories. Public.
  - `POST /api/categories` — Create a category. Body: category fields (eg. `name`, `slug`, etc.). Auth: `ADMIN` or `TUTOR`.
  - Files: `src/modules/categories/categories.route.ts`, `src/modules/categories/categories.controller.ts`, `src/modules/categories/categories.service.ts`.

- **Bookings**
  - Base: `/api/bookings`
  - `GET /api/bookings` — Get bookings for current authenticated student (or admin). Auth: `STUDENT`, `ADMIN`.
  - `GET /api/bookings/:id` — Get a single booking by id (only the booking owner may fetch it). Auth: `STUDENT`, `ADMIN`.
  - `POST /api/bookings` — Create a booking. Body example:

    ```json
    {
      "studentId": "<student-user-id>",
      "data": {
        "tutorProfileId": "<tutor-profile-id>",
        "startAt": "2026-02-02T10:00:00.000Z",
        "endAt": "2026-02-02T11:00:00.000Z",
        "durationMinutes": 60,
        "timezone": "UTC",
        "topic": "Algebra",
        "meetingLink": "https://meet.example.com/abc"
      }
    }
    ```

  - Auth: `STUDENT` (or `ADMIN`). Files: `src/modules/bookings/bookings.route.ts`, `src/modules/bookings/bookings.controller.ts`, `src/modules/bookings/booking.service.ts`.

Notes:

- Authentication middleware is implemented in `src/middleware/auth.ts`. It requires a valid session via `better-auth`, enforces email verification, and checks role membership for protected routes.
- Role values: `student`, `tutor`, `admin`.

If you want, I can also add simple example `curl` requests for each endpoint, or generate an OpenAPI/Swagger spec from these routes. 
