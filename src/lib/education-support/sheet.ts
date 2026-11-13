// Browser-safe Google Sheet backup layout for Education Support registrations.
// Columns are matched by header text, so the owner may reorder columns in the sheet.

export const SHEET_TAB = "Responses";

export const formFieldKeys = [
  "studentCategory", "applicationType",
  "currentClass", "schoolName", "schoolType", "schoolBoard", "schoolAddress", "schoolCity", "schoolState", "schoolPin",
  "courseName", "courseSpecialization", "collegeName", "enrollmentNumber", "currentYear", "currentSemester", "studyMode", "collegeState", "collegeCity",
  "educationSector", "academicSession",
  "studentName", "fatherName", "motherName", "dateOfBirth", "gender", "nationality", "mobile", "whatsapp", "email",
  "permanentAddress", "currentAddress", "state", "district", "city", "pinCode",
  "guardianName", "guardianMobile", "guardianEmail", "guardianRelationship", "guardianConsent",
  "withoutCoordinator", "coordinatorName", "coordinatorMobile", "coordinatorWhatsapp", "coordinatorEmail", "coordinatorType", "coordinatorInstitution", "coordinatorIdText", "coordinatorCode",
] as const;
export type FormFieldKey = (typeof formFieldKeys)[number];
export const boolFormFields: readonly FormFieldKey[] = ["guardianConsent", "withoutCoordinator"];

export type SheetMeta = {
  ackNumber: string; submittedAt: string; savedInDatabase: "Yes" | "Backup only"; editedAt: string; editedBy: string;
  paymentStatus: string; paymentReference: string; fee: string;
  bankLast4: string; aadhaarLast4: string; declarations: string; privateCiphertext: string; receiptHash: string;
};
export type SheetRecord = { meta: SheetMeta; values: Record<FormFieldKey, string | boolean> };

const metaHead: [keyof SheetMeta, string][] = [
  ["ackNumber", "Acknowledgement No"], ["submittedAt", "Submitted At"], ["savedInDatabase", "Saved In Database"],
  ["editedAt", "Last Edited At"], ["editedBy", "Edited By"], ["paymentStatus", "Payment Status"], ["paymentReference", "Payment ID"], ["fee", "Registration Fee (Rs)"],
];
const metaTail: [keyof SheetMeta, string][] = [
  ["bankLast4", "Bank Account (last 4)"], ["aadhaarLast4", "Aadhaar (last 4)"], ["declarations", "Declarations Accepted"],
  ["privateCiphertext", "Encrypted Bank & Aadhaar (do not edit)"], ["receiptHash", "Receipt Check (do not edit)"],
];
const fieldHeaders: Record<FormFieldKey, string> = {
  studentCategory: "Student Category", applicationType: "Apply For",
  currentClass: "Current Class", schoolName: "School Name", schoolType: "School Type", schoolBoard: "School Board", schoolAddress: "School Address", schoolCity: "School City", schoolState: "School State", schoolPin: "School PIN Code",
  courseName: "Course Name", courseSpecialization: "Course Specialization", collegeName: "College / University", enrollmentNumber: "Enrollment No", currentYear: "Current Year", currentSemester: "Current Semester", studyMode: "Study Mode", collegeState: "College State", collegeCity: "College City",
  educationSector: "Education Sector", academicSession: "Academic Session",
  studentName: "Student Name", fatherName: "Father's Name", motherName: "Mother's Name", dateOfBirth: "Date of Birth", gender: "Gender", nationality: "Nationality", mobile: "Mobile", whatsapp: "WhatsApp", email: "Email",
  permanentAddress: "Permanent Address", currentAddress: "Current Address", state: "State", district: "District", city: "City", pinCode: "PIN Code",
  guardianName: "Guardian Name", guardianMobile: "Guardian Mobile", guardianEmail: "Guardian Email", guardianRelationship: "Guardian Relationship", guardianConsent: "Guardian Consent",
  withoutCoordinator: "Without Coordinator", coordinatorName: "Coordinator Name", coordinatorMobile: "Coordinator Mobile", coordinatorWhatsapp: "Coordinator WhatsApp", coordinatorEmail: "Coordinator Email", coordinatorType: "Coordinator Type", coordinatorInstitution: "Coordinator Institution", coordinatorIdText: "Coordinator ID", coordinatorCode: "Coordinator Code",
};

