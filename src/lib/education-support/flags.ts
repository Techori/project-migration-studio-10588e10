import { ageOn, applicationTypes, type ApplicationType } from "./rules";

// Browser-safe mismatch rules for Education Support registrations. The server runs them
// (with the decrypted bank holder name) and stores the result; admin reads the stored flags.

export const flagFields = ["name", "class", "payment", "coordinator"] as const;
export type FlagField = (typeof flagFields)[number];
export const flagFieldLabels: Record<FlagField, string> = { name: "Name", class: "Class / course", payment: "Payment", coordinator: "Coordinator code" };
export type ReviewFlag = { field: FlagField; severity: "high" | "medium"; message: string; source: "rule" | "ai" };

export type FlagInput = {
  studentName: string; fatherName: string; motherName: string; guardianName?: string | null;
  /** Decrypted bank account holder; null when not available (older registrations). */
  bankHolder: string | null;
  studentCategory: string; currentClass: string | null; courseName: string | null;
  dateOfBirth: string; registeredOn: Date;
  applicationType: string; registrationFee: number;
  paymentStatus: string; paymentReference: string | null;
  withoutCoordinator: boolean; coordinatorCode: string | null; coordinatorNameEntered: string;
  /** Name of the active employee / coordinator the code belongs to; null when the code matches nobody. */
  codeOwnerName: string | null;
};

const honorifics = new Set(["mr", "mrs", "ms", "miss", "shri", "sri", "smt", "kumari", "km", "dr", "md", "mohd"]);
const aliases: Record<string, string> = { kr: "kumar", mohd: "mohammad", md: "mohammad", mohammed: "mohammad", muhammad: "mohammad" };

export function nameTokens(name: string | null | undefined): string[] {
  return (name ?? "").toLowerCase().replace(/[^a-z\u0900-\u097f\s]/g, " ").split(/\s+/)
    .filter(Boolean).map(t => aliases[t] ?? t).filter(t => !honorifics.has(t) || t === "mohammad");
}

/** True when every word of the shorter name appears in the other (initials allowed), e.g. "R. Kumar" ~ "Rahul Kumar". */
export function namesMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  const x = nameTokens(a), y = nameTokens(b);
  if (!x.length || !y.length) return false;
  const [short, long] = x.length <= y.length ? [x, y] : [y, x];
  const pool = [...long];
  for (const t of short) {
    const i = pool.findIndex(p => p === t || (t.length === 1 && p.startsWith(t)) || (p.length === 1 && t.startsWith(p)));
    if (i < 0) return false;
    pool.splice(i, 1);
  }
  return true;
}

/** Usual age range for an Indian school class: class 4 is about 9 years old. */
export function expectedAgeRange(schoolClass: number): [number, number] { return [schoolClass + 3, schoolClass + 8]; }

export const razorpayPaymentId = /^pay_[A-Za-z0-9]{10,20}$/;

export function computeRuleFlags(v: FlagInput): ReviewFlag[] {
  const flags: ReviewFlag[] = [];
  const add = (field: FlagField, severity: ReviewFlag["severity"], message: string) => flags.push({ field, severity, message, source: "rule" });

  // Name
  if (/\d/.test(v.studentName)) add("name", "high", "Student name contains numbers.");
  if (nameTokens(v.studentName).length < 2) add("name", "medium", "Only one word given for the student name; check the full name.");
  if (namesMatch(v.studentName, v.fatherName) && nameTokens(v.studentName).length === nameTokens(v.fatherName).length) add("name", "medium", "Student name is the same as the father's name.");
  if (namesMatch(v.studentName, v.motherName) && nameTokens(v.studentName).length === nameTokens(v.motherName).length) add("name", "medium", "Student name is the same as the mother's name.");
  if (v.bankHolder === null) add("name", "medium", "Bank account holder name is not available to compare.");
  else if (!namesMatch(v.bankHolder, v.studentName)) {
    const parent = [v.fatherName, v.motherName, v.guardianName ?? ""].find(p => p && namesMatch(v.bankHolder, p));
    if (parent) add("name", "medium", `Bank account is in a parent/guardian's name (${v.bankHolder}), not the student's.`);
    else add("name", "high", `Bank account holder "${v.bankHolder}" does not match the student or parent names.`);
  }

  // Class / course against age at registration
  const age = /^\d{4}-\d{2}-\d{2}$/.test(v.dateOfBirth) ? ageOn(v.dateOfBirth, v.registeredOn) : null;
  if (v.studentCategory === "school") {
    const c = Number(v.currentClass);
    if (!Number.isInteger(c) || c < 4 || c > 12) add("class", "high", `School class "${v.currentClass ?? "—"}" is outside Class 4–12.`);
    else if (age !== null) {
      const [min, max] = expectedAgeRange(c);
      if (age < min || age > max) add("class", age < min - 2 || age > max + 3 ? "high" : "medium", `Age ${age} is unusual for Class ${c} (usually ${min}–${max}).`);
    }
    if (v.courseName) add("class", "medium", "A college course is filled in for a school student.");
  } else {
    if (v.currentClass) add("class", "medium", "A school class is filled in for a college student.");
    if (age !== null && v.studentCategory === "ug" && age < 16) add("class", "high", `Age ${age} is unusual for an undergraduate course.`);
    if (age !== null && v.studentCategory === "pg" && age < 19) add("class", "high", `Age ${age} is unusual for a postgraduate course.`);
  }

  // Payment
  const expected = applicationTypes[v.applicationType as ApplicationType]?.fee;
  if (expected === undefined) add("payment", "high", `Unknown application type "${v.applicationType}".`);
  else if (expected !== v.registrationFee) add("payment", "high", `Recorded fee ₹${v.registrationFee} does not match the ₹${expected} fee for this application.`);
  const ref = v.paymentReference?.trim() ?? "";
  if (!ref) add("payment", v.paymentStatus === "paid" ? "high" : "medium", v.paymentStatus === "paid" ? "Marked paid but no transaction ID was given." : "No payment transaction ID received yet.");
  if (v.paymentStatus === "failed") add("payment", "high", "Payment is marked as failed.");
  if (ref && v.paymentStatus === "reference_submitted") add("payment", "medium", "Transaction ID received; check it in Zoho Checkout payments before marking the payment confirmed.");

  // Coordinator code
  if (!v.withoutCoordinator) {
    const code = v.coordinatorCode?.trim() ?? "";
    if (!code) add("coordinator", "medium", "A coordinator is named but no coordinator / employee code was entered, so the lead is unassigned.");
    else if (v.codeOwnerName === null) add("coordinator", "high", `Code "${code}" does not belong to any active employee or coordinator.`);
    else if (v.coordinatorNameEntered && !namesMatch(v.coordinatorNameEntered, v.codeOwnerName)) add("coordinator", "medium", `Code "${code}" belongs to ${v.codeOwnerName}, but the form names "${v.coordinatorNameEntered}".`);
  }
  return flags;
}

export function flagCounts(flags: ReviewFlag[]) {
  return { high: flags.filter(f => f.severity === "high").length, medium: flags.filter(f => f.severity === "medium").length };
}

/** Approval needs confirmed payment and a person's confirmation of the latest check. */
export function approvalBlocker(r: { payment_status: string; flags_checked_at: string | null; flags_confirmed_at: string | null }): string | null {
  if (r.payment_status !== "paid") return "Confirm the payment first.";
  if (!r.flags_checked_at) return "Run the mismatch check first.";
  if (!r.flags_confirmed_at) return "A person must confirm the mismatch check first.";
  return null;
}
