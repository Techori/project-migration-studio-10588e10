import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Copy, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { getEducationStaffLeads, verifyEducationReferral } from '@/lib/education-staff.functions';
import { paymentStatusLabels } from '@/lib/education-support/rules';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/staff')({
  staticData: { sitemap: false },
  head: () => ({ meta: [{ title: 'BDE & BDM referrals | RILOYD' }, { name: 'description', content: 'Private RILOYD staff referral workspace.' }, { property: 'og:title', content: 'BDE & BDM referrals | RILOYD' }, { property: 'og:description', content: 'Private RILOYD staff referral workspace.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex' }] }),
  component: StaffPage,
});

type Lead = Awaited<ReturnType<typeof getEducationStaffLeads>>['rows'][number];

function VerifyRow({ lead }: { lead: Lead }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const verify = useServerFn(verifyEducationReferral);
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => verify({ data: { ackNumber: lead.ack_number, note } }),
    onSuccess: async () => { setOpen(false); await qc.invalidateQueries({ queryKey: ['staff-referrals'] }); toast.success('Marked as verified by employee.'); },
    onError: e => toast.error(e.message),
  });
  if (lead.employee_verified_at) return <span className="text-xs font-semibold text-primary">Verified {new Date(lead.employee_verified_at).toLocaleDateString('en-IN')}</span>;
  if (lead.form_status !== 'completed') return <span className="text-xs text-muted-foreground">Form not finished</span>;
  if (!open) return <Button size="sm" variant="outline" onClick={() => setOpen(true)}><ShieldCheck />Verify</Button>;
  return <form className="flex min-w-56 flex-col gap-2" onSubmit={e => { e.preventDefault(); mutation.mutate(); }}>
    <label className="text-xs font-semibold">What did you check?<input value={note} maxLength={300} onChange={e => setNote(e.target.value)} className="mt-1 h-8 w-full rounded-md border border-input bg-background px-2 text-sm font-normal" placeholder="e.g. Spoke to parent, school confirmed" /></label>
    <div className="flex gap-2"><Button size="sm" type="submit" disabled={mutation.isPending}>Mark verified</Button><Button size="sm" type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button></div>
  </form>;
}

function StaffPage() {
  const getLeads = useServerFn(getEducationStaffLeads);
  const query = useQuery({ queryKey: ['staff-referrals'], queryFn: () => getLeads(), retry: false });
  const link = query.data ? `${typeof window === 'undefined' ? '' : window.location.origin}/education-support?ref=${query.data.code}` : '';
  return <main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-24"><h1 className="text-3xl font-bold">Staff referrals</h1>
    <Button asChild variant="outline" className="mt-4"><Link to="/crm">Open sales & support CRM</Link></Button>
    {query.isPending && <p className="mt-6">Checking access…</p>}
    {query.error && <div className="mt-6"><p>Sign in with your verified staff account, then return here. Your administrator must assign active BDE or BDM access.</p><Button asChild className="mt-4"><Link to="/admin">Sign in</Link></Button></div>}
    {query.data && <>
      <p className="mt-4">{query.data.designation} · {query.data.code}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-border p-3 text-sm"><span className="font-semibold">Your referral link:</span><code className="break-all">{link}</code><Button size="sm" variant="outline" onClick={() => { void navigator.clipboard.writeText(link).then(() => toast.success('Referral link copied.')); }}><Copy />Copy</Button></div>
      <p className="mt-3 text-sm text-muted-foreground">Students who open this link get your details filled in as their coordinator. You can mark completed registrations as verified after checking them; payment confirmation and approval are done by the admin.</p>
      <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead><tr>{['Acknowledgement', 'Student', 'Parents / DOB', 'Class / course', 'Place', 'Referral', 'Payment', 'Approval', 'Verify'].map(h => <th key={h} className="p-3">{h}</th>)}</tr></thead>
        <tbody>{query.data.rows.map(r => <tr key={r.ack_number} className="border-t border-border align-top">
          <td className="p-3 font-mono text-xs">{r.ack_number}</td>
          <td className="p-3">{r.student_name}</td>
          <td className="p-3 text-xs">{r.father_name || '—'} / {r.mother_name || '—'}<br />{r.date_of_birth}</td>
          <td className="p-3 text-xs">{r.current_class ? `Class ${r.current_class}` : r.course_name || '—'}<br />{r.institution_name || ''}</td>
          <td className="p-3 text-xs">{r.district}, {r.state}</td>
          <td className="p-3 text-xs">{r.coordinator_code}</td>
          <td className="p-3 text-xs">{paymentStatusLabels[r.payment_status as keyof typeof paymentStatusLabels] ?? r.payment_status}</td>
          <td className="p-3 text-xs">{r.approval_status}</td>
          <td className="p-3"><VerifyRow lead={r} /></td>
        </tr>)}</tbody></table></div>
      {!query.data.rows.length && <p className="mt-4">No referrals yet.</p>}
    </>}
  </main>;
}
