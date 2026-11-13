import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getEducationStaffLeads } from '@/lib/education-staff.functions';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/staff')({
  staticData: { sitemap: false },
  head: () => ({ meta: [{ title: 'BDE & BDM referrals | RILOYD' }, { name: 'description', content: 'Private RILOYD staff referral workspace.' }, { property: 'og:title', content: 'BDE & BDM referrals | RILOYD' }, { property: 'og:description', content: 'Private RILOYD staff referral workspace.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex' }] }),
  component: StaffPage,
});
function StaffPage() {
  const getLeads = useServerFn(getEducationStaffLeads);
  const query = useQuery({ queryKey: ['staff-referrals'], queryFn: () => getLeads(), retry: false });
  return <main className="mx-auto min-h-[70vh] max-w-5xl px-4 py-24"><h1 className="text-3xl font-bold">Staff referrals</h1>
    <Button asChild variant="outline" className="mt-4"><Link to="/crm">Open sales & support CRM</Link></Button>
    {query.isPending && <p className="mt-6">Checking access…</p>}
    {query.error && <div className="mt-6"><p>Sign in with your verified staff account, then return here. Your administrator must assign active BDE or BDM access.</p><Button asChild className="mt-4"><Link to="/admin">Sign in</Link></Button></div>}
    {query.data && <><p className="mt-4">{query.data.designation} · {query.data.code}</p><div className="mt-6 overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead><tr>{['Acknowledgement','Student','Referral','Payment','Approval'].map(h => <th key={h} className="p-3">{h}</th>)}</tr></thead><tbody>{query.data.rows.map(r => <tr key={r.ack_number} className="border-t border-border"><td className="p-3">{r.ack_number}</td><td className="p-3">{r.student_name}</td><td className="p-3">{r.coordinator_code}</td><td className="p-3">{r.payment_status}</td><td className="p-3">{r.approval_status}</td></tr>)}</tbody></table></div>{!query.data.rows.length && <p className="mt-4">No referrals yet.</p>}</>}
  </main>;
}