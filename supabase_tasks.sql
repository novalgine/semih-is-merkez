-- Create tasks table for Weekly Kanban Board
create table if not exists tasks (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  is_completed boolean default false,
  assigned_date date, -- NULL means Backlog
  position integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indexes for performance
create index if not exists tasks_assigned_date_idx on tasks(assigned_date);
create index if not exists tasks_position_idx on tasks(position);

-- Enable RLS
alter table tasks enable row level security;

-- Policies (Allow all for now, similar to other tables in this project context)
create policy "Enable read access for all users" on tasks for select using (true);
create policy "Enable insert for all users" on tasks for insert with check (true);
create policy "Enable update for all users" on tasks for update using (true);
create policy "Enable delete for all users" on tasks for delete using (true);
