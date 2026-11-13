-- Education Support: if the code box is empty, an employee code typed into "Coordinator ID" also routes the lead.
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
  RAISE WARNING 'CRM intake skipped for %: %', TG_TABLE_NAME, SQLERRM;
  RETURN NEW;
END $function$;
REVOKE ALL ON FUNCTION public.crm_intake_submission() FROM PUBLIC, anon, authenticated;