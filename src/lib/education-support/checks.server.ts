import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { computeRuleFlags, flagFields, type FlagInput, type ReviewFlag } from "./flags";
import { ageOn } from "./rules";

type Client = SupabaseClient<Database>;

/** Name of the active employee or coordinator a form code belongs to, or null. */
export async function codeOwnerName(client: Client, rawCode: string | null): Promise<string | null> {
  const code = rawCode?.trim().toUpperCase();
  if (!code) return null;
  const { data: employees } = await client.from("crm_employee_profiles").select("user_id, full_name, employee_code").ilike("employee_code", code);
  const staffRows = (await client.from("education_staff_access").select("user_id").eq("active", true).ilike("referral_code", code)).data ?? [];
  const userIds = [...(employees ?? []).filter(e => e.employee_code.trim().toUpperCase() === code).map(e => e.user_id), ...staffRows.map(s => s.user_id)];
  if (userIds.length) {
    const { data: members } = await client.from("crm_memberships").select("user_id").eq("active", true).in("user_id", userIds);
    const active = members?.[0]?.user_id;
    if (active) {
      const { data: profile } = await client.from("crm_employee_profiles").select("full_name").eq("user_id", active).maybeSingle();
      return profile?.full_name ?? "an employee";
    }
  }
  const { data: coordinator } = await client.from("coordinators").select("full_name").eq("active", true).eq("referral_code", code).maybeSingle();
  return coordinator?.full_name ?? null;
}

export type CheckRow = {
  student_name: string; father_name: string; mother_name: string; guardian_name: string | null;
  student_category: string; current_class: string | null; course_name: string | null; date_of_birth: string; created_at: string;
  application_type: string; registration_fee: number; payment_status: string; payment_reference: string | null;
  without_coordinator: boolean; coordinator_code: string | null; coordinator: unknown;
};

export async function ruleFlagsFor(client: Client, row: CheckRow, bankHolder: string | null): Promise<{ flags: ReviewFlag[]; input: FlagInput }> {
  const entered = ((row.coordinator ?? {}) as Record<string, unknown>)["name"];
  const input: FlagInput = {
    studentName: row.student_name, fatherName: row.father_name, motherName: row.mother_name, guardianName: row.guardian_name, bankHolder,
    studentCategory: row.student_category, currentClass: row.current_class, courseName: row.course_name, dateOfBirth: row.date_of_birth, registeredOn: new Date(row.created_at),
    applicationType: row.application_type, registrationFee: row.registration_fee, paymentStatus: row.payment_status, paymentReference: row.payment_reference,
    withoutCoordinator: row.without_coordinator, coordinatorCode: row.coordinator_code, coordinatorNameEntered: typeof entered === "string" ? entered : "",
    codeOwnerName: row.without_coordinator ? null : await codeOwnerName(client, row.coordinator_code),
  };
  return { flags: computeRuleFlags(input), input };
}

const checkColumns = "id, student_name, father_name, mother_name, guardian_name, student_category, current_class, course_name, date_of_birth, created_at, application_type, registration_fee, payment_status, payment_reference, without_coordinator, coordinator_code, coordinator, private_details_ciphertext, review_flags, ai_review";

async function bankHolderOf(ciphertext: string | null): Promise<string | null> {
  const secret = process.env["EDUCATION_KYC_ENCRYPTION_KEY"];
  if (!ciphertext || !secret) return null;
  const { decryptDetails } = await import("./privacy.server");
  try { return (await decryptDetails(ciphertext, secret))["bankHolder"] ?? null; } catch { return null; }
}

/**
 * Recompute and store the mismatch flags for one registration. With `ai`, the AI Gateway also
 * compares spellings; it receives only names, class/course, age and fee type, never contact,
 * bank account or Aadhaar details. Without `ai`, earlier AI flags are kept.
 */
export async function refreshEducationChecks(client: Client, id: string, opts: { ai: boolean }): Promise<{ flags: ReviewFlag[]; aiError: string | null }> {
  const { data: row, error } = await client.from("education_support_registrations").select(checkColumns).eq("id", id).single();
  if (error || !row) throw new Error("Registration not found.");
  const { flags, input } = await ruleFlagsFor(client, row, await bankHolderOf(row.private_details_ciphertext));
  let aiFlags = ((row.review_flags ?? []) as ReviewFlag[]).filter(f => f.source === "ai");
  let aiReview = row.ai_review;
  let aiError: string | null = null;
  if (opts.ai) {
    const result = await aiCheck(input, flags);
    if (result.ok) { aiFlags = result.flags; aiReview = result.summary; } else aiError = result.error;
  }
  const all = [...flags, ...aiFlags];
  const { error: saveError } = await client.from("education_support_registrations")
    .update({ review_flags: all, ai_review: aiReview, flags_checked_at: new Date().toISOString() }).eq("id", id);
  if (saveError) throw new Error("The check results could not be saved.");
  return { flags: all, aiError };
}

