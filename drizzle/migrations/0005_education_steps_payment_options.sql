-- Scholarship registrations are created after step 1 and completed after the final step.
ALTER TABLE public.education_support_registrations
  ADD COLUMN form_status text NOT NULL DEFAULT 'completed',
  ADD COLUMN completed_at timestamptz,
  ADD COLUMN employee_verified_at timestamptz,
  ADD COLUMN employee_verified_by uuid,
  ADD COLUMN employee_verification_note text NOT NULL DEFAULT '';
ALTER TABLE public.education_support_registrations
  ADD CONSTRAINT education_form_status_check CHECK (form_status IN ('started', 'completed'));

-- Admin-editable payment link and Razorpay payment button for each programme fee.
CREATE TABLE public.payment_options (
  key text PRIMARY KEY,
  programme text NOT NULL,
  label text NOT NULL,
  payment_link text,
  razorpay_button_id text,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payment_options_link_https CHECK (payment_link IS NULL OR payment_link ~ '^https://[^\s<>"]+$'),
  CONSTRAINT payment_options_button_id CHECK (razorpay_button_id IS NULL OR razorpay_button_id ~ '^pl_[A-Za-z0-9]{6,40}$')
);
GRANT SELECT ON public.payment_options TO anon, authenticated;
GRANT UPDATE ON public.payment_options TO authenticated;
GRANT ALL ON public.payment_options TO service_role;
ALTER TABLE public.payment_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read payment options" ON public.payment_options FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins update payment options" ON public.payment_options FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.payment_options (key, programme, label, payment_link, sort_order) VALUES
  ('education_sponsorship', 'Scholarship & Sponsorship', 'For Sponsorship', 'https://rzp.io/rzp/Qxq0Jnp', 10),
  ('education_scholarship_25k', 'Scholarship & Sponsorship', 'Scholarship up to Rs 25,000', 'https://rzp.io/rzp/IO7EI7Q', 20),
  ('education_scholarship_50k', 'Scholarship & Sponsorship', 'Scholarship up to Rs 50,000', 'https://rzp.io/rzp/6NAOBYdt', 30),
  ('young_innovators_6_8', 'Young Innovators', 'Class 6–8', NULL, 40),
  ('young_innovators_9_10', 'Young Innovators', 'Class 9–10', NULL, 50),
  ('young_innovators_11_12', 'Young Innovators', 'Class 11–12', NULL, 60),
  ('funding_programme_registration', 'Funding Programme', 'Registration', NULL, 70),
  ('funding_programme_summit', 'Funding Programme', 'Summit package (optional, per participant)', NULL, 80),
  ('prototype_funding_registration', 'Prototype Funding', 'Registration', NULL, 90);