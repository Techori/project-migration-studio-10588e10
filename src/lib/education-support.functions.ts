import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { educationBasicSchema, educationCoreSchema, educationLookupSchema, educationPrivateSchema, educationReviewSchema, paymentReferenceSchema, paymentStatuses, studentCategories, applicationTypeKeys, type ApplicationType } from "./education-support/rules";

/** Step 1: basic details → acknowledgement number. */
export const startEducationRegistration = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => educationBasicSchema.parse(input))
  .handler(async ({ data }) => {
    const { startRegistration } = await import("./education-support/registration-store.server");
    return startRegistration(data);
  });

/** Coordinator details for a referral link code (shown read-only in the form). */
export const getReferralCoordinator = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ code: z.string().trim().max(40).regex(/^[A-Za-z0-9-]+$/) }).parse(input))
  .handler(async ({ data }) => {
    const { limitSubmission } = await import("./submissions.server");
    await limitSubmission(`ref:${data.code.toUpperCase()}`, { failOpen: true });
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { referralCoordinator } = await import("./education-support/registration-store.server");
      return await referralCoordinator(supabaseAdmin, data.code);
    } catch (e) { console.error("Referral lookup failed", e); return null; }
  });

export const submitEducationPaymentReference = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => paymentReferenceSchema.parse(input))
  .handler(async ({ data }) => {
    const { savePaymentReference } = await import("./education-support/registration-store.server");
    return savePaymentReference(data);
  });

const editValuesSchema = z.object({ changePrivateDetails: z.boolean(), values: z.record(z.unknown()) });
function parseEditValues(input: z.infer<typeof editValuesSchema>) {
  const core = educationCoreSchema.parse(input.values);
  const priv = input.changePrivateDetails ? educationPrivateSchema.parse(input.values) : null;
  return { core, priv };
}

/** Student reopens their registration with acknowledgement number, date of birth and state (database first, then the Google Sheet). */
export const lookupEducationRegistration = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => educationLookupSchema.parse(input))
  .handler(async ({ data }) => {
    const { lookupForEdit } = await import("./education-support/registration-store.server");
    return lookupForEdit(data);
  });

export const saveEducationProgress = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ verify: educationLookupSchema, values: z.record(z.union([z.string().max(300), z.boolean()])) }).parse(input))
  .handler(async ({ data }) => {
    const { saveProgress } = await import("./education-support/registration-store.server");
    return saveProgress(data.verify, data.values);
  });

/** Final submission, and later edits until payment is confirmed. */
export const submitEducationRegistration = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => editValuesSchema.extend({ verify: educationLookupSchema }).parse(input))
  .handler(async ({ data }) => {
    const { core, priv } = parseEditValues(data);
    const { saveFullRegistration } = await import("./education-support/registration-store.server");
    return saveFullRegistration(data.verify, core, priv);
  });

export const getEducationRegistrationForEdit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { data: admin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!admin) throw new Error("Admin access required.");
    const { getForAdmin } = await import("./education-support/registration-store.server");
    return getForAdmin(context.supabase, data.id);
  });

export const adminUpdateEducationRegistration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => editValuesSchema.extend({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { data: admin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!admin) throw new Error("Admin access required.");
    const { core, priv } = parseEditValues(data);
    const { updateFromAdmin } = await import("./education-support/registration-store.server");
    return updateFromAdmin(context.supabase, data.id, core, priv);
  });

/** Imports backup-only sheet rows into the database and copies database rows missing from the sheet. */
export const syncEducationSheet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: admin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!admin) throw new Error("Admin access required.");
    const { syncWithSheet } = await import("./education-support/registration-store.server");
    return syncWithSheet();
  });

const listSchema = z.object({
  page: z.number().int().min(0).max(10000),
  search: z.string().trim().max(100).optional(),
  category: z.enum(studentCategories).optional(),
  applicationType: z.enum(applicationTypeKeys as [ApplicationType, ...ApplicationType[]]).optional(),
  paymentStatus: z.enum(paymentStatuses).optional(),
  all: z.boolean().optional(),
  flags: z.enum(["flagged", "unconfirmed"]).optional(),
});

const adminColumns = "id, ack_number, student_category, current_class, course_name, education_sector, institution_name, education, student_name, father_name, mother_name, date_of_birth, gender, nationality, mobile, whatsapp, email, permanent_address, current_address, state, district, city, pin_code, is_minor, guardian_name, guardian_mobile, guardian_email, guardian_relationship, guardian_consent_at, without_coordinator, coordinator, coordinator_code, application_type, registration_fee, payment_status, payment_reference, payment_reference_at, status, status_reason, created_at, updated_at, review_flags, ai_review, flags_checked_at, flags_confirmed_by, flags_confirmed_at, flags_confirm_note";

