-- Habit schedule + reminders
alter table if exists public.habits
  add column if not exists frequency text default 'daily',
  add column if not exists days_of_week int[] default '{0,1,2,3,4,5,6}',
  add column if not exists reminder_time time,
  add column if not exists reminder_enabled boolean default false;

-- Ensure RLS is enabled
alter table if exists public.habits enable row level security;
alter table if exists public.habit_entries enable row level security;

create unique index if not exists habit_entries_habit_date_unique
  on public.habit_entries (habit_id, date);

-- Habits policies
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'habits' and policyname = 'Habits are viewable by owner'
  ) then
    create policy "Habits are viewable by owner"
      on public.habits
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'habits' and policyname = 'Habits are insertable by owner'
  ) then
    create policy "Habits are insertable by owner"
      on public.habits
      for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'habits' and policyname = 'Habits are updatable by owner'
  ) then
    create policy "Habits are updatable by owner"
      on public.habits
      for update
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'habits' and policyname = 'Habits are deletable by owner'
  ) then
    create policy "Habits are deletable by owner"
      on public.habits
      for delete
      using (auth.uid() = user_id);
  end if;
end $$;

-- Habit entries policies (scoped to habit owner)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'habit_entries' and policyname = 'Entries are viewable by habit owner'
  ) then
    create policy "Entries are viewable by habit owner"
      on public.habit_entries
      for select
      using (
        exists (
          select 1
          from public.habits h
          where h.id = habit_entries.habit_id
            and h.user_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'habit_entries' and policyname = 'Entries are insertable by habit owner'
  ) then
    create policy "Entries are insertable by habit owner"
      on public.habit_entries
      for insert
      with check (
        exists (
          select 1
          from public.habits h
          where h.id = habit_entries.habit_id
            and h.user_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'habit_entries' and policyname = 'Entries are updatable by habit owner'
  ) then
    create policy "Entries are updatable by habit owner"
      on public.habit_entries
      for update
      using (
        exists (
          select 1
          from public.habits h
          where h.id = habit_entries.habit_id
            and h.user_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'habit_entries' and policyname = 'Entries are deletable by habit owner'
  ) then
    create policy "Entries are deletable by habit owner"
      on public.habit_entries
      for delete
      using (
        exists (
          select 1
          from public.habits h
          where h.id = habit_entries.habit_id
            and h.user_id = auth.uid()
        )
      );
  end if;
end $$;
