-- Add description column to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS description text;

-- Add comment for documentation
COMMENT ON COLUMN tasks.description IS 'Detailed description of the task';
