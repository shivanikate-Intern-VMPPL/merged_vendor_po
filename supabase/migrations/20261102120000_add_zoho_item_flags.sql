ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS can_be_purchased BOOLEAN DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS can_be_sold BOOLEAN DEFAULT NULL;

CREATE OR REPLACE FUNCTION public.sync_zoho_item_flags(p_item_flags JSONB)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $function$
  UPDATE public.items AS local_item
  SET
    can_be_purchased = source.can_be_purchased,
    can_be_sold = source.can_be_sold
  FROM jsonb_to_recordset(p_item_flags) AS source(
    zoho_item_id TEXT,
    can_be_purchased BOOLEAN,
    can_be_sold BOOLEAN
  )
  WHERE local_item.zoho_item_id = source.zoho_item_id;
$function$;

REVOKE ALL ON FUNCTION public.sync_zoho_item_flags(JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_zoho_item_flags(JSONB) TO service_role;
