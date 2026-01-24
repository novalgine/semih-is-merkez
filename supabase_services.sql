-- Create Services Table
create table if not exists services (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  price decimal(10,2),
  unit text default 'adet' -- adet, saat, gün, proje
);

-- Enable RLS
alter table services enable row level security;

-- Policies
create policy "Enable all access for all users" on services for all using (true);
