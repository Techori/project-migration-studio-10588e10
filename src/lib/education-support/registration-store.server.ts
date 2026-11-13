// Saves Education Support registrations to the database and the Google Sheet backup.
// If the database is unavailable, the sheet still receives the registration with a backup acknowledgement number.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { applicationTypes, educationBasicSchema, educationCoreSchema, type ApplicationType, type EducationBasicValues, type EducationCoreValues, type EducationLookup, type EducationPrivateValues } from "./rules";
import { stateCodes } from "./numbering";
import { backupAckNumber, emptyRecord, formFieldKeys, istTimestamp, isBackupAck, type FormFieldKey, type SheetRecord } from "./sheet";
import { applicationTypeChangeBlocker, editBlocker, type EditActor } from "./editing";
import { buildSheetRecord, dbRegistrationColumns, dbRowToSheetRecord, dbRowToValues, valuesToDbColumns, type DbRegistrationRow } from "./record-mapping";
import { appendSheetRecords, findSheetRecord, readAllSheetRecords, upsertSheetRecord, writeSheetRows } from "./sheets.server";

type Client = SupabaseClient<Database>;
type Row = DbRegistrationRow & { id: string };

/** An error whose message is meant for the visitor and must not trigger the backup path. */
export class VisitorError extends Error {}

const NO_MATCH = "No registration matches these details. Please check your acknowledgement number, date of birth and state.";

async function admin() { return (await import("@/integrations/supabase/client.server")).supabaseAdmin; }
async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
}
function kycSecret() {
  const secret = process.env["EDUCATION_KYC_ENCRYPTION_KEY"];
  if (!secret) throw new Error("Secure identity storage is unavailable. Please contact the Foundation team.");
  return secret;
}
async function encryptPrivate(p: EducationPrivateValues) {
  const { encryptDetails } = await import("./privacy.server");
  return encryptDetails({ bankHolder: p.bankHolder, bankName: p.bankName, bankAccount: p.bankAccount, bankIfsc: p.bankIfsc, aadhaarNumber: p.aadhaarNumber }, kycSecret());
}
async function bankLast4Of(ciphertext: string | null): Promise<string> {
  const secret = process.env["EDUCATION_KYC_ENCRYPTION_KEY"];
  if (!ciphertext || !secret) return "";
  try { const { decryptDetails } = await import("./privacy.server"); return (await decryptDetails(ciphertext, secret))["bankAccount"]?.slice(-4) ?? ""; } catch { return ""; }
}
async function coordinatorIdFor(client: Client, v: EducationCoreValues) {
  const code = v.withoutCoordinator ? "" : v.coordinatorCode.toUpperCase();
  if (!code) return null;
  const { data } = await client.from("coordinators").select("id").eq("referral_code", code).eq("active", true).maybeSingle();
  return data?.id ?? null;
}
const stateCodeOf = (state: string) => stateCodes.find(s => s.name.toLowerCase() === state.trim().toLowerCase())?.code ?? "00";
const random7 = () => crypto.getRandomValues(new Uint32Array(1))[0]! % 10_000_000;

/** Coordinator details for a referral code: RILOYD staff (BDE/BDM or CRM employee) first, then registered coordinators. */
export async function referralCoordinator(db: Client, rawCode: string): Promise<{ code: string; name: string; mobile: string; email: string; type: string } | null> {
  const code = rawCode.trim().toUpperCase();
  if (!/^[A-Z0-9-]{2,40}$/.test(code)) return null;
  const staff = (await db.from("education_staff_access").select("user_id, referral_code").eq("active", true).ilike("referral_code", code)).data?.find(s => s.referral_code.toUpperCase() === code);
  const employee = staff ? null : (await db.from("crm_employee_profiles").select("user_id, employee_code").ilike("employee_code", code)).data?.find(e => e.employee_code.toUpperCase() === code);
  const userId = staff?.user_id ?? employee?.user_id;
  if (userId) {
    const { data: profile } = await db.from("crm_employee_profiles").select("full_name, phone").eq("user_id", userId).maybeSingle();
    const { data: user } = await db.auth.admin.getUserById(userId);
    return { code, name: profile?.full_name ?? "", mobile: profile?.phone ?? "", email: user?.user?.email ?? "", type: "RILOYD Employee" };
  }
  const { data: c } = await db.from("coordinators").select("full_name, phone, email").eq("active", true).eq("referral_code", code).maybeSingle();
  return c ? { code, name: c.full_name, mobile: c.phone, email: c.email, type: "Other" } : null;
}