async function aiCheck(v: FlagInput, ruleFlags: ReviewFlag[]): Promise<{ ok: true; flags: ReviewFlag[]; summary: string } | { ok: false; error: string }> {
  const age = /^\d{4}-\d{2}-\d{2}$/.test(v.dateOfBirth) ? ageOn(v.dateOfBirth, v.registeredOn) : null;
  const facts = [
    `Student name: ${v.studentName}`, `Father's name: ${v.fatherName}`, `Mother's name: ${v.motherName}`, `Guardian name: ${v.guardianName || "—"}`,
    `Bank account holder name: ${v.bankHolder ?? "[not available]"}`,
    `Category: ${v.studentCategory}`, `School class: ${v.currentClass || "—"}`, `College course: ${v.courseName || "—"}`, `Age at registration: ${age ?? "unknown"}`,
    `Applied for: ${v.applicationType}, fee recorded ₹${v.registrationFee}`, `Payment status: ${v.paymentStatus}`, `Transaction ID given: ${v.paymentReference ? "yes" : "no"}`,
    `Registering without coordinator: ${v.withoutCoordinator ? "yes" : "no"}`, `Coordinator name entered on form: ${v.coordinatorNameEntered || "—"}`,
    `Coordinator code entered: ${v.coordinatorCode || "—"}`, `Code belongs to: ${v.codeOwnerName ?? "nobody active"}`,
  ];
  const { generateResponse, GatewayError } = await import("@lovable.dev/ai-gateway");
  try {
    const response = await generateResponse({
      model: "openai/gpt-6-astra",
      instructions: "You help the RILOYD Foundation admin check an Education Support scholarship registration for mismatches before a person approves it. Look only for inconsistencies in names (spelling or transliteration differences between student, parents, bank holder and coordinator), class or course versus age, payment versus fee, and coordinator code versus coordinator name. Never invent facts and never decide approval. Be short and neutral, in simple English.",
      input: `Registration facts:\n${facts.map(f => `- ${f}`).join("\n")}\n\nAutomatic rule flags already raised:\n${ruleFlags.map(f => `- [${f.field}] ${f.message}`).join("\n") || "- none"}\n\nReturn extra flags only for mismatches the rules above missed (empty list if none), and a one or two sentence summary for the reviewer.`,
      text: { format: { type: "json_schema", name: "education_mismatch_review", strict: true, schema: { type: "object", additionalProperties: false, required: ["flags", "summary"], properties: { summary: { type: "string" }, flags: { type: "array", items: { type: "object", additionalProperties: false, required: ["field", "severity", "message"], properties: { field: { type: "string", enum: [...flagFields] }, severity: { type: "string", enum: ["high", "medium"] }, message: { type: "string" } } } } } } } },
    });
    const text = response.output.flatMap(item => item.type === "message" ? item.content : []).map(part => part.type === "output_text" ? part.text : "").join("");
    const parsed = JSON.parse(text) as { summary?: unknown; flags?: unknown };
    const flags = (Array.isArray(parsed.flags) ? parsed.flags : []).flatMap((f): ReviewFlag[] => {
      const x = f as Record<string, unknown>;
      return (flagFields as readonly string[]).includes(String(x["field"])) && (x["severity"] === "high" || x["severity"] === "medium") && typeof x["message"] === "string"
        ? [{ field: x["field"] as ReviewFlag["field"], severity: x["severity"], message: x["message"].slice(0, 300), source: "ai" }] : [];
    }).slice(0, 8);
    return { ok: true, flags, summary: typeof parsed.summary === "string" ? parsed.summary.slice(0, 600) : "" };
  } catch (err) {
    if (err instanceof GatewayError) {
      console.error("Education AI check failed", err.code, err.httpStatus);
      if (err.code === "payment_required") return { ok: false, error: "AI credits have run out; rule checks were saved. Add credits and run the check again." };
      if (err.code === "rate_limited") return { ok: false, error: "Too many AI requests right now; rule checks were saved. Try again in a minute." };
    } else console.error("Education AI check failed", err);
    return { ok: false, error: "The AI check is unavailable right now; rule checks were saved." };
  }
}
