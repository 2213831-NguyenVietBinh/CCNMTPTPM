-- 1. Add role column to profiles table
alter table public.profiles add column if not exists role text default 'author' check (role in ('author', 'admin'));

-- 2. Add admin policy for profiles
create policy "Admins can do everything on profiles."
  on public.profiles for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 3. Add admin policy for posts
create policy "Admins can do everything on posts."
  on public.posts for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 4. Add admin policy for comments
create policy "Admins can do everything on comments."
  on public.comments for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 5. Add admin policy for tags
create policy "Admins can do everything on tags."
  on public.tags for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 6. Add admin policy for post_tags
create policy "Admins can do everything on post_tags."
  on public.post_tags for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- HƯỚNG DẪN NÂNG CẤP TÀI KHOẢN THÀNH ADMIN:
-- Chạy lệnh SQL dưới đây trong Supabase SQL Editor của bạn:
-- update public.profiles set role = 'admin' where username = 'binh';
-- (hoặc dùng username tương ứng của bạn)
