-- V3 Schema Updates

-- 1. Tags System
-- Add tags column to customers and shoots
alter table customers add column if not exists tags text[] default '{}';
alter table shoots add column if not exists tags text[] default '{}';

-- 2. Shoots Checklist
-- Add checklist column to shoots (stores JSON array of {id, text, completed})
alter table shoots add column if not exists checklist jsonb default '[]'::jsonb;

-- 3. Service Bundles
-- Create bundles table
create table if not exists bundles (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  price decimal(10,2) not null
);

-- Create bundle_items table (junction table for bundles <-> services)
create table if not exists bundle_items (
  id uuid default gen_random_uuid() primary key,
  bundle_id uuid references bundles(id) on delete cascade not null,
  service_id uuid references services(id) on delete cascade not null,
  quantity integer default 1 not null
);

-- Enable RLS for new tables
alter table bundles enable row level security;
alter table bundle_items enable row level security;

-- Policies (Allow all access for now, similar to other tables)
create policy "Enable all access for all users" on bundles for all using (true);
create policy "Enable all access for all users" on bundle_items for all using (true);
