-- Custom SQL migration file to update existing field configs with default values

-- Update existing field configs with visible and cellType based on their key and type
-- This is for backwards compatibility with existing workspaces

-- Title field
UPDATE field_configs 
SET cell_type = 'editable-text'
WHERE key = 'title' AND cell_type IS NULL;

-- Owner field
UPDATE field_configs 
SET cell_type = 'editable-owner'
WHERE key = 'owner' AND cell_type IS NULL;

-- Status field
UPDATE field_configs 
SET cell_type = 'status'
WHERE key = 'status' AND cell_type IS NULL;

-- Priority field
UPDATE field_configs 
SET cell_type = 'priority'
WHERE key = 'priority' AND cell_type IS NULL;

-- Asset class field
UPDATE field_configs 
SET cell_type = 'editable-combobox'
WHERE key = 'assetClass' AND cell_type IS NULL;

-- Theme field (hidden by default)
UPDATE field_configs 
SET visible = 'false', cell_type = 'editable-combobox'
WHERE key = 'theme' AND cell_type IS NULL;

-- Teams involved field
UPDATE field_configs 
SET cell_type = 'badge-list'
WHERE key = 'teamsInvolved' AND cell_type IS NULL;

-- Text fields that are detail-only
UPDATE field_configs 
SET visible = 'detail-only', cell_type = 'editable-text'
WHERE key IN ('problemStatement', 'solutionDesign', 'benefits', 'otherUseCases') AND cell_type IS NULL;

-- Number fields
UPDATE field_configs 
SET cell_type = 'editable-number'
WHERE key IN ('currentHrs', 'workedHrs') AND cell_type IS NULL;

-- Saved hours (hidden by default)
UPDATE field_configs 
SET visible = 'false', cell_type = 'editable-number'
WHERE key = 'savedHrs' AND cell_type IS NULL;

-- Multi-select fields that are detail-only
UPDATE field_configs 
SET visible = 'detail-only', cell_type = 'editable-tags'
WHERE key IN ('tools', 'tags') AND cell_type IS NULL;

-- Date field
UPDATE field_configs 
SET visible = 'detail-only', cell_type = 'editable-date'
WHERE key = 'completionDate' AND cell_type IS NULL;
