import { z } from "zod";
import { coordinatorTypes, educationSectors, genders, guardianRelationships, indianStates, schoolBoards, schoolClasses, schoolTypes, studyModes } from "./catalog";

// Browser-safe registration rules shared by the page, server functions, admin and tests.

export const applicationTypes = {
  sponsorship: { fee: 149, maxAward: null, paymentLink: "https://rzp.io/rzp/Qxq0Jnp", en: "For Sponsorship", hi: "स्पॉन्सरशिप के लिए" },
  scholarship_25k: { fee: 249, maxAward: 25000, paymentLink: "https://rzp.io/rzp/IO7EI7Q", en: "Scholarship up to ₹25,000", hi: "₹25,000 तक छात्रवृत्ति" },
  scholarship_50k: { fee: 599, maxAward: 50000, paymentLink: "https://rzp.io/rzp/6NAOBYdt", en: "Scholarship up to ₹50,000", hi: "₹50,000 तक छात्रवृत्ति" },
} as const;
export type ApplicationType = keyof typeof applicationTypes;
export const applicationTypeKeys = Object.keys(applicationTypes) as ApplicationType[];
export const registrationFee = (type: ApplicationType) => applicationTypes[type].fee;

export const studentCategories = ["school", "ug", "pg"] as const;
export type StudentCategory = (typeof studentCategories)[number];

export const registrationStatuses = ["submitted", "under_verification", "incomplete_documents", "verified", "eligible", "not_eligible", "selected", "not_selected"] as const;
export const paymentStatuses = ["pending", "reference_submitted", "paid", "failed"] as const;
export const paymentStatusLabels: Record<(typeof paymentStatuses)[number], string> = { pending: "Payment pending", reference_submitted: "Payment reference received", paid: "Payment confirmed", failed: "Payment failed" };
export const registrationStatusLabels: Record<(typeof registrationStatuses)[number], string> = { submitted: "Submitted", under_verification: "Under verification", incomplete_documents: "Incomplete documents", verified: "Verified", eligible: "Eligible", not_eligible: "Not eligible", selected: "Selected", not_selected: "Not selected" };

/** Age in whole years on `today` for an ISO date of birth. */
export function ageOn(dateOfBirth: string, today: Date = new Date()): number {
  const [y, m, d] = dateOfBirth.split("-").map(Number) as [number, number, number];
  let age = today.getFullYear() - y;
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age -= 1;
  return age;
}
export const isMinor = (dateOfBirth: string, today: Date = new Date()) => ageOn(dateOfBirth, today) < 18;

