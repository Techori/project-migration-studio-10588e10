-- Registrations first collected in the Google Sheet backup keep their backup acknowledgement number (B + 15 digits) when imported.
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
  IF NEW.ack_number ~ '^B[0-9]{15}$' THEN RETURN NEW; END IF;
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