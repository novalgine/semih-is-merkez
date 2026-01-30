-- Remove the restrictive checks on 'category' and 'sentiment'
-- This allows the AI to tag voice notes with ANY string value

-- Drop category check constraint
ALTER TABLE daily_logs 
DROP CONSTRAINT IF EXISTS daily_logs_category_check;

-- Drop sentiment check constraint
ALTER TABLE daily_logs 
DROP CONSTRAINT IF EXISTS daily_logs_sentiment_check;

-- Ensure schema cache is reloaded
NOTIFY pgrst, 'reload schema';