const text = (max = 120) => z.string().trim().max(max);
const required = (msg: string, max = 120) => z.string().trim().min(1, msg).max(max);
const mobile = z.string().trim().regex(/^(\+91[\s-]?)?[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number.");
const optionalMobile = z.string().trim().refine(v => v === "" || /^(\+91[\s-]?)?[6-9]\d{9}$/.test(v), "Enter a valid 10-digit Indian mobile number.");
const optionalEmail = z.string().trim().max(255).refine(v => v === "" || z.string().email().safeParse(v).success, "Enter a valid email address.");
const pin = z.string().trim().regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit PIN code.");
const oneOf = <T extends readonly [string, ...string[]]>(values: T, msg: string) => z.string().refine((v): v is T[number] => (values as readonly string[]).includes(v), msg);
const tick = (msg: string) => z.literal(true, { errorMap: () => ({ message: msg }) });

export const educationSupportBase = z.object({
  studentCategory: z.enum(studentCategories, { errorMap: () => ({ message: "Select a student category." }) }),
  // School
  currentClass: text(4), schoolName: text(160), schoolType: text(40), schoolBoard: text(40), schoolAddress: text(300), schoolCity: text(80), schoolState: text(80), schoolPin: text(6),
  // UG / PG
  courseName: text(160), courseSpecialization: text(160), collegeName: text(200), enrollmentNumber: text(60), currentYear: text(10), currentSemester: text(10), studyMode: text(20), collegeState: text(80), collegeCity: text(80),
  educationSector: text(80), academicSession: text(20),
  // Personal
  studentName: required("Enter the student's full name.", 100).pipe(z.string().min(2, "Enter the student's full name.")),
  fatherName: required("Enter the father's name.", 100), motherName: required("Enter the mother's name.", 100),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter the date of birth."),
  gender: oneOf(genders, "Select gender."), nationality: required("Enter nationality.", 60),
  mobile, whatsapp: optionalMobile, email: z.string().trim().email("Enter a valid email address.").max(255),
  permanentAddress: required("Enter the permanent address.", 300), currentAddress: required("Enter the current address.", 300),
  state: oneOf(indianStates, "Select a state."), district: required("Enter the district.", 80), city: required("Enter the city.", 80), pinCode: pin,
  // Guardian (required for minors)
  guardianName: text(100), guardianMobile: optionalMobile, guardianEmail: optionalEmail, guardianRelationship: text(40), guardianConsent: z.boolean(),
  // Coordinator
  withoutCoordinator: z.boolean(),
  coordinatorName: text(100), coordinatorMobile: optionalMobile, coordinatorWhatsapp: optionalMobile, coordinatorEmail: optionalEmail, coordinatorType: text(60), coordinatorInstitution: text(160), coordinatorIdText: text(60),
  coordinatorCode: z.string().trim().max(40).regex(/^[A-Za-z0-9-]*$/, "Coordinator code can contain only letters, numbers and dashes."),
  // Application
  applicationType: z.enum(applicationTypeKeys as [ApplicationType, ...ApplicationType[]], { errorMap: () => ({ message: "Select what you are applying for." }) }),
  bankHolder: required("Enter the account holder name.", 100),
  bankName: required("Enter the bank name.", 100),
  bankAccount: z.string().trim().regex(/^\d{9,18}$/, "Enter a valid 9–18 digit bank account number."),
  bankAccountConfirm: z.string().trim(),
  bankIfsc: z.string().trim().toUpperCase().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter a valid IFSC code."),
  aadhaarNumber: z.string().trim().regex(/^[2-9]\d{11}$/, "Enter the full 12-digit Aadhaar number."),
  kycConsent: tick("Please consent to secure bank and identity verification."),
  // Declarations
  confirmAccurate: tick("Please confirm the information is accurate."),
  agreeTerms: tick("Please agree to the registration terms."),
  consentVerification: tick("Please consent to document verification."),
  authorizeContact: tick("Please allow us to contact you."),
  understandFees: tick("Please confirm you understand the fee is separate from selection."),
});

type BaseValues = z.infer<typeof educationSupportBase>;

/** Category, age and coordinator rules; works on partial drafts so each step can be checked on its own. */
export function conditionalIssues(raw: Partial<Record<keyof BaseValues, unknown>>): { path: string; message: string }[] {
  const str = (k: keyof BaseValues) => (typeof raw[k] === "string" ? (raw[k] as string).trim() : "");
  const v = new Proxy({} as BaseValues, { get: (_t, k: string) => (typeof raw[k as keyof BaseValues] === "boolean" ? raw[k as keyof BaseValues] : str(k as keyof BaseValues)) });

  const issues: { path: string; message: string }[] = [];
  const need = (path: string, ok: boolean, message: string) => { if (!ok) issues.push({ path, message }); };
  if (v.studentCategory === "school") {
    need("currentClass", (schoolClasses as readonly string[]).includes(v.currentClass), "Select the current class (4–12).");
    need("schoolName", v.schoolName.length >= 2, "Enter the school name.");
    need("schoolType", (schoolTypes as readonly string[]).includes(v.schoolType), "Select the school type.");
    need("schoolBoard", (schoolBoards as readonly string[]).includes(v.schoolBoard), "Select the school board.");
    need("schoolAddress", v.schoolAddress.length >= 3, "Enter the school address.");
    need("schoolCity", v.schoolCity.length >= 2, "Enter the school city.");
    need("schoolState", (indianStates as readonly string[]).includes(v.schoolState), "Select the school state.");
    need("schoolPin", /^[1-9]\d{5}$/.test(v.schoolPin), "Enter a valid 6-digit PIN code.");
    need("educationSector", v.educationSector === "" || (educationSectors as readonly string[]).includes(v.educationSector), "Select a valid sector.");
  } else {
    need("educationSector", (educationSectors as readonly string[]).includes(v.educationSector), "Select the education sector.");
    need("courseName", v.courseName.length >= 2, "Select or type the course name.");
    need("collegeName", v.collegeName.length >= 2, "Enter the college / university name.");
    need("currentYear", v.currentYear.length > 0, "Select the current year.");
    need("studyMode", (studyModes as readonly string[]).includes(v.studyMode), "Select the study mode.");
    need("collegeState", (indianStates as readonly string[]).includes(v.collegeState), "Select the college state.");
    need("collegeCity", v.collegeCity.length >= 2, "Enter the college city.");
  }
  need("academicSession", /^\d{4}\s*[-–/]\s*\d{2,4}$/.test(v.academicSession), "Enter the academic session, e.g. 2026-27.");
  if (/^\d{4}-\d{2}-\d{2}$/.test(v.dateOfBirth)) {
    const age = ageOn(v.dateOfBirth);
    need("dateOfBirth", age >= 6 && age <= 60, "Please check the date of birth.");
    if (age < 18) {
      need("guardianName", v.guardianName.length >= 2, "Enter the parent/guardian name.");
      need("guardianMobile", v.guardianMobile.length > 0, "Enter the parent/guardian mobile number.");
      need("guardianRelationship", (guardianRelationships as readonly string[]).includes(v.guardianRelationship), "Select the relationship.");
      need("guardianConsent", v.guardianConsent, "Parent/guardian consent is required for students under 18.");
    }
  }
  if (!v.withoutCoordinator) {
    need("coordinatorName", v.coordinatorName.length >= 2, "Enter the coordinator's name, or tick 'registering without a coordinator'.");
    need("coordinatorMobile", v.coordinatorMobile.length > 0, "Enter the coordinator's mobile number.");
    need("coordinatorType", (coordinatorTypes as readonly string[]).includes(v.coordinatorType), "Select the coordinator type.");
  }

  return issues;
}

export const educationSupportSchema = educationSupportBase.superRefine((v, ctx) => {
  for (const i of conditionalIssues(v)) ctx.addIssue({ code: "custom", path: [i.path], message: i.message });
  if (v.bankAccount !== v.bankAccountConfirm) ctx.addIssue({ code: "custom", path: ["bankAccountConfirm"], message: "Bank account numbers do not match." });
});

/** First error message per field for the given step's fields. */
export function stepErrors(values: Record<string, unknown>, fields: string[]): Record<string, string> {
  const errors: Record<string, string> = {};
  const parsed = educationSupportBase.safeParse(values);
  const all = [...(parsed.success ? [] : parsed.error.issues.map(i => ({ path: String(i.path[0]), message: i.message }))), ...conditionalIssues(values as Partial<Record<keyof BaseValues, unknown>>)];
  for (const i of all) if (fields.includes(i.path) && !errors[i.path]) errors[i.path] = i.message;
  // Optional school/college fields are only checked by the conditional rules.
  return errors;
}

export type EducationSupportInput = z.input<typeof educationSupportSchema>;

/** Database numbers (15 digits), earlier SCH- references and Google Sheet backup numbers (B + 15 digits). */
export const ackNumberPattern = /^(\d{15}|SCH-\d{4}-\d{8}|B\d{15})$/;

export const privateFieldKeys = ["bankHolder", "bankName", "bankAccount", "bankAccountConfirm", "bankIfsc", "aadhaarNumber", "kycConsent"] as const;
const privateMask = { bankHolder: true, bankName: true, bankAccount: true, bankAccountConfirm: true, bankIfsc: true, aadhaarNumber: true, kycConsent: true } as const;

/** Everything except bank and Aadhaar details; used when editing without changing them. */
export const educationCoreSchema = educationSupportBase.omit(privateMask).superRefine((v, ctx) => {
  for (const i of conditionalIssues(v)) ctx.addIssue({ code: "custom", path: [i.path], message: i.message });
});
export type EducationCoreValues = z.infer<typeof educationCoreSchema>;
export const educationPrivateSchema = educationSupportBase.pick(privateMask).superRefine((v, ctx) => {
  if (v.bankAccount !== v.bankAccountConfirm) ctx.addIssue({ code: "custom", path: ["bankAccountConfirm"], message: "Bank account numbers do not match." });
});
export type EducationPrivateValues = z.infer<typeof educationPrivateSchema>;

/** What a student enters to open their registration for editing. */
export const educationLookupSchema = z.object({
  ackNumber: z.string().trim().toUpperCase().regex(ackNumberPattern, "Enter your acknowledgement number exactly as shown on your receipt."),
  mobile,
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter the date of birth."),
});
export type EducationLookup = z.infer<typeof educationLookupSchema>;

export const paymentReferenceSchema = z.object({
  ackNumber: z.string().trim().regex(ackNumberPattern, "Invalid acknowledgement number."),
  receiptToken: z.string().regex(/^[a-f0-9]{64}$/),
  reference: z.string().trim().regex(/^[A-Za-z0-9_-]{6,60}$/, "Enter the payment ID from your Razorpay receipt (e.g. pay_XXXXXXXX)."),
});

export const educationReviewSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(registrationStatuses).optional(),
  paymentStatus: z.enum(paymentStatuses).optional(),
  reason: z.string().trim().max(500).optional(),
  approvalStatus: z.enum(["pending", "approved", "rejected"]).optional(),
}).refine(v => v.status || v.paymentStatus || v.approvalStatus, "Nothing to update.");

/** Fields shown on each step, used to validate one step at a time. */
export const stepFields: string[][] = [
  ["studentCategory", "currentClass", "schoolName", "schoolType", "schoolBoard", "schoolAddress", "schoolCity", "schoolState", "schoolPin", "courseName", "courseSpecialization", "collegeName", "enrollmentNumber", "currentYear", "currentSemester", "studyMode", "collegeState", "collegeCity", "educationSector", "academicSession"],
  ["studentName", "fatherName", "motherName", "dateOfBirth", "gender", "nationality", "mobile", "whatsapp", "email", "permanentAddress", "currentAddress", "state", "district", "city", "pinCode"],
  ["guardianName", "guardianMobile", "guardianEmail", "guardianRelationship", "guardianConsent"],
  ["withoutCoordinator", "coordinatorName", "coordinatorMobile", "coordinatorWhatsapp", "coordinatorEmail", "coordinatorType", "coordinatorInstitution", "coordinatorIdText", "coordinatorCode"],
  ["applicationType"],
  ["confirmAccurate", "agreeTerms", "consentVerification", "authorizeContact", "understandFees"],
  ["bankHolder", "bankName", "bankAccount", "bankAccountConfirm", "bankIfsc", "aadhaarNumber", "kycConsent"],
];
