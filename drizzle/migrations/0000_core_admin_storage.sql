CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

CREATE POLICY user_roles_read_self_or_admin ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY user_roles_admin_write ON public.user_roles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  avatar_url text NOT NULL DEFAULT '',
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_read_self ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY profiles_insert_self ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY profiles_update_self ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- User-controlled profile metadata never confers authorization.
CREATE FUNCTION public.create_account_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.create_account_profile() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_account_profile() TO service_role;

CREATE TRIGGER create_account_profile AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.create_account_profile();

INSERT INTO public.profiles (id, display_name, avatar_url)
SELECT id, COALESCE(raw_user_meta_data ->> 'display_name', raw_user_meta_data ->> 'full_name', ''),
       COALESCE(raw_user_meta_data ->> 'avatar_url', '')
FROM auth.users ON CONFLICT (id) DO NOTHING;

CREATE FUNCTION public.first_admin_setup_status()
RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE first_user uuid; verified_at timestamptz;
BEGIN
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN RETURN 'closed'; END IF;
  SELECT id, email_confirmed_at INTO first_user, verified_at FROM auth.users
  ORDER BY created_at ASC NULLS LAST, id ASC LIMIT 1;
  IF auth.uid() IS NULL OR first_user IS DISTINCT FROM auth.uid() THEN RETURN 'closed'; END IF;
  IF verified_at IS NULL THEN RETURN 'unverified'; END IF;
  RETURN 'eligible';
END;
$$;
REVOKE EXECUTE ON FUNCTION public.first_admin_setup_status() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.first_admin_setup_status() TO authenticated, service_role;

CREATE FUNCTION public.claim_first_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE first_user uuid; verified_at timestamptz;
BEGIN
  -- Fixed transaction lock serializes competing bootstrap claims.
  PERFORM pg_catalog.pg_advisory_xact_lock(741903, 1);
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501'; END IF;
  LOCK TABLE public.user_roles IN SHARE ROW EXCLUSIVE MODE;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RAISE EXCEPTION 'First-admin setup is closed' USING ERRCODE = '42501';
  END IF;
  SELECT id, email_confirmed_at INTO first_user, verified_at FROM auth.users
  ORDER BY created_at ASC NULLS LAST, id ASC LIMIT 1;
  IF first_user IS DISTINCT FROM auth.uid() OR verified_at IS NULL THEN
    RAISE EXCEPTION 'Only the first registered, email-verified account may claim admin' USING ERRCODE = '42501';
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'admin');
  RETURN true;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.claim_first_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;

CREATE TABLE public.form_submission_limits (
  key_hash text NOT NULL PRIMARY KEY,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  attempts integer NOT NULL DEFAULT 0
);
REVOKE ALL ON public.form_submission_limits FROM anon, authenticated;
GRANT ALL ON public.form_submission_limits TO service_role;
ALTER TABLE public.form_submission_limits ENABLE ROW LEVEL SECURITY;

