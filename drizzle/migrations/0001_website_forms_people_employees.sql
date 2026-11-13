CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE public.coordinators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  referral_code text NOT NULL UNIQUE,
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.coordinators FROM anon, authenticated;
GRANT ALL ON public.coordinators TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coordinators TO authenticated;
ALTER TABLE public.coordinators ENABLE ROW LEVEL SECURITY;
CREATE POLICY coordinators_admin ON public.coordinators FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  service text NOT NULL,
  industry text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  admin_notes text NOT NULL DEFAULT '',
  coordinator_code text,
  coordinator_id uuid REFERENCES public.coordinators(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.contact_submissions FROM anon, authenticated;
GRANT ALL ON public.contact_submissions TO service_role;
GRANT SELECT ON public.contact_submissions TO authenticated;
GRANT INSERT ON public.contact_submissions TO authenticated;
GRANT UPDATE (status, admin_notes) ON public.contact_submissions TO authenticated;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY contact_submissions_admin_read ON public.contact_submissions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY contact_submissions_admin_insert ON public.contact_submissions FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY contact_submissions_admin_review ON public.contact_submissions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
ALTER TABLE public.contact_submissions ADD CONSTRAINT contact_submissions_status_check
  CHECK (status IN ('new', 'reviewed', 'approved', 'rejected'));

CREATE TABLE public.registration_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_code text NOT NULL UNIQUE,
  category text NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  document_path text,
  document_name text,
  status text NOT NULL DEFAULT 'new',
  admin_notes text NOT NULL DEFAULT '',
  coordinator_code text,
  coordinator_id uuid REFERENCES public.coordinators(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.registration_applications FROM anon, authenticated;
GRANT ALL ON public.registration_applications TO service_role;
GRANT SELECT, INSERT ON public.registration_applications TO authenticated;
GRANT UPDATE (status, admin_notes, document_path, document_name) ON public.registration_applications TO authenticated;
ALTER TABLE public.registration_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY registration_applications_admin_read ON public.registration_applications FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY registration_applications_admin_insert ON public.registration_applications FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY registration_applications_admin_update ON public.registration_applications FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
ALTER TABLE public.registration_applications
  ADD CONSTRAINT registration_applications_category_check CHECK (category IN ('startup', 'mentor', 'investor', 'business')),
  ADD CONSTRAINT registration_applications_status_check CHECK (status IN ('new', 'reviewed', 'approved', 'rejected'));

CREATE TABLE public.people_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_group text NOT NULL,
  slug text NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  focus text[] NOT NULL DEFAULT '{}'::text[],
  summary text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  photo_url text,
  sort_order integer NOT NULL DEFAULT 0,
  source_application_id uuid UNIQUE REFERENCES public.registration_applications(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.people_profiles FROM anon, authenticated;
GRANT ALL ON public.people_profiles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.people_profiles TO authenticated;
ALTER TABLE public.people_profiles ENABLE ROW LEVEL SECURITY;
-- Profile pages are readable by signed-in visitors only; admins edit.
CREATE POLICY people_profiles_member_read ON public.people_profiles FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY people_profiles_admin_insert ON public.people_profiles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY people_profiles_admin_update ON public.people_profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY people_profiles_admin_delete ON public.people_profiles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
ALTER TABLE public.people_profiles
  ADD CONSTRAINT people_profiles_group_check CHECK (person_group IN ('investors', 'mentors', 'team', 'startups', 'businesses')),
  ADD CONSTRAINT people_profiles_group_slug_key UNIQUE (person_group, slug);

-- Strips emails, links and phone numbers before anything is published.
CREATE FUNCTION public.people_profile_safe_text(_value text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public
AS $$
  SELECT btrim(regexp_replace(regexp_replace(regexp_replace(coalesce(_value, ''),
    '[[:alnum:]_.%+-]+@[[:alnum:].-]+\.[[:alpha:]]+', '', 'gi'),
    '(https?://|www\.)[^[:space:]]+', '', 'gi'),
    '\+?[[:digit:]][[:digit:][:space:]().-]{7,}[[:digit:]]', '', 'g'));
$$;
REVOKE EXECUTE ON FUNCTION public.people_profile_safe_text(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.people_profile_safe_text(text) TO service_role;

CREATE FUNCTION public.sync_approved_application_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_group text; v_name text; v_role text; v_summary text; v_bio text; v_focus text[]; v_slug text;
BEGIN
  IF NEW.status <> 'approved' THEN
    DELETE FROM public.people_profiles WHERE source_application_id = NEW.id;
    RETURN NEW;
  END IF;
  v_group := CASE NEW.category WHEN 'investor' THEN 'investors' WHEN 'mentor' THEN 'mentors'
    WHEN 'startup' THEN 'startups' WHEN 'business' THEN 'businesses' END;
  IF v_group IS NULL THEN
    DELETE FROM public.people_profiles WHERE source_application_id = NEW.id;
    RETURN NEW;
  END IF;
  v_name := public.people_profile_safe_text(CASE NEW.category
    WHEN 'startup' THEN coalesce(nullif(NEW.details->>'startupName', ''), NEW.full_name)
    WHEN 'business' THEN coalesce(nullif(NEW.details->>'businessName', ''), NEW.full_name)
    ELSE NEW.full_name END);
  v_role := public.people_profile_safe_text(CASE NEW.category
    WHEN 'investor' THEN coalesce(NEW.details->>'investorType', 'Investor')
    WHEN 'business' THEN coalesce(NEW.details->>'businessType', 'Business')
    WHEN 'startup' THEN coalesce(NEW.details->>'startupStage', 'Startup')
    ELSE coalesce(NEW.details->>'designation', 'Mentor') END);
  v_summary := public.people_profile_safe_text(CASE NEW.category
    WHEN 'startup' THEN NEW.details->>'product'
    WHEN 'business' THEN NEW.details->>'products'
    WHEN 'investor' THEN NEW.details->>'investmentThesis'
    WHEN 'mentor' THEN NEW.details->>'mentorAreas' END);
  v_bio := public.people_profile_safe_text(CASE NEW.category
    WHEN 'mentor' THEN concat_ws(E'\n\n', nullif(NEW.details->>'mentorAreas', ''), nullif(NEW.details->>'motivation', ''))
    ELSE v_summary END);
  IF NEW.category = 'mentor' AND jsonb_typeof(NEW.details->'expertise') = 'array' THEN
    SELECT coalesce(array_agg(cleaned) FILTER (WHERE cleaned <> ''), '{}'::text[]) INTO v_focus
    FROM (SELECT public.people_profile_safe_text(value) AS cleaned FROM jsonb_array_elements_text(NEW.details->'expertise')) AS items;
  ELSIF NEW.category = 'investor' THEN
    SELECT coalesce(array_agg(cleaned) FILTER (WHERE cleaned <> ''), '{}'::text[]) INTO v_focus
    FROM (SELECT public.people_profile_safe_text(value) AS cleaned
          FROM regexp_split_to_table(coalesce(NEW.details->>'investmentFocus', ''), '\s*,\s*') AS parts(value)) AS items;
  ELSE
    v_focus := array_remove(ARRAY[public.people_profile_safe_text(NEW.details->>'industry')], '');
  END IF;
  v_slug := coalesce(nullif(left(trim(BOTH '-' FROM regexp_replace(lower(btrim(v_name)), '[^a-z0-9]+', '-', 'g')), 80), ''), 'profile')
    || '-' || replace(NEW.id::text, '-', '');
  INSERT INTO public.people_profiles (person_group, slug, name, role, location, focus, summary, bio, source_application_id)
  VALUES (v_group, v_slug, v_name, v_role,
    public.people_profile_safe_text(coalesce(nullif(NEW.details->>'location', ''), NEW.details->>'headquarter', '')),
    coalesce(v_focus, '{}'::text[]), left(v_summary, 300), left(v_bio, 3000), NEW.id)
  ON CONFLICT (source_application_id) DO UPDATE SET
    person_group = EXCLUDED.person_group, slug = EXCLUDED.slug, name = EXCLUDED.name, role = EXCLUDED.role,
    location = EXCLUDED.location, focus = EXCLUDED.focus, summary = EXCLUDED.summary, bio = EXCLUDED.bio;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.sync_approved_application_profile() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_approved_application_profile() TO service_role;

CREATE TRIGGER sync_approved_application_profile AFTER INSERT OR UPDATE ON public.registration_applications
  FOR EACH ROW EXECUTE FUNCTION public.sync_approved_application_profile();

CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id text NOT NULL UNIQUE,
  code_hash text NOT NULL,
  full_name text NOT NULL,
  photo_url text,
  designation text NOT NULL,
  department text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  valid_until date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.employees FROM anon, authenticated;
GRANT ALL ON public.employees TO service_role;
-- No table-level SELECT: even admin browser queries cannot read code_hash.
GRANT SELECT (id, employee_id, full_name, photo_url, designation, department, status, valid_until, created_at, updated_at)
  ON public.employees TO authenticated;
GRANT DELETE ON public.employees TO authenticated;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY employees_admin_read ON public.employees FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY employees_admin_delete ON public.employees FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
ALTER TABLE public.employees ADD CONSTRAINT employees_status_check CHECK (status IN ('active', 'inactive'));

CREATE TABLE public.employee_verification_attempts (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  employee_id text NOT NULL,
  success boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.employee_verification_attempts FROM anon, authenticated;
GRANT ALL ON public.employee_verification_attempts TO service_role;
ALTER TABLE public.employee_verification_attempts ENABLE ROW LEVEL SECURITY;
CREATE INDEX employee_verification_attempts_lookup ON public.employee_verification_attempts (employee_id, created_at DESC) WHERE NOT success;

CREATE FUNCTION public.admin_save_employee(_code text, _department text, _designation text, _employee_id text,
  _full_name text, _photo_url text, _status text, _valid_until date)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_id text := upper(btrim(_employee_id)); v_code text := btrim(coalesce(_code, '')); v_hash text;
BEGIN
  IF NOT coalesce(public.has_role(auth.uid(), 'admin'), false) THEN
    RAISE EXCEPTION 'Admin access required' USING ERRCODE = '42501';
  END IF;
  IF v_id IS NULL OR length(v_id) NOT BETWEEN 2 AND 40 OR nullif(btrim(_full_name), '') IS NULL
     OR nullif(btrim(_designation), '') IS NULL OR nullif(btrim(_department), '') IS NULL
     OR _status IS NULL OR _status NOT IN ('active', 'inactive') OR length(v_code) > 64 THEN
    RAISE EXCEPTION 'Invalid employee details' USING ERRCODE = '22023';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('employee:' || v_id, 0));
  SELECT e.code_hash INTO v_hash FROM public.employees AS e WHERE e.employee_id = v_id;
  IF v_code <> '' THEN
    IF length(v_code) < 6 THEN RAISE EXCEPTION 'Employee Code must be at least 6 characters' USING ERRCODE = '22023'; END IF;
    -- SHA-256 first so bcrypt's 72-byte limit cannot truncate input.
    v_hash := extensions.crypt(encode(extensions.digest(v_code, 'sha256'), 'hex'), extensions.gen_salt('bf', 12));
  ELSIF v_hash IS NULL THEN
    RAISE EXCEPTION 'Employee Code required for new employee' USING ERRCODE = '22023';
  END IF;
  INSERT INTO public.employees (employee_id, code_hash, full_name, photo_url, designation, department, status, valid_until)
  VALUES (v_id, v_hash, btrim(_full_name), nullif(btrim(_photo_url), ''), btrim(_designation), btrim(_department), _status, _valid_until)
  ON CONFLICT (employee_id) DO UPDATE SET code_hash = EXCLUDED.code_hash, full_name = EXCLUDED.full_name,
    photo_url = EXCLUDED.photo_url, designation = EXCLUDED.designation, department = EXCLUDED.department,
    status = EXCLUDED.status, valid_until = EXCLUDED.valid_until, updated_at = now();
END;
$$;
REVOKE EXECUTE ON FUNCTION public.admin_save_employee(text, text, text, text, text, text, text, date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_save_employee(text, text, text, text, text, text, text, date) TO authenticated, service_role;

CREATE FUNCTION public.verify_employee(_code text, _employee_id text)
RETURNS TABLE (department text, designation text, employee_id text, full_name text, photo_url text, status text, valid_until date)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_id text := upper(btrim(_employee_id)); v_code text := btrim(coalesce(_code, ''));
  v_employee public.employees%ROWTYPE; v_success boolean := false;
BEGIN
  IF v_id IS NULL OR length(v_id) NOT BETWEEN 2 AND 40 OR length(v_code) NOT BETWEEN 4 AND 64 THEN RETURN; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('employee:' || v_id, 0));
  IF (SELECT count(*) FROM public.employee_verification_attempts AS a
      WHERE a.employee_id = v_id AND NOT a.success AND a.created_at > now() - interval '15 minutes') >= 5 THEN
    RAISE EXCEPTION 'too_many_attempts' USING ERRCODE = 'P0001';
  END IF;
  SELECT e.* INTO v_employee FROM public.employees AS e WHERE e.employee_id = v_id;
  IF FOUND THEN
    v_success := v_employee.code_hash = extensions.crypt(encode(extensions.digest(v_code, 'sha256'), 'hex'), v_employee.code_hash);
  END IF;
  INSERT INTO public.employee_verification_attempts (employee_id, success) VALUES (v_id, coalesce(v_success, false));
  IF coalesce(v_success, false) THEN
    RETURN QUERY SELECT v_employee.department, v_employee.designation, v_employee.employee_id,
      v_employee.full_name, v_employee.photo_url, v_employee.status, v_employee.valid_until;
  END IF;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.verify_employee(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_employee(text, text) TO anon, authenticated, service_role;

CREATE TABLE public.foundation_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'new',
  admin_notes text NOT NULL DEFAULT '',
  coordinator_code text,
  coordinator_id uuid REFERENCES public.coordinators(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.foundation_submissions FROM anon, authenticated;
GRANT ALL ON public.foundation_submissions TO service_role;
GRANT SELECT ON public.foundation_submissions TO authenticated;
GRANT UPDATE (status) ON public.foundation_submissions TO authenticated;
ALTER TABLE public.foundation_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY foundation_submissions_admin_read ON public.foundation_submissions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY foundation_submissions_admin_review ON public.foundation_submissions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND status IN ('reviewed', 'approved', 'rejected'));
ALTER TABLE public.foundation_submissions
  ADD CONSTRAINT foundation_submissions_kind_check CHECK (kind IN ('scholarship', 'school_fee', 'volunteer', 'partner', 'donation_pledge', 'assistance', 'contact')),
  ADD CONSTRAINT foundation_submissions_status_check CHECK (status IN ('new', 'reviewed', 'approved', 'rejected'));

CREATE TABLE public.young_innovators_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_code text NOT NULL UNIQUE,
  student_name text NOT NULL,
  school_class integer NOT NULL,
  city text NOT NULL,
  guardian_name text NOT NULL,
  guardian_email text NOT NULL,
  guardian_phone text NOT NULL,
  idea_title text NOT NULL,
  idea text NOT NULL,
  guardian_consent boolean NOT NULL,
  consent_at timestamptz NOT NULL DEFAULT now(),
  fee_amount integer NOT NULL,
  gst_percent integer NOT NULL DEFAULT 18,
  status text NOT NULL DEFAULT 'new',
  submission_status text NOT NULL DEFAULT 'submitted',
  submitted_at timestamptz,
  coordinator_code text,
  coordinator_id uuid REFERENCES public.coordinators(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.young_innovators_registrations FROM anon, authenticated;
GRANT ALL ON public.young_innovators_registrations TO service_role;
GRANT SELECT, INSERT ON public.young_innovators_registrations TO authenticated;
GRANT UPDATE (status) ON public.young_innovators_registrations TO authenticated;
ALTER TABLE public.young_innovators_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY young_innovators_admin_read ON public.young_innovators_registrations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY young_innovators_admin_insert ON public.young_innovators_registrations FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
-- Student review sets only approved/rejected (column-scoped grant above).
CREATE POLICY young_innovators_admin_review ON public.young_innovators_registrations FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND status IN ('approved', 'rejected'));
ALTER TABLE public.young_innovators_registrations ADD CONSTRAINT young_innovators_status_check
  CHECK (status IN ('new', 'approved', 'rejected'));

CREATE TABLE public.programme_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_code text NOT NULL UNIQUE,
  programme text NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  amount_paise integer NOT NULL,
  status text NOT NULL DEFAULT 'new',
  admin_notes text NOT NULL DEFAULT '',
  submission_status text NOT NULL DEFAULT 'submitted',
  submitted_at timestamptz,
  coordinator_code text,
  coordinator_id uuid REFERENCES public.coordinators(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.programme_applications FROM anon, authenticated;
GRANT ALL ON public.programme_applications TO service_role;
GRANT SELECT ON public.programme_applications TO authenticated;
ALTER TABLE public.programme_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY programme_applications_admin_read ON public.programme_applications FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.programme_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid,
  application_kind text,
  amount_paise integer NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  payer_email text NOT NULL,
  payer_name text NOT NULL,
  payer_phone text NOT NULL DEFAULT '',
  programme text NOT NULL DEFAULT '',
  provider text NOT NULL DEFAULT 'razorpay',
  provider_payment_id text,
  provider_reference text,
  razorpay_order_id text,
  razorpay_payment_id text,
  status text NOT NULL DEFAULT 'created',
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.programme_payments FROM anon, authenticated;
GRANT ALL ON public.programme_payments TO service_role;
GRANT SELECT ON public.programme_payments TO authenticated;
ALTER TABLE public.programme_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY programme_payments_admin_read ON public.programme_payments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE FUNCTION public.coordinator_name_for_code(_code text)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT c.full_name FROM public.coordinators AS c
  WHERE c.active AND c.referral_code = upper(btrim(_code)) LIMIT 1;
$$;
REVOKE EXECUTE ON FUNCTION public.coordinator_name_for_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.coordinator_name_for_code(text) TO anon, authenticated, service_role;

CREATE FUNCTION public.coordinator_referral_stats()
RETURNS TABLE (coordinator_id uuid, leads bigint, submitted bigint)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT coalesce(public.has_role(auth.uid(), 'admin'), false) AND coalesce(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'Admin access required' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY
  WITH referrals AS (
    SELECT s.coordinator_id AS cid, true AS is_submitted FROM public.contact_submissions AS s
    UNION ALL SELECT s.coordinator_id, true FROM public.registration_applications AS s
    UNION ALL SELECT s.coordinator_id, true FROM public.foundation_submissions AS s
    UNION ALL SELECT s.coordinator_id, s.submission_status = 'submitted' FROM public.young_innovators_registrations AS s
    UNION ALL SELECT s.coordinator_id, s.submission_status = 'submitted' FROM public.programme_applications AS s
  )
  SELECT c.id, count(r.cid), count(r.cid) FILTER (WHERE r.is_submitted)
  FROM public.coordinators AS c LEFT JOIN referrals AS r ON r.cid = c.id GROUP BY c.id;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.coordinator_referral_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.coordinator_referral_stats() TO authenticated, service_role;

CREATE INDEX contact_submissions_created_at_idx ON public.contact_submissions (created_at DESC);
CREATE INDEX registration_applications_created_at_idx ON public.registration_applications (created_at DESC);
CREATE INDEX foundation_submissions_created_at_idx ON public.foundation_submissions (created_at DESC);
CREATE INDEX young_innovators_created_at_idx ON public.young_innovators_registrations (created_at DESC);
CREATE INDEX people_profiles_listing_idx ON public.people_profiles (person_group, sort_order, name);
CREATE INDEX programme_payments_application_idx ON public.programme_payments (application_kind, application_id);