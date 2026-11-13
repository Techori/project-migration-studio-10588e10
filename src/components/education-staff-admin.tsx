import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import { Copy, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { listEducationStaff, saveEducationStaff } from '@/lib/education-staff.functions';

export function EducationStaffAdmin() {
  const list = useServerFn(listEducationStaff); const save = useServerFn(saveEducationStaff); const qc = useQueryClient();
  const query = useQuery({ queryKey: ['education-staff'], queryFn: () => list() });
  const [email, setEmail] = useState(''); const [designation, setDesignation] = useState<'BDE'|'BDM'>('BDE'); const [managerId, setManagerId] = useState(''); const [code, setCode] = useState(''); const [active, setActive] = useState(true);
  const mutation = useMutation({ mutationFn: () => save({ data: { email, designation, referralCode: code, ...(managerId ? { managerId } : {}), active } }), onSuccess: () => { void qc.invalidateQueries({ queryKey: ['education-staff'] }); toast.success('Staff access saved.'); }, onError: e => toast.error(e.message) });
  const cls = 'h-10 w-full rounded-md border border-border bg-background px-3 text-sm';
  return <section className="mt-8">
    <h2 className="text-xl font-bold">BDE & BDM access</h2><p className="mt-2 text-sm text-muted-foreground">BDE sees own referrals. BDM sees own and assigned team referrals. Neither can view bank/Aadhaar details, confirm payments or approve applications.</p>
    <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={e => { e.preventDefault(); mutation.mutate(); }}>
      <label>Verified account email<input required type="email" className={cls} value={email} onChange={e => setEmail(e.target.value)} /></label>
      <label>Designation<select className={cls} value={designation} onChange={e => { setDesignation(e.target.value as 'BDE'|'BDM'); setManagerId(''); }}><option>BDE</option><option>BDM</option></select></label>
      <label>Referral code<div className="flex gap-2"><input required className={cls} value={code} onChange={e => setCode(e.target.value.toUpperCase())} /><Button variant="outline" type="button" size="icon" aria-label="Generate referral code" onClick={() => setCode(`RIL-${crypto.randomUUID().slice(0,8).toUpperCase()}`)}><Plus /></Button></div></label>
      <label>Manager<select className={cls} disabled={designation === 'BDM'} value={managerId} onChange={e => setManagerId(e.target.value)}><option value="">No manager</option>{query.data?.filter(r => r.designation === 'BDM' && r.active).map(r => <option key={r.user_id} value={r.user_id}>{r.referral_code}</option>)}</select></label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />Active access</label>
      <Button disabled={mutation.isPending} type="submit">{mutation.isPending ? 'Saving…' : 'Save staff access'}</Button>
    </form>
    {query.error && <p role="alert">{query.error.message}</p>}
    <div className="mt-6 divide-y divide-border">{query.data?.map(r => <div key={r.user_id} className="flex flex-wrap items-center justify-between gap-3 py-3"><span>{r.designation} · {r.referral_code} · {r.active ? 'Active' : 'Inactive'}</span><Button variant="outline" size="icon" aria-label={`Copy referral link ${r.referral_code}`} onClick={() => { void navigator.clipboard.writeText(`${window.location.origin}/education-support?ref=${r.referral_code}`).then(() => toast.success('Referral link copied.')); }}><Copy /></Button></div>)}</div>
  </section>;
}