CREATE FUNCTION public.consume_form_submission_limit(_key_hash text)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path = public
AS $$
DECLARE allowed boolean; sampled_at timestamptz := clock_timestamp();
BEGIN
  IF _key_hash IS NULL OR _key_hash !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'Invalid rate-limit key' USING ERRCODE = '22023';
  END IF;
  INSERT INTO public.form_submission_limits AS limits (key_hash, window_started_at, attempts)
  VALUES (_key_hash, sampled_at, 1)
  ON CONFLICT (key_hash) DO UPDATE
  SET window_started_at = CASE WHEN limits.window_started_at <= sampled_at - interval '15 minutes' THEN sampled_at ELSE limits.window_started_at END,
      attempts = CASE WHEN limits.window_started_at <= sampled_at - interval '15 minutes' THEN 1 ELSE LEAST(limits.attempts + 1, 6) END
  RETURNING attempts <= 5 INTO allowed;
  RETURN allowed;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.consume_form_submission_limit(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_form_submission_limit(text) TO service_role;

CREATE TABLE public.prototype_ai_access_state (
  model_id text NOT NULL PRIMARY KEY,
  status_code integer NOT NULL,
  message text NOT NULL DEFAULT '',
  blocked_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.prototype_ai_access_state FROM anon, authenticated;
GRANT ALL ON public.prototype_ai_access_state TO service_role;
ALTER TABLE public.prototype_ai_access_state ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.prototype_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea text NOT NULL,
  prototype text NOT NULL,
  funding_goal text NOT NULL DEFAULT '',
  eligibility_context text NOT NULL DEFAULT '',
  ai_output text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prototype_submissions TO authenticated;
GRANT ALL ON public.prototype_submissions TO service_role;
ALTER TABLE public.prototype_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY prototype_submissions_admin ON public.prototype_submissions FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX prototype_submissions_created_at_idx ON public.prototype_submissions (created_at DESC);

CREATE TABLE public.payment_provider_tokens (
  provider text NOT NULL PRIMARY KEY,
  access_token text NOT NULL,
  expires_at timestamptz NOT NULL,
  refresh_token text
);
REVOKE ALL ON public.payment_provider_tokens FROM anon, authenticated;
GRANT ALL ON public.payment_provider_tokens TO service_role;
ALTER TABLE public.payment_provider_tokens ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.country_logos (
  country text NOT NULL,
  theme text NOT NULL,
  file_path text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT country_logos_pkey PRIMARY KEY (country, theme)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.country_logos TO authenticated;
GRANT ALL ON public.country_logos TO service_role;
ALTER TABLE public.country_logos ENABLE ROW LEVEL SECURITY;
CREATE POLICY country_logos_admin ON public.country_logos FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.country_programme_fees (
  country text NOT NULL PRIMARY KEY,
  currency text NOT NULL,
  amount integer,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.country_programme_fees TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.country_programme_fees TO authenticated;
GRANT ALL ON public.country_programme_fees TO service_role;
ALTER TABLE public.country_programme_fees ENABLE ROW LEVEL SECURITY;
CREATE POLICY country_programme_fees_public_read ON public.country_programme_fees FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY country_programme_fees_admin_write ON public.country_programme_fees FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Unknown overseas fees remain unset rather than inventing prices.
INSERT INTO public.country_programme_fees (country, currency, amount) VALUES
  ('india', 'INR', 999), ('uk', 'GBP', NULL), ('uae', 'AED', NULL), ('canada', 'CAD', NULL),
  ('usa', 'USD', 169), ('singapore', 'SGD', NULL), ('europe', 'EUR', NULL), ('australia', 'AUD', NULL)
ON CONFLICT (country) DO NOTHING;

CREATE TABLE public.customer_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_number text NOT NULL,
  publish_date date NOT NULL,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'document',
  file_path text NOT NULL,
  file_name text NOT NULL,
  file_size integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT customer_reports_report_number_key UNIQUE (report_number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_reports TO authenticated;
GRANT ALL ON public.customer_reports TO service_role;
ALTER TABLE public.customer_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY customer_reports_admin ON public.customer_reports FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX customer_reports_created_at_idx ON public.customer_reports (created_at DESC);

-- Private buckets: admins manage files; visitors get short-lived links from server checks.
CREATE POLICY core_private_storage_admin ON storage.objects FOR ALL TO authenticated
USING (bucket_id IN ('registration-documents','customer-reports','country-logos') AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id IN ('registration-documents','customer-reports','country-logos') AND public.has_role(auth.uid(), 'admin'));

CREATE FUNCTION public.admin_setup_metadata()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = public
AS $$
DECLARE result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin access required' USING ERRCODE = '42501';
  END IF;
  SELECT jsonb_build_object(
    'tables', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'name', c.relname, 'rls', c.relrowsecurity,
        'columns', COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'name', a.attname,
            'type', pg_catalog.format_type(a.atttypid, a.atttypmod),
            'nullable', NOT a.attnotnull) ORDER BY a.attnum)
          FROM pg_catalog.pg_attribute a
          WHERE a.attrelid = c.oid AND a.attnum > 0 AND NOT a.attisdropped
        ), '[]'::jsonb)) ORDER BY c.relname)
      FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p')
    ), '[]'::jsonb),
    'functions', COALESCE((
      SELECT jsonb_agg(names.proname ORDER BY names.proname) FROM (
        SELECT DISTINCT p.proname FROM pg_catalog.pg_proc p
        JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public' AND p.prokind = 'f') names
    ), '[]'::jsonb),
    'triggers', COALESCE((
      SELECT jsonb_agg(names.tgname ORDER BY names.tgname) FROM (
        SELECT DISTINCT t.tgname FROM pg_catalog.pg_trigger t
        JOIN pg_catalog.pg_class c ON c.oid = t.tgrelid
        JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname IN ('public', 'auth') AND NOT t.tgisinternal AND t.tgenabled <> 'D') names
    ), '[]'::jsonb)
  ) INTO result;
  RETURN result;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.admin_setup_metadata() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_setup_metadata() TO authenticated, service_role;

