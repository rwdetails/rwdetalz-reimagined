-- Create storage bucket for booking images
insert into storage.buckets (id, name, public)
values ('booking-images', 'booking-images', false);

-- Create RLS policies for booking images
create policy "Users can upload their own booking images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'booking-images' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can view their own booking images"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'booking-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Service role can access all booking images"
on storage.objects
for select
to service_role
using (bucket_id = 'booking-images');