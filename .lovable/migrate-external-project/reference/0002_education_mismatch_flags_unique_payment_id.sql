ALTER TABLE public.education_support_registrations
  ADD COLUMN IF NOT EXISTS review_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS ai_review text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS flags_checked_at timestamptz,
  ADD COLUMN IF NOT EXISTS flags_confirmed_by uuid,
  ADD COLUMN IF NOT EXISTS flags_confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS flags_confirm_note text NOT NULL DEFAULT '';

-- A payment transaction ID can be used by only one registration, ignoring case and spaces.
CREATE UNIQUE INDEX IF NOT EXISTS education_support_payment_reference_unique
  ON public.education_support_registrations (upper(btrim(payment_reference)))
  WHERE payment_reference IS NOT NULL;

CREATE OR REPLACE FUNCTION public.guard_education_approval()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  -- New check results or payment changes cancel an earlier human confirmation.
  IF (NEW.review_flags IS DISTINCT FROM OLD.review_flags
      OR NEW.flags_checked_at IS DISTINCT FROM OLD.flags_checked_at
      OR NEW.payment_status IS DISTINCT FROM OLD.payment_status
      OR NEW.payment_reference IS DISTINCT FROM OLD.payment_reference)
     AND NEW.flags_confirmed_at IS NOT DISTINCT FROM OLD.flags_confirmed_at THEN
    NEW.flags_confirmed_at := NULL;
    NEW.flags_confirmed_by := NULL;
  END IF;

  -- Recording a confirmation: always stamped with the signed-in person and the current time.
  IF NEW.flags_confirmed_at IS NOT NULL AND NEW.flags_confirmed_at IS DISTINCT FROM OLD.flags_confirmed_at THEN
    IF NEW.flags_checked_at IS NULL THEN RAISE EXCEPTION 'Run the mismatch check before confirming'; END IF;
    IF auth.uid() IS NULL THEN RAISE EXCEPTION 'A signed-in person must confirm the mismatch check'; END IF;
    NEW.flags_confirmed_by := auth.uid();
    NEW.flags_confirmed_at := now();
  ELSIF NEW.flags_confirmed_at IS NULL THEN
    NEW.flags_confirmed_by := NULL;
  END IF;

  IF NEW.approval_status = 'approved' AND NEW.payment_status <> 'paid' THEN
    RAISE EXCEPTION 'Confirm payment before approval';
  END IF;
  IF NEW.approval_status = 'approved' AND OLD.approval_status IS DISTINCT FROM 'approved'
     AND (NEW.flags_confirmed_at IS NULL OR NEW.flags_confirmed_by IS NULL) THEN
    RAISE EXCEPTION 'A person must confirm the mismatch check before approval';
  END IF;

  IF NEW.approval_status IS DISTINCT FROM OLD.approval_status THEN
    NEW.approved_by := auth.uid();
    NEW.approved_at := now();
  END IF;
  RETURN NEW;
END $function$;