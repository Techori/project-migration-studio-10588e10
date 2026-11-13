import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { ShieldCheck, Mail, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { claimFirstAdmin } from '@/lib/admin-bootstrap.functions';

export function FirstAdminSetup({ onComplete }: { onComplete: () => void }) {
  const claim = useServerFn(claimFirstAdmin);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function complete() {
    setBusy(true); setMessage('');
    try { await claim(); onComplete(); }
    catch (e) { setMessage(e instanceof Error ? e.message : 'Setup could not be completed.'); }
    finally { setBusy(false); }
  }
  async function resend() {
    setBusy(true);
    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user?.email) throw new Error('Sign in first.');
      const { error } = await supabase.auth.resend({ type: 'signup', email: data.user.email, options: { emailRedirectTo: `${window.location.origin}/admin` } });
      if (error) throw error;
      setMessage('Verification email sent. Open its link, then return here.');
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Email could not be sent.'); }
    finally { setBusy(false); }
  }
  return <section className="mt-8 max-w-xl border-y border-border py-6">
    <h2 className="flex items-center gap-2 text-xl font-bold"><ShieldCheck size={22} /> First admin setup</h2>
    <p className="mt-3 text-sm text-muted-foreground">Only the first registered account can complete setup. Confirm your email using its verification link. Setup closes once an admin exists.</p>
    <div className="mt-5 flex flex-wrap gap-3"><Button disabled={busy} onClick={() => void complete()}><ShieldCheck size={16} /> {busy ? 'Please wait…' : 'Verify and enable admin access'}</Button><Button variant="outline" disabled={busy} onClick={() => void resend()}><Mail size={16} /> Resend verification</Button><Button variant="outline" onClick={() => void supabase.auth.signOut()}><LogOut size={16} /> Sign out</Button></div>
    {message && <p role="status" className="mt-4 text-sm">{message}</p>}
  </section>;
}