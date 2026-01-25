-- Migration: Clean up old daily_logs data
-- Date: 2026-01-26
-- Description: Removes all data from the old daily_logs table since we've migrated to the new tasks system

-- Option 1: Delete all data but keep the table structure (RECOMMENDED)
DELETE FROM daily_logs;

-- Option 2: Drop the entire table (UNCOMMENT IF YOU WANT TO COMPLETELY REMOVE THE TABLE)
-- DROP TABLE IF EXISTS daily_logs;

-- Verify the cleanup
SELECT COUNT(*) as remaining_logs FROM daily_logs;
