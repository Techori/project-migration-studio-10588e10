import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { applicationTypes, educationReviewSchema, educationSupportSchema, isMinor, paymentReferenceSchema, paymentStatuses, studentCategories, applicationTypeKeys, type ApplicationType } from "./education-support/rules";

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
}

export const submitEducationSupport = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => educationSupportSchema.parse(input))
  .handler(async ({ data: v }) => {
    const { limitSubmission } = await import("./submissions.server");
    await limitSubmission(v.email);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const code = v.withoutCoordinator ? "" : v.coordinatorCode.toUpperCase();
    let coordinatorId: string | null = null;
    if (code) {
      const { data: c } = await supabaseAdmin.from("coordinators").select("id").eq("referral_code", code).eq("active", true).maybeSingle();
      coordinatorId = c?.id ?? null;
    }
    const minor = isMinor(v.dateOfBirth);
    const school = v.studentCategory === "school";
    const education = school
      ? { currentClass: v.currentClass, schoolName: v.schoolName, schoolType: v.schoolType, schoolBoard: v.schoolBoard, schoolAddress: v.schoolAddress, schoolCity: v.schoolCity, schoolState: v.schoolState, schoolPin: v.schoolPin, academicSession: v.academicSession }
      : { courseName: v.courseName, courseSpecialization: v.courseSpecialization, collegeName: v.collegeName, enrollmentNumber: v.enrollmentNumber, currentYear: v.currentYear, currentSemester: v.currentSemester, studyMode: v.studyMode, collegeState: v.collegeState, collegeCity: v.collegeCity, academicSession: v.academicSession };
    const receiptToken = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, "0")).join("");
    const fee = applicationTypes[v.applicationType].fee;
    const secret = process.env['EDUCATION_KYC_ENCRYPTION_KEY'];
    if (!secret) throw new Error('Secure identity storage is unavailable. Please contact the Foundation team.');
    const { encryptDetails } = await import('./education-support/privacy.server');
    const privateDetails = await encryptDetails({ bankHolder: v.bankHolder, bankName: v.bankName, bankAccount: v.bankAccount, bankIfsc: v.bankIfsc, aadhaarNumber: v.aadhaarNumber }, secret);
    const { ruleFlagsFor } = await import("./education-support/checks.server");
    const checkedAt = new Date().toISOString();
    const { flags: reviewFlags } = await ruleFlagsFor(supabaseAdmin, {
      student_name: v.studentName, father_name: v.fatherName, mother_name: v.motherName, guardian_name: v.guardianName || null,
      student_category: v.studentCategory, current_class: school ? v.currentClass : null, course_name: school ? null : v.courseName, date_of_birth: v.dateOfBirth, created_at: checkedAt,
      application_type: v.applicationType, registration_fee: fee, payment_status: "pending", payment_reference: null,
      without_coordinator: v.withoutCoordinator, coordinator_code: code || null, coordinator: { name: v.coordinatorName },
    }, v.bankHolder);
    const { data: row, error } = await supabaseAdmin.from("education_support_registrations").insert({
      review_flags: reviewFlags, flags_checked_at: checkedAt,
      student_category: v.studentCategory,
      current_class: school ? v.currentClass : null,
      course_name: school ? null : v.courseName,
      education_sector: v.educationSector || null,
      institution_name: school ? v.schoolName : v.collegeName,
      education,
      student_name: v.studentName, father_name: v.fatherName, mother_name: v.motherName, date_of_birth: v.dateOfBirth,
      gender: v.gender, nationality: v.nationality, mobile: v.mobile, whatsapp: v.whatsapp || null, email: v.email,
      permanent_address: v.permanentAddress, current_address: v.currentAddress, state: v.state, district: v.district, city: v.city, pin_code: v.pinCode,
      is_minor: minor,
      guardian_name: v.guardianName || null, guardian_mobile: v.guardianMobile || null, guardian_email: v.guardianEmail || null, guardian_relationship: v.guardianRelationship || null,
      guardian_consent_at: minor && v.guardianConsent ? new Date().toISOString() : null,
      without_coordinator: v.withoutCoordinator,
      coordinator: v.withoutCoordinator ? {} : { name: v.coordinatorName, mobile: v.coordinatorMobile, whatsapp: v.coordinatorWhatsapp, email: v.coordinatorEmail, type: v.coordinatorType, institution: v.coordinatorInstitution, coordinatorId: v.coordinatorIdText },
      coordinator_code: code || null, coordinator_id: coordinatorId,
      application_type: v.applicationType, registration_fee: fee,
      receipt_token_hash: await sha256Hex(receiptToken),
      private_details_ciphertext: privateDetails, aadhaar_last_four: v.aadhaarNumber.slice(-4),
      declarations: { confirmAccurate: true, agreeTerms: true, consentVerification: true, authorizeContact: true, understandFees: true, kycConsent: true, guardianConsent: minor ? v.guardianConsent : null, at: new Date().toISOString() },
    }).select("ack_number, created_at").single();
    if (error || !row) throw new Error("Your registration could not be saved. Please try again.");
    return { ackNumber: row.ack_number, createdAt: row.created_at, receiptToken, fee, applicationType: v.applicationType as ApplicationType, coordinatorName: v.withoutCoordinator ? "" : v.coordinatorName };
  });

export const submitEducationPaymentReference = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => paymentReferenceSchema.parse(input))
  .handler(async ({ data }) => {
    const { limitSubmission } = await import("./submissions.server");
    await limitSubmission(data.ackNumber);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin.from("education_support_registrations")
      .update({ payment_reference: data.reference, payment_reference_at: new Date().toISOString(), payment_status: "reference_submitted" })
      .eq("ack_number", data.ackNumber).eq("receipt_token_hash", await sha256Hex(data.receiptToken)).in("payment_status", ["pending", "reference_submitted"])
      .select("id, ack_number");
    if (error?.code === "23505") throw new Error("This transaction ID has already been used for another registration. Each payment ID can be used only once — please check your Razorpay receipt.");
    if (error) throw new Error("The payment ID could not be saved. Please try again.");
    if (!rows?.length) throw new Error("This registration could not be updated. Please contact the Foundation team with your acknowledgement number.");
    try {
      const { refreshEducationChecks } = await import("./education-support/checks.server");
      await refreshEducationChecks(supabaseAdmin, rows[0]!.id, { ai: false });
    } catch (e) { console.error("Education checks after payment ID failed", e); }
    return { ok: true };
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