/** Full form values with empty strings for everything not yet entered. */
function withBlanks(values: Partial<Record<string, unknown>>): Record<FormFieldKey, string | boolean> {
  const v = emptyRecord().values;
  for (const k of formFieldKeys) { const x = values[k]; if (typeof x === "string" || typeof x === "boolean") v[k] = x; }
  v.nationality = v.nationality || "Indian";
  return v;
}

/** Step 1: save basic details and issue the acknowledgement number (database first, Google Sheet always). */
export async function startRegistration(basic: EducationBasicValues) {
  const { limitSubmission } = await import("../submissions.server");
  await limitSubmission(basic.email, { failOpen: true });
  const now = new Date();
  const receiptHash = await sha256Hex(Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16)).join(""));
  const values = withBlanks(basic);
  let referral: Awaited<ReturnType<typeof referralCoordinator>> = null;
  let saved: { ack_number: string; created_at: string } | null = null;
  try {
    const db = await admin();
    if (basic.coordinatorCode) {
      referral = await referralCoordinator(db, basic.coordinatorCode).catch(() => null);
      if (referral) Object.assign(values, { withoutCoordinator: false, coordinatorCode: referral.code, coordinatorName: referral.name, coordinatorMobile: referral.mobile, coordinatorEmail: referral.email, coordinatorType: referral.type });
    }
    const columns = valuesToDbColumns(values as unknown as EducationCoreValues, now);
    const { data, error } = await db.from("education_support_registrations").insert({
      ...columns, declarations: {}, guardian_consent_at: null, form_status: "started",
      coordinator_id: referral ? await coordinatorIdFor(db, values as unknown as EducationCoreValues) : null,
      receipt_token_hash: receiptHash,
    }).select("ack_number, created_at").single();
    if (error || !data) throw error ?? new Error("No row returned");
    saved = data;
  } catch (e) {
    console.error("Education registration could not be saved in the database; using the Google Sheet backup.", e);
  }
  const ackNumber = saved?.ack_number ?? backupAckNumber(now, stateCodeOf(basic.state), random7());
  const fee = applicationTypes[basic.applicationType as ApplicationType].fee;
  const record = buildSheetRecord(values, {
    ackNumber, submittedAt: istTimestamp(saved ? new Date(saved.created_at) : now), savedInDatabase: saved ? "Yes" : "Backup only", formStatus: "Started",
    fee: String(fee), declarations: "No", receiptHash,
  });
  try { await appendSheetRecords([record]); }
  catch (e) {
    console.error("Education registration could not be copied to the Google Sheet.", e);
    if (!saved) throw new Error("Your registration could not be saved. Please try again in a few minutes.");
  }
  return { ackNumber, createdAt: saved?.created_at ?? now.toISOString(), fee, applicationType: basic.applicationType as ApplicationType, values };
}

