-- Custom SQL migration file, put your code below! --

-- ============================================
-- USERS
-- ============================================
INSERT INTO users (id, email, name, avatar, created_at, updated_at)
VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'kandarp@example.com', 'Kandarp Shah', 'https://api.dicebear.com/7.x/avataaars/svg?seed=kandarp', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  avatar = EXCLUDED.avatar;
