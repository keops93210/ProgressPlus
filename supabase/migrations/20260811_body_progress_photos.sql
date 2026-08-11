create table if not exists public.body_progress_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  captured_at timestamptz not null default now(),
  storage_path text not null,
  angle text not null default 'front' check (angle in ('front','side','back','other')),
  note text,
  created_at timestamptz not null default now()
);

alter table public.body_progress_photos enable row level security;

grant select, insert, delete on public.body_progress_photos to authenticated;

create policy "Users can read their own body photos" on public.body_progress_photos
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "Users can create their own body photos" on public.body_progress_photos
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "Users can delete their own body photos" on public.body_progress_photos
  for delete to authenticated using ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public)
values ('body-progress', 'body-progress', false)
on conflict (id) do nothing;

create policy "Users can upload their own body progress photos" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'body-progress'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can read their own body progress photos" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'body-progress'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can delete their own body progress photos" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'body-progress'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