export async function savePaymentReference(data: { verify: EducationLookup; reference: string }) {
  const { limitSubmission } = await import("../submissions.server");
  await limitSubmission(`pay:${data.verify.ackNumber}`, { failOpen: true });
  const found = await locate(data.verify);
  const bad = new VisitorError("This registration could not be updated. Please contact the Foundation team with your acknowledgement number.");
  if (found.source === "database") {
    const db = await admin();
    const { data: rows, error } = await db.from("education_support_registrations")
      .update({ payment_reference: data.reference, payment_reference_at: new Date().toISOString(), payment_status: "reference_submitted" })
      .eq("id", found.row.id).in("payment_status", ["pending", "reference_submitted"]).select(`id, ${dbRegistrationColumns}`);
    if (error?.code === "23505") throw new VisitorError("This transaction ID has already been used for another registration. Each payment ID can be used only once — please check your Razorpay receipt.");
    if (error) throw new Error("The payment ID could not be saved. Please try again.");
    const row = rows?.[0] as Row | undefined;
    if (!row) throw bad;
    if (row.form_status === "completed") {
      try { const { refreshEducationChecks } = await import("./checks.server"); await refreshEducationChecks(db, row.id, { ai: false }); }
      catch (e) { console.error("Education checks after payment ID failed", e); }
    }
    try { await syncRowToSheet(row); } catch (e) { console.error("Payment ID could not be copied to the Google Sheet.", e); }
    return { ok: true };
  }
  const { record } = found.sheet;
  if (!["pending", "reference_submitted", ""].includes(record.meta.paymentStatus)) throw bad;
  record.meta.paymentReference = data.reference;
  record.meta.paymentStatus = "reference_submitted";
  try { await writeSheetRows([found.sheet]); } catch { throw new Error("The payment ID could not be saved. Please try again."); }
  return { ok: true };
}

async function syncRowToSheet(row: Row, edit?: { at: Date; by: string }) {
  const record = dbRowToSheetRecord(row, { bankLast4: await bankLast4Of(row.private_details_ciphertext), ...(edit ? { editedAt: edit.at, editedBy: edit.by } : {}) });
  await upsertSheetRecord(record);
}

const sameState = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
type Located = { source: "database"; row: Row } | { source: "sheet"; sheet: NonNullable<Awaited<ReturnType<typeof findSheetRecord>>> };

/** Find a registration by acknowledgement number, mobile and date of birth: database first, then the Google Sheet. */
async function locate(verify: EducationLookup): Promise<Located> {
  let dbReachable = false;
  try {
    const db = await admin();
    const { data, error } = await db.from("education_support_registrations").select(`id, ${dbRegistrationColumns}`).eq("ack_number", verify.ackNumber).maybeSingle();
    if (error) throw error;
    dbReachable = true;
    if (data) {
      const row = data as Row;
      if (String(row.date_of_birth).slice(0, 10) === verify.dateOfBirth && sameState(row.state, verify.state)) return { source: "database", row };
      throw new VisitorError(NO_MATCH);
    }
  } catch (e) {
    if (e instanceof VisitorError) throw e;
    console.error("Registration lookup in the database failed; trying the Google Sheet.", e);
  }
  let found: Awaited<ReturnType<typeof findSheetRecord>>;
  try { found = await findSheetRecord(verify.ackNumber); }
  catch { throw new Error(dbReachable ? NO_MATCH : "Registrations cannot be opened right now. Please try again in a few minutes."); }
  if (!found || found.record.values.dateOfBirth !== verify.dateOfBirth || !sameState(String(found.record.values.state), verify.state)) throw new VisitorError(NO_MATCH);
  return { source: "sheet", sheet: found };
}

const editableValues = (values: Record<FormFieldKey, string | boolean>) => ({ ...values, confirmAccurate: false, agreeTerms: false, consentVerification: false, authorizeContact: false, understandFees: false });

