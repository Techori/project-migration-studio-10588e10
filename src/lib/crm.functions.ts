import { createServerFn } from '@tanstack/react-start';
import { setResponseHeader } from '@tanstack/react-start/server';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { leadSchema,memberSchema,taskSchema,ticketSchema,targetSchema,stages } from './crm/rules';

export const getCrm = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
  setResponseHeader('Cache-Control','no-store');
  const {data:role,error}=await context.supabase.rpc('crm_role');
  if(error||!role) throw new Error('Your account needs active CRM access. Ask your administrator.');
  const results=await Promise.all([
    context.supabase.from('crm_memberships').select('*'),
    context.supabase.from('crm_employee_profiles').select('*'),
    context.supabase.from('crm_customers').select('*').order('created_at',{ascending:false}).limit(1000),
    context.supabase.from('crm_leads').select('*').order('created_at',{ascending:false}).limit(1000),
    context.supabase.from('crm_tasks').select('*').order('due_date').limit(1000),
    context.supabase.from('crm_tickets').select('*').order('created_at',{ascending:false}).limit(1000),
  ]);
  const [members,profiles,customers,leads,tasks,tickets]=results;
  const [activities,targets]=await Promise.all([context.supabase.from('crm_activities').select('*').order('created_at',{ascending:false}).limit(1000),context.supabase.from('crm_targets').select('*').order('month',{ascending:false}).limit(1000)]);
  if(results.some(r=>r.error)||activities.error||targets.error) throw new Error('CRM records could not be loaded.');
  return {role,userId:context.userId,members:members?.data??[],profiles:profiles?.data??[],customers:customers?.data??[],leads:leads?.data??[],tasks:tasks?.data??[],tickets:tickets?.data??[],activities:activities.data??[],targets:targets.data??[]};
});
export const createCrmLead=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>leadSchema.parse(v)).handler(async({context,data})=>{
  const {data:role}=await context.supabase.rpc('crm_role'); if(!role||role==='support') throw new Error('Sales access required.');
  const {data:row,error}=await context.supabase.rpc('crm_create_lead',{_input:data});
  if(error) throw new Error('Lead could not be created. Check the assigned employee.'); return row;
});
export const moveCrmLead=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>z.object({id:z.string().uuid(),stage:z.enum(stages)}).parse(v)).handler(async({context,data})=>{
  const {data:row,error}=await context.supabase.from('crm_leads').update({stage:data.stage}).eq('id',data.id).select('id').single();
  if(error||!row) throw new Error('Stage change denied or could not be saved.'); return {ok:true};
});
export const saveCrmMember=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>memberSchema.parse(v)).handler(async({context,data})=>{
  const {data:admin}=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'}); if(!admin) throw new Error('Admin access required.');
  const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
  let userId:string|undefined;
  for(let page=1;page<=100;page++){const {data:users,error}=await supabaseAdmin.auth.admin.listUsers({page,perPage:100}); if(error) throw new Error('Account lookup failed.'); const u=users.users.find(u=>u.email?.toLowerCase()===data.email.toLowerCase()); if(u){if(!u.email_confirmed_at)throw new Error('Employee must verify their email first.');userId=u.id;break;}if(users.users.length<100)break;}
  if(!userId) throw new Error('Employee must create and verify their account before onboarding.');
  const {error}=await context.supabase.rpc('crm_onboard_member',{_user_id:userId,_input:data}); if(error) throw new Error('Employee could not be saved. Check employee code and manager.'); return {ok:true};
});
const actionSchema=z.discriminatedUnion('kind',[
 z.object({kind:z.literal('task'),data:taskSchema}),
 z.object({kind:z.literal('task_status'),data:z.object({id:z.string().uuid(),status:z.enum(['open','done'])})}),
 z.object({kind:z.literal('ticket'),data:ticketSchema}),
 z.object({kind:z.literal('ticket_status'),data:z.object({id:z.string().uuid(),status:z.enum(['open','in_progress','resolved'])})}),
 z.object({kind:z.literal('target'),data:targetSchema}),
 z.object({kind:z.literal('activity'),data:z.object({leadId:z.string().uuid().optional(),ticketId:z.string().uuid().optional(),kind:z.enum(['note','call','email','meeting']),body:z.string().trim().min(1).max(3000)}).refine(v=>Boolean(v.leadId)!==Boolean(v.ticketId),'Select one lead or ticket')}),
]);
export const crmAction=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>actionSchema.parse(v)).handler(async({context,data:action})=>{
 let error;
 if(action.kind==='task'){const d=action.data;({error}=await context.supabase.from('crm_tasks').insert({title:d.title,owner_id:d.ownerId,due_date:d.dueDate,priority:d.priority}));}
 else if(action.kind==='task_status'){({error}=await context.supabase.from('crm_tasks').update({status:action.data.status}).eq('id',action.data.id).select('id').single());}
 else if(action.kind==='ticket'){const d=action.data;({error}=await context.supabase.from('crm_tickets').insert({customer_id:d.customerId,owner_id:d.ownerId,subject:d.subject,description:d.description,priority:d.priority}));}
 else if(action.kind==='ticket_status'){({error}=await context.supabase.from('crm_tickets').update({status:action.data.status}).eq('id',action.data.id).select('id').single());}
 else if(action.kind==='target'){const d=action.data;({error}=await context.supabase.from('crm_targets').upsert({owner_id:d.ownerId,month:d.month.slice(0,7)+'-01',revenue_target:d.revenue,wins_target:d.wins,calls_target:d.calls},{onConflict:'owner_id,month'}));}
 else {const d=action.data;const result=d.leadId?await context.supabase.from('crm_leads').select('owner_id').eq('id',d.leadId).single():await context.supabase.from('crm_tickets').select('owner_id').eq('id',d.ticketId??'').single();if(!result.data)throw new Error('Record access denied.');({error}=await context.supabase.from('crm_activities').insert({owner_id:result.data.owner_id??context.userId,actor_id:context.userId,lead_id:d.leadId??null,ticket_id:d.ticketId??null,kind:d.kind,body:d.body}));}
 if(error)throw new Error('Change denied or could not be saved.');return {ok:true};
});
export const crmCustomerLookup=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>z.object({reference:z.string().trim().min(6).max(60)}).parse(v)).handler(async({context,data})=>{
 const {data:role}=await context.supabase.rpc('crm_role');if(!role)throw new Error('Active CRM access required.');
 const {data:rows,error}=await context.supabase.rpc('crm_customer_lookup',{_reference:data.reference}); if(error)throw new Error('Customer lookup unavailable.'); return rows;
});
export const assignCrmLead=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>z.object({leadId:z.string().uuid(),ownerId:z.string().uuid().nullable()}).parse(v)).handler(async({context,data})=>{
 const {data:role}=await context.supabase.rpc('crm_role');if(role!=='admin'&&role!=='BDM')throw new Error('Only an admin or BDM can reassign leads.');
 const {error}=await context.supabase.rpc('crm_assign_lead',{_lead:data.leadId,_owner:data.ownerId as string});if(error)throw new Error('Lead could not be reassigned. Check that the employee is active and in your team.');return {ok:true};
});
