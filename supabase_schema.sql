-- ============================================
-- SEMIH İŞ MERKEZİ V3 - COMPLETE DATABASE SCHEMA
-- ============================================

-- 1. CUSTOMERS TABLE
create table if not exists customers (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  company text,
  email text,
  phone text,
  status text check (status in ('active', 'lead', 'passive')) default 'lead',
  image_url text,
  portal_token text unique,
  portal_pin text,
  user_id uuid default auth.uid()
);

-- 2. INTERACTIONS TABLE
create table if not exists interactions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  customer_id uuid references customers(id) on delete cascade not null,
  type text not null, -- 'meeting', 'email', 'note', etc.
  content text,
  date timestamp with time zone default timezone('utc'::text, now())
);

-- 3. SHOOTS TABLE
create table if not exists shoots (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  customer_id uuid references customers(id) on delete cascade not null,
  title text not null,
  shoot_date date,
  shoot_time text,
  location text,
  status text check (status in ('planned', 'completed', 'cancelled')) default 'planned',
  description text,
  notes text
);

-- 4. DELIVERABLES TABLE
create table if not exists deliverables (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  shoot_id uuid references shoots(id) on delete cascade not null,
  title text not null,
  file_url text,
  file_type text,
  status text check (status in ('pending', 'delivered')) default 'pending',
  delivered_at timestamp with time zone
);

-- 5. PROPOSALS TABLE
create table if not exists proposals (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  customer_id uuid references customers(id) on delete cascade not null,
  title text not null,
  description text,
  total_amount numeric(10,2) default 0,
  status text check (status in ('draft', 'sent', 'accepted', 'rejected')) default 'draft',
  valid_until date,
  notes text
);

-- 6. TASKS TABLE
create table if not exists tasks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  assigned_date date,
  status text check (status in ('pending', 'completed')) default 'pending',
  priority text check (priority in ('low', 'medium', 'high')) default 'medium',
  customer_id uuid references customers(id) on delete set null,
  completed_at timestamp with time zone
);

-- 7. PROJECTS TABLE
create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  status text check (status in ('active', 'completed', 'on-hold')) default 'active',
  budget numeric(10,2),
  customer_id uuid references customers(id) on delete set null
);

-- 8. EXPENSES TABLE
create table if not exists expenses (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  description text not null,
  amount numeric(10,2) not null,
  category text,
  date date default current_date,
  project_id uuid references projects(id) on delete set null
);

-- 9. SERVICES TABLE
create table if not exists services (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  price numeric(10,2) not null,
  duration text,
  is_active boolean default true
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
alter table customers enable row level security;
alter table interactions enable row level security;
alter table shoots enable row level security;
alter table deliverables enable row level security;
alter table proposals enable row level security;
alter table tasks enable row level security;
alter table projects enable row level security;
alter table expenses enable row level security;
alter table services enable row level security;

-- ============================================
-- CREATE POLICIES (Allow all for development)
-- ============================================

-- Customers Policies
create policy "Enable all access for customers" on customers for all using (true) with check (true);

-- Interactions Policies
create policy "Enable all access for interactions" on interactions for all using (true) with check (true);

-- Shoots Policies
create policy "Enable all access for shoots" on shoots for all using (true) with check (true);

-- Deliverables Policies
create policy "Enable all access for deliverables" on deliverables for all using (true) with check (true);

-- Proposals Policies
create policy "Enable all access for proposals" on proposals for all using (true) with check (true);

-- Tasks Policies
create policy "Enable all access for tasks" on tasks for all using (true) with check (true);

-- Projects Policies
create policy "Enable all access for projects" on projects for all using (true) with check (true);

-- Expenses Policies
create policy "Enable all access for expenses" on expenses for all using (true) with check (true);

-- Services Policies
create policy "Enable all access for services" on services for all using (true) with check (true);

-- ============================================
-- SEED DATA
-- ============================================

-- Sample Customer with Portal Access
insert into customers (name, company, status, email, phone, portal_token, portal_pin)
values 
  ('Pürtelaş Tiyatro', 'Sanat Kurumu', 'active', 'info@purtelas.com', '+90 555 123 4567', '04f73174-5a86-48cd-bd45-994a564f7e09', '1234')
on conflict (portal_token) do nothing;

-- Sample Shoot
insert into shoots (customer_id, title, shoot_date, shoot_time, location, status, description)
select 
  id,
  'Tiyatro Oyunu Çekimi',
  current_date + interval '3 days',
  '14:00',
  'Kadıköy Sahne',
  'planned',
  'Yeni oyun için tanıtım videosu çekimi'
from customers 
where portal_token = '04f73174-5a86-48cd-bd45-994a564f7e09'
limit 1;

-- Sample Proposal
insert into proposals (customer_id, title, description, total_amount, status, valid_until)
select 
  id,
  'Video Prodüksiyon Paketi',
  'Tiyatro oyunu için profesyonel video çekimi ve kurgu hizmeti',
  15000.00,
  'sent',
  current_date + interval '14 days'
from customers 
where portal_token = '04f73174-5a86-48cd-bd45-994a564f7e09'
limit 1;

-- Sample Tasks
insert into tasks (title, description, assigned_date, status, priority)
values 
  ('Orhan ile Toplantı', 'Yeni proje görüşmesi', current_date, 'pending', 'high'),
  ('Ekipman Kontrolü', 'Perşembe çekimi için ekipman hazırlığı', current_date - interval '1 day', 'pending', 'medium'),
  ('Melis Hanım Takip', 'Teklif için takip araması', current_date - interval '2 days', 'pending', 'high');

-- Sample Service
insert into services (name, description, price, duration, is_active)
values 
  ('Video Çekimi', 'Profesyonel video çekim hizmeti', 5000.00, '1 gün', true),
  ('Video Kurgu', 'Post-prodüksiyon ve kurgu', 3000.00, '3 gün', true),
  ('Drone Çekimi', 'Havadan görüntüleme', 2500.00, '2 saat', true);