export async function lookupForEdit(verify: EducationLookup) {
  const { limitSubmission } = await import("../submissions.server");
  await limitSubmission(`edit:${verify.ackNumber}`, { failOpen: true });
  const found = await locate(verify);
  const paymentStatus = found.source === "database" ? found.row.payment_status : found.sheet.record.meta.paymentStatus || "pending";
  const blocker = editBlocker(paymentStatus, "student");
  if (blocker) throw new VisitorError(blocker);
  const values = found.source === "database" ? dbRowToValues(found.row) : found.sheet.record.values;
  const formStatus = found.source === "database" ? found.row.form_status : /^completed$/i.test(found.sheet.record.meta.formStatus) ? "completed" : "started";
  const hasPrivateDetails = found.source === "database" ? Boolean(found.row.private_details_ciphertext) : Boolean(found.sheet.record.meta.privateCiphertext);
  return { ackNumber: verify.ackNumber, paymentStatus, formStatus, hasPrivateDetails, source: found.source, applicationType: String(values.applicationType) as ApplicationType, fee: applicationTypes[String(values.applicationType) as ApplicationType]?.fee ?? 0, values: editableValues(values) };
}

/** Saves what the student has entered so far (database; Google Sheet only if the database is unavailable). */
export async function saveProgress(verify: EducationLookup, raw: Record<string, unknown>) {
  const basic = educationBasicSchema.parse({ ...raw, coordinatorCode: typeof raw["coordinatorCode"] === "string" ? raw["coordinatorCode"] : "" });
  const values = { ...withBlanks(raw), ...basic };
  const found = await locate(verify);
  const now = new Date();
  if (found.source === "database") {
    const row = found.row;
    const blocker = editBlocker(row.payment_status, "student") ?? applicationTypeChangeBlocker(row.application_type, basic.applicationType, row.payment_status, "student");
    if (blocker) throw new VisitorError(blocker);
    const db = await admin();
    const columns = valuesToDbColumns(values as unknown as EducationCoreValues, now);
    const { declarations: _d, ...rest } = columns;
    const { error } = await db.from("education_support_registrations").update({ ...rest, guardian_consent_at: row.guardian_consent_at, updated_at: now.toISOString() }).eq("id", row.id).neq("payment_status", "paid");
    if (!error) return { ok: true, verify: { ackNumber: verify.ackNumber, dateOfBirth: basic.dateOfBirth, state: basic.state } };
    console.error("Progress could not be saved in the database; trying the Google Sheet.", error);
  }
  const sheet = found.source === "sheet" ? found.sheet : await findSheetRecord(verify.ackNumber).catch(() => null);
  if (!sheet) throw new Error("Your progress could not be saved. Please try again.");
  const blocker = editBlocker(sheet.record.meta.paymentStatus || "pending", "student") ?? applicationTypeChangeBlocker(String(sheet.record.values.applicationType), basic.applicationType, sheet.record.meta.paymentStatus || "pending", "student");
  if (blocker) throw new VisitorError(blocker);
  const next = buildSheetRecord(values, { ...sheet.record.meta, editedAt: istTimestamp(now), editedBy: "Student", fee: String(applicationTypes[basic.applicationType as ApplicationType].fee) });
  try { await writeSheetRows([{ ...sheet, record: next }]); } catch { throw new Error("Your progress could not be saved. Please try again."); }
  return { ok: true, verify: { ackNumber: verify.ackNumber, dateOfBirth: basic.dateOfBirth, state: basic.state } };
}

