-- Custom SQL migration file, put your code below! --
INSERT INTO users (id, email, name, created_at, updated_at)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'kandarp@example.com',
  'Kandarp',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET name = 'Kandarp';

-- Create test workspace
INSERT INTO workspaces (id, name, slug, owner_user_id, numeric_id, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Personal Projects',
  'personal',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  1,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO UPDATE SET name = 'Personal Projects';

-- Create sample tasks
INSERT INTO tasks (workspace_id, display_id, sequence_number, data, version, created_at, updated_at)
VALUES
('550e8400-e29b-41d4-a716-446655440000', 'TSK-001', 1,
 '{"title": "Automated mentor-mentee matching", "status": "completed", "priority": "high", "owner": "Kandarp", "assetClass": "People Tech", "problemStatement": "Manual mentor assignment was slow", "solutionDesign": "Built a weighted similarity engine", "currentHrs": 120, "workedHrs": 90, "savedHrs": 300, "tools": ["React", "FastAPI", "PostgreSQL"], "theme": "Automation", "teamsInvolved": ["HR", "Engineering"], "benefits": "Reduced manual ops effort", "otherUseCases": "Can be reused for buddy allocation", "tags": ["high-impact", "ai-assisted"]}'::jsonb,
 1, '2024-01-05'::timestamp, NOW()),
('550e8400-e29b-41d4-a716-446655440000', 'TSK-002', 2,
 '{"title": "Mentoring program admin dashboard", "status": "in-progress", "priority": "medium", "owner": "Aditi", "assetClass": "Internal Tools", "problemStatement": "Program admins lacked visibility", "solutionDesign": "Designed a role-based dashboard", "currentHrs": 80, "workedHrs": 50, "savedHrs": 160, "tools": ["React", "Next.js", "Chart.js"], "theme": "Operations", "teamsInvolved": ["HR"], "benefits": "Improved operational visibility", "otherUseCases": "Dashboard pattern reusable", "tags": ["dashboard", "ops"]}'::jsonb,
 1, '2024-02-10'::timestamp, NOW()),
('550e8400-e29b-41d4-a716-446655440000', 'TSK-003', 3,
 '{"title": "Email automation for mentees", "status": "todo", "priority": "low", "owner": "Rahul", "assetClass": "People Tech", "problemStatement": "Manual email sending", "solutionDesign": "Automated email workflows", "currentHrs": 40, "workedHrs": 0, "savedHrs": 120, "tools": ["SendGrid", "Python"], "theme": "Automation", "teamsInvolved": ["HR"], "benefits": "Saves time", "otherUseCases": "Reusable", "tags": ["email", "automation"]}'::jsonb,
 1, '2024-03-15'::timestamp, NOW())
ON CONFLICT (display_id) DO NOTHING;
