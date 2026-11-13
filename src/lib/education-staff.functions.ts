import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const listEducationStaff = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: admin } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
  if (!admin) throw new Error('Admin access required.');
  const { data, error } = await context.supabase.from('education_staff_access').select('*').order('created_at');
  if (error) throw new Error('Staff could not be loaded.');
  return data ?? [];
});

export const saveEducationStaff = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ email: z.string().trim().email(), designation: z.enum(['BDE','BDM']), referralCode: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{3,40}$/), managerId: z.string().uuid().optional(), active: z.boolean() }).parse(v))
  .handler(async ({ context, data }) => {
    const { data: admin } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
    if (!admin) throw new Error('Admin access required.');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    let userId: string | undefined;
    for (let page = 1; page <= 100; page++) {
      const { data: users, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 100 });
      if (error) throw new Error('Account lookup failed.');
      const user = users.users.find(u => u.email?.toLowerCase() === data.email.toLowerCase());
      if (user) { if (!user.email_confirmed_at) throw new Error('This user must verify their email before access is granted.'); userId = user.id; break; }
      if (users.users.length < 100) break;
    }
    if (!userId) throw new Error('Ask this person to create and verify their own account first. Passwords are not shared or generated here.');
    if (data.managerId) {
      const { data: manager } = await context.supabase.from('education_staff_access').select('designation, active').eq('user_id', data.managerId).single();
      if (!manager?.active || manager.designation !== 'BDM' || data.managerId === userId) throw new Error('Select an active BDM as manager.');
    }
    const { error } = await context.supabase.from('education_staff_access').upsert({ user_id: userId, designation: data.designation, referral_code: data.referralCode, manager_id: data.designation === 'BDE' ? data.managerId ?? null : null, active: data.active });
    if (error) throw new Error('Staff access could not be saved; check that the referral code is unique.');
    return { ok: true };
  });

export const getEducationStaffLeads = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: staff } = await context.supabase.from('education_staff_access').select('*').eq('user_id', context.userId).eq('active', true).maybeSingle();
  if (!staff) throw new Error('Active BDE or BDM access required.');
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const codes = [staff.referral_code];
  if (staff.designation === 'BDM') {
    const { data: team } = await supabaseAdmin.from('education_staff_access').select('referral_code').eq('manager_id', context.userId).eq('active', true);
    codes.push(...(team ?? []).map(t => t.referral_code));
  }
  const { data: rows, error } = await supabaseAdmin.from('education_support_registrations').select('ack_number, student_name, student_category, coordinator_code, payment_status, approval_status, created_at').in('coordinator_code', codes).order('created_at', { ascending: false }).limit(500);
  if (error) throw new Error('Your referrals could not be loaded.');
  return { designation: staff.designation, code: staff.referral_code, rows: rows ?? [] };
});