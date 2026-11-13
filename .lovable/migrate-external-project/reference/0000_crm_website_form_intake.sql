-- Website leads can wait unassigned for an admin when no valid employee code was entered.
ALTER TABLE public.crm_leads ALTER COLUMN owner_id DROP NOT NULL;
ALTER TABLE public.crm_customers ALTER COLUMN owner_id DROP NOT NULL;
ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS referral_code text;

ALTER TABLE public.crm_activities DROP CONSTRAINT IF EXISTS crm_activities_kind_check;
ALTER TABLE public.crm_activities ADD CONSTRAINT crm_activities_kind_check CHECK (kind = ANY (ARRAY['note','call','email','meeting','stage_change','ticket_change','assignment']));

-- Writes made inside trusted database functions (definer context) skip the per-user guard; user requests stay checked.
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
    code:=CASE WHEN COALESCE((r->>'without_coordinator')::boolean,false) THEN NULL ELSE r->>'coordinator_code' END;
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
    VALUES(cid,left(ttl,200),GREATEST(COALESCE(amt,0),0),src,(r->>'id')::uuid,own,code);
  RETURN NEW;
EXCEPTION WHEN others THEN
  -- Never lose the visitor's submission because of a CRM problem; it stays in the admin inbox.
  RAISE WARNING 'CRM intake skipped for %: %', TG_TABLE_NAME, SQLERRM;
  RETURN NEW;
END $function$;
REVOKE ALL ON FUNCTION public.crm_intake_submission() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER crm_intake AFTER INSERT ON public.contact_submissions FOR EACH ROW EXECUTE FUNCTION public.crm_intake_submission();
CREATE TRIGGER crm_intake AFTER INSERT ON public.education_support_registrations FOR EACH ROW EXECUTE FUNCTION public.crm_intake_submission();
CREATE TRIGGER crm_intake AFTER INSERT ON public.foundation_submissions FOR EACH ROW EXECUTE FUNCTION public.crm_intake_submission();
CREATE TRIGGER crm_intake AFTER INSERT ON public.registration_applications FOR EACH ROW EXECUTE FUNCTION public.crm_intake_submission();
CREATE TRIGGER crm_intake AFTER INSERT ON public.young_innovators_registrations FOR EACH ROW EXECUTE FUNCTION public.crm_intake_submission();
CREATE TRIGGER crm_intake AFTER INSERT ON public.programme_applications FOR EACH ROW EXECUTE FUNCTION public.crm_intake_submission();

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
GRANT EXECUTE ON FUNCTION public.crm_assign_lead(uuid, uuid) TO authenticated;