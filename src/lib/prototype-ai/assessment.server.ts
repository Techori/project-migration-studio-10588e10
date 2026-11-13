import { requestClientIp } from "@/lib/client-ip";
import { prototypeAssessmentInstructions, prototypeAssessmentSchema } from "../prototype-assessment";
import { GatewayError, streamResponse } from "@lovable.dev/ai-gateway";
import { getLovableAiGatewayResponseHeaders } from "./run-id.server.ts";
import { isAssessmentAbort } from "./cancellation";

const model = "openai/gpt-6-astra";
const jsonError = (message: string, status: number) => Response.json({ message }, { status, headers: { "Cache-Control": "no-store" } });

export async function assessPrototype(request: Request) {
  const stopped = () => new Response(null, { status: 499 });
  if (request.signal.aborted) return stopped();
  if (request.headers.get("origin") !== new URL(request.url).origin) return jsonError("Open the assessment from the Riloyd website.", 403);
  if (!request.headers.get("content-type")?.includes("application/json")) return jsonError("Expected an idea assessment form.", 400);
  if (Number(request.headers.get("content-length") ?? 0) > 16000) return jsonError("Please shorten your description.", 413);
  let input;
  try {
    const raw = await request.text();
    if (raw.length > 14000) return jsonError("Please shorten your description.", 413);
    input = prototypeAssessmentSchema.parse(JSON.parse(raw));
  } catch (error) { return isAssessmentAbort(error, request.signal) ? stopped() : jsonError("Complete the idea, prototype and eligibility fields, and confirm consent.", 400); }
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: blocked, error: stateError } = await supabaseAdmin.from("prototype_ai_access_state").select("status_code,message").eq("model_id", model).maybeSingle();
  if (stateError) return jsonError("AI availability could not be checked. Please contact the team.", 503);
  if (blocked) return jsonError(blocked.message, blocked.status_code);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`prototype:${requestClientIp(request) ?? "guest"}`));
  const keyHash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
  const { data: allowed, error: limitError } = await supabaseAdmin.rpc("consume_form_submission_limit", { _key_hash: keyHash });
  if (limitError) return jsonError("Assessment availability could not be checked.", 503);
  if (!allowed) return jsonError("Too many assessments. Please try again later.", 429);
  if (request.signal.aborted) return stopped();
  const failure = async (error: unknown) => {
    if (!(error instanceof GatewayError)) return { status: 503, message: "The AI connection failed. Your details have not been submitted as an application." };
    console.error("Prototype AI request failed", { code: error.code, ids: error.ids, outcome: error.outcome });
    const message = error.code === "payment_required" ? "AI advice is paused until the website owner restores AI credits." : error.code === "permission_denied" ? (error.recovery?.message ?? "AI advice is paused until the website owner restores model access.") : error.code === "rate_limited" ? "The AI service is busy. Please wait before trying again." : "AI advice is unavailable. Your input is preserved; please contact the Riloyd team.";
    if (error.code === "permission_denied" || error.code === "payment_required") {
      const { error: pauseError } = await supabaseAdmin.from("prototype_ai_access_state").upsert({ model_id: model, status_code: error.httpStatus ?? 403, message, blocked_at: new Date().toISOString() });
      if (pauseError) console.error("Prototype AI pause could not be recorded");
    }
    return { status: error.httpStatus ?? 503, message };
  };
  const abort = new AbortController();
  const cancelRequest = () => abort.abort();
  request.signal.addEventListener("abort", cancelRequest, { once: true });
  let gateway;
  try {
    gateway = await streamResponse({ model, instructions: prototypeAssessmentInstructions(), input: JSON.stringify({ idea: input.idea, prototype: input.prototype, eligibilityContext: input.context, fundingGoal: input.fundingGoal }), reasoning: { effort: "medium", summary: "auto" }, include: ["reasoning.encrypted_content"] }, { signal: abort.signal, maxRetries: 0 });
  } catch (error) {
    request.signal.removeEventListener("abort", cancelRequest);
    if (isAssessmentAbort(error, abort.signal)) return stopped();
    const result = await failure(error); return jsonError(result.message, result.status);
  }
  const iterator = gateway[Symbol.asyncIterator]();
  const encoder = new TextEncoder();
  let cancelled = false;
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let hasText = false;
      let output = "";
      let failed = false;
      const emit = (event: object) => { if (!cancelled && !request.signal.aborted) controller.enqueue(encoder.encode(JSON.stringify(event) + "\n")); };
      try {
        emit({ type: "started" });
        while (true) {
          const part = await iterator.next(); if (part.done) break;
          const chunk = part.value;
          if (chunk.type === "response.output_text.delta") { hasText = true; output += chunk.delta; emit({ type: "text", text: chunk.delta }); }
          if (chunk.type === "response.refusal.delta") { failed = true; emit({ type: "error", message: "The AI declined this assessment. No application was submitted." }); break; }
          if (chunk.type === "response.incomplete") { failed = true; emit({ type: "error", message: "The AI assessment is incomplete. No application was submitted." }); }
        }
        if (!hasText && !failed) emit({ type: "error", message: "The AI returned no assessment. Please contact the Riloyd team." });
        else if (!failed) {
          emit({ type: "done" });
          if (input.saveSubmission && !cancelled && !request.signal.aborted) {
            const { error } = await supabaseAdmin.from("prototype_submissions").insert({ idea: input.idea, prototype: input.prototype, funding_goal: input.fundingGoal, eligibility_context: input.context, ai_output: output });
            if (error) emit({ type: "error", message: "Your assessment completed, but could not be saved. Please contact the team." });
            else emit({ type: "saved" });
          }
        }
      } catch (error) { if (!abort.signal.aborted) { const result = await failure(error); emit({ type: "error", message: result.message }); } }
      finally { request.signal.removeEventListener("abort", cancelRequest); if (!cancelled) controller.close(); }
    },
    cancel: async () => { cancelled = true; abort.abort(); try { await iterator.return?.(); } catch (error) { if (!isAssessmentAbort(error, abort.signal)) throw error; } },
  });
  const headers = getLovableAiGatewayResponseHeaders(undefined, { "Content-Type": "application/x-ndjson", "Cache-Control": "no-cache, no-store, no-transform" });
  const runId = gateway.runId;
  if (runId) headers.set("X-Lovable-AIG-Run-ID", runId);
  return new Response(stream, { headers });
}