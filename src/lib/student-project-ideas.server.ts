import { requestClientIp } from "@/lib/client-ip";
import { streamResponse, GatewayError } from '@lovable.dev/ai-gateway';
import { projectIdeasSchema, projectIdeasInstructions } from './student-project-ideas';

export async function studentProjectIdeas(request: Request) {
  const fail = (message:string,status:number) => Response.json({message},{status,headers:{'Cache-Control':'no-store'}});
  if(request.headers.get('origin')!==new URL(request.url).origin) return fail('Open this tool on the Riloyd website.',403);
  let input;
  try { const raw=await request.text(); if(raw.length>12000)return fail('Please shorten your descriptions.',413);input=projectIdeasSchema.parse(JSON.parse(raw)); }
  catch {return fail('Complete your class, interests, skills, materials and guardian approval. Do not include contact details.',400);}
  const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`student-projects:${requestClientIp(request)??'guest'}`));
  const hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
  const {data:allowed,error}=await supabaseAdmin.rpc('consume_form_submission_limit',{_key_hash:hash});
  if(error)return fail('Project suggestions are temporarily unavailable.',503);
  if(!allowed)return fail('Too many requests. Please try again after 15 minutes.',429);
  const safeError=(e:unknown)=>e instanceof GatewayError && e.httpStatus===402 ? 'AI credits are unavailable. Please contact the Riloyd team.' : e instanceof GatewayError && e.httpStatus===403 ? 'This AI service is not permitted for the workspace. Please contact the Riloyd team.' : 'AI suggestions could not finish. Your inputs are still here; any partial output is incomplete.';
  try {
    const result=await streamResponse({model:'openai/gpt-6-astra',input:JSON.stringify({schoolClass:input.schoolClass,interests:input.interests,skills:input.skills,materials:input.materials}),instructions:projectIdeasInstructions,max_output_tokens:3500},{signal:request.signal});
    const encoder=new TextEncoder();let cancelled=false;
    const stream=new ReadableStream<Uint8Array>({
      async start(controller){
        const emit=(v:object)=>{if(!cancelled)controller.enqueue(encoder.encode(JSON.stringify(v)+'\n'));};
        let completed=false;let text=false;let refused=false;
        try {
          for await(const event of result){
            if(event.type==='response.output_text.delta'){text=true;emit({type:'text',text:event.delta});}
            if(event.type==='response.refusal.delta'||event.type==='response.refusal.done'){refused=true;}
            if(event.type==='response.completed')completed=true;
            if(event.type==='response.incomplete')completed=false;
          }
          emit(completed&&text&&!refused?{type:'done'}:{type:'error',message:refused?'AI declined this request. Try a safe supervised project.':'The suggestions are incomplete. No registration was submitted.'});
        }catch(e){if(!request.signal.aborted)emit({type:'error',message:safeError(e)});}
        finally{if(!cancelled)controller.close();}
      },cancel(){cancelled=true;},
    });
    return new Response(stream,{headers:{'Content-Type':'application/x-ndjson','Cache-Control':'no-store, no-transform',...(result.runId?{'X-Lovable-AIG-Run-ID':result.runId}:{})}});
  }catch(e){return fail(safeError(e),e instanceof GatewayError?e.httpStatus??503:503);}
}