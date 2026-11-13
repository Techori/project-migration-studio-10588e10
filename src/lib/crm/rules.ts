import { z } from 'zod';
export const crmRoles = ['sales','support','BDE','BDM'] as const;
export const stages = ['new','contacted','qualified','proposal','won','lost'] as const;
export const stageLabels: Record<(typeof stages)[number], string> = { new:'New', contacted:'Contacted', qualified:'Qualified', proposal:'Proposal', won:'Won', lost:'Lost' };
/** Where a lead came from; website forms create leads automatically. */
export const sourceLabels: Record<string,string> = { manual:'Added in CRM', enquiry:'Contact enquiry', education:'Education Support', foundation:'Foundation form', registration:'Registration', young_innovators:'Young Innovators', programme:'Programme application' };
const text = z.string().trim().min(1).max(200);
const id = z.string().uuid();
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const leadSchema = z.object({ title:text, fullName:text, email:z.string().trim().email().or(z.literal('')), phone:z.string().trim().max(30), company:z.string().trim().max(150), amount:z.number().min(0).max(1e10), ownerId:id, followUp:date.optional(), acknowledgement:z.string().trim().max(60).optional() });
export const memberSchema = z.object({ email:z.string().trim().email(), fullName:text, employeeCode:text, phone:z.string().trim().max(30), designation:text, photoUrl:z.string().url().startsWith('https://').or(z.literal('')), joiningDate:date, role:z.enum(crmRoles), managerId:id.optional(), active:z.boolean() });
export const taskSchema = z.object({ title:text, ownerId:id, dueDate:date, priority:z.enum(['normal','high','urgent']) });
export const ticketSchema = z.object({ customerId:id, ownerId:id, subject:text, description:z.string().trim().max(3000), priority:z.enum(['normal','high','urgent']) });
export const targetSchema = z.object({ ownerId:id, month:date, revenue:z.number().min(0).max(1e10), wins:z.number().int().min(0).max(100000), calls:z.number().int().min(0).max(100000) });
export type AccessMember = { user_id:string; role:string; manager_id:string|null; active:boolean };
export function visibleOwner(actor:string, role:string, owner:string, members:AccessMember[]) {
  if (role==='admin') return true;
  const me=members.find(m=>m.user_id===actor && m.active);
  return Boolean(me && (owner===actor || (role==='BDM' && members.some(m=>m.user_id===owner && m.manager_id===actor && m.active))));
}
export function progress(actual:number,target:number) { return target>0 ? Math.min(100,Math.round(actual/target*100)) : 0; }