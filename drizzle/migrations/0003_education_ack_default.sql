-- The acknowledgement number is always assigned by the assign_education_ack trigger.
ALTER TABLE public.education_support_registrations ALTER COLUMN ack_number SET DEFAULT '';