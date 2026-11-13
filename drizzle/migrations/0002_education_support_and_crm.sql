-- Admin CSV import runs as the signed-in admin, so admins need a narrow insert path for employee records.
GRANT INSERT ON public.employees TO authenticated;
CREATE POLICY employees_admin_insert ON public.employees FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.education_district_codes (
  state_code text NOT NULL CHECK (state_code ~ '^(0[1-9]|[12][0-9]|3[0-6])$'),
  district_key text NOT NULL,
  district_name text NOT NULL,
  code integer NOT NULL CHECK (code BETWEEN 1 AND 99),
  PRIMARY KEY (state_code, district_key),
  UNIQUE (state_code, code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.education_district_codes TO authenticated;
GRANT ALL ON public.education_district_codes TO service_role;
ALTER TABLE public.education_district_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY education_district_codes_admin ON public.education_district_codes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.education_staff_access (
  user_id uuid PRIMARY KEY,
  designation text NOT NULL CHECK (designation IN ('BDE', 'BDM')),
  manager_id uuid REFERENCES public.education_staff_access(user_id),
  referral_code text NOT NULL UNIQUE CHECK (referral_code ~ '^[A-Z0-9-]{3,40}$'),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (manager_id IS NULL OR manager_id <> user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.education_staff_access TO authenticated;
GRANT ALL ON public.education_staff_access TO service_role;
ALTER TABLE public.education_staff_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY education_staff_access_admin ON public.education_staff_access FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY education_staff_access_self ON public.education_staff_access FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE TABLE public.education_support_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ack_number text NOT NULL UNIQUE,
  student_category text NOT NULL,
  current_class text,
  course_name text,
  education_sector text,
  institution_name text NOT NULL,
  education jsonb NOT NULL DEFAULT '{}'::jsonb,
  student_name text NOT NULL,
  father_name text NOT NULL,
  mother_name text NOT NULL,
  date_of_birth date NOT NULL,
  gender text NOT NULL,
  nationality text NOT NULL,
  mobile text NOT NULL,
  whatsapp text,
  email text NOT NULL,
  permanent_address text NOT NULL,
  current_address text NOT NULL,
  state text NOT NULL,
  district text NOT NULL,
  city text NOT NULL,
  pin_code text NOT NULL,
  is_minor boolean NOT NULL DEFAULT false,
  guardian_name text,
  guardian_mobile text,
  guardian_email text,
  guardian_relationship text,
  guardian_consent_at timestamptz,
  without_coordinator boolean NOT NULL DEFAULT false,
  coordinator jsonb NOT NULL DEFAULT '{}'::jsonb,
  coordinator_code text,
  coordinator_id uuid REFERENCES public.coordinators(id),
  application_type text NOT NULL,
  registration_fee integer NOT NULL CHECK (registration_fee >= 0),
  payment_status text NOT NULL DEFAULT 'pending',
  payment_reference text,
  payment_reference_at timestamptz,
  receipt_token_hash text NOT NULL,
  status text NOT NULL DEFAULT 'submitted',
  status_reason text NOT NULL DEFAULT '',
  declarations jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  private_details_ciphertext text,
  aadhaar_last_four text,
  approval_status text NOT NULL DEFAULT 'pending',
  approved_by uuid,
  approved_at timestamptz,
  review_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  ai_review text NOT NULL DEFAULT '',
  flags_checked_at timestamptz,
  flags_confirmed_by uuid,
  flags_confirmed_at timestamptz,
  flags_confirm_note text NOT NULL DEFAULT ''
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.education_support_registrations TO authenticated;
GRANT ALL ON public.education_support_registrations TO service_role;
ALTER TABLE public.education_support_registrations ENABLE ROW LEVEL SECURITY;
-- Staff summaries and public receipt/payment requests go through server checks with the service role.
CREATE POLICY education_support_registrations_admin ON public.education_support_registrations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- A payment transaction ID can be used by only one registration, ignoring case and spaces.
CREATE UNIQUE INDEX education_support_payment_reference_unique
  ON public.education_support_registrations (upper(btrim(payment_reference))) WHERE payment_reference IS NOT NULL;
CREATE INDEX education_support_coordinator_code_idx ON public.education_support_registrations (coordinator_code);
CREATE INDEX education_staff_manager_idx ON public.education_staff_access (manager_id);

CREATE SEQUENCE public.crm_customer_code_seq;
CREATE SEQUENCE public.crm_ticket_code_seq;
GRANT ALL ON SEQUENCE public.crm_customer_code_seq, public.crm_ticket_code_seq TO service_role;
GRANT USAGE ON SEQUENCE public.crm_customer_code_seq, public.crm_ticket_code_seq TO authenticated;

CREATE TABLE public.crm_memberships (
  user_id uuid PRIMARY KEY,
  role text NOT NULL CHECK (role IN ('sales', 'support', 'BDE', 'BDM')),
  manager_id uuid REFERENCES public.crm_memberships(user_id),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (manager_id IS NULL OR manager_id <> user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_memberships TO authenticated;
GRANT ALL ON public.crm_memberships TO service_role;
ALTER TABLE public.crm_memberships ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.crm_employee_profiles (
  user_id uuid PRIMARY KEY REFERENCES public.crm_memberships(user_id),
  employee_code text NOT NULL UNIQUE,
  full_name text NOT NULL,
  phone text NOT NULL DEFAULT '',
  designation text NOT NULL DEFAULT '',
  photo_url text,
  joining_date date NOT NULL DEFAULT CURRENT_DATE
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_employee_profiles TO authenticated;
GRANT ALL ON public.crm_employee_profiles TO service_role;
ALTER TABLE public.crm_employee_profiles ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX crm_employee_code_normalized_unique ON public.crm_employee_profiles (upper(btrim(employee_code)));

CREATE TABLE public.crm_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_code text NOT NULL UNIQUE DEFAULT ('CUS-' || lpad(nextval('public.crm_customer_code_seq')::text, 10, '0')),
  full_name text NOT NULL,
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT '',
  acknowledgement text,
  owner_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.crm_customers TO authenticated;
GRANT ALL ON public.crm_customers TO service_role;
ALTER TABLE public.crm_customers ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.crm_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.crm_customers(id),
  title text NOT NULL,
  stage text NOT NULL DEFAULT 'new' CHECK (stage IN ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost')),
  amount numeric NOT NULL DEFAULT 0 CHECK (amount >= 0),
  source text NOT NULL DEFAULT 'manual',
  source_id uuid,
  owner_id uuid,
  next_follow_up date,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  referral_code text
);
GRANT SELECT ON public.crm_leads TO authenticated;
GRANT UPDATE (stage, amount, next_follow_up, notes, title) ON public.crm_leads TO authenticated;
GRANT ALL ON public.crm_leads TO service_role;
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX crm_leads_source_unique ON public.crm_leads (source, source_id) WHERE source_id IS NOT NULL;

CREATE TABLE public.crm_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  owner_id uuid NOT NULL,
  customer_id uuid REFERENCES public.crm_customers(id),
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'done')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'urgent')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.crm_tasks TO authenticated;
GRANT UPDATE (status) ON public.crm_tasks TO authenticated;
GRANT ALL ON public.crm_tasks TO service_role;
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.crm_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_code text NOT NULL UNIQUE DEFAULT ('TKT-' || lpad(nextval('public.crm_ticket_code_seq')::text, 10, '0')),
  customer_id uuid NOT NULL REFERENCES public.crm_customers(id),
  owner_id uuid NOT NULL,
  subject text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'urgent')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.crm_tickets TO authenticated;
GRANT UPDATE (status) ON public.crm_tickets TO authenticated;
GRANT ALL ON public.crm_tickets TO service_role;
ALTER TABLE public.crm_tickets ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.crm_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  actor_id uuid NOT NULL,
  lead_id uuid REFERENCES public.crm_leads(id),
  ticket_id uuid REFERENCES public.crm_tickets(id),
  kind text NOT NULL CHECK (kind = ANY (ARRAY['note','call','email','meeting','stage_change','ticket_change','assignment'])),
  body text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((lead_id IS NOT NULL) <> (ticket_id IS NOT NULL))
);
GRANT SELECT, INSERT ON public.crm_activities TO authenticated;
GRANT ALL ON public.crm_activities TO service_role;
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.crm_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  month date NOT NULL,
  revenue_target numeric NOT NULL DEFAULT 0 CHECK (revenue_target >= 0),
  wins_target integer NOT NULL DEFAULT 0 CHECK (wins_target >= 0),
  calls_target integer NOT NULL DEFAULT 0 CHECK (calls_target >= 0),
  UNIQUE (owner_id, month),
  CHECK (extract(day FROM month) = 1)
);
GRANT SELECT, INSERT, UPDATE ON public.crm_targets TO authenticated;
GRANT ALL ON public.crm_targets TO service_role;
ALTER TABLE public.crm_targets ENABLE ROW LEVEL SECURITY;

CREATE INDEX crm_memberships_manager_idx ON public.crm_memberships (manager_id);
CREATE INDEX crm_customers_owner_idx ON public.crm_customers (owner_id);
CREATE INDEX crm_leads_owner_idx ON public.crm_leads (owner_id);
CREATE INDEX crm_tasks_owner_idx ON public.crm_tasks (owner_id);
CREATE INDEX crm_tickets_owner_idx ON public.crm_tickets (owner_id);
CREATE INDEX crm_activities_owner_idx ON public.crm_activities (owner_id);
CREATE INDEX crm_activities_lead_idx ON public.crm_activities (lead_id);
CREATE INDEX crm_activities_ticket_idx ON public.crm_activities (ticket_id);

CREATE OR REPLACE FUNCTION public.crm_role()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $function$
  SELECT CASE WHEN public.has_role(auth.uid(), 'admin') THEN 'admin'
    ELSE (SELECT m.role FROM public.crm_memberships m WHERE m.user_id = auth.uid() AND m.active) END
$function$;
REVOKE EXECUTE ON FUNCTION public.crm_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.crm_role() TO authenticated, service_role;

-- Admin sees all; everyone sees their own records; a BDM also sees direct active reports.
CREATE OR REPLACE FUNCTION public.crm_can_access(_owner uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $function$
  SELECT public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.crm_memberships me
      WHERE me.user_id = auth.uid() AND me.active
        AND (_owner = me.user_id
          OR (me.role = 'BDM' AND EXISTS (
            SELECT 1 FROM public.crm_memberships team
            WHERE team.user_id = _owner AND team.manager_id = me.user_id AND team.active))))
$function$;
REVOKE EXECUTE ON FUNCTION public.crm_can_access(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.crm_can_access(uuid) TO authenticated, service_role;

CREATE POLICY crm_memberships_read ON public.crm_memberships FOR SELECT TO authenticated
  USING (public.crm_can_access(user_id) OR public.crm_role() = 'support');
CREATE POLICY crm_memberships_admin ON public.crm_memberships FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY crm_profiles_read ON public.crm_employee_profiles FOR SELECT TO authenticated
  USING (public.crm_can_access(user_id) OR public.crm_role() = 'support');
CREATE POLICY crm_profiles_admin ON public.crm_employee_profiles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY crm_customers_read ON public.crm_customers FOR SELECT TO authenticated
  USING (public.crm_can_access(owner_id) OR public.crm_role() = 'support');

CREATE POLICY crm_leads_read ON public.crm_leads FOR SELECT TO authenticated
  USING (public.crm_can_access(owner_id) AND public.crm_role() <> 'support');
CREATE POLICY crm_leads_update ON public.crm_leads FOR UPDATE TO authenticated
  USING (public.crm_can_access(owner_id) AND public.crm_role() <> 'support')
  WITH CHECK (public.crm_can_access(owner_id) AND public.crm_role() <> 'support');

CREATE POLICY crm_tasks_read ON public.crm_tasks FOR SELECT TO authenticated USING (public.crm_can_access(owner_id));
CREATE POLICY crm_tasks_insert ON public.crm_tasks FOR INSERT TO authenticated
  WITH CHECK (public.crm_can_access(owner_id) AND (customer_id IS NULL OR EXISTS (
    SELECT 1 FROM public.crm_customers c WHERE c.id = customer_id
      AND (public.crm_can_access(c.owner_id) OR public.crm_role() = 'support'))));
CREATE POLICY crm_tasks_update ON public.crm_tasks FOR UPDATE TO authenticated
  USING (public.crm_can_access(owner_id)) WITH CHECK (public.crm_can_access(owner_id));

CREATE POLICY crm_tickets_read ON public.crm_tickets FOR SELECT TO authenticated
  USING (public.crm_can_access(owner_id) OR public.crm_role() = 'support');
CREATE POLICY crm_tickets_insert ON public.crm_tickets FOR INSERT TO authenticated
  WITH CHECK (public.crm_can_access(owner_id) OR public.crm_role() = 'support');
CREATE POLICY crm_tickets_update ON public.crm_tickets FOR UPDATE TO authenticated
  USING (public.crm_can_access(owner_id) OR public.crm_role() = 'support')
  WITH CHECK (public.crm_can_access(owner_id) OR public.crm_role() = 'support');

CREATE POLICY crm_activities_read ON public.crm_activities FOR SELECT TO authenticated
  USING ((lead_id IS NOT NULL AND public.crm_role() <> 'support' AND public.crm_can_access(owner_id))
    OR (ticket_id IS NOT NULL AND (public.crm_can_access(owner_id) OR public.crm_role() = 'support')));
CREATE POLICY crm_activities_insert ON public.crm_activities FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid() AND kind IN ('note', 'call', 'email', 'meeting') AND (
    (lead_id IS NOT NULL AND public.crm_role() <> 'support' AND public.crm_can_access(owner_id))
    OR (ticket_id IS NOT NULL AND (public.crm_can_access(owner_id) OR public.crm_role() = 'support'))));

CREATE POLICY crm_targets_read ON public.crm_targets FOR SELECT TO authenticated
  USING (public.crm_can_access(owner_id) AND public.crm_role() <> 'support');
CREATE POLICY crm_targets_insert ON public.crm_targets FOR INSERT TO authenticated
  WITH CHECK (public.crm_role() IN ('admin', 'BDM') AND public.crm_can_access(owner_id));
CREATE POLICY crm_targets_update ON public.crm_targets FOR UPDATE TO authenticated
  USING (public.crm_role() IN ('admin', 'BDM') AND public.crm_can_access(owner_id))
  WITH CHECK (public.crm_role() IN ('admin', 'BDM') AND public.crm_can_access(owner_id));

-- Acknowledgement number: YYMMDD + state code + district code + 5-digit daily serial (India time).
CREATE OR REPLACE FUNCTION public.assign_education_ack_number()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $function$
DECLARE
  states constant text[] := ARRAY['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana',
    'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland',
    'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
    'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir','Ladakh',
    'Lakshadweep','Puducherry'];
  state_position integer; sc text; dk text; dc integer; prefix text; serial integer;
BEGIN
  SELECT ord::integer INTO state_position FROM unnest(states) WITH ORDINALITY AS s(name, ord)
  WHERE lower(name) = lower(btrim(NEW.state));
  IF state_position IS NULL THEN RAISE EXCEPTION 'Invalid education registration state'; END IF;
  sc := lpad(state_position::text, 2, '0');
  dk := lower(regexp_replace(btrim(NEW.district), '\s+', ' ', 'g'));
  IF dk = '' THEN RAISE EXCEPTION 'District is required'; END IF;
  PERFORM pg_advisory_xact_lock(73101, state_position);
  SELECT code INTO dc FROM public.education_district_codes WHERE state_code = sc AND district_key = dk;
  IF dc IS NULL THEN
    SELECT COALESCE(max(code), 0) + 1 INTO dc FROM public.education_district_codes WHERE state_code = sc;
    IF dc > 99 THEN RAISE EXCEPTION 'District code capacity exceeded'; END IF;
    INSERT INTO public.education_district_codes(state_code, district_key, district_name, code) VALUES (sc, dk, btrim(NEW.district), dc);
  END IF;
  prefix := to_char(NEW.created_at AT TIME ZONE 'Asia/Kolkata', 'YYMMDD') || sc || lpad(dc::text, 2, '0');
  SELECT COALESCE(max(right(ack_number, 5)::integer), 0) + 1 INTO serial FROM public.education_support_registrations
  WHERE left(ack_number, 10) = prefix AND ack_number ~ '^[0-9]{15}$';
  IF serial > 99999 THEN RAISE EXCEPTION 'Acknowledgement capacity exceeded'; END IF;
  NEW.ack_number := prefix || lpad(serial::text, 5, '0');
  RETURN NEW;
END
$function$;
REVOKE EXECUTE ON FUNCTION public.assign_education_ack_number() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.assign_education_ack_number() TO service_role;

CREATE OR REPLACE FUNCTION public.guard_education_approval()
 RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
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
REVOKE EXECUTE ON FUNCTION public.guard_education_approval() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.guard_education_approval() TO service_role;

-- Employee code (or an active BDE/BDM referral code) -> active CRM employee.
CREATE OR REPLACE FUNCTION public.crm_owner_for_code(_code text)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $function$
  SELECT owner FROM (
    SELECT p.user_id AS owner, 1 AS pri FROM public.crm_employee_profiles p
      JOIN public.crm_memberships m ON m.user_id=p.user_id AND m.active
      WHERE upper(btrim(p.employee_code))=upper(btrim(_code))
    UNION ALL
    SELECT s.user_id, 2 FROM public.education_staff_access s
      JOIN public.crm_memberships m ON m.user_id=s.user_id AND m.active
      WHERE s.active AND upper(btrim(s.referral_code))=upper(btrim(_code))
  ) x ORDER BY pri LIMIT 1
$function$;
REVOKE ALL ON FUNCTION public.crm_owner_for_code(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.crm_owner_for_code(text) TO service_role;

CREATE OR REPLACE FUNCTION public.crm_create_lead(_input jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $function$
DECLARE own uuid := (_input->>'ownerId')::uuid; cid uuid; lid uuid;
BEGIN
  IF public.crm_role() IS NULL OR public.crm_role() = 'support' OR NOT public.crm_can_access(own) THEN
    RAISE EXCEPTION 'Sales access denied';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.crm_memberships WHERE user_id = own AND active) AND NOT public.has_role(own, 'admin') THEN
    RAISE EXCEPTION 'Employee is not active';
  END IF;
  IF NULLIF(btrim(_input->>'title'), '') IS NULL OR NULLIF(btrim(_input->>'fullName'), '') IS NULL THEN
    RAISE EXCEPTION 'Title and customer name are required';
  END IF;
  INSERT INTO public.crm_customers(full_name, email, phone, company, acknowledgement, owner_id)
  VALUES (btrim(_input->>'fullName'), COALESCE(_input->>'email', ''), COALESCE(_input->>'phone', ''),
    COALESCE(_input->>'company', ''), NULLIF(btrim(_input->>'acknowledgement'), ''), own)
  RETURNING id INTO cid;
  INSERT INTO public.crm_leads(customer_id, title, amount, owner_id, next_follow_up)
  VALUES (cid, btrim(_input->>'title'), COALESCE((_input->>'amount')::numeric, 0), own, NULLIF(_input->>'followUp', '')::date)
  RETURNING id INTO lid;
  RETURN lid;
END
$function$;
REVOKE EXECUTE ON FUNCTION public.crm_create_lead(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.crm_create_lead(jsonb) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.crm_customer_lookup(_reference text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $function$
DECLARE result jsonb;
BEGIN
  IF public.crm_role() IS NULL THEN RAISE EXCEPTION 'Active CRM access required'; END IF;
  IF length(btrim(_reference)) NOT BETWEEN 6 AND 60 THEN RAISE EXCEPTION 'Invalid reference'; END IF;
  SELECT COALESCE(jsonb_agg(to_jsonb(x)), '[]'::jsonb) INTO result FROM (
    SELECT c.id, c.customer_code, c.full_name, c.email, c.phone, c.company, c.acknowledgement
    FROM public.crm_customers c
    WHERE (upper(c.customer_code) = upper(btrim(_reference)) OR upper(c.acknowledgement) = upper(btrim(_reference)))
      AND (public.crm_can_access(c.owner_id) OR public.crm_role() = 'support')
    ORDER BY c.created_at DESC LIMIT 50) x;
  RETURN result;
END
$function$;
REVOKE EXECUTE ON FUNCTION public.crm_customer_lookup(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.crm_customer_lookup(text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.crm_onboard_member(_user_id uuid, _input jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $function$
DECLARE manager uuid := NULLIF(_input->>'managerId', '')::uuid; member_role text := _input->>'role';
  employee_code text := upper(btrim(_input->>'employeeCode'));
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Denied'; END IF;
  IF _user_id IS NULL OR member_role IS NULL OR member_role NOT IN ('sales', 'support', 'BDE', 'BDM')
     OR NULLIF(employee_code, '') IS NULL THEN
    RAISE EXCEPTION 'Invalid member';
  END IF;
  PERFORM pg_advisory_xact_lock(73102, 1);
  IF manager IS NOT NULL THEN
    IF manager = _user_id OR NOT EXISTS (SELECT 1 FROM public.crm_memberships WHERE user_id = manager AND role = 'BDM' AND active) THEN
      RAISE EXCEPTION 'Select an active BDM as manager';
    END IF;
    IF EXISTS (
      WITH RECURSIVE ancestors AS (
        SELECT user_id, manager_id FROM public.crm_memberships WHERE user_id = manager
        UNION SELECT m.user_id, m.manager_id FROM public.crm_memberships m JOIN ancestors a ON m.user_id = a.manager_id)
      SELECT 1 FROM ancestors WHERE user_id = _user_id) THEN
      RAISE EXCEPTION 'Manager cycle is not allowed';
    END IF;
  END IF;
  INSERT INTO public.crm_memberships(user_id, role, manager_id, active)
  VALUES (_user_id, member_role, manager, COALESCE((_input->>'active')::boolean, true))
  ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role, manager_id = EXCLUDED.manager_id, active = EXCLUDED.active;
  INSERT INTO public.crm_employee_profiles(user_id, employee_code, full_name, phone, designation, photo_url, joining_date)
  VALUES (_user_id, employee_code, btrim(_input->>'fullName'), COALESCE(_input->>'phone', ''),
    COALESCE(_input->>'designation', ''), NULLIF(_input->>'photoUrl', ''), (_input->>'joiningDate')::date)
  ON CONFLICT (user_id) DO UPDATE SET employee_code = EXCLUDED.employee_code, full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone, designation = EXCLUDED.designation, photo_url = EXCLUDED.photo_url, joining_date = EXCLUDED.joining_date;
END
$function$;
REVOKE EXECUTE ON FUNCTION public.crm_onboard_member(uuid, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.crm_onboard_member(uuid, jsonb) TO authenticated, service_role;

-- Admin-only backfill of one stored submission into the CRM; copies contact fields only.
CREATE OR REPLACE FUNCTION public.crm_import_submission(_id uuid, _kind text, _owner uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $function$
DECLARE tbl text; src text; r jsonb; n text; e text; p text; ack text; ttl text; amt numeric := 0; cid uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Denied'; END IF;
  CASE _kind
    WHEN 'enquiry', 'contact', 'contact_submissions' THEN tbl := 'contact_submissions'; src := 'enquiry';
    WHEN 'education', 'education_support_registrations' THEN tbl := 'education_support_registrations'; src := 'education';
    WHEN 'foundation', 'foundation_submissions' THEN tbl := 'foundation_submissions'; src := 'foundation';
    WHEN 'registration', 'registration_applications' THEN tbl := 'registration_applications'; src := 'registration';
    WHEN 'young_innovators', 'young_innovators_registrations' THEN tbl := 'young_innovators_registrations'; src := 'young_innovators';
    WHEN 'programme', 'programme_applications' THEN tbl := 'programme_applications'; src := 'programme';
    ELSE RAISE EXCEPTION 'Unsupported submission kind';
  END CASE;
  IF _owner IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.crm_memberships WHERE user_id = _owner AND active)
     AND NOT public.has_role(_owner, 'admin') THEN
    RAISE EXCEPTION 'Employee is not active';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(src || ':' || _id::text, 0));
  IF EXISTS (SELECT 1 FROM public.crm_leads WHERE source = src AND source_id = _id) THEN RETURN; END IF;
  EXECUTE format('SELECT to_jsonb(s) FROM public.%I s WHERE s.id = $1', tbl) INTO r USING _id;
  IF r IS NULL THEN RAISE EXCEPTION 'Submission not found'; END IF;
  IF src = 'enquiry' THEN
    n := r->>'name'; e := r->>'email'; p := r->>'phone';
    ttl := 'Website enquiry' || COALESCE(': ' || NULLIF(r->>'service', ''), '');
  ELSIF src = 'education' THEN
    n := r->>'student_name'; e := r->>'email'; p := r->>'mobile'; ack := r->>'ack_number';
    ttl := 'Education Support: ' || COALESCE(r->>'application_type', 'registration');
    amt := COALESCE((r->>'registration_fee')::numeric, 0);
  ELSIF src = 'young_innovators' THEN
    n := r->>'guardian_name'; e := r->>'guardian_email'; p := r->>'guardian_phone'; ack := r->>'application_code';
    ttl := 'Young Innovators: ' || COALESCE(ack, 'registration');
    amt := COALESCE((r->>'fee_amount')::numeric, 0);
  ELSE
    n := r->>'full_name'; e := r->>'email'; p := r->>'phone'; ack := r->>'application_code';
    ttl := CASE src WHEN 'foundation' THEN 'Foundation: ' || COALESCE(r->>'kind', 'form')
      WHEN 'registration' THEN 'Registration: ' || COALESCE(r->>'category', 'application')
      ELSE 'Programme: ' || COALESCE(r->>'programme', 'application') END;
    IF src = 'programme' THEN amt := COALESCE((r->>'amount_paise')::numeric, 0) / 100; END IF;
  END IF;
  INSERT INTO public.crm_customers(full_name, email, phone, acknowledgement, owner_id)
  VALUES (COALESCE(NULLIF(btrim(n), ''), 'Website visitor'), COALESCE(e, ''), COALESCE(p, ''), NULLIF(ack, ''), _owner)
  RETURNING id INTO cid;
  INSERT INTO public.crm_leads(customer_id, title, amount, source, source_id, owner_id)
  VALUES (cid, left(ttl, 200), GREATEST(amt, 0), src, _id, _owner);
END
$function$;
REVOKE EXECUTE ON FUNCTION public.crm_import_submission(uuid, text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.crm_import_submission(uuid, text, uuid) TO authenticated, service_role;

-- Admins assign any lead; a BDM can move leads only within their own team.
CREATE OR REPLACE FUNCTION public.crm_assign_lead(_lead uuid, _owner uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE old_owner uuid; cust uuid; is_admin boolean := public.has_role(auth.uid(),'admin');
BEGIN
  SELECT owner_id, customer_id INTO old_owner, cust FROM public.crm_leads WHERE id=_lead;
  IF NOT FOUND THEN RAISE EXCEPTION 'Lead not found'; END IF;
  IF NOT (is_admin OR (public.crm_role()='BDM' AND old_owner IS NOT NULL AND _owner IS NOT NULL AND public.crm_can_access(old_owner) AND public.crm_can_access(_owner))) THEN
    RAISE EXCEPTION 'Denied';
  END IF;
  IF _owner IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.crm_memberships WHERE user_id=_owner AND active) AND NOT public.has_role(_owner,'admin') THEN
    RAISE EXCEPTION 'Employee is not active';
  END IF;
  IF old_owner IS NOT DISTINCT FROM _owner THEN RETURN; END IF;
  UPDATE public.crm_leads SET owner_id=_owner WHERE id=_lead;
  UPDATE public.crm_customers SET owner_id=_owner WHERE id=cust;
  IF _owner IS NOT NULL THEN
    UPDATE public.crm_activities SET owner_id=_owner WHERE lead_id=_lead;
    INSERT INTO public.crm_activities(owner_id,actor_id,lead_id,kind,body)
      VALUES(_owner,auth.uid(),_lead,'assignment','Lead assigned to '||COALESCE((SELECT full_name FROM public.crm_employee_profiles WHERE user_id=_owner),'employee'));
  END IF;
END $function$;
REVOKE ALL ON FUNCTION public.crm_assign_lead(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.crm_assign_lead(uuid, uuid) TO authenticated, service_role;

-- Writes made inside trusted database functions skip the per-user guard; user requests stay checked.
CREATE OR REPLACE FUNCTION public.crm_validate_write()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $function$
DECLARE linked_owner uuid;
BEGIN
  IF current_user NOT IN ('authenticated','anon') THEN RETURN NEW; END IF;
  IF TG_TABLE_NAME='crm_activities' THEN
    IF NEW.lead_id IS NOT NULL THEN
      IF public.crm_role()='support' THEN RAISE EXCEPTION 'Sales record access denied'; END IF;
      SELECT owner_id INTO linked_owner FROM public.crm_leads WHERE id=NEW.lead_id;
      IF NOT FOUND THEN RAISE EXCEPTION 'Invalid activity ownership'; END IF;
    ELSIF NEW.ticket_id IS NOT NULL THEN
      SELECT owner_id INTO linked_owner FROM public.crm_tickets WHERE id=NEW.ticket_id;
      IF NOT FOUND THEN RAISE EXCEPTION 'Invalid activity ownership'; END IF;
    ELSE RAISE EXCEPTION 'Activity requires a record'; END IF;
    IF NEW.actor_id IS DISTINCT FROM auth.uid() THEN RAISE EXCEPTION 'Invalid activity ownership'; END IF;
    IF linked_owner IS NULL THEN
      IF NOT public.has_role(auth.uid(),'admin') OR NEW.owner_id IS DISTINCT FROM auth.uid() THEN RAISE EXCEPTION 'Invalid activity ownership'; END IF;
    ELSIF linked_owner<>NEW.owner_id THEN RAISE EXCEPTION 'Invalid activity ownership'; END IF;
  ELSIF TG_TABLE_NAME='crm_leads' THEN
    IF NOT EXISTS(SELECT 1 FROM public.crm_customers WHERE id=NEW.customer_id AND public.crm_can_access(owner_id)) THEN RAISE EXCEPTION 'Customer access denied'; END IF;
  ELSIF TG_TABLE_NAME='crm_tickets' THEN
    IF NOT EXISTS(SELECT 1 FROM public.crm_customers WHERE id=NEW.customer_id AND (public.crm_can_access(owner_id) OR public.crm_role()='support')) THEN RAISE EXCEPTION 'Customer access denied'; END IF;
  END IF;
  RETURN NEW;
END $function$;
REVOKE EXECUTE ON FUNCTION public.crm_validate_write() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.crm_validate_write() TO service_role;

CREATE OR REPLACE FUNCTION public.crm_record_changes()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE log_owner uuid;
BEGIN
  NEW.updated_at=now();
  log_owner := COALESCE(NEW.owner_id, auth.uid());
  IF log_owner IS NULL THEN RETURN NEW; END IF;
  IF TG_TABLE_NAME='crm_leads' AND NEW.stage IS DISTINCT FROM OLD.stage THEN
    INSERT INTO public.crm_activities(owner_id,actor_id,lead_id,kind,body) VALUES(log_owner,auth.uid(),NEW.id,'stage_change',OLD.stage||' → '||NEW.stage);
  ELSIF TG_TABLE_NAME='crm_tickets' AND NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.crm_activities(owner_id,actor_id,ticket_id,kind,body) VALUES(log_owner,auth.uid(),NEW.id,'ticket_change',OLD.status||' → '||NEW.status);
  END IF;
  RETURN NEW;
END $function$;
REVOKE EXECUTE ON FUNCTION public.crm_record_changes() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.crm_record_changes() TO service_role;

-- Every stored website submission becomes a CRM customer + lead. Only contact fields are copied (never bank/KYC).
CREATE OR REPLACE FUNCTION public.crm_intake_submission()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE r jsonb := to_jsonb(NEW); src text; n text; e text; p text; ack text; ttl text; amt numeric := 0; code text; own uuid; cid uuid;
BEGIN
  IF TG_TABLE_NAME='contact_submissions' THEN
    src:='enquiry'; n:=r->>'name'; e:=r->>'email'; p:=r->>'phone'; code:=r->>'coordinator_code';
    ttl:='Website enquiry'||COALESCE(': '||NULLIF(r->>'service',''),'');
  ELSIF TG_TABLE_NAME='education_support_registrations' THEN
    src:='education'; n:=r->>'student_name'; e:=r->>'email'; p:=r->>'mobile'; ack:=r->>'ack_number';
    ttl:='Education Support: '||COALESCE(r->>'application_type','registration'); amt:=COALESCE((r->>'registration_fee')::numeric,0);
    code:=CASE WHEN COALESCE((r->>'without_coordinator')::boolean,false) THEN NULL
               ELSE COALESCE(NULLIF(btrim(r->>'coordinator_code'),''), NULLIF(btrim(r->'coordinator'->>'coordinatorId'),'')) END;
  ELSIF TG_TABLE_NAME='foundation_submissions' THEN
    src:='foundation'; n:=r->>'full_name'; e:=r->>'email'; p:=r->>'phone'; code:=r->>'coordinator_code';
    ttl:='Foundation: '||COALESCE(r->>'kind','form');
  ELSIF TG_TABLE_NAME='registration_applications' THEN
    src:='registration'; n:=r->>'full_name'; e:=r->>'email'; p:=r->>'phone'; ack:=r->>'application_code'; code:=r->>'coordinator_code';
    ttl:='Registration: '||COALESCE(r->>'category','application');
  ELSIF TG_TABLE_NAME='young_innovators_registrations' THEN
    src:='young_innovators'; n:=r->>'guardian_name'; e:=r->>'guardian_email'; p:=r->>'guardian_phone'; ack:=r->>'application_code'; code:=r->>'coordinator_code';
    ttl:='Young Innovators: '||COALESCE(r->>'application_code','registration'); amt:=COALESCE((r->>'fee_amount')::numeric,0);
  ELSIF TG_TABLE_NAME='programme_applications' THEN
    src:='programme'; n:=r->>'full_name'; e:=r->>'email'; p:=r->>'phone'; ack:=r->>'application_code'; code:=r->>'coordinator_code';
    ttl:='Programme: '||COALESCE(r->>'programme','application'); amt:=COALESCE((r->>'amount_paise')::numeric,0)/100;
  ELSE RETURN NEW; END IF;
  IF EXISTS(SELECT 1 FROM public.crm_leads WHERE source=src AND source_id=(r->>'id')::uuid) THEN RETURN NEW; END IF;
  code := NULLIF(upper(btrim(COALESCE(code,''))),'');
  IF code IS NOT NULL THEN own := public.crm_owner_for_code(code); END IF;
  INSERT INTO public.crm_customers(full_name,email,phone,acknowledgement,owner_id)
    VALUES(COALESCE(NULLIF(btrim(n),''),'Website visitor'),COALESCE(e,''),COALESCE(p,''),NULLIF(ack,''),own) RETURNING id INTO cid;
  INSERT INTO public.crm_leads(customer_id,title,amount,source,source_id,owner_id,referral_code)
    VALUES(cid,left(ttl,200),GREATEST(COALESCE(amt,0),0),src,(r->>'id')::uuid,own,left(code,40));
  RETURN NEW;
EXCEPTION WHEN others THEN
  -- Never lose the visitor's submission because of a CRM problem; it stays in the admin inbox.
  RAISE WARNING 'CRM intake skipped for %: %', TG_TABLE_NAME, SQLERRM;
  RETURN NEW;
END $function$;
REVOKE ALL ON FUNCTION public.crm_intake_submission() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.crm_intake_submission() TO service_role;

CREATE TRIGGER assign_education_ack BEFORE INSERT ON public.education_support_registrations
  FOR EACH ROW EXECUTE FUNCTION public.assign_education_ack_number();
CREATE TRIGGER guard_education_approval BEFORE UPDATE ON public.education_support_registrations
  FOR EACH ROW EXECUTE FUNCTION public.guard_education_approval();

CREATE TRIGGER crm_validate_write BEFORE INSERT OR UPDATE ON public.crm_activities FOR EACH ROW EXECUTE FUNCTION public.crm_validate_write();
CREATE TRIGGER crm_validate_write BEFORE INSERT OR UPDATE ON public.crm_leads FOR EACH ROW EXECUTE FUNCTION public.crm_validate_write();
CREATE TRIGGER crm_validate_write BEFORE INSERT OR UPDATE ON public.crm_tickets FOR EACH ROW EXECUTE FUNCTION public.crm_validate_write();
CREATE TRIGGER crm_record_changes BEFORE UPDATE ON public.crm_leads FOR EACH ROW EXECUTE FUNCTION public.crm_record_changes();
CREATE TRIGGER crm_record_changes BEFORE UPDATE ON public.crm_tickets FOR EACH ROW EXECUTE FUNCTION public.crm_record_changes();

CREATE TRIGGER crm_intake AFTER INSERT ON public.contact_submissions FOR EACH ROW EXECUTE FUNCTION public.crm_intake_submission();
CREATE TRIGGER crm_intake AFTER INSERT ON public.education_support_registrations FOR EACH ROW EXECUTE FUNCTION public.crm_intake_submission();
CREATE TRIGGER crm_intake AFTER INSERT ON public.foundation_submissions FOR EACH ROW EXECUTE FUNCTION public.crm_intake_submission();
CREATE TRIGGER crm_intake AFTER INSERT ON public.registration_applications FOR EACH ROW EXECUTE FUNCTION public.crm_intake_submission();
CREATE TRIGGER crm_intake AFTER INSERT ON public.young_innovators_registrations FOR EACH ROW EXECUTE FUNCTION public.crm_intake_submission();
CREATE TRIGGER crm_intake AFTER INSERT ON public.programme_applications FOR EACH ROW EXECUTE FUNCTION public.crm_intake_submission();