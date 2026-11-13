// Saves Education Support registrations to the database and the Google Sheet backup.
// If the database is unavailable, the sheet still receives the registration with a backup acknowledgement number.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { applicationTypes, educationCoreSchema, type ApplicationType, type EducationCoreValues, type EducationLookup, type EducationPrivateValues } from "./rules";
import { stateCodes } from "./numbering";
import { backupAckNumber, istTimestamp, isBackupAck, type FormFieldKey, type SheetRecord } from "./sheet";
import { applicationTypeChangeBlocker, editBlocker, sameMobile, type EditActor } from "./editing";
import { buildSheetRecord, dbRegistrationColumns, dbRowToSheetRecord, dbRowToValues, valuesToDbColumns, type DbRegistrationRow } from "./record-mapping";
import { appendSheetRecords, findSheetRecord, readAllSheetRecords, upsertSheetRecord, writeSheetRows } from "./sheets.server";

type Client = SupabaseClient<Database>;
type Row = DbRegistrationRow & { id: string };

/** An error whose message is meant for the visitor and must not trigger the backup path. */
export class VisitorError extends Error {}

const NO_MATCH = "No registration matches these details. Please check your acknowledgement number, mobile number and date of birth.";

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

export async function saveNewRegistration(v: EducationCoreValues & EducationPrivateValues) {
  const { limitSubmission } = await import("../submissions.server");
  await limitSubmission(v.email, { failOpen: true });
  const now = new Date();
  const privateCiphertext = await encryptPrivate(v);
  const receiptToken = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, "0")).join("");
  const receiptHash = await sha256Hex(receiptToken);
  const columns = valuesToDbColumns(v, now);

  let saved: { ack_number: string; created_at: string } | null = null;
  try {
    const db = await admin();
    const coordinatorId = await coordinatorIdFor(db, v);
    const { ruleFlagsFor } = await import("./checks.server");
    const checkedAt = now.toISOString();
    const { flags } = await ruleFlagsFor(db, {
      student_name: v.studentName, father_name: v.fatherName, mother_name: v.motherName, guardian_name: v.guardianName || null,
      student_category: v.studentCategory, current_class: columns.current_class, course_name: columns.course_name, date_of_birth: v.dateOfBirth, created_at: checkedAt,
      application_type: v.applicationType, registration_fee: columns.registration_fee, payment_status: "pending", payment_reference: null,
      without_coordinator: v.withoutCoordinator, coordinator_code: columns.coordinator_code, coordinator: { name: v.coordinatorName },
    }, v.bankHolder);
    const { data, error } = await db.from("education_support_registrations").insert({
      ...columns, coordinator_id: coordinatorId, review_flags: flags, flags_checked_at: checkedAt,
      receipt_token_hash: receiptHash, private_details_ciphertext: privateCiphertext, aadhaar_last_four: v.aadhaarNumber.slice(-4),
    }).select("ack_number, created_at").single();
    if (error || !data) throw error ?? new Error("No row returned");
    saved = data;
  } catch (e) {
    console.error("Education registration could not be saved in the database; using the Google Sheet backup.", e);
  }

  const ackNumber = saved?.ack_number ?? backupAckNumber(now, stateCodeOf(v.state), random7());
  const record = buildSheetRecord(v as unknown as Record<FormFieldKey, string | boolean>, {
    ackNumber, submittedAt: istTimestamp(saved ? new Date(saved.created_at) : now), savedInDatabase: saved ? "Yes" : "Backup only",
    fee: String(columns.registration_fee), bankLast4: v.bankAccount.slice(-4), aadhaarLast4: v.aadhaarNumber.slice(-4), privateCiphertext, receiptHash,
  });
  try { await appendSheetRecords([record]); }
  catch (e) {
    console.error("Education registration could not be copied to the Google Sheet.", e);
    if (!saved) throw new Error("Your registration could not be saved. Please try again in a few minutes.");
  }
  return {
    ackNumber, createdAt: saved?.created_at ?? now.toISOString(), receiptToken, fee: columns.registration_fee,
    applicationType: v.applicationType as ApplicationType, coordinatorName: v.withoutCoordinator ? "" : v.coordinatorName,
  };
}

export async function savePaymentReference(data: { ackNumber: string; receiptToken: string; reference: string }) {
  const { limitSubmission } = await import("../submissions.server");
  await limitSubmission(data.ackNumber, { failOpen: true });
  const hash = await sha256Hex(data.receiptToken);
  let savedRow: Row | null = null;
  let dbReachable = false;
  try {
    const db = await admin();
    const { data: rows, error } = await db.from("education_support_registrations")
      .update({ payment_reference: data.reference, payment_reference_at: new Date().toISOString(), payment_status: "reference_submitted" })
      .eq("ack_number", data.ackNumber).eq("receipt_token_hash", hash).in("payment_status", ["pending", "reference_submitted"])
      .select(`id, ${dbRegistrationColumns}`);
    if (error?.code === "23505") throw new VisitorError("This transaction ID has already been used for another registration. Each payment ID can be used only once — please check your Razorpay receipt.");
    if (error) throw error;
    dbReachable = true;
    savedRow = (rows?.[0] as Row | undefined) ?? null;
    if (savedRow) {
      try { const { refreshEducationChecks } = await import("./checks.server"); await refreshEducationChecks(db, savedRow.id, { ai: false }); }
      catch (e) { console.error("Education checks after payment ID failed", e); }
    }
  } catch (e) {
    if (e instanceof VisitorError) throw e;
    console.error("Payment ID could not be saved in the database; trying the Google Sheet backup.", e);
  }
  if (savedRow) {
    try { await syncRowToSheet(savedRow); } catch (e) { console.error("Payment ID could not be copied to the Google Sheet.", e); }
    return { ok: true };
  }
  if (dbReachable && !isBackupAck(data.ackNumber)) throw new VisitorError("This registration could not be updated. Please contact the Foundation team with your acknowledgement number.");
  let found: Awaited<ReturnType<typeof findSheetRecord>>;
  try { found = await findSheetRecord(data.ackNumber); }
  catch { throw new Error("The payment ID could not be saved. Please try again."); }
  if (!found || found.record.meta.receiptHash !== hash || !["pending", "reference_submitted", ""].includes(found.record.meta.paymentStatus)) {
    throw new VisitorError("This registration could not be updated. Please contact the Foundation team with your acknowledgement number.");
  }
  found.record.meta.paymentReference = data.reference;
  found.record.meta.paymentStatus = "reference_submitted";
  try { await writeSheetRows([found]); } catch { throw new Error("The payment ID could not be saved. Please try again."); }
  return { ok: true };
}

async function syncRowToSheet(row: Row, edit?: { at: Date; by: string }) {
  const record = dbRowToSheetRecord(row, { bankLast4: await bankLast4Of(row.private_details_ciphertext), ...(edit ? { editedAt: edit.at, editedBy: edit.by } : {}) });
  await upsertSheetRecord(record);
}

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
      if (sameMobile(row.mobile, verify.mobile) && String(row.date_of_birth).slice(0, 10) === verify.dateOfBirth) return { source: "database", row };
      throw new VisitorError(NO_MATCH);
    }
  } catch (e) {
    if (e instanceof VisitorError) throw e;
    console.error("Registration lookup in the database failed; trying the Google Sheet.", e);
  }
  let found: Awaited<ReturnType<typeof findSheetRecord>>;
  try { found = await findSheetRecord(verify.ackNumber); }
  catch { throw new Error(dbReachable ? NO_MATCH : "Registrations cannot be opened right now. Please try again in a few minutes."); }
  if (!found || !sameMobile(String(found.record.values.mobile), verify.mobile) || found.record.values.dateOfBirth !== verify.dateOfBirth) throw new VisitorError(NO_MATCH);
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
  return { ackNumber: verify.ackNumber, paymentStatus, source: found.source, values: editableValues(values) };
}

export async function updateFromStudent(verify: EducationLookup, core: EducationCoreValues, priv: EducationPrivateValues | null) {
  const { limitSubmission } = await import("../submissions.server");
  await limitSubmission(`edit:${verify.ackNumber}`, { failOpen: true });
  const found = await locate(verify);
  const actor: EditActor = "student";
  const now = new Date();
  if (found.source === "database") {
    const db = await admin();
    return updateDatabaseRow(db, db, found.row, core, priv, actor, now);
  }
  const { record } = found.sheet;
  const paymentStatus = record.meta.paymentStatus || "pending";
  const blocker = editBlocker(paymentStatus, actor) ?? applicationTypeChangeBlocker(String(record.values.applicationType), core.applicationType, paymentStatus, actor);
  if (blocker) throw new VisitorError(blocker);
  const next: SheetRecord = buildSheetRecord(core as unknown as Record<FormFieldKey, string | boolean>, { ...record.meta, editedAt: istTimestamp(now), editedBy: "Student", fee: String(applicationTypes[core.applicationType as ApplicationType].fee) });
  if (priv) { next.meta.privateCiphertext = await encryptPrivate(priv); next.meta.bankLast4 = priv.bankAccount.slice(-4); next.meta.aadhaarLast4 = priv.aadhaarNumber.slice(-4); }
  try { await writeSheetRows([{ ...found.sheet, record: next }]); }
  catch { throw new Error("Your changes could not be saved. Please try again in a few minutes."); }
  return { ackNumber: verify.ackNumber, paymentStatus, fee: applicationTypes[core.applicationType as ApplicationType].fee, applicationType: core.applicationType as ApplicationType };
}

/** `client` performs the update (admin session or service role); `lookup` resolves coordinator codes. */
async function updateDatabaseRow(client: Client, lookup: Client, row: Row, core: EducationCoreValues, priv: EducationPrivateValues | null, actor: EditActor, now: Date) {
  const blocker = editBlocker(row.payment_status, actor) ?? applicationTypeChangeBlocker(row.application_type, core.applicationType, row.payment_status, actor);
  if (blocker) throw new VisitorError(blocker);
  const update = {
    ...valuesToDbColumns(core, now), coordinator_id: await coordinatorIdFor(lookup, core), updated_at: now.toISOString(),
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
  return { ackNumber: updated.ack_number, paymentStatus: updated.payment_status, fee: updated.registration_fee, applicationType: updated.application_type as ApplicationType };
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
