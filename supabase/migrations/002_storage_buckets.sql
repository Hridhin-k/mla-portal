-- Run in Supabase SQL Editor after 001_initial_schema.sql
-- Creates storage buckets for admin image uploads

INSERT INTO storage.buckets (id, name, public) VALUES
  ('news', 'news', true),
  ('projects', 'projects', true),
  ('gallery', 'gallery', true),
  ('complaints', 'complaints', true),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Public read for all buckets
CREATE POLICY "Public read storage" ON storage.objects
  FOR SELECT USING (bucket_id IN ('news', 'projects', 'gallery', 'complaints', 'avatars'));

-- Staff can upload (authenticated users with staff role)
CREATE POLICY "Staff upload storage" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id IN ('news', 'projects', 'gallery', 'complaints', 'avatars')
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Staff update storage" ON storage.objects
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Staff delete storage" ON storage.objects
  FOR DELETE USING (auth.role() = 'authenticated');

-- Promote your admin user (replace email)
-- UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
