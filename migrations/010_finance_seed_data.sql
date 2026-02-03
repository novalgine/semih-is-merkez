-- Seed data for new Finance System
-- Run this AFTER the migration (009_finance_system_upgrade.sql)

-- 1. Sample Expense Templates
INSERT INTO expense_templates (name, default_amount, category, is_mandatory)
VALUES 
  ('Sigara', 150.00, 'Kişisel', false),
  ('Adobe Creative Cloud', 750.00, 'Abonelik', true),
  ('Epidemic Sound', 250.00, 'Abonelik', true),
  ('Elektrik Faturası', 500.00, 'Fatura', true),
  ('Yemek / Market', 200.00, 'Mutfak', false);

-- 2. Sample Income Templates
INSERT INTO income_templates (name, default_amount, category, customer_id)
SELECT '👰 Afife Tanıtım (Aylık)', 5000.00, 'Düzenli İş', id 
FROM customers WHERE name LIKE '%Afife%' LIMIT 1;

INSERT INTO income_templates (name, default_amount, category, customer_id)
SELECT '🎭 Pürtelaş Destek', 3000.00, 'Düzenli İş', id 
FROM customers WHERE name LIKE '%Pürtelaş%' LIMIT 1;

-- 3. Sample Manual Incomes
INSERT INTO incomes (amount, date, category, description, source)
VALUES 
  (2500.00, current_date - interval '2 days', 'Kurgu', 'Ek kurgu işi - Melis', 'manual'),
  (1200.00, current_date - interval '10 days', 'Çekim', 'Nakit çekim işi', 'manual');

-- 4. Update existing proposals to have payment_status
UPDATE proposals SET payment_status = 'Paid' WHERE status = 'accepted';
UPDATE proposals SET payment_status = 'Unpaid' WHERE status = 'sent';
