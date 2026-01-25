-- Add portal_token and portal_pin columns to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS portal_token TEXT,
ADD COLUMN IF NOT EXISTS portal_pin TEXT;

-- Create a unique index on portal_token to ensure uniqueness and fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_portal_token ON customers (portal_token);
