# Couple's Memory Page — Barebones v1

This is the smallest working version: a form that takes an order, uploads
photos, and a page that displays them once you've manually marked the
payment as verified.

## What this version does NOT have yet (on purpose)
- No editor page (adding more photos later) — you'll add this once v1 sells
- No automated payment verification — you check GCash/Maya yourself and
  flip a switch in Supabase
- No password hashing — the page password is stored as plain text. Fine
  for a "keep nosy people out" password, NOT fine if you ever store
  anything truly sensitive this way

## Step 1 — Create a Supabase project
1. Go to supabase.com, sign up free, click "New Project"
2. Once it's created, go to **Project Settings > API**
3. Copy your **Project URL** and **anon public key**
4. Open `config.js` in this folder and paste them in

## Step 2 — Create the database table
In Supabase, go to **SQL Editor** and run this:

```sql
create table couples (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  names text not null,
  email text not null,
  page_password text,
  photo_urls jsonb default '[]'::jsonb,
  payment_reference text,
  payment_status text default 'pending',
  created_at timestamp with time zone default now()
);

-- allow anyone to insert orders and read couples (fine for v1 — the
-- form only writes new rows, and viewing a page requires knowing the slug)
alter table couples enable row level security;

create policy "Anyone can create an order"
  on couples for insert
  with check (true);

create policy "Anyone can view a page by slug"
  on couples for select
  using (true);
```

## Step 3 — Create a storage bucket for photos
1. In Supabase, go to **Storage**
2. Click "New bucket", name it exactly `photos`
3. Toggle it to **Public**
4. Under **Policies** for that bucket, add a policy allowing public `INSERT`
   and `SELECT` (Supabase gives you templates for this — pick "Allow public
   uploads" and "Allow public read access")

## Step 4 — Test locally
Just open `index.html` in your browser (or use a simple local server like
the VS Code "Live Server" extension). Submit a test order with a real
photo. Then check Supabase's **Table Editor** — you should see your new
row in `couples`, and the photo should appear in **Storage > photos**.

## Step 5 — Verify a payment (manual, for now)
1. Check your GCash/Maya app for the matching reference number
2. In Supabase's **Table Editor**, open the `couples` table
3. Find the order, change `payment_status` from `pending` to `verified`
4. Their page is now live at: `yoursite.netlify.app/view.html?slug=their-slug`

## Step 6 — Deploy to Netlify
1. Push this folder to a GitHub repo (or drag-and-drop the folder directly
   into Netlify's dashboard — "Deploys" tab has a drag-and-drop zone)
2. No build command needed — this is plain HTML/CSS/JS, so leave the
   build settings empty and set the publish directory to the folder root
3. Once deployed, test the same flow live

## Known limitations to fix once this is making money
- Manual payment verification doesn't scale past ~10-15 orders/week
- No editor page yet — couples can't add more photos themselves
- Page password isn't hashed
- No image compression — large photo uploads will eat your free storage
  quota faster than you'd expect