CREATE FUNCTION public.admin_import_records(_table text, _rows jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = public
AS $$
DECLARE
  allowed_columns text[]; record_value jsonb; column_list text; select_list text;
  affected integer; inserted_count integer := 0; total_count integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin access required' USING ERRCODE = '42501';
  END IF;
  -- Table and column allowlists mirror record-import.ts; auth, role, token, limiter and staff-security tables are never importable.
  allowed_columns := CASE _table
    WHEN 'contact_submissions' THEN ARRAY['id','created_at','name','email','phone','service','industry','message','status','admin_notes']
    WHEN 'registration_applications' THEN ARRAY['id','created_at','application_code','category','full_name','email','phone','details','document_path','document_name','status','admin_notes']
    WHEN 'employees' THEN ARRAY['id','created_at','employee_id','code_hash','full_name','photo_url','designation','department','status','valid_until','updated_at']
    WHEN 'people_profiles' THEN ARRAY['id','created_at','person_group','slug','name','role','location','focus','summary','bio','photo_url','sort_order','source_application_id']
    WHEN 'customer_reports' THEN ARRAY['id','created_at','report_number','publish_date','title','category','file_path','file_name','file_size','active']
    WHEN 'country_logos' THEN ARRAY['country','theme','file_path','updated_at']
    WHEN 'country_programme_fees' THEN ARRAY['country','currency','amount','updated_at']
    WHEN 'prototype_submissions' THEN ARRAY['id','created_at','idea','prototype','funding_goal','eligibility_context','ai_output']
    WHEN 'young_innovators_registrations' THEN ARRAY['id','created_at','application_code','student_name','school_class','city','guardian_name','guardian_email','guardian_phone','idea_title','idea','guardian_consent','consent_at','fee_amount','gst_percent','status']
    ELSE NULL
  END;
  IF allowed_columns IS NULL THEN RAISE EXCEPTION 'Unsupported import destination' USING ERRCODE = '22023'; END IF;
  IF _rows IS NULL OR jsonb_typeof(_rows) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Rows must be a JSON array' USING ERRCODE = '22023';
  END IF;
  total_count := jsonb_array_length(_rows);
  IF total_count < 1 OR total_count > 1000 THEN
    RAISE EXCEPTION 'Import requires 1–1000 records' USING ERRCODE = '22023';
  END IF;
  FOR record_value IN SELECT value FROM jsonb_array_elements(_rows) LOOP
    IF jsonb_typeof(record_value) IS DISTINCT FROM 'object' OR record_value = '{}'::jsonb THEN
      RAISE EXCEPTION 'Each record must be a nonempty JSON object' USING ERRCODE = '22023';
    END IF;
    IF EXISTS (SELECT 1 FROM jsonb_object_keys(record_value) AS keys(key) WHERE NOT (key = ANY (allowed_columns))) THEN
      RAISE EXCEPTION 'Unsupported import column' USING ERRCODE = '22023';
    END IF;
    SELECT string_agg(format('%I', key), ', ' ORDER BY key), string_agg(format('r.%I', key), ', ' ORDER BY key)
    INTO column_list, select_list FROM jsonb_object_keys(record_value) AS keys(key);
    EXECUTE format('INSERT INTO public.%I (%s) SELECT %s FROM pg_catalog.jsonb_populate_record(NULL::public.%I, $1) AS r ON CONFLICT DO NOTHING',
      _table, column_list, select_list, _table) USING record_value;
    GET DIAGNOSTICS affected = ROW_COUNT;
    inserted_count := inserted_count + affected;
  END LOOP;
  RETURN jsonb_build_object('inserted', inserted_count, 'skipped', total_count - inserted_count);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.admin_import_records(text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_import_records(text, jsonb) TO authenticated, service_role;