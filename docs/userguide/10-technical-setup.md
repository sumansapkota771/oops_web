# 10. Technical setup (for the developer)

← [Back to the guide index](README.md)

This page is for whoever installs, hosts and maintains the site. Day-to-day editors do not need it.

## What the site is made of

| Part | Technology |
| --- | --- |
| Website and admin | Next.js 16 (App Router), React, Tailwind CSS 4, TypeScript |
| Database and file storage | Supabase (Postgres + Storage) |
| Admin sign-in | Built-in email + password login (no outside service) |
| Enquiry emails | Gmail through Nodemailer (optional) |
| Package manager | pnpm |

Content is loaded through cached reads tagged `content`. Every admin save invalidates that tag, which is why edits show instantly with no redeploy.

## Environment variables

Copy `.env.example` to `.env.local` and fill it in. **Never commit `.env.local` or share these values in chat or screenshots.**

| Variable | Needed for |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project address |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` *or* `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser-safe read key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only.** Required for the admin to sign in, save and upload. Without it the site is read-only |
| `SUPABASE_DB_URL` *or* `SUPABASE_ACCESS_TOKEN` | Optional: lets `pnpm db:setup` apply the SQL automatically |
| `ADMIN_SESSION_SECRET` | Random string, 32+ characters. Signs the login cookie. Changing it signs everyone out |
| `ENQUIRY_TO_EMAIL` | Comma-separated inboxes that receive each enquiry (the management email in Site settings is only a fallback) |
| `SMTP_USER` / `SMTP_PASS` | Gmail address and a Google **app password** (needs 2-Step Verification). Optional: `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM` |

Generate a session secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

On the hosting platform (for example Vercel), add the same variables in the project's *Environment Variables* settings.

## First-time setup

```bash
pnpm install
pnpm db:setup                              # tables, row-level security, buckets (media = public, data = private)
pnpm media                                 # only if public/media is missing: converts original photos/videos
pnpm db:seed                               # uploads media and inserts all content
pnpm admin:create you@example.com "Your Name"   # first admin; prints a temporary password once
pnpm dev                                   # http://localhost:3000  (admin at /admin)
```

If `SUPABASE_DB_URL` isn't set, `pnpm db:setup` tells you to paste `supabase/migrations/0001_init.sql` into the Supabase **SQL Editor** once, then run it again to create the buckets.

`db:seed` never overwrites edits. Options: `--reset` (re-seed from scratch — destroys edits), `--force` (re-upload files), `--no-media` (skip uploads).

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` / `build` / `start` | Run, build, serve |
| `pnpm typecheck` / `pnpm lint` | Checks |
| `pnpm media` | Convert originals into `public/media` |
| `pnpm db:setup` | Create tables, row-level security, buckets |
| `pnpm db:seed` | Upload media, insert content |
| `pnpm admin:create <email> ["Name"]` | Create (or reset) an admin account |

## Recovering admin access

If no admin can sign in: run `pnpm admin:create admin@example.com "Name"` on a machine that has `.env.local` with the service-role key. It creates or resets that account and prints a temporary password once.

## Where things live

| Path | What |
| --- | --- |
| `src/lib/admin/collections.ts` | Definitions of the 11 content lists (fields, labels) |
| `src/lib/admin/page-schemas.ts` | Fields for each page and for Site settings |
| `src/lib/admin/fields.ts`, `validate.ts` | Field types and server-side validation |
| `src/app/admin/actions.ts` | Every save, delete, upload and export |
| `src/app/admin/users-actions.ts`, `auth-actions.ts` | User management and sign-in |
| `src/lib/data.ts` | Public cached reads; offer/event date filtering |
| `src/app/actions/enquiry.ts`, `src/lib/email.ts` | Enquiry form handling and emails |
| `supabase/migrations/0001_init.sql` | Database schema |

Adding a field to an existing list or page is a one-line change in `collections.ts` / `page-schemas.ts` (plus a database column for lists). The admin form, validation and saving follow from the definition.

## Security notes

- Passwords: salted scrypt hashes; minimum 10 characters, letters and numbers.
- Sessions: signed, HTTP-only cookie, 7 days, re-checked against the database on every request. Changing a password or disabling a user ends their sessions.
- Lock-out: 5 wrong passwords → 15 minutes. Extra per-address throttling in production.
- All writes use the service-role key on the server; it is never sent to the browser. Row-level security lets the public read only visible content; enquiries are never public.
- Links saved from the admin are filtered to `http(s)`, `mailto:`, `tel:`, `/` and `#`.
- Enquiry exports and content backups are stored in the private `data` bucket and are shared by 1-hour signed links.
- If any secret has been shared in chat or committed, **rotate it** (Supabase keys, `ADMIN_SESSION_SECRET`, Gmail app password).

## Known limits

- The Editor role is only blocked from user management; editors can otherwise delete content and enquiries.
- No draft/preview mode and no undo; backups cover data but not media files or users, and restoring is manual.
- Rate limits for the sign-in and enquiry form are kept in memory per server instance (best-effort on serverless hosting); the account lock-out is stored in the database.
- Uploaded videos are limited to 50 MB (Supabase bucket limit).
