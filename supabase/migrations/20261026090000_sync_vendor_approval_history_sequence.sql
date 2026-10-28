-- Keep the generated history ID sequence ahead of existing rows imported
-- from the original Vendor Onboarding database.
DO $$
DECLARE
  history_sequence TEXT;
  highest_history_id BIGINT;
BEGIN
  SELECT pg_get_serial_sequence('public.vendor_approval_history', 'id')
  INTO history_sequence;

  IF history_sequence IS NOT NULL THEN
    SELECT COALESCE(MAX(id), 0)
    INTO highest_history_id
    FROM public.vendor_approval_history;

    PERFORM setval(
      history_sequence::REGCLASS,
      GREATEST(highest_history_id, 1),
      highest_history_id > 0
    );
  END IF;
END;
$$;