export const listEducationSupport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => listSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { data: admin, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!admin || roleError) throw new Error("Admin access required.");
    let query = context.supabase.from("education_support_registrations").select(adminColumns, { count: "exact" });
    if (data.category) query = query.eq("student_category", data.category);
    if (data.applicationType) query = query.eq("application_type", data.applicationType);
    if (data.paymentStatus) query = query.eq("payment_status", data.paymentStatus);
    if (data.flags === "flagged") query = query.neq("review_flags", "[]");
    if (data.flags === "unconfirmed") query = query.is("flags_confirmed_at", null);
    if (data.search) {
      const s = data.search.replace(/[^A-Za-z0-9@.\- ]/g, "");
      if (s) query = query.or(`ack_number.ilike.%${s}%,student_name.ilike.%${s}%,mobile.ilike.%${s}%,email.ilike.%${s}%`);
    }
    query = query.order("created_at", { ascending: false });
    const { data: rows, error, count } = await query.range(data.page * (data.all ? 500 : 20), data.page * (data.all ? 500 : 20) + (data.all ? 499 : 19));
    if (error) throw new Error("Education support registrations could not be loaded.");
    const ids = (rows ?? []).map(r => r.id);
    const { data: approvalRows } = ids.length ? await context.supabase.from('education_support_registrations').select('id, approval_status, aadhaar_last_four').in('id', ids) : { data: [] };
    return { rows: (rows ?? []).map(r => ({ ...r, approval_status: approvalRows?.find(a => a.id === r.id)?.approval_status ?? 'pending', aadhaar_last_four: approvalRows?.find(a => a.id === r.id)?.aadhaar_last_four ?? null })), count: count ?? 0 };
  });

export const reviewEducationSupport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => educationReviewSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { data: admin, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!admin || roleError) throw new Error("Admin access required.");
    const update: { status?: string; payment_status?: string; status_reason?: string; approval_status?: string } = {};
    if (data.status) update.status = data.status;
    if (data.paymentStatus) update.payment_status = data.paymentStatus;
    if (data.reason !== undefined) update.status_reason = data.reason;
    if (data.approvalStatus) update.approval_status = data.approvalStatus;
    if (data.approvalStatus === "approved") {
      const { data: current } = await context.supabase.from("education_support_registrations").select("payment_status, flags_checked_at, flags_confirmed_at").eq("id", data.id).single();
      const { approvalBlocker } = await import("./education-support/flags");
      const blocker = current ? approvalBlocker(current) : "Registration not found.";
      if (blocker) throw new Error(blocker);
    }
    const { error } = await context.supabase.from("education_support_registrations").update(update).eq("id", data.id);
    if (error) throw new Error(data.approvalStatus === 'approved' ? 'Approval needs confirmed payment and a person\'s confirmation of the mismatch check.' : "The registration could not be updated.");
    if (data.paymentStatus) {
      const { refreshEducationChecks } = await import("./education-support/checks.server");
      await refreshEducationChecks(context.supabase, data.id, { ai: false }).catch(e => console.error("Education checks refresh failed", e));
    }
    return { ok: true };
  });

export const getEducationPrivateDetails = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ id: z.string().uuid() }).parse(v))
  .handler(async ({ context, data }) => {
    const { data: admin } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
    if (!admin) throw new Error('Admin access required.');
    const { data: row, error } = await context.supabase.from('education_support_registrations').select('private_details_ciphertext').eq('id', data.id).single();
    if (error) throw new Error('Identity details could not be loaded.');
    if (!row?.private_details_ciphertext) return { details: {} as Record<string, string> };
    const secret = process.env['EDUCATION_KYC_ENCRYPTION_KEY'];
    if (!secret) throw new Error('Secure identity access is unavailable.');
    const { decryptDetails } = await import('./education-support/privacy.server');
    return { details: await decryptDetails(row.private_details_ciphertext, secret) };
  });


export const runEducationChecks = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ id: z.string().uuid(), ai: z.boolean() }).parse(v))
  .handler(async ({ context, data }) => {
    const { data: admin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!admin) throw new Error("Admin access required.");
    const { refreshEducationChecks } = await import("./education-support/checks.server");
    const result = await refreshEducationChecks(context.supabase, data.id, { ai: data.ai });
    return { count: result.flags.length, aiError: result.aiError };
  });

export const confirmEducationChecks = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ id: z.string().uuid(), note: z.string().trim().max(500), checkedEveryFlag: z.literal(true) }).parse(v))
  .handler(async ({ context, data }) => {
    const { data: admin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!admin) throw new Error("Admin access required.");
    // The database stamps the confirming person and time; it refuses when no check has run.
    const { error } = await context.supabase.from("education_support_registrations")
      .update({ flags_confirmed_at: new Date().toISOString(), flags_confirm_note: data.note }).eq("id", data.id);
    if (error) throw new Error("The confirmation could not be saved. Run the mismatch check first.");
    return { ok: true };
  });
