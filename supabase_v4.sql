-- V4 Schema Updates: Client Portal & CEO View

-- 1. Customer Portal Access
-- Add token and PIN for secure client access
alter table customers add column if not exists portal_token uuid default gen_random_uuid();
alter table customers add unique (portal_token);
alter table customers add column if not exists portal_pin text;

-- 2. CEO Score & Daily Logs
-- Add category for "CEO Score" calculation
-- Categories: 'Strategic', 'Operational', 'Learning', 'Waste'
alter table daily_logs add column if not exists category text check (category in ('Strategic', 'Operational', 'Learning', 'Waste'));

-- 3. Deliverables (Client Portal)
-- Store files/links for clients
create table if not exists deliverables (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  shoot_id uuid references shoots(id) on delete cascade not null,
  title text not null,
  url text not null,
  type text check (type in ('video', 'photo', 'document', 'other')) not null,
  description text
);

-- 4. Expenses (CEO View)
-- Track project-based or general expenses
create table if not exists expenses (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  shoot_id uuid references shoots(id) on delete set null, -- Can be null for general expenses
  description text not null,
  amount decimal(10,2) not null,
  category text, -- e.g., 'Equipment', 'Travel', 'Talent', 'Software'
  date timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Enable RLS
alter table deliverables enable row level security;
alter table expenses enable row level security;

-- 6. Policies (Admin Access)
-- Allow full access to authenticated users (Admins)
create policy "Enable all access for authenticated users" on deliverables for all to authenticated using (true);
create policy "Enable all access for authenticated users" on expenses for all to authenticated using (true);

-- Note: Portal access will be handled via secure Server Actions using the portal_token,
-- bypassing RLS for specific read-only operations or using a service role if necessary.
