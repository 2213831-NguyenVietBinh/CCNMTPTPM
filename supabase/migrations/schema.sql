-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- profiles table (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamptz default now()
);

-- posts table
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  slug text unique not null,
  content text,
  excerpt text,
  thumbnail_url text,
  status text default 'draft' check (status in ('draft','published')),
  view_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- tags table
create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null
);

-- post_tags table
create table if not exists post_tags (
  post_id uuid references posts(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- comments table
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  author_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- Automatically update updated_at timestamp helper function
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Drop trigger if exists and create
drop trigger if exists update_posts_updated_at on posts;
create trigger update_posts_updated_at
  before update on posts
  for each row execute procedure update_updated_at_column();

-- Auto profile creation when a new auth user registers
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists and create
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- ROW LEVEL SECURITY (RLS) & POLICIES
-- ==========================================

alter table profiles enable row level security;
alter table posts enable row level security;
alter table tags enable row level security;
alter table post_tags enable row level security;
alter table comments enable row level security;

-- PROFILES POLICIES
drop policy if exists "Public profiles are viewable by everyone" on profiles;
create policy "Public profiles are viewable by everyone" 
  on profiles for select using (true);

drop policy if exists "Users can update their own profile" on profiles;
create policy "Users can update their own profile" 
  on profiles for update using (auth.uid() = id);

-- POSTS POLICIES
drop policy if exists "Published posts are viewable by everyone" on posts;
create policy "Published posts are viewable by everyone" 
  on posts for select using (status = 'published' or auth.uid() = author_id);

drop policy if exists "Authenticated users can create posts" on posts;
create policy "Authenticated users can create posts" 
  on posts for insert with check (auth.uid() = author_id);

drop policy if exists "Authors can update their own posts" on posts;
create policy "Authors can update their own posts" 
  on posts for update using (auth.uid() = author_id);

drop policy if exists "Authors can delete their own posts" on posts;
create policy "Authors can delete their own posts" 
  on posts for delete using (auth.uid() = author_id);

-- TAGS POLICIES
drop policy if exists "Tags are viewable by everyone" on tags;
create policy "Tags are viewable by everyone" 
  on tags for select using (true);

drop policy if exists "Authenticated users can insert tags" on tags;
create policy "Authenticated users can insert tags" 
  on tags for insert with check (auth.role() = 'authenticated');

-- POST_TAGS POLICIES
drop policy if exists "Post-tag mappings are viewable by everyone" on post_tags;
create policy "Post-tag mappings are viewable by everyone" 
  on post_tags for select using (true);

drop policy if exists "Authors can insert tags for their own posts" on post_tags;
create policy "Authors can insert tags for their own posts" 
  on post_tags for insert with check (
    exists (select 1 from posts where posts.id = post_id and posts.author_id = auth.uid())
  );

drop policy if exists "Authors can remove tags from their own posts" on post_tags;
create policy "Authors can remove tags from their own posts" 
  on post_tags for delete using (
    exists (select 1 from posts where posts.id = post_id and posts.author_id = auth.uid())
  );

-- COMMENTS POLICIES
drop policy if exists "Comments are viewable by everyone" on comments;
create policy "Comments are viewable by everyone" 
  on comments for select using (true);

drop policy if exists "Authenticated users can create comments" on comments;
create policy "Authenticated users can create comments" 
  on comments for insert with check (auth.uid() = author_id);

drop policy if exists "Authors can delete their comments, or post authors can delete comments on their posts" on comments;
create policy "Authors can delete their comments, or post authors can delete comments on their posts" 
  on comments for delete using (
    auth.uid() = author_id or 
    exists (select 1 from posts where posts.id = post_id and posts.author_id = auth.uid())
  );

-- Increment view count function (Security Definer to bypass RLS for readers)
create or replace function public.increment_views(post_id uuid)
returns void as $$
begin
  update public.posts
  set view_count = view_count + 1
  where id = post_id;
end;
$$ language plpgsql security definer;

