-- Add tags column to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create an index for faster tag searching (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_customers_tags ON customers USING GIN (tags);
