-- Add category column to tasks table for better organization via Voice Assistant
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS category TEXT;

-- Drop constraints from daily_logs just in case the previous manual step wasn't run
ALTER TABLE daily_logs DROP CONSTRAINT IF EXISTS daily_logs_category_check;
ALTER TABLE daily_logs DROP CONSTRAINT IF EXISTS daily_logs_sentiment_check;

-- Ensure schema cache is updated
NOTIFY pgrst, 'reload schema';
