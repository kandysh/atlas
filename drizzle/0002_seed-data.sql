-- Custom SQL migration file, put your code below! --

-- ============================================
-- USERS
-- ============================================
INSERT INTO users (id, email, name, avatar, created_at, updated_at)
VALUES 
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'kandarp@example.com', 'Kandarp Shah', 'https://api.dicebear.com/7.x/avataaars/svg?seed=kandarp', NOW(), NOW()),
  ('a1b2c3d4-e5f6-4789-a012-3456789abcde'::uuid, 'sarah.chen@example.com', 'Sarah Chen', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', NOW(), NOW()),
  ('b2c3d4e5-f6a7-4890-b123-456789abcdef'::uuid, 'mike.johnson@example.com', 'Mike Johnson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike', NOW(), NOW()),
  ('c3d4e5f6-a7b8-4901-c234-56789abcdef0'::uuid, 'priya.patel@example.com', 'Priya Patel', 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya', NOW(), NOW()),
  ('d4e5f6a7-b8c9-4012-d345-6789abcdef01'::uuid, 'alex.kim@example.com', 'Alex Kim', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET 
  name = EXCLUDED.name,
  avatar = EXCLUDED.avatar;

-- ============================================
-- WORKSPACES
-- ============================================
INSERT INTO workspaces (id, name, slug, owner_user_id, numeric_id, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Personal Projects', 'personal', 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 1, NOW(), NOW()),
  ('660e8400-e29b-41d4-a716-446655440001'::uuid, 'Engineering Team', 'engineering', 'a1b2c3d4-e5f6-4789-a012-3456789abcde'::uuid, 2, NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440002'::uuid, 'Product Development', 'product-dev', 'b2c3d4e5-f6a7-4890-b123-456789abcdef'::uuid, 3, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  owner_user_id = EXCLUDED.owner_user_id;

-- ============================================
-- WORKSPACE MEMBERS
-- ============================================
INSERT INTO workspace_members (id, workspace_id, user_id, role, created_at, updated_at)
VALUES 
  -- Personal Projects workspace
  ('650e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'owner', NOW(), NOW()),
  
  -- Engineering Team workspace
  ('750e8400-e29b-41d4-a716-446655440002'::uuid, '660e8400-e29b-41d4-a716-446655440001'::uuid, 'a1b2c3d4-e5f6-4789-a012-3456789abcde'::uuid, 'owner', NOW(), NOW()),
  ('750e8400-e29b-41d4-a716-446655440003'::uuid, '660e8400-e29b-41d4-a716-446655440001'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'admin', NOW(), NOW()),
  ('750e8400-e29b-41d4-a716-446655440004'::uuid, '660e8400-e29b-41d4-a716-446655440001'::uuid, 'c3d4e5f6-a7b8-4901-c234-56789abcdef0'::uuid, 'member', NOW(), NOW()),
  ('750e8400-e29b-41d4-a716-446655440005'::uuid, '660e8400-e29b-41d4-a716-446655440001'::uuid, 'd4e5f6a7-b8c9-4012-d345-6789abcdef01'::uuid, 'member', NOW(), NOW()),
  
  -- Product Development workspace
  ('850e8400-e29b-41d4-a716-446655440006'::uuid, '770e8400-e29b-41d4-a716-446655440002'::uuid, 'b2c3d4e5-f6a7-4890-b123-456789abcdef'::uuid, 'owner', NOW(), NOW()),
  ('850e8400-e29b-41d4-a716-446655440007'::uuid, '770e8400-e29b-41d4-a716-446655440002'::uuid, 'a1b2c3d4-e5f6-4789-a012-3456789abcde'::uuid, 'admin', NOW(), NOW()),
  ('850e8400-e29b-41d4-a716-446655440008'::uuid, '770e8400-e29b-41d4-a716-446655440002'::uuid, 'c3d4e5f6-a7b8-4901-c234-56789abcdef0'::uuid, 'member', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- FIELD CONFIGS
-- ============================================
INSERT INTO field_configs (id, workspace_id, key, name, type, options, "order", created_at, updated_at)
VALUES 
  -- Personal Projects workspace fields
  ('950e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'status', 'Status', 'select', '{"choices": ["todo", "in-progress", "completed", "blocked"], "defaultValue": "todo", "required": true}'::jsonb, 1, NOW(), NOW()),
  ('950e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'priority', 'Priority', 'select', '{"choices": ["low", "medium", "high", "urgent"], "defaultValue": "medium", "required": true}'::jsonb, 2, NOW(), NOW()),
  ('950e8400-e29b-41d4-a716-446655440003'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'owner', 'Owner', 'text', '{"required": true}'::jsonb, 3, NOW(), NOW()),
  ('950e8400-e29b-41d4-a716-446655440004'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'dueDate', 'Due Date', 'date', '{}'::jsonb, 4, NOW(), NOW()),
  
  -- Engineering Team workspace fields
  ('a50e8400-e29b-41d4-a716-446655440001'::uuid, '660e8400-e29b-41d4-a716-446655440001'::uuid, 'status', 'Status', 'select', '{"choices": ["backlog", "todo", "in-progress", "review", "done"], "defaultValue": "backlog", "required": true}'::jsonb, 1, NOW(), NOW()),
  ('a50e8400-e29b-41d4-a716-446655440002'::uuid, '660e8400-e29b-41d4-a716-446655440001'::uuid, 'priority', 'Priority', 'select', '{"choices": ["p0", "p1", "p2", "p3"], "defaultValue": "p2", "required": true}'::jsonb, 2, NOW(), NOW()),
  ('a50e8400-e29b-41d4-a716-446655440003'::uuid, '660e8400-e29b-41d4-a716-446655440001'::uuid, 'assignee', 'Assignee', 'text', '{"required": false}'::jsonb, 3, NOW(), NOW()),
  ('a50e8400-e29b-41d4-a716-446655440004'::uuid, '660e8400-e29b-41d4-a716-446655440001'::uuid, 'sprint', 'Sprint', 'text', '{}'::jsonb, 4, NOW(), NOW()),
  ('a50e8400-e29b-41d4-a716-446655440005'::uuid, '660e8400-e29b-41d4-a716-446655440001'::uuid, 'storyPoints', 'Story Points', 'number', '{"defaultValue": 0}'::jsonb, 5, NOW(), NOW()),
  ('a50e8400-e29b-41d4-a716-446655440006'::uuid, '660e8400-e29b-41d4-a716-446655440001'::uuid, 'labels', 'Labels', 'multiselect', '{"choices": ["bug", "feature", "enhancement", "documentation", "technical-debt"]}'::jsonb, 6, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- TASKS - Personal Projects
-- ============================================
INSERT INTO tasks (workspace_id, display_id, sequence_number, data, version, created_at, updated_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'TSK-001', 1,
   '{"title": "Automated mentor-mentee matching system", "status": "completed", "priority": "high", "owner": "Kandarp Shah", "assetClass": "People Tech", "problemStatement": "Manual mentor assignment was time-consuming and prone to mismatches", "solutionDesign": "Built a weighted similarity engine using skills, interests, and availability", "currentHrs": 120, "workedHrs": 90, "savedHrs": 300, "tools": ["React", "FastAPI", "PostgreSQL", "Scikit-learn"], "theme": "Automation", "teamsInvolved": ["HR", "Engineering"], "benefits": "Reduced manual ops effort by 80%, improved match quality by 45%", "otherUseCases": "Can be reused for buddy allocation, team formation, project assignments", "tags": ["high-impact", "ai-assisted", "shipped"], "dueDate": "2024-01-30"}'::jsonb,
   1, '2024-01-05'::timestamp, NOW()),
  
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'TSK-002', 2,
   '{"title": "Mentoring program admin dashboard", "status": "in-progress", "priority": "medium", "owner": "Kandarp Shah", "assetClass": "Internal Tools", "problemStatement": "Program admins lacked real-time visibility into mentoring relationships", "solutionDesign": "Designed a role-based dashboard with analytics and reporting", "currentHrs": 80, "workedHrs": 50, "savedHrs": 160, "tools": ["React", "Next.js", "Chart.js", "Tailwind CSS"], "theme": "Operations", "teamsInvolved": ["HR", "Engineering"], "benefits": "Improved operational visibility and decision-making", "otherUseCases": "Dashboard pattern reusable for other admin tools", "tags": ["dashboard", "ops", "analytics"], "dueDate": "2024-02-28"}'::jsonb,
   1, '2024-02-01'::timestamp, NOW()),
  
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'TSK-003', 3,
   '{"title": "Email automation for mentees", "status": "todo", "priority": "low", "owner": "Kandarp Shah", "assetClass": "People Tech", "problemStatement": "Manual email sending for program updates", "solutionDesign": "Automated email workflows with templates and scheduling", "currentHrs": 40, "workedHrs": 0, "savedHrs": 120, "tools": ["SendGrid", "Python", "Celery"], "theme": "Automation", "teamsInvolved": ["HR"], "benefits": "Saves time and ensures consistent communication", "otherUseCases": "Reusable for onboarding, training programs", "tags": ["email", "automation"], "dueDate": "2024-03-31"}'::jsonb,
   1, '2024-03-01'::timestamp, NOW()),
  
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'TSK-004', 4,
   '{"title": "Mobile app for mentee check-ins", "status": "todo", "priority": "medium", "owner": "Kandarp Shah", "assetClass": "Mobile", "problemStatement": "Mentees struggled to log interactions and progress on desktop", "solutionDesign": "Native mobile app for quick check-ins and feedback", "currentHrs": 200, "workedHrs": 0, "savedHrs": 0, "tools": ["React Native", "Expo", "Firebase"], "theme": "User Experience", "teamsInvolved": ["Engineering", "Design"], "benefits": "Increased engagement and data collection", "otherUseCases": "Can be extended for other programs", "tags": ["mobile", "ux"], "dueDate": "2024-06-30"}'::jsonb,
   1, NOW(), NOW()),

-- ============================================
-- TASKS - Engineering Team
-- ============================================
  ('660e8400-e29b-41d4-a716-446655440001'::uuid, 'ENG-001', 1,
   '{"title": "Implement dark mode across application", "status": "done", "priority": "p2", "assignee": "Sarah Chen", "sprint": "Sprint 24", "storyPoints": 5, "labels": ["feature", "enhancement"], "description": "Add dark mode theme support with user preference detection", "acceptanceCriteria": "Theme persists across sessions, respects system preference", "tags": ["frontend", "ui"]}'::jsonb,
   1, '2024-01-10'::timestamp, NOW()),
  
  ('660e8400-e29b-41d4-a716-446655440001'::uuid, 'ENG-002', 2,
   '{"title": "Fix memory leak in WebSocket connection", "status": "review", "priority": "p0", "assignee": "Alex Kim", "sprint": "Sprint 25", "storyPoints": 8, "labels": ["bug", "technical-debt"], "description": "WebSocket connections not properly cleaned up on component unmount", "acceptanceCriteria": "No memory growth after repeated connections", "tags": ["backend", "critical"]}'::jsonb,
   1, '2024-01-15'::timestamp, NOW()),
  
  ('660e8400-e29b-41d4-a716-446655440001'::uuid, 'ENG-003', 3,
   '{"title": "Add real-time collaboration features", "status": "in-progress", "priority": "p1", "assignee": "Priya Patel", "sprint": "Sprint 25", "storyPoints": 13, "labels": ["feature"], "description": "Enable multiple users to edit documents simultaneously", "acceptanceCriteria": "Changes visible in real-time, conflict resolution works", "tags": ["websocket", "collaboration"]}'::jsonb,
   1, '2024-01-18'::timestamp, NOW()),
  
  ('660e8400-e29b-41d4-a716-446655440001'::uuid, 'ENG-004', 4,
   '{"title": "Upgrade to React 19", "status": "backlog", "priority": "p2", "assignee": null, "sprint": null, "storyPoints": 5, "labels": ["technical-debt", "enhancement"], "description": "Upgrade React and related dependencies to v19", "acceptanceCriteria": "All tests pass, no breaking changes", "tags": ["dependencies", "upgrade"]}'::jsonb,
   1, NOW(), NOW()),
  
  ('660e8400-e29b-41d4-a716-446655440001'::uuid, 'ENG-005', 5,
   '{"title": "Implement API rate limiting", "status": "todo", "priority": "p1", "assignee": "Mike Johnson", "sprint": "Sprint 25", "storyPoints": 3, "labels": ["feature", "security"], "description": "Add rate limiting middleware to protect APIs", "acceptanceCriteria": "429 responses after threshold, proper headers", "tags": ["backend", "security"]}'::jsonb,
   1, NOW(), NOW()),

-- ============================================
-- TASKS - Product Development
-- ============================================
  ('770e8400-e29b-41d4-a716-446655440002'::uuid, 'PRD-001', 1,
   '{"title": "User onboarding flow redesign", "status": "completed", "priority": "high", "owner": "Mike Johnson", "phase": "Design", "targetDate": "2024-02-15", "description": "Redesign the user onboarding experience to improve activation rates", "successMetrics": "Increase activation by 25%, reduce time-to-first-action by 40%", "stakeholders": ["Product", "Design", "Engineering"], "tags": ["onboarding", "ux", "growth"]}'::jsonb,
   1, '2024-01-20'::timestamp, NOW()),
  
  ('770e8400-e29b-41d4-a716-446655440002'::uuid, 'PRD-002', 2,
   '{"title": "A/B test checkout optimization", "status": "in-progress", "priority": "high", "owner": "Sarah Chen", "phase": "Testing", "targetDate": "2024-02-28", "description": "Test 3 checkout flow variations to improve conversion", "successMetrics": "Find variant with 10%+ conversion improvement", "stakeholders": ["Product", "Data Science"], "tags": ["conversion", "a-b-testing", "revenue"]}'::jsonb,
   1, '2024-02-01'::timestamp, NOW()),
  
  ('770e8400-e29b-41d4-a716-446655440002'::uuid, 'PRD-003', 3,
   '{"title": "Customer feedback collection system", "status": "todo", "priority": "medium", "owner": "Priya Patel", "phase": "Planning", "targetDate": "2024-03-30", "description": "Build in-app feedback collection with NPS surveys", "successMetrics": "Collect 500+ responses per month", "stakeholders": ["Product", "Customer Success"], "tags": ["feedback", "nps", "analytics"]}'::jsonb,
   1, NOW(), NOW()),
  
  ('770e8400-e29b-41d4-a716-446655440002'::uuid, 'PRD-004', 4,
   '{"title": "Feature usage analytics dashboard", "status": "todo", "priority": "medium", "owner": "Mike Johnson", "phase": "Planning", "targetDate": "2024-04-15", "description": "Internal dashboard to track feature adoption and usage patterns", "successMetrics": "All PMs use it weekly for decision making", "stakeholders": ["Product", "Engineering"], "tags": ["analytics", "internal-tool"]}'::jsonb,
   1, NOW(), NOW())
ON CONFLICT (display_id) DO NOTHING;

-- ============================================
-- TASK COMMENTS
-- ============================================
INSERT INTO task_comments (id, workspace_id, task_id, user_id, content, created_at, updated_at)
VALUES
  ('c50e8400-e29b-41d4-a716-446655440001'::uuid,
   '550e8400-e29b-41d4-a716-446655440000'::uuid,
   (SELECT id FROM tasks WHERE display_id = 'TSK-001'),
   'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
   'Great work on this! The matching algorithm is performing well in production.',
   NOW() - INTERVAL '5 days',
   NOW() - INTERVAL '5 days'),
  
  ('c50e8400-e29b-41d4-a716-446655440002'::uuid,
   '660e8400-e29b-41d4-a716-446655440001'::uuid,
   (SELECT id FROM tasks WHERE display_id = 'ENG-002'),
   'a1b2c3d4-e5f6-4789-a012-3456789abcde'::uuid,
   'Found the root cause - we need to add a cleanup function in the useEffect hook.',
   NOW() - INTERVAL '2 days',
   NOW() - INTERVAL '2 days'),
  
  ('c50e8400-e29b-41d4-a716-446655440003'::uuid,
   '660e8400-e29b-41d4-a716-446655440001'::uuid,
   (SELECT id FROM tasks WHERE display_id = 'ENG-002'),
   'd4e5f6a7-b8c9-4012-d345-6789abcdef01'::uuid,
   'PR is ready for review! Added comprehensive tests.',
   NOW() - INTERVAL '1 day',
   NOW() - INTERVAL '1 day'),
  
  ('c50e8400-e29b-41d4-a716-446655440004'::uuid,
   '770e8400-e29b-41d4-a716-446655440002'::uuid,
   (SELECT id FROM tasks WHERE display_id = 'PRD-001'),
   'b2c3d4e5-f6a7-4890-b123-456789abcdef'::uuid,
   'The new onboarding flow is showing very positive results in early testing!',
   NOW() - INTERVAL '3 days',
   NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;