/** Final submission (also used to save later edits): all steps must be complete. */
export async function saveFullRegistration(verify: EducationLookup, core: EducationCoreValues, priv: EducationPrivateValues | null) {
  const { limitSubmission } = await import("../submissions.server");
  await limitSubmission(`edit:${verify.ackNumber}`, { failOpen: true });
  const found = await locate(verify);
  const actor: EditActor = "student";
  const now = new Date();
  if (found.source === "database") {
    if (!priv && !found.row.private_details_ciphertext) throw new VisitorError("Please enter your bank and Aadhaar details.");
    const db = await admin();
    return updateDatabaseRow(db, db, found.row, core, priv, actor, now);
  }
  const { record } = found.sheet;
  if (!priv && !record.meta.privateCiphertext) throw new VisitorError("Please enter your bank and Aadhaar details.");
  const paymentStatus = record.meta.paymentStatus || "pending";
  const blocker = editBlocker(paymentStatus, actor) ?? applicationTypeChangeBlocker(String(record.values.applicationType), core.applicationType, paymentStatus, actor);
  if (blocker) throw new VisitorError(blocker);
  const next: SheetRecord = buildSheetRecord(core as unknown as Record<FormFieldKey, string | boolean>, { ...record.meta, formStatus: "Completed", declarations: "Yes", editedAt: istTimestamp(now), editedBy: "Student", fee: String(applicationTypes[core.applicationType as ApplicationType].fee) });
  if (priv) { next.meta.privateCiphertext = await encryptPrivate(priv); next.meta.bankLast4 = priv.bankAccount.slice(-4); next.meta.aadhaarLast4 = priv.aadhaarNumber.slice(-4); }
  try { await writeSheetRows([{ ...found.sheet, record: next }]); }
  catch { throw new Error("Your registration could not be saved. Please try again in a few minutes."); }
  return { ackNumber: verify.ackNumber, paymentStatus, fee: applicationTypes[core.applicationType as ApplicationType].fee, applicationType: core.applicationType as ApplicationType, createdAt: record.meta.submittedAt };
}

/** `client` performs the update (admin session or service role); `lookup` resolves coordinator codes. */
async function updateDatabaseRow(client: Client, lookup: Client, row: Row, core: EducationCoreValues, priv: EducationPrivateValues | null, actor: EditActor, now: Date) {
  const blocker = editBlocker(row.payment_status, actor) ?? applicationTypeChangeBlocker(row.application_type, core.applicationType, row.payment_status, actor);
  if (blocker) throw new VisitorError(blocker);
  const update = {
    ...valuesToDbColumns(core, now), coordinator_id: await coordinatorIdFor(lookup, core), updated_at: now.toISOString(),
    form_status: "completed", ...(row.form_status === "completed" ? {} : { completed_at: now.toISOString() }),
    ...(priv ? { private_details_ciphertext: await encryptPrivate(priv), aadhaar_last_four: priv.aadhaarNumber.slice(-4) } : {}),
  };
  let q = client.from("education_support_registrations").update(update).eq("id", row.id);
  if (actor === "student") q = q.neq("payment_status", "paid");
  const { data, error } = await q.select(`id, ${dbRegistrationColumns}`);
  if (error || !data?.length) { console.error("Education registration update failed", error); throw new Error("Your changes could not be saved. Please try again."); }
  const updated = data[0] as Row;
  try { const { refreshEducationChecks } = await import("./checks.server"); await refreshEducationChecks(client, row.id, { ai: false }); }
  catch (e) { console.error("Education checks after edit failed", e); }
  try { await syncRowToSheet(updated, { at: now, by: actor === "admin" ? "Admin" : "Student" }); }
  catch (e) { console.error("Edited registration could not be copied to the Google Sheet.", e); }
  return { ackNumber: updated.ack_number, paymentStatus: updated.payment_status, fee: updated.registration_fee, applicationType: updated.application_type as ApplicationType, createdAt: updated.created_at };
}

export async function getForAdmin(client: Client, id: string) {
  const { data, error } = await client.from("education_support_registrations").select(`id, ${dbRegistrationColumns}`).eq("id", id).single();
  if (error || !data) throw new Error("Registration not found.");
  const row = data as Row;
  return { ackNumber: row.ack_number, paymentStatus: row.payment_status, values: { ...dbRowToValues(row), confirmAccurate: true, agreeTerms: true, consentVerification: true, authorizeContact: true, understandFees: true } };
}

export async function updateFromAdmin(client: Client, id: string, core: EducationCoreValues, priv: EducationPrivateValues | null) {
  const { data, error } = await client.from("education_support_registrations").select(`id, ${dbRegistrationColumns}`).eq("id", id).single();
  if (error || !data) throw new Error("Registration not found.");
  return updateDatabaseRow(client, await admin(), data as Row, core, priv, "admin", new Date());
}

