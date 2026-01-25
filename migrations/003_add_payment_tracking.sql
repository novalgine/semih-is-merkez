-- Migration: Add payment tracking to proposals
-- Date: 2026-01-26
-- Description: Adds payment_status and paid_at columns to track actual cash collection

-- Add payment_status column (Pending by default)
ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid'));

-- Add paid_at column for payment date tracking
ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Create index for faster payment status queries
CREATE INDEX IF NOT EXISTS idx_proposals_payment_status ON proposals(payment_status);

-- Update existing approved proposals to Pending (they haven't been paid yet)
UPDATE proposals 
SET payment_status = 'Pending' 
WHERE status = 'Approved' AND payment_status IS NULL;

-- Verify the changes
SELECT 
    COUNT(*) as total_proposals,
    COUNT(*) FILTER (WHERE payment_status = 'Paid') as paid_count,
    COUNT(*) FILTER (WHERE payment_status = 'Pending') as pending_count
FROM proposals;
