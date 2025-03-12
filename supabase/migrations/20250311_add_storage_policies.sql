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

-- Policy for authenticated users to upload screenshots
create policy "Authenticated users can upload screenshots"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'screenshots' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for authenticated users to update their own screenshots
create policy "Users can update their own screenshots"
on storage.objects for update
to authenticated
using (
  bucket_id = 'screenshots' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'screenshots' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for authenticated users to delete their own screenshots
create policy "Users can delete their own screenshots"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'screenshots' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
