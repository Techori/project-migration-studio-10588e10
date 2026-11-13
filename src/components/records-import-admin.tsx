import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Upload, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { importLabels, importSchemas, importFields, mapCsvRows, parseCsv, type ImportTable } from '@/lib/record-import';
import { importRecords } from '@/lib/record-import.functions';

export function RecordsImportAdmin() {
  const submit = useServerFn(importRecords);
  const [table,setTable] = useState<ImportTable>('contact_submissions');
  const [csv,setCsv] = useState<ReturnType<typeof parseCsv> | null>(null);
  const [mapping,setMapping] = useState<Record<string,string>>({});
  const [step,setStep] = useState<'map'|'review'|'done'>('map');
  const [message,setMessage] = useState(''); const [busy,setBusy] = useState(false); const [confirmed,setConfirmed] = useState(false);
  const fields = Object.keys(importSchemas[table].shape);
  const reviewed = csv ? mapCsvRows(table,csv.rows,mapping) : [];
  const bad = reviewed.filter(r => r.errors.length);
  function selectTable(value:ImportTable) { setTable(value); setStep('map'); setConfirmed(false); setMessage(''); setMapping(Object.fromEntries(Object.keys(importSchemas[value].shape).map(f => [f,csv?.headers.find(h => h.trim().toLowerCase() === f) ?? '']))); }
  async function read(file?:File) {
    if (!file) return;
    setMessage(''); setStep('map'); setConfirmed(false);
    try { if(file.size>10_000_000) throw new Error('Choose a CSV up to 10MB.'); const parsed=parseCsv(await file.text()); setCsv(parsed); setMapping(Object.fromEntries(fields.map(f=>[f,parsed.headers.find(h=>h.trim().toLowerCase()===f) ?? '']))); }
    catch(e) { setCsv(null); setMessage(e instanceof Error ? e.message:'CSV could not be read.'); }
  }
  async function save() {
    if (!confirmed || bad.length || !reviewed.length) return;
    setBusy(true); setMessage('');
    try { const result=await submit({data:{table,rows:reviewed.map(r=>r.record)}}); setMessage(`${result.inserted} records imported. ${result.skipped} existing records skipped.`); setStep('done'); setCsv(null); }
    catch(e) { setMessage(e instanceof Error ? e.message:'Import failed.'); }
    finally { setBusy(false); }
  }
  return <section className="mt-8 min-w-0"><h2 className="text-2xl font-black uppercase">Import records</h2>
    <ol className="my-5 flex flex-wrap gap-5 text-sm text-muted-foreground"><li>1. Upload & map</li><li>2. Review</li><li>3. Import</li></ol>
    {step==='map' && <><div className="grid gap-4 sm:grid-cols-2"><div className="grid gap-2"><Label htmlFor="import-table">Destination</Label><select id="import-table" className="h-10 border border-input bg-background px-3 text-sm" value={table} onChange={e=>selectTable(e.target.value as ImportTable)}>{Object.entries(importLabels).map(([key,label])=><option key={key} value={key}>{label} · {key}</option>)}</select></div><div className="grid gap-2"><Label htmlFor="import-csv">Exported CSV</Label><Input id="import-csv" type="file" accept=".csv,text/csv" onChange={e=>void read(e.target.files?.[0])}/></div></div>
      {csv && <div className="mt-6"><h3 className="font-bold">Map columns · {csv.rows.length} records</h3><div className="mt-4 grid gap-3 sm:grid-cols-2">{fields.map(field=><div key={field} className="grid gap-1"><Label htmlFor={`map-${field}`}>{field}{!importFields(table)[field]?.isOptional() ? ' *':''}</Label><select id={`map-${field}`} className="h-10 border border-input bg-background px-3 text-sm" value={mapping[field]??''} onChange={e=>setMapping({...mapping,[field]:e.target.value})}><option value="">Not mapped · use default</option>{csv.headers.map(h=><option key={h} value={h}>{h}</option>)}</select></div>)}</div><Button className="mt-5" onClick={()=>setStep('review')}><Check size={16}/> Review records</Button></div>}</>}
    {step==='review' && <><h3 className="font-bold">{reviewed.length} records · {bad.length} with errors</h3><p className="mt-2 text-sm text-muted-foreground">Existing unique records will be skipped, not overwritten. Missing files must be restored separately. Accounts and access roles are never imported.</p><div className="mt-5 max-h-[420px] overflow-auto border border-border"><table className="w-full text-left text-xs"><thead className="bg-surface"><tr><th className="p-3">CSV row</th><th className="p-3">Validation</th>{Object.entries(mapping).filter(([,v])=>v).map(([f])=><th className="p-3" key={f}>{f}</th>)}</tr></thead><tbody>{reviewed.map(r=><tr className="border-t border-border" key={r.row}><td className="p-3">{r.row}</td><td className="min-w-40 p-3">{r.errors.join('; ')||'Ready'}</td>{Object.entries(mapping).filter(([,v])=>v).map(([f])=><td className="max-w-64 break-words p-3" key={f}>{f==='code_hash'?'Protected hash':JSON.stringify(r.record[f])}</td>)}</tr>)}</tbody></table></div><label className="my-5 flex items-start gap-2 text-sm"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)} disabled={!!bad.length}/> I reviewed these records and authorize importing them into {importLabels[table]}.</label><div className="flex gap-3"><Button variant="outline" disabled={busy} onClick={()=>{setStep('map');setConfirmed(false);}}><ArrowLeft size={16}/> Back to mapping</Button><Button disabled={busy||!confirmed||!!bad.length} onClick={()=>void save()}><Upload size={16}/> {busy?'Importing…':'Import records'}</Button></div></>}
    {message&&<p role="status" className="mt-4 text-sm">{message}</p>}{step==='done'&&<Button className="mt-4" variant="outline" onClick={()=>{setStep('map');setConfirmed(false);}}>Import another CSV</Button>}
  </section>;
}