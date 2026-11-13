import { DndContext,PointerSensor,KeyboardSensor,useSensor,useSensors,useDraggable,useDroppable,type DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical,Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { stages,stageLabels } from '@/lib/crm/rules';
import type { getCrm } from '@/lib/crm.functions';
type Lead=Awaited<ReturnType<typeof getCrm>>['leads'][number];
const money=(n:number)=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);
function LeadCard({lead,name,open,move,busy}:{lead:Lead;name:string;open:()=>void;move:(id:string,stage:typeof stages[number])=>void;busy:boolean}){
 const {attributes,listeners,setNodeRef,transform,isDragging}=useDraggable({id:lead.id,disabled:busy});
 return <article ref={setNodeRef} style={transform?{transform:CSS.Translate.toString(transform)}:undefined} className={`rounded-md border border-border bg-background p-3 ${isDragging?'z-50 opacity-70':''}`}>
  <div className="flex items-start gap-2"><Button variant="ghost" size="icon" className="h-7 w-6 shrink-0 cursor-grab touch-none" aria-label={`Drag ${lead.title}`} {...attributes} {...listeners}><GripVertical className="size-4"/></Button><Button variant="link" className="h-auto min-w-0 justify-start whitespace-normal p-0 text-left text-sm font-bold text-foreground" onClick={open}>{lead.title}</Button></div>
  <p className="mt-2 truncate text-xs text-muted-foreground">{name}</p><p className="mt-3 text-base font-bold tabular-nums">{money(lead.amount)}</p>
  {lead.next_follow_up&&<p className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground"><Calendar className="size-3"/>{lead.next_follow_up}</p>}
  <select aria-label={`Stage for ${lead.title}`} className="mt-3 h-8 w-full rounded border border-border bg-surface px-2 text-xs" value={lead.stage} disabled={busy} onChange={e=>move(lead.id,e.target.value as typeof stages[number])}>{stages.map(s=><option key={s} value={s}>{stageLabels[s]}</option>)}</select>
 </article>;
}
function Column({stage,children,count,amount}:{stage:typeof stages[number];children:React.ReactNode;count:number;amount:number}){
 const {setNodeRef,isOver}=useDroppable({id:stage});
 return <section ref={setNodeRef} className={`min-h-96 min-w-0 border-t-2 p-3 ${isOver?'border-primary bg-primary/10':'border-border bg-surface'}`}><div className="mb-3 flex items-center justify-between"><h3 className="text-xs font-bold uppercase">{stageLabels[stage]}</h3><span className="text-xs text-muted-foreground">{count}</span></div><p className="mb-4 text-xs text-muted-foreground">{money(amount)}</p><div className="space-y-3">{children}</div></section>;
}
export function CrmPipeline({leads,customerName,onOpen,onMove,busy}:{leads:Lead[];customerName:(id:string)=>string;onOpen:(id:string)=>void;onMove:(id:string,stage:typeof stages[number])=>void;busy:boolean}){
 const sensors=useSensors(useSensor(PointerSensor,{activationConstraint:{distance:6}}),useSensor(KeyboardSensor));
 const end=(e:DragEndEvent)=>{const target=String(e.over?.id??'');if(stages.includes(target as typeof stages[number]))onMove(String(e.active.id),target as typeof stages[number]);};
 return <DndContext sensors={sensors} onDragEnd={end}><div className="overflow-x-auto pb-4"><div className="grid min-w-[1250px] grid-cols-6 gap-3">{stages.map(s=>{const rows=leads.filter(l=>l.stage===s);return <Column key={s} stage={s} count={rows.length} amount={rows.reduce((n,l)=>n+l.amount,0)}>{rows.map(l=><LeadCard key={l.id} lead={l} name={customerName(l.customer_id)} open={()=>onOpen(l.id)} move={onMove} busy={busy}/>)}</Column>;})}</div></div></DndContext>;
}