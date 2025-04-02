-- Create shared_files table
create table if not exists public.shared_files (
  id uuid default gen_random_uuid() primary key,
  token text not null unique,
  song_id uuid not null references public.songs(id) on delete cascade,
  shared_by uuid not null references auth.users(id) on delete cascade,
  shared_with_email text,
  permissions text not null default 'view',
  expires_at timestamp with time zone,
  is_active boolean not null default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.shared_files enable row level security;

-- Create policies
create policy "Users can view their own shared files"
  on public.shared_files
  for select
  using (
    auth.uid() = shared_by or 
    (shared_with_email is null) or
    (auth.jwt()->>'email' = shared_with_email)
  );

create policy "Users can create shared files for songs they own"
  on public.shared_files
  for insert
  with check (
    exists (
      select 1 from public.songs
      where id = shared_files.song_id
      and user_id = auth.uid()
    )
  );

create policy "Users can update their own shared files"
  on public.shared_files
  for update
  using (auth.uid() = shared_by);

create policy "Users can delete their own shared files"
  on public.shared_files
  for delete
  using (auth.uid() = shared_by);

-- Create function to update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger handle_updated_at
  before update on public.shared_files
  for each row
  execute procedure public.handle_updated_at(); 