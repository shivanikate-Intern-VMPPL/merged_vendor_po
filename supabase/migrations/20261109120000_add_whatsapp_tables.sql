-- =============================================================================
-- PHASE 3: WHATSAPP INTEGRATION SCHEMA MIGRATION
-- =============================================================================

-- 1. WhatsApp Messages Tracking Table
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  vendor_id TEXT,
  phone TEXT,
  template_name TEXT,
  message_type TEXT NOT NULL DEFAULT 'po_notification',
  provider_message_id TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'delivered', 'read', 'failed', 'skipped')),
  error TEXT,
  attempts INT NOT NULL DEFAULT 0,
  pdf_storage_path TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT whatsapp_messages_po_type_unique UNIQUE (po_id, message_type)
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_po_id ON public.whatsapp_messages(po_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_provider_id ON public.whatsapp_messages(provider_message_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status ON public.whatsapp_messages(status);

-- 2. Vendor WhatsApp Opt-In Tracking
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS whatsapp_opt_in BOOLEAN DEFAULT NULL;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS whatsapp_opt_in_updated_at TIMESTAMPTZ;

-- 3. Storage Bucket for PO PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('po-pdfs', 'po-pdfs', false)
ON CONFLICT (id) DO NOTHING;

-- 4. Row Level Security on whatsapp_messages
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view WhatsApp status for POs they have access to
DROP POLICY IF EXISTS "Users can read whatsapp_messages" ON public.whatsapp_messages;
CREATE POLICY "Users can read whatsapp_messages"
ON public.whatsapp_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.purchase_orders po
    WHERE po.id = whatsapp_messages.po_id
    AND (
      po.created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'office')
      )
    )
  )
);

-- Service role bypasses RLS for edge functions
GRANT ALL ON public.whatsapp_messages TO service_role;
GRANT SELECT ON public.whatsapp_messages TO authenticated;
