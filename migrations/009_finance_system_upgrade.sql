-- Semih İş Merkezi V3 - Finance System Migration
-- This migration adds support for recurring expense templates, income tracking, and financial status.

-- 1. PROPOSALS UPDATES
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'Unpaid' CHECK (payment_status IN ('Unpaid', 'Partial', 'Paid', 'Cancelled'));
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS paid_at timestamp with time zone;

-- 2. EXPENSES UPDATES
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS status text DEFAULT 'confirmed' CHECK (status IN ('draft', 'confirmed'));
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false;

-- 3. EXPENSE TEMPLATES
CREATE TABLE IF NOT EXISTS expense_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  name text NOT NULL,
  default_amount numeric(10,2),
  category text,
  is_mandatory boolean DEFAULT false,
  user_id uuid DEFAULT auth.uid()
);

-- 4. INCOMES (For manual/other income entries)
CREATE TABLE IF NOT EXISTS incomes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  amount numeric(10,2) NOT NULL,
  date date DEFAULT current_date,
  category text,
  description text,
  source text DEFAULT 'manual', -- 'manual', 'proposal', etc.
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  user_id uuid DEFAULT auth.uid()
);

-- 5. INCOME TEMPLATES (For recurring customers like Afife, Pürtelaş)
CREATE TABLE IF NOT EXISTS income_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  name text NOT NULL,
  default_amount numeric(10,2),
  category text,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  user_id uuid DEFAULT auth.uid()
);

-- 6. RLS POLICIES
ALTER TABLE expense_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for expense_templates" ON expense_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for incomes" ON incomes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for income_templates" ON income_templates FOR ALL USING (true) WITH CHECK (true);

-- 7. UPDATE EXISTING EXPENSES TO 'confirmed'
UPDATE expenses SET status = 'confirmed' WHERE status IS NULL;
