# Supabase Setup Instructions

## Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Sign up with GitHub
3. Create new project (free tier)
4. Choose region closest to you (US East)

## Step 2: Create Database Table
In Supabase SQL Editor, run:

```sql
create table inventory_submissions (
  id uuid default gen_random_uuid() primary key,
  item_name text not null,
  count float not null,
  submission_id text not null,
  form_id text not null,
  responded_at timestamp with time zone not null,
  created_at timestamp with time zone default now()
);

-- Create indexes for faster queries
create index idx_submission_id on inventory_submissions(submission_id);
create index idx_created_at on inventory_submissions(created_at desc);
```

## Step 3: Get Connection Details
In Supabase Project Settings → API:
- Project URL: `https://your-project.supabase.co`
- Anon Key: `eyJhbGciOiJIUzI1NiIs...`

## Step 4: Add Environment Variables to Vercel
In Vercel Project Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Anon Key

## Step 5: Redeploy
Vercel will automatically rebuild with the new environment variables.

---

## Alternative: Use Vercel Postgres (Easier but Paid)

If you prefer Vercel Postgres ($20/month):
1. Go to Vercel Dashboard → Storage
2. Create Postgres database
3. Connect to your project
4. Vercel auto-configures environment variables
