-- OOPS! Nepal website — content schema, row level security and storage buckets.
-- Safe to run more than once.


-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Singletons and pages
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  id smallint primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.pages (
  slug text primary key,
  title text not null,
  seo_title text,
  seo_description text,
  og_image text,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Attractions
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  accent text not null default 'sea',
  sort integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.attractions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category_slug text references public.categories (slug) on update cascade on delete set null,
  tagline text,
  description text,
  cover_image text,
  images jsonb not null default '[]'::jsonb,
  notes jsonb not null default '[]'::jsonb,
  grip_socks boolean not null default false,
  is_featured boolean not null default false,
  sort integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Prices & offers
-- ---------------------------------------------------------------------------
create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  kind text not null default 'regular' check (kind in ('regular', 'special')),
  title text not null,
  tagline text,
  schedule text,
  price_label text,
  price_note text,
  options jsonb not null default '[]'::jsonb,
  inclusions jsonb not null default '[]'::jsonb,
  notes text,
  poster_image text,
  wide_image text,
  starts_on date,
  ends_on date,
  khalti boolean not null default false,
  cta_label text,
  cta_url text,
  sort integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.powerplay_tiers (
  id uuid primary key default gen_random_uuid(),
  pay integer not null,
  credits integer not null,
  bonus integer not null default 0,
  total integer not null,
  is_highlight boolean not null default false,
  sort integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Events
-- ---------------------------------------------------------------------------
create table if not exists public.event_types (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  highlights jsonb not null default '[]'::jsonb,
  cover_image text,
  images jsonb not null default '[]'::jsonb,
  videos jsonb not null default '[]'::jsonb,
  sort integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date,
  time_label text,
  description text,
  poster_image text,
  cta_label text,
  cta_url text,
  sort integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Gallery
-- ---------------------------------------------------------------------------
create table if not exists public.gallery_albums (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  layout text not null default 'photos' check (layout in ('photos', 'people', 'logos')),
  sort integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  album_slug text not null references public.gallery_albums (slug) on update cascade on delete cascade,
  image text not null,
  caption text,
  sort integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gallery_items_album_idx on public.gallery_items (album_slug, sort);

-- ---------------------------------------------------------------------------
-- Social proof, help & policies
-- ---------------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  author text not null,
  rating smallint not null default 5 check (rating between 1 and 5),
  body text not null,
  date_label text,
  source text not null default 'Google',
  badge text,
  sort integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.policy_sections (
  id uuid primary key default gen_random_uuid(),
  group_key text not null default 'rules',
  title text not null,
  items jsonb not null default '[]'::jsonb,
  sort integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Media library (files live in the "media" storage bucket)
-- ---------------------------------------------------------------------------
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  path text not null unique,
  bucket text not null default 'media',
  kind text not null default 'image' check (kind in ('image', 'svg', 'video', 'file')),
  ext text not null default 'webp',
  widths jsonb not null default '[]'::jsonb,
  width integer,
  height integer,
  bytes bigint not null default 0,
  blur text,
  alt text,
  folder text not null default 'uploads',
  name text,
  poster text,
  duration real,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists media_folder_idx on public.media (folder);

-- ---------------------------------------------------------------------------
-- Enquiries (Book Now form) — never readable by the public
-- ---------------------------------------------------------------------------
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  message text,
  source text,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.enquiries add column if not exists email text;

create index if not exists enquiries_created_idx on public.enquiries (created_at desc);

-- ---------------------------------------------------------------------------
-- Admin users (website staff). Passwords are stored as salted scrypt hashes.
-- No policies exist, so only the server (service role) can ever read this table.
-- ---------------------------------------------------------------------------
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null default '',
  role text not null default 'editor' check (role in ('admin', 'editor')),
  password_hash text not null,
  is_active boolean not null default true,
  must_change_password boolean not null default false,
  failed_attempts integer not null default 0,
  locked_until timestamptz,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'site_settings', 'pages', 'categories', 'attractions', 'offers', 'powerplay_tiers',
    'event_types', 'events', 'gallery_albums', 'gallery_items', 'reviews', 'faqs',
    'policy_sections', 'media', 'enquiries', 'admin_users'
  ]
  loop
    execute format('drop trigger if exists %I_updated_at on public.%I', t, t);
    execute format(
      'create trigger %I_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      t, t
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row level security: the public may read published content only.
-- All writes happen on the server with the service-role key after the
-- admin has been verified (Clerk), so no insert/update/delete policies exist.
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'site_settings', 'pages', 'categories', 'attractions', 'offers', 'powerplay_tiers',
    'event_types', 'events', 'gallery_albums', 'gallery_items', 'reviews', 'faqs',
    'policy_sections', 'media', 'enquiries', 'admin_users'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "public read" on public.%I', t);
  end loop;

  foreach t in array array['site_settings', 'pages', 'media']
  loop
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
  end loop;

  foreach t in array array[
    'categories', 'attractions', 'offers', 'powerplay_tiers', 'event_types', 'events',
    'gallery_albums', 'gallery_items', 'reviews', 'faqs', 'policy_sections'
  ]
  loop
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (is_visible)', t);
  end loop;
end;
$$;

grant usage on schema public to anon, authenticated, service_role;
grant select on all tables in schema public to anon, authenticated;
grant all on all tables in schema public to service_role;
revoke all on public.enquiries from anon, authenticated;
revoke all on public.admin_users from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Admin helper: re-number the `sort` column of a content table in one call.
-- Only the service role (the admin server actions) may execute it.
-- ---------------------------------------------------------------------------
create or replace function public.reorder_rows(tbl text, ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if tbl not in (
    'categories', 'attractions', 'offers', 'powerplay_tiers', 'event_types', 'events',
    'gallery_albums', 'gallery_items', 'reviews', 'faqs', 'policy_sections'
  ) then
    raise exception 'reorder_rows: table % is not allowed', tbl;
  end if;
  execute format(
    'update public.%I t set sort = o.ord::integer from unnest($1) with ordinality as o(id, ord) where t.id = o.id',
    tbl
  ) using ids;
end;
$$;

revoke all on function public.reorder_rows(text, uuid[]) from public, anon, authenticated;
grant execute on function public.reorder_rows(text, uuid[]) to service_role;

-- ---------------------------------------------------------------------------
-- Storage buckets
--   media: public website files (images, video, logos, posters, PDFs)
--   data:  private files (original uploads, content backups, enquiry exports)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('media', 'media', true, 52428800, array[
    'image/webp', 'image/jpeg', 'image/png', 'image/gif', 'image/avif', 'image/svg+xml',
    'video/mp4', 'video/webm', 'application/pdf'
  ]),
  ('data', 'data', false, 52428800, null)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
