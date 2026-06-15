# Beninfy

Beninfy.com — cross-border rides, tours, and border-fee guidance for West Africa. Built on Next.js 16 (App Router + Turbopack), Prisma 7 (with the pg driver adapter), Auth.js v5, and next-intl.

## Local development

```bash
npm install
cp .env.example .env       # then fill in DATABASE_URL, AUTH_SECRET, etc.
npx prisma migrate deploy  # apply migrations
npm run db:seed            # seed vehicles, routes, tours, border fees
npm run dev
```

Register `info@beninfy.com` from `/register` (or the email matching `ADMIN_EMAIL`) and you will be auto-promoted to **super admin**.

## Roles

- `super_admin` — Beninfy owner. Sole role allowed to change roles or create/delete users. Created automatically when the email matching `ADMIN_EMAIL` registers (or via the seed script).
- `admin` — Backoffice operator. Created from the super-admin Users page. Full access to bookings, payments, catalogs.
- `user` — Customer. Default for all public registrations.

Backoffice lives at `/[locale]/admin`.

## Environment variables

| Name | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | Postgres connection string. Use the pooled Supabase/Postgres URL on Vercel for runtime queries. |
| `DIRECT_URL` | recommended | Direct Postgres connection string for Prisma migrations. |
| `PRISMA_MIGRATE_URL` | optional | Migration-only override. Takes precedence over `DIRECT_URL`. |
| `AUTH_SECRET` | yes | `openssl rand -base64 32` |
| `ADMIN_EMAIL` | yes | Email that gets auto-promoted to `super_admin`. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | optional | Google OAuth. |
| `PAYSTACK_SECRET_KEY` / `PAYSTACK_PUBLIC_KEY` | optional | Live Paystack integration. Stubbed when unset. |

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, **Import Project** and select the repo. Framework auto-detected.
3. Add the env vars from `.env.example` in the Vercel project settings.
4. The included `vercel.json` runs `npm run build` on deploy. Run `npm run db:migrate` separately when a deployment includes new Prisma migrations.
5. After the first deploy:
   - Visit `https://beninfy.com/en/register` and create the super-admin account with `ADMIN_EMAIL`.
   - Sign in, open `/en/admin`, and create additional admins from the Users page.

### Notes
- `trustHost: true` is set in `src/lib/auth.ts` so Auth.js works behind the Vercel proxy without `AUTH_URL`.
- Prisma 7 requires a driver adapter — `src/lib/prisma.ts` uses `@prisma/adapter-pg`.
- Prisma CLI uses `PRISMA_MIGRATE_URL || DIRECT_URL || DATABASE_URL` from `prisma.config.js`; the app runtime uses `DATABASE_URL`.
- `postinstall: prisma generate` ensures the client is built on every Vercel install.

## Move Database to Supabase

1. Create a Supabase project and copy the Postgres connection strings.
2. In `.env` and Vercel, set `DATABASE_URL` to the pooled/runtime Supabase URL.
3. Set `DIRECT_URL` to the direct Supabase database URL for migrations.
4. Run `npm run db:migrate` once to create the schema in Supabase.
5. Run `npm run db:seed` to seed routes, vehicles, tours, fees, and the admin email.
6. Update Vercel environment variables, then redeploy.

If existing Neon data must be preserved, export from Neon with `pg_dump` and restore into Supabase before switching Vercel to the new `DATABASE_URL`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Next dev server (Turbopack) |
| `npm run build` | Production build (runs `prisma generate` first) |
| `npm run start` | Run production build |
| `npm run lint` | ESLint |
| `npm run db:migrate` | `prisma migrate deploy` |
| `npm run db:seed` | Seed catalogs and promote the super admin |
