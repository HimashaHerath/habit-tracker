# Habit Tracker

A focused habit tracker built with Next.js, Supabase, and shadcn/ui.

## Stack

- Next.js 16 (App Router)
- Supabase (auth + database)
- shadcn/ui + Radix UI
- Tailwind CSS

## Local setup

1) Install dependencies:

```bash
pnpm install
```

2) Create a `.env` file with your Supabase keys:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_USER_IDS=your-user-id-1,your-user-id-2
```

3) Apply the database migration in Supabase SQL Editor:

`supabase/migrations/20260126_add_habit_schedule_and_rls.sql`

4) Run the dev server:

```bash
pnpm dev
```
