// Browser-safe conversions between form values, database rows and Google Sheet records.
import { applicationTypes, isMinor, type ApplicationType, type EducationCoreValues } from "./rules";
import { emptyRecord, formFieldKeys, istTimestamp, type FormFieldKey, type SheetMeta, type SheetRecord } from "./sheet";

type Json = Record<string, unknown>;
export type DbRegistrationRow = {
  ack_number: string; created_at: string; student_category: string; education: unknown; education_sector: string | null;
  student_name: string; father_name: string; mother_name: string; date_of_birth: string; gender: string; nationality: string;
  mobile: string; whatsapp: string | null; email: string; permanent_address: string; current_address: string; state: string; district: string; city: string; pin_code: string;
  guardian_name: string | null; guardian_mobile: string | null; guardian_email: string | null; guardian_relationship: string | null; guardian_consent_at: string | null;
  without_coordinator: boolean; coordinator: unknown; coordinator_code: string | null; application_type: string; registration_fee: number;
  payment_status: string; payment_reference: string | null; receipt_token_hash: string; form_status: string; private_details_ciphertext: string | null; aadhaar_last_four: string | null;
};
export const dbRegistrationColumns = "ack_number, created_at, student_category, education, education_sector, student_name, father_name, mother_name, date_of_birth, gender, nationality, mobile, whatsapp, email, permanent_address, current_address, state, district, city, pin_code, guardian_name, guardian_mobile, guardian_email, guardian_relationship, guardian_consent_at, without_coordinator, coordinator, coordinator_code, application_type, registration_fee, payment_status, payment_reference, receipt_token_hash, form_status, private_details_ciphertext, aadhaar_last_four";

const str = (v: unknown) => (v === null || v === undefined ? "" : String(v));

/** Form values (without bank/Aadhaar or declarations) from a stored database row. */
export function dbRowToValues(row: DbRegistrationRow): Record<FormFieldKey, string | boolean> {
  const e = (row.education && typeof row.education === "object" ? row.education : {}) as Json;
  const c = (row.coordinator && typeof row.coordinator === "object" ? row.coordinator : {}) as Json;
  const v = emptyRecord().values;
  for (const k of ["currentClass", "schoolName", "schoolType", "schoolBoard", "schoolAddress", "schoolCity", "schoolState", "schoolPin", "courseName", "courseSpecialization", "collegeName", "enrollmentNumber", "currentYear", "currentSemester", "studyMode", "collegeState", "collegeCity", "academicSession"] as const) v[k] = str(e[k]);
  Object.assign(v, {
    studentCategory: row.student_category, applicationType: row.application_type, educationSector: str(row.education_sector),
    studentName: row.student_name, fatherName: row.father_name, motherName: row.mother_name, dateOfBirth: str(row.date_of_birth).slice(0, 10), gender: row.gender, nationality: row.nationality,
    mobile: row.mobile, whatsapp: str(row.whatsapp), email: row.email, permanentAddress: row.permanent_address, currentAddress: row.current_address,
    state: row.state, district: row.district, city: row.city, pinCode: row.pin_code,
    guardianName: str(row.guardian_name), guardianMobile: str(row.guardian_mobile), guardianEmail: str(row.guardian_email), guardianRelationship: str(row.guardian_relationship), guardianConsent: Boolean(row.guardian_consent_at),
    withoutCoordinator: row.without_coordinator,
    coordinatorName: str(c["name"]), coordinatorMobile: str(c["mobile"]), coordinatorWhatsapp: str(c["whatsapp"]), coordinatorEmail: str(c["email"]), coordinatorType: str(c["type"]), coordinatorInstitution: str(c["institution"]), coordinatorIdText: str(c["coordinatorId"]),
    coordinatorCode: str(row.coordinator_code),
  });
  return v;
}