type Column = { header: string } & ({ meta: keyof SheetMeta } | { field: FormFieldKey });
export const sheetColumns: Column[] = [
  ...metaHead.map(([meta, header]) => ({ header, meta })),
  ...formFieldKeys.map(field => ({ header: fieldHeaders[field], field })),
  ...metaTail.map(([meta, header]) => ({ header, meta })),
];
export const sheetHeaders = () => sheetColumns.map(c => c.header);

const cell = (c: Column, r: SheetRecord): string => {
  if ("meta" in c) return r.meta[c.meta] ?? "";
  const v = r.values[c.field];
  return typeof v === "boolean" ? (v ? "Yes" : "No") : (v ?? "");
};

/** Row cells in the order of `header` (the sheet's actual first row). Unknown headers are left empty. */
export function toSheetRow(record: SheetRecord, header: string[] = sheetHeaders()): string[] {
  const byHeader = new Map(sheetColumns.map(c => [c.header.trim().toLowerCase(), c]));
  return header.map(h => { const c = byHeader.get(h.trim().toLowerCase()); return c ? cell(c, record) : ""; });
}

export function emptyRecord(): SheetRecord {
  const values = {} as Record<FormFieldKey, string | boolean>;
  for (const k of formFieldKeys) values[k] = boolFormFields.includes(k) ? false : "";
  const meta = {} as SheetMeta;
  for (const [k] of [...metaHead, ...metaTail]) (meta as Record<string, string>)[k] = "";
  meta.savedInDatabase = "Backup only";
  return { meta, values };
}

export function fromSheetRow(header: string[], row: (string | number | boolean | undefined)[]): SheetRecord {
  const r = emptyRecord();
  const byHeader = new Map(sheetColumns.map(c => [c.header.trim().toLowerCase(), c]));
  header.forEach((h, i) => {
    const c = byHeader.get(String(h).trim().toLowerCase());
    if (!c) return;
    const raw = row[i] === undefined || row[i] === null ? "" : String(row[i]).trim();
    if ("meta" in c) { (r.meta as Record<string, string>)[c.meta] = raw; return; }
    r.values[c.field] = boolFormFields.includes(c.field) ? /^(yes|true|1)$/i.test(raw) : raw;
  });
  if (r.meta.savedInDatabase !== "Yes") r.meta.savedInDatabase = "Backup only";
  return r;
}

/** 1 -> A, 27 -> AA */
export function columnLetter(n: number): string {
  let s = ""; let x = n;
  while (x > 0) { const m = (x - 1) % 26; s = String.fromCharCode(65 + m) + s; x = Math.floor((x - 1) / 26); }
  return s;
}

/** Backup acknowledgement: "B" + YYMMDD (India time) + 2-digit state code + 7 random digits. Never collides with 15-digit database numbers. */
export function backupAckNumber(now: Date, stateCode: string, random7: number): string {
  if (!/^\d{2}$/.test(stateCode) || !Number.isInteger(random7) || random7 < 0 || random7 > 9_999_999) throw new Error("Invalid backup acknowledgement values");
  const ist = new Date(now.getTime() + 330 * 60_000);
  const yymmdd = ist.toISOString().slice(2, 10).replaceAll("-", "");
  return `B${yymmdd}${stateCode}${String(random7).padStart(7, "0")}`;
}
export const isBackupAck = (ack: string) => /^B\d{15}$/.test(ack);

/** India time ISO-like text that `new Date()` can read back. */
export function istTimestamp(d: Date): string {
  return new Date(d.getTime() + 330 * 60_000).toISOString().slice(0, 19) + "+05:30";
}
