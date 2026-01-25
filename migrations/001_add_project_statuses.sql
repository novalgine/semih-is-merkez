-- Migration: Add new project statuses
-- Date: 2026-01-25
-- Description: Update projects table to support new status values including 'in-progress'

-- Drop existing check constraint
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;

-- Add new check constraint with expanded status options
ALTER TABLE projects ADD CONSTRAINT projects_status_check 
CHECK (status IN ('proposal', 'planning', 'shooting', 'editing', 'in-progress', 'completed', 'on-hold'));

-- Update any existing 'active' status to 'in-progress' (optional migration)
UPDATE projects SET status = 'in-progress' WHERE status = 'active';
