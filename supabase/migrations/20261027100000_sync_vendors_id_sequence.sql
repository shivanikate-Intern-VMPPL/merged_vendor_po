-- Keep generated vendor IDs ahead of existing rows imported from the
-- original Vendor Onboarding database.
DO $$
DECLARE
  vendors_sequence TEXT;
  highest_vendor_id BIGINT;
  current_sequence_value BIGINT;
  sequence_is_called BOOLEAN;
BEGIN
  LOCK TABLE public.vendors IN ACCESS EXCLUSIVE MODE;

  SELECT pg_get_serial_sequence('public.vendors', 'id')
  INTO vendors_sequence;

  IF vendors_sequence IS NOT NULL THEN
    EXECUTE format(
      'SELECT last_value, is_called FROM %s',
      vendors_sequence::REGCLASS
    )
    INTO current_sequence_value, sequence_is_called;

    SELECT COALESCE(MAX(id), 0)
    INTO highest_vendor_id
    FROM public.vendors;

    IF highest_vendor_id > current_sequence_value
       OR (highest_vendor_id > 0 AND NOT sequence_is_called) THEN
      PERFORM setval(
        vendors_sequence::REGCLASS,
        GREATEST(highest_vendor_id, 1),
        TRUE
      );
    END IF;
  END IF;
END;
$$;
