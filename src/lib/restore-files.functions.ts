import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';
import { validateReportFile } from './report-schemas';
import { validateDocument } from './submission-schemas';
import { validateLogoFile, matchesLogoSignature } from './country-logo-schemas';

export const listRestoreTargets = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async ({context})=>{
  const {data:admin,error} = await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});
  if (!admin||error) throw new Error('Admin access required.');
  const [reports,documents,logos] = await Promise.all([
    context.supabase.from('customer_reports').select('id,title,report_number,file_path,file_name').order('title'),
    context.supabase.from('registration_applications').select('id,application_code,full_name,category,document_path,document_name').order('created_at',{ascending:false}),
    context.supabase.from('country_logos').select('country,theme,file_path').order('country'),
  ]);
  if (reports.error||documents.error||logos.error) throw new Error('File records could not be loaded.');
  return {reports:reports.data??[],documents:documents.data??[],logos:logos.data??[]};
});
export const restoreFile = createServerFn({method:'POST'}).middleware([requireSupabaseAuth])
  .inputValidator((v:unknown)=>{if(!(v instanceof FormData)) throw new Error('Invalid file upload.');return v;})
  .handler(async({data,context})=>{
    const {data:admin,error:roleError}=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});
    if(!admin||roleError) throw new Error('Admin access required.');
    const kind=z.enum(['reports','documents','logos']).parse(data.get('kind'));
    const key=z.string().min(1).max(100).parse(data.get('key'));
    const file=data.get('file'); if(!(file instanceof File)||file.size<1) throw new Error('Choose a file.');
    let path:string|null=null; let bucket='';
    if(kind==='reports') {const {data:row,error}=await context.supabase.from('customer_reports').select('file_path').eq('id',z.string().uuid().parse(key)).single();if(error||!row)throw new Error('Report not found.');path=row.file_path;bucket='customer-reports';validateReportFile(file);}
    if(kind==='documents') {const {data:row,error}=await context.supabase.from('registration_applications').select('document_path,category').eq('id',z.string().uuid().parse(key)).single();if(error||!row)throw new Error('Application not found.');path=row.document_path||`${row.category}/${key}/${crypto.randomUUID()}.${file.name.split('.').pop()}`;bucket='registration-documents';validateDocument(file,z.enum(['startup','mentor','investor','business']).parse(row.category));}
    if(kind==='logos') {const [country,theme]=key.split(':');const {data:row,error}=await context.supabase.from('country_logos').select('file_path').eq('country',country??'').eq('theme',theme??'').single();if(error||!row)throw new Error('Logo record not found.');path=row.file_path;bucket='country-logos';validateLogoFile(file);}
    if(!path||path.startsWith('/')||path.split('/').includes('..')||path.includes('\\')) throw new Error('Invalid file folder.');
    const bytes=new Uint8Array(await file.arrayBuffer());
    if(kind==='logos') {if(!matchesLogoSignature(bytes,validateLogoFile(file)))throw new Error('Image content does not match its type.');}
    else {const ext=file.name.split('.').pop()?.toLowerCase();if(ext==='pdf' ? new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-' : ['docx','pptx','xlsx'].includes(ext??'') ? bytes[0]!==80||bytes[1]!==75 : bytes[0]!==208||bytes[1]!==207)throw new Error('Document content does not match its type.');}
    // The exact owning record and administrator are verified before privileged file restoration.
    const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
    const {data:existing,error:checkError}=await supabaseAdmin.storage.from(bucket).exists(path);
    if(checkError)throw new Error('Could not check the destination file.');
    if(existing&&!z.literal('yes').safeParse(data.get('replace')).success)throw new Error('A file already exists. Confirm replacement first.');
    const {error}=await supabaseAdmin.storage.from(bucket).upload(path,bytes,{contentType:file.type,upsert:existing});
    if(error)throw new Error('File upload failed.');
    if(kind==='reports') {const {error:e}=await context.supabase.from('customer_reports').update({file_name:file.name,file_size:file.size}).eq('id',key);if(e)throw new Error('File restored, but report details could not be updated.');}
    if(kind==='documents') {const {error:e}=await context.supabase.from('registration_applications').update({document_name:file.name,document_path:path}).eq('id',key);if(e)throw new Error('File restored, but document details could not be updated.');}
    return {path,bucket};
  });