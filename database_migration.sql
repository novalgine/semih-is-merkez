-- ==========================================
-- MIGRATION SCRIPT FOR TASKS TABLE
-- Run this in Supabase SQL Editor to fix the application error
-- ==========================================

-- 1. Add missing columns used by the application
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS content text;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS position integer DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_completed boolean DEFAULT false;

-- 2. Migrate existing data from old columns to new columns
UPDATE tasks SET content = title WHERE content IS NULL;
UPDATE tasks SET is_completed = true WHERE status = 'completed';
UPDATE tasks SET is_completed = false WHERE status = 'pending' OR status IS NULL;

-- 3. Set default values for new tasks
ALTER TABLE tasks ALTER COLUMN is_completed SET DEFAULT false;
ALTER TABLE tasks ALTER COLUMN position SET DEFAULT 0;

-- 4. (Optional) You can verify the changes with:
-- SELECT * FROM tasks LIMIT 10;
