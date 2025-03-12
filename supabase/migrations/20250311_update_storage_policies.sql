-- Drop existing policies if they exist
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated users can upload screenshots" on storage.objects;
drop policy if exists "Users can update their own screenshots" on storage.objects;
drop policy if exists "Users can delete their own screenshots" on storage.objects;

-- Create screenshots bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('screenshots', 'screenshots', true)
on conflict (id) do nothing;

-- Enable RLS on the bucket
alter table storage.objects enable row level security;

-- Policy for public read access to screenshots
create policy "Public Access"
on storage.objects for select
to public
using (bucket_id = 'screenshots');

-- Policy for anonymous uploads to screenshots bucket
create policy "Anonymous uploads to screenshots"
on storage.objects for insert
to public
with check (
  bucket_id = 'screenshots' AND
  (storage.foldername(name))[1] = 'anonymous'
);

-- Policy for anonymous updates to their own screenshots
create policy "Anonymous updates to screenshots"
on storage.objects for update
to public
using (
  bucket_id = 'screenshots' AND
  (storage.foldername(name))[1] = 'anonymous'
)
with check (
  bucket_id = 'screenshots' AND
  (storage.foldername(name))[1] = 'anonymous'
);

-- Policy for anonymous deletes of their own screenshots
create policy "Anonymous deletes from screenshots"
on storage.objects for delete
to public
using (
  bucket_id = 'screenshots' AND
  (storage.foldername(name))[1] = 'anonymous'
);
