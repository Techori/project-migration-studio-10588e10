import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { setResponseHeader } from '@tanstack/react-start/server';

export const getAdminAccess = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  setResponseHeader('Cache-Control', 'no-store');
  const { data: admin, error } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
  if (error) throw new Error('Access could not be checked. Please try again.');
  if (admin) return { admin: true, setup: 'closed' };
  const { data: setup, error: setupError } = await context.supabase.rpc('first_admin_setup_status');
  if (setupError) throw new Error('Setup eligibility could not be checked.');
  return { admin: false, setup };
});

export const claimFirstAdmin = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: user, error: userError } = await context.supabase.auth.getUser();
  if (userError || !user.user?.email_confirmed_at) throw new Error('Verify your email before completing setup.');
  const { error } = await context.supabase.rpc('claim_first_admin');
  if (error) throw new Error('Setup is unavailable: only the first registered, verified account may claim admin access, and only before an admin exists.');
  return { ok: true };
});