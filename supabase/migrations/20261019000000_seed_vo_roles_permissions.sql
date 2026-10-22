-- =============================================================================
-- FIX RLS & SEED ROLES, PERMISSIONS, AND USER ASSIGNMENTS
-- Run this in your Supabase SQL Editor (dlnnavewgvuvqofowprr)
-- =============================================================================

-- Step 1: Disable RLS on lookup tables to prevent permission errors
ALTER TABLE public.roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vo_user_roles DISABLE ROW LEVEL SECURITY;

-- Step 2: Seed Roles
INSERT INTO public.roles (id, name, role_name, description) VALUES
  (1, 'Admin', 'Admin', 'Full access to the system'),
  (2, 'Approver', 'Approver', 'Can review and approve vendors'),
  (3, 'Data Entry Operator', 'Data Entry Operator', 'Can create and manage vendor forms'),
  (6, 'Approver1', 'Approver1', 'Reviews vendor registration forms and performs first-level verification.'),
  (7, 'Approver2', 'Approver2', 'Performs final-level review and approval of vendor registration forms.')
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, role_name = EXCLUDED.role_name;

-- Step 3: Seed Permissions
INSERT INTO public.permissions (id, name, permission_name, description) VALUES
  (5, 'dashboard.view', 'dashboard.view', 'View dashboard metrics and counts'),
  (6, 'vendor.create', 'vendor.create', 'Create new vendor records'),
  (7, 'vendor.read', 'vendor.read', 'Read vendor details and lists'),
  (8, 'vendor.update', 'vendor.update', 'Update existing vendor records'),
  (9, 'vendor.delete', 'vendor.delete', 'Delete vendor records'),
  (10, 'vendor.approve', 'vendor.approve', 'Approve or reject vendors'),
  (11, 'user.read', 'user.read', 'Read user list'),
  (12, 'user.create', 'user.create', 'Create users'),
  (13, 'user.update', 'user.update', 'Update users'),
  (14, 'user.delete', 'user.delete', 'Delete users'),
  (15, 'role.read', 'role.read', 'Read roles'),
  (16, 'role.create', 'role.create', 'Create roles'),
  (17, 'role.update', 'role.update', 'Update roles'),
  (18, 'role.delete', 'role.delete', 'Delete roles'),
  (19, 'permission.read', 'permission.read', 'Read permissions'),
  (20, 'permission.update', 'permission.update', 'Update permissions'),
  (21, 'vendor.history.read', 'vendor.history.read', 'View vendor approval history')
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, permission_name = EXCLUDED.permission_name;

-- Step 4: Seed Role-Permission Mappings
INSERT INTO public.role_permissions (role_id, permission_id) VALUES
  (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10), (1, 11), (1, 12), (1, 13), (1, 14), (1, 15), (1, 16), (1, 17), (1, 18), (1, 19), (1, 20), (1, 21),
  (3, 5), (3, 6), (3, 7), (3, 8),
  (6, 5), (6, 7), (6, 10), (6, 21),
  (7, 5), (7, 7), (7, 10), (7, 21)
ON CONFLICT DO NOTHING;

-- Step 5: Assign Roles to Users
INSERT INTO public.vo_user_roles (id, user_id, role_id) VALUES
  (1, 1, 1),
  (2, 2, 6),
  (3, 3, 7),
  (4, 6, 7),
  (5, 7, 7),
  (6, 8, 3),
  (7, 9, 6),
  (8, 10, 1),
  (9, 11, 7)
ON CONFLICT (id) DO UPDATE 
SET role_id = EXCLUDED.role_id;