/** Two-way catch-up: backup-only sheet rows go into the database, and database rows missing from the sheet are added to it. */
export async function syncWithSheet() {
  const db = await admin();
  const sheetRows = await readAllSheetRecords();
  const dbAcks = new Set<string>();
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from("education_support_registrations").select("ack_number").order("created_at").range(from, from + 999);
    if (error) throw new Error("The database could not be read. Please try again.");
    for (const r of data ?? []) dbAcks.add(r.ack_number);
    if (!data || data.length < 1000) break;
  }
  const marked: typeof sheetRows = [];
  const skipped: { ackNumber: string; reason: string }[] = [];
  let imported = 0;
  const seen = new Set<string>();
  for (const s of sheetRows) {
    const ack = s.record.meta.ackNumber;
    if (seen.has(ack)) continue;
    seen.add(ack);
    if (dbAcks.has(ack)) { if (s.record.meta.savedInDatabase !== "Yes") marked.push({ ...s, record: { ...s.record, meta: { ...s.record.meta, savedInDatabase: "Yes" } } }); continue; }
    if (!isBackupAck(ack)) { skipped.push({ ackNumber: ack, reason: "Not a backup number and not found in the database." }); continue; }
    const parsed = educationCoreSchema.safeParse({ ...s.record.values, confirmAccurate: true, agreeTerms: true, consentVerification: true, authorizeContact: true, understandFees: true });
    if (!parsed.success) { skipped.push({ ackNumber: ack, reason: parsed.error.issues[0]?.message ?? "Invalid details in the sheet." }); continue; }
    if (!s.record.meta.receiptHash || !/^[a-f0-9]{64}$/.test(s.record.meta.receiptHash)) { skipped.push({ ackNumber: ack, reason: "Receipt check column is missing or was changed." }); continue; }
    const createdAt = new Date(s.record.meta.submittedAt);
    const created = Number.isNaN(createdAt.getTime()) ? new Date() : createdAt;
    const pay = ["pending", "reference_submitted"].includes(s.record.meta.paymentStatus) ? s.record.meta.paymentStatus : "pending";
    const { data: inserted, error } = await db.from("education_support_registrations").insert({
      ...valuesToDbColumns(parsed.data, created), ack_number: ack, created_at: created.toISOString(),
      coordinator_id: await coordinatorIdFor(db, parsed.data), receipt_token_hash: s.record.meta.receiptHash,
      private_details_ciphertext: s.record.meta.privateCiphertext || null, aadhaar_last_four: s.record.meta.aadhaarLast4 || null,
      payment_status: pay, payment_reference: pay === "reference_submitted" ? s.record.meta.paymentReference || null : null,
    }).select("id").single();
    if (error || !inserted) { skipped.push({ ackNumber: ack, reason: error?.code === "23505" ? "Payment ID already used by another registration." : "The database refused this row." }); continue; }
    imported++;
    try { const { refreshEducationChecks } = await import("./checks.server"); await refreshEducationChecks(db, inserted.id, { ai: false }); } catch (e) { console.error("Checks after sheet import failed", e); }
    marked.push({ ...s, record: { ...s.record, meta: { ...s.record.meta, savedInDatabase: "Yes" } } });
  }
  await writeSheetRows(marked);

  const missing = [...dbAcks].filter(a => !seen.has(a));
  let appended = 0;
  for (let i = 0; i < missing.length; i += 100) {
    const { data } = await db.from("education_support_registrations").select(`id, ${dbRegistrationColumns}`).in("ack_number", missing.slice(i, i + 100)).order("created_at");
    const records = await Promise.all(((data ?? []) as Row[]).map(async r => dbRowToSheetRecord(r, { bankLast4: await bankLast4Of(r.private_details_ciphertext) })));
    await appendSheetRecords(records);
    appended += records.length;
  }
  return { imported, appended, skipped };
}
