-- Payment options: the public only sees fee options that actually have a payment page configured; admins see all.
DROP POLICY IF EXISTS "Anyone can read payment options" ON public.payment_options;
CREATE POLICY "Public reads configured payment options" ON public.payment_options
  FOR SELECT TO anon, authenticated
  USING (payment_link IS NOT NULL OR razorpay_button_id IS NOT NULL);
CREATE POLICY "Admins read all payment options" ON public.payment_options
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Country fees: the public only sees announced fees; unannounced rows stay admin-only (admin_write covers admin reads).
DROP POLICY IF EXISTS country_programme_fees_public_read ON public.country_programme_fees;
CREATE POLICY country_programme_fees_public_read ON public.country_programme_fees
  FOR SELECT TO anon, authenticated
  USING (amount IS NOT NULL);

-- People profiles: only verified members (admins, active staff/CRM members, or confirmed accounts of approved applicants).
CREATE OR REPLACE FUNCTION public.can_view_people_profiles()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL AND (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.crm_memberships m WHERE m.user_id = auth.uid() AND m.active)
    OR EXISTS (SELECT 1 FROM public.education_staff_access s WHERE s.user_id = auth.uid() AND s.active)
    OR EXISTS (
      SELECT 1
      FROM auth.users u
      JOIN public.registration_applications r ON lower(r.email) = lower(u.email)
      WHERE u.id = auth.uid() AND u.email_confirmed_at IS NOT NULL AND r.status = 'approved'
    )
  )
$$;
REVOKE EXECUTE ON FUNCTION public.can_view_people_profiles() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_view_people_profiles() TO authenticated, service_role;

DROP POLICY IF EXISTS people_profiles_member_read ON public.people_profiles;
CREATE POLICY people_profiles_member_read ON public.people_profiles
  FOR SELECT TO authenticated
  USING (public.can_view_people_profiles());