/** Database columns for the non-private part of a registration. */
export function valuesToDbColumns(v: EducationCoreValues, now: Date = new Date()) {
  const school = v.studentCategory === "school";
  const minor = isMinor(v.dateOfBirth, now);
  const code = v.withoutCoordinator ? "" : v.coordinatorCode.toUpperCase();
  const education = school
    ? { currentClass: v.currentClass, schoolName: v.schoolName, schoolType: v.schoolType, schoolBoard: v.schoolBoard, schoolAddress: v.schoolAddress, schoolCity: v.schoolCity, schoolState: v.schoolState, schoolPin: v.schoolPin, academicSession: v.academicSession }
    : { courseName: v.courseName, courseSpecialization: v.courseSpecialization, collegeName: v.collegeName, enrollmentNumber: v.enrollmentNumber, currentYear: v.currentYear, currentSemester: v.currentSemester, studyMode: v.studyMode, collegeState: v.collegeState, collegeCity: v.collegeCity, academicSession: v.academicSession };
  return {
    student_category: v.studentCategory, current_class: school ? v.currentClass : null, course_name: school ? null : v.courseName,
    education_sector: v.educationSector || null, institution_name: school ? v.schoolName : v.collegeName, education,
    student_name: v.studentName, father_name: v.fatherName, mother_name: v.motherName, date_of_birth: v.dateOfBirth,
    gender: v.gender, nationality: v.nationality, mobile: v.mobile, whatsapp: v.whatsapp || null, email: v.email,
    permanent_address: v.permanentAddress, current_address: v.currentAddress, state: v.state, district: v.district, city: v.city, pin_code: v.pinCode,
    is_minor: minor,
    guardian_name: v.guardianName || null, guardian_mobile: v.guardianMobile || null, guardian_email: v.guardianEmail || null, guardian_relationship: v.guardianRelationship || null,
    guardian_consent_at: minor && v.guardianConsent ? now.toISOString() : null,
    without_coordinator: v.withoutCoordinator,
    coordinator: v.withoutCoordinator ? {} : { name: v.coordinatorName, mobile: v.coordinatorMobile, whatsapp: v.coordinatorWhatsapp, email: v.coordinatorEmail, type: v.coordinatorType, institution: v.coordinatorInstitution, coordinatorId: v.coordinatorIdText },
    coordinator_code: code || null,
    application_type: v.applicationType, registration_fee: applicationTypes[v.applicationType as ApplicationType].fee,
    declarations: { confirmAccurate: true, agreeTerms: true, consentVerification: true, authorizeContact: true, understandFees: true, kycConsent: true, guardianConsent: minor ? v.guardianConsent : null, at: now.toISOString() },
  };
}

export function buildSheetRecord(values: Partial<Record<FormFieldKey, string | boolean>>, meta: Partial<SheetMeta> & Pick<SheetMeta, "ackNumber">): SheetRecord {
  const r = emptyRecord();
  for (const k of formFieldKeys) if (values[k] !== undefined) r.values[k] = values[k]!;
  if (r.values.withoutCoordinator === true) for (const k of ["coordinatorName", "coordinatorMobile", "coordinatorWhatsapp", "coordinatorEmail", "coordinatorType", "coordinatorInstitution", "coordinatorIdText", "coordinatorCode"] as const) r.values[k] = "";
  const type = String(r.values.applicationType) as ApplicationType;
  r.meta = { ...r.meta, declarations: "Yes", fee: applicationTypes[type] ? String(applicationTypes[type].fee) : "", paymentStatus: "pending", ...meta };
  return r;
}

export function dbRowToSheetRecord(row: DbRegistrationRow, extra: { bankLast4?: string; editedAt?: Date; editedBy?: string } = {}): SheetRecord {
  return buildSheetRecord(dbRowToValues(row), {
    ackNumber: row.ack_number, submittedAt: istTimestamp(new Date(row.created_at)), savedInDatabase: "Yes",
    formStatus: row.form_status === "completed" ? "Completed" : "Started", declarations: row.form_status === "completed" ? "Yes" : "No",
    paymentStatus: row.payment_status, paymentReference: str(row.payment_reference), fee: String(row.registration_fee),
    aadhaarLast4: str(row.aadhaar_last_four), bankLast4: extra.bankLast4 ?? "", privateCiphertext: str(row.private_details_ciphertext), receiptHash: row.receipt_token_hash,
    ...(extra.editedAt ? { editedAt: istTimestamp(extra.editedAt), editedBy: extra.editedBy ?? "" } : {}),
  });
}
