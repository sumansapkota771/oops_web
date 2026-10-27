# OOPS! Nepal website

Next.js 16 (App Router, Cache Components) · Tailwind CSS 4 · Supabase (database + storage) · built-in admin login.
Every piece of content — text, prices, offers, photos, videos, menus, SEO — is stored in Supabase and edited from `/admin`.

## Run it

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

Before Supabase is connected the site renders the same content from `src/content/seed/`. The admin needs Supabase
(it stores its users and content there) — see the two sections below.

## Connect Supabase (≈5 minutes)

1. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` and the anon/publishable key (Supabase dashboard → Project Settings → API)
   - `SUPABASE_SERVICE_ROLE_KEY` — **required for the admin to save changes and upload files**
   - optionally `SUPABASE_DB_URL` (dashboard → Connect) so the SQL is applied automatically. With only the database URL
     (no service-role key) `pnpm db:setup` and `pnpm db:seed` still work, and the site can read everything, but the admin stays read-only.
2. Create the tables and the two storage buckets (**`media`** public, **`data`** private):
   ```bash
   pnpm db:setup
   ```
   Without `SUPABASE_DB_URL` the script tells you to paste `supabase/migrations/0001_init.sql` into the Supabase
   SQL Editor once, then run `pnpm db:setup` again to create the buckets and verify.
3. Upload the media and load all the content:
   ```bash
   pnpm media          # only if public/media is missing: converts the original photos/videos
   pnpm db:seed        # uploads ~430 files to the media bucket + inserts every content row
   ```
   `db:seed` never overwrites edits. `--reset` re-seeds from scratch, `--force` re-uploads files, `--no-media` skips the upload.
4. Restart `pnpm dev` — the site now reads from Supabase.

## Admin sign-in

The admin has its own login (email + password) — no outside service needed.

1. Put a random `ADMIN_SESSION_SECRET` (32+ characters) in `.env.local` (see `.env.example`).
2. Create the first admin: `pnpm admin:create you@gmail.com "Your Name"` — it prints a temporary password once.
3. Sign in at `/admin` and choose your own password under **My account**.
4. Admins add more people at **Users**: give them the **Editor** role (edits content only) or **Admin** (everything, including adding users and promoting others). Admins can also reset passwords, disable and delete users. There is always at least one active admin.

Security: passwords are stored as salted scrypt hashes; five wrong passwords lock an account for 15 minutes; changing or resetting a password signs that user out everywhere; every page and every save is re-checked against the database.

## What staff can edit

| Where | What |
| --- | --- |
| Pages | headings, text, buttons, photos and videos of all 9 pages, plus each page's Google title/description/share image |
| Content | attractions (+ categories), offers (+ the 3 “other offers” slots and end dates), Powerplay table, upcoming events (3 slots or more), event types, gallery, reviews, FAQ, rules & policies |
| Site settings | phones, emails, hours, address & map, social links, header menu, footer, big numbers, announcement bar, SEO defaults |
| Media library | upload / replace / describe / delete photos and videos (photos are resized to WebP in the browser) |
| Enquiries | Book Now & Contact messages, status, CSV export and full backup to the private `data` bucket |
| Users | add staff, set Editor/Admin roles, reset passwords (admins only) |

Wrap words in `*asterisks*` in any title to give them the colourful gradient. Saving an item refreshes the public site immediately.

## Enquiry emails (optional)

Enquiries are always saved in Supabase. To also email them, set `SMTP_USER` (a Gmail address), `SMTP_PASS` (a Google [app password](https://myaccount.google.com/apppasswords)) and `ENQUIRY_TO_EMAIL` (comma-separated list of inboxes).

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` / `build` / `start` | run, build and serve the site |
| `pnpm typecheck` / `lint` | checks |
| `pnpm media` | convert the original photos/videos in the parent folders into `public/media` |
| `pnpm db:setup` | create tables, row level security, buckets |
| `pnpm db:seed` | upload media and insert content |
| `pnpm admin:create email` | create (or reset) an admin account |

## How it fits together

- `src/lib/data.ts` — cached public reads (`"use cache"`, tag `content`); falls back to `src/content/seed` until Supabase is connected.
- `src/app/admin/actions.ts` — every write: signed-in-user-verified, validated against `src/lib/admin/*` field definitions, then `updateTag("content")`.
- `src/lib/admin/collections.ts`, `page-schemas.ts` — one definition per editable thing drives the admin form, validation and defaults.
- Row level security: the public can only read rows marked visible; enquiries are never public; all writes use the server-side service key.

## Content to confirm with OOPS!

- 30 Taps Thrill: the folder says “Every Tuesday”, the poster says “Every Tuesday & Thursday” (poster used).
- Stats (25,000+ monthly footfall, 100,000+ customers) — confirm the numbers.
- Descriptions for attractions without supplied copy were drafted — review them under Content → Attractions.
- Hall of Fame photos without a person's name have no caption yet; `About US/IMG_0366.CR2` is a camera RAW and needs a JPG export.
- The videos are compressed (the original 346 MB film is 31 MB at 720p); for the full-quality film, paste a YouTube link in Pages → Homepage → Video section.
