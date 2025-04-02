-- Create shared_files table
create table if not exists public.shared_files (
  id uuid default gen_random_uuid() primary key,
  song_id uuid references public.songs(id) on delete cascade,
  shared_by uuid references auth.users(id) on delete cascade,
  shared_with_email text,
  permissions text not null default 'read',
  token text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone,
  is_active boolean default true not null
);

-- Add RLS policies
alter table public.shared_files enable row level security;

-- Allow users to create share links for songs they own
create policy "Users can create share links for songs they own"
  on public.shared_files
  for insert
  with check (
    auth.uid() = (
      select user_id 
      from public.songs 
      where id = song_id
    )
  );

-- Allow users to view their own share links
create policy "Users can view their own share links"
  on public.shared_files
  for select
  using (auth.uid() = shared_by);

-- Allow users to update their own share links
create policy "Users can update their own share links"
  on public.shared_files
  for update
  using (auth.uid() = shared_by);

-- Allow users to delete their own share links
create policy "Users can delete their own share links"
  on public.shared_files
  for delete
  using (auth.uid() = shared_by);

-- Allow anyone to view active share links by token
create policy "Anyone can view active share links by token"
  on public.shared_files
  for select
  using (is_active = true);

-- Add indexes
create index shared_files_song_id_idx on public.shared_files(song_id);
create index shared_files_shared_by_idx on public.shared_files(shared_by);
create index shared_files_token_idx on public.shared_files(token);
create index shared_files_created_at_idx on public.shared_files(created_at); 