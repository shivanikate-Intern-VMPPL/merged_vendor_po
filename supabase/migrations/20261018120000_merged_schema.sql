-- =============================================================================
-- MULYAM UNIFIED PORTAL: CONSOLIDATED SCHEMA MIGRATION
-- Run this in your Supabase SQL Editor (Ctrl+A then Run)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. BASE TABLES & ENHANCEMENTS
-- =============================================================================

-- PO Manager: Profiles (Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  mobile TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Unified Roles: supports both PO Manager ('name') and VO ('role_name')
CREATE TABLE IF NOT EXISTS public.roles (
  id BIGSERIAL PRIMARY KEY,
  name TEXT,
  role_name TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.roles ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.roles ADD COLUMN IF NOT EXISTS role_name TEXT;
ALTER TABLE public.roles ADD COLUMN IF NOT EXISTS description TEXT;

-- Unified Permissions: supports both PO Manager ('name') and VO ('permission_name')
CREATE TABLE IF NOT EXISTS public.permissions (
  id BIGSERIAL PRIMARY KEY,
  name TEXT,
  permission_name TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.permissions ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.permissions ADD COLUMN IF NOT EXISTS permission_name TEXT;
ALTER TABLE public.permissions ADD COLUMN IF NOT EXISTS description TEXT;

-- Role Permissions
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id BIGSERIAL PRIMARY KEY,
  role_id BIGINT NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id BIGINT NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- PO Manager: User Roles (Auth UUID)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id BIGINT NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- VO: Custom Users Table (with all Zoho and department fields)
CREATE TABLE IF NOT EXISTS public."Users" (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  employee_id TEXT,
  department TEXT,
  status TEXT DEFAULT 'active',
  zone TEXT,
  zoho_access_token TEXT,
  zoho_refresh_token TEXT,
  zoho_token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public."Users" ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public."Users" ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public."Users" ADD COLUMN IF NOT EXISTS zoho_access_token TEXT;
ALTER TABLE public."Users" ADD COLUMN IF NOT EXISTS zoho_refresh_token TEXT;
ALTER TABLE public."Users" ADD COLUMN IF NOT EXISTS zoho_token_expires_at TIMESTAMPTZ;

-- VO: User Roles (Integer User ID)
CREATE TABLE IF NOT EXISTS public.vo_user_roles (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES public."Users"(id) ON DELETE CASCADE,
  role_id BIGINT NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- PO Manager: Farmers / Master Vendors
CREATE TABLE IF NOT EXISTS public.farmers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zoho_vendor_id TEXT UNIQUE,
  name TEXT NOT NULL,
  mobile TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- PO Manager: Items / Requirements
CREATE TABLE IF NOT EXISTS public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name TEXT NOT NULL,
  required_qty NUMERIC,
  unit TEXT NOT NULL,
  vendor_id TEXT,
  vendor_name TEXT,
  rate NUMERIC,
  zoho_item_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.purchase_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name TEXT NOT NULL,
  required_qty NUMERIC,
  unit TEXT NOT NULL,
  vendor_id TEXT,
  vendor_name TEXT,
  rate NUMERIC,
  zoho_item_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- PO Manager: Purchase Orders & Order Items
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number TEXT NOT NULL UNIQUE,
  vendor_id TEXT NOT NULL,
  vendor_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  is_draft_only BOOLEAN DEFAULT false,
  zoho_po_id TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  rate NUMERIC,
  unit TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.zoho_cache (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.po_number_counters (
  prefix TEXT PRIMARY KEY,
  last_number INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- VO: Vendors (with all original KYC and Zoho sync fields)
CREATE TABLE IF NOT EXISTS public.vendors (
  id BIGSERIAL PRIMARY KEY,
  vendor_name TEXT,
  trade_name TEXT,
  vendor_type TEXT,
  category TEXT,
  contact_person TEXT,
  mobile TEXT,
  email TEXT,
  registered_address TEXT,
  registered_country TEXT,
  registered_address_line1 TEXT,
  registered_address_line2 TEXT,
  registered_city TEXT,
  registered_state TEXT,
  registered_pin_code TEXT,
  communication_address TEXT,
  communication_country TEXT,
  communication_address_line1 TEXT,
  communication_address_line2 TEXT,
  communication_city TEXT,
  communication_state TEXT,
  communication_pin_code TEXT,
  gst_no TEXT,
  pan_no TEXT,
  msme_status TEXT,
  bank_name TEXT,
  account_name TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  credit_days TEXT,
  tds_applicable TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  requested_by TEXT,
  zone TEXT,
  date TEXT,
  status TEXT DEFAULT 'pending',
  approval_level INT DEFAULT 0,
  zoho_uploaded_at TIMESTAMPTZ,
  zoho_uploaded_by TEXT,
  zoho_contact_id TEXT,
  zoho_upload_status TEXT,
  zoho_upload_error TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS zoho_uploaded_at TIMESTAMPTZ;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS zoho_uploaded_by TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS zoho_contact_id TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS zoho_upload_status TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS zoho_upload_error TEXT;

-- VO: Vendor Approval Audit History
CREATE TABLE IF NOT EXISTS public.vendor_approval_history (
  id BIGSERIAL PRIMARY KEY,
  vendor_id BIGINT NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  approver_id BIGINT,
  approver_role TEXT,
  approval_level INT,
  action TEXT NOT NULL,
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================================================
-- 2. STORAGE BUCKETS
-- =============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('po-attachments', 'po-attachments', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('vendor-documents', 'vendor-documents', true)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 3. ROW LEVEL SECURITY & POLICIES
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zoho_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.po_number_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_approval_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vo_user_roles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Roles & Permissions
  DROP POLICY IF EXISTS "Allow read roles" ON public.roles;
  CREATE POLICY "Allow read roles" ON public.roles FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Allow read permissions" ON public.permissions;
  CREATE POLICY "Allow read permissions" ON public.permissions FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Allow read role_permissions" ON public.role_permissions;
  CREATE POLICY "Allow read role_permissions" ON public.role_permissions FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Allow read user_roles" ON public.user_roles;
  CREATE POLICY "Allow read user_roles" ON public.user_roles FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Allow read vo_user_roles" ON public.vo_user_roles;
  CREATE POLICY "Allow read vo_user_roles" ON public.vo_user_roles FOR ALL USING (true) WITH CHECK (true);

  -- Vendor Onboarding access
  DROP POLICY IF EXISTS "Allow vendor operations" ON public.vendors;
  CREATE POLICY "Allow vendor operations" ON public.vendors FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Allow approval history operations" ON public.vendor_approval_history;
  CREATE POLICY "Allow approval history operations" ON public.vendor_approval_history FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Allow Users operations" ON public."Users";
  CREATE POLICY "Allow Users operations" ON public."Users" FOR ALL USING (true) WITH CHECK (true);

  -- Storage Policies
  DROP POLICY IF EXISTS "Public po-attachments" ON storage.objects;
  CREATE POLICY "Public po-attachments" ON storage.objects FOR ALL USING (bucket_id = 'po-attachments') WITH CHECK (bucket_id = 'po-attachments');

  DROP POLICY IF EXISTS "Public vendor-documents" ON storage.objects;
  CREATE POLICY "Public vendor-documents" ON storage.objects FOR ALL USING (bucket_id = 'vendor-documents') WITH CHECK (bucket_id = 'vendor-documents');
END $$;
