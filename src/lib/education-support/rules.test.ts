import { describe, expect, it } from "vitest";
import { applicationTypes, educationSupportSchema, isMinor, registrationFee, stepErrors, stepFields } from "./rules";
import { indianStates, pgCourses, ugCourses, educationSectors } from "./catalog";
import { formatAcknowledgement, stateCodes, canApprove } from './numbering';

const adult = {
  bankHolder: 'Test Student', bankName: 'Test Bank', bankAccount: '123456789012', bankAccountConfirm: '123456789012', bankIfsc: 'SBIN0001234', aadhaarNumber: '234567890123', kycConsent: true,
  studentCategory: "ug", currentClass: "", schoolName: "", schoolType: "", schoolBoard: "", schoolAddress: "", schoolCity: "", schoolState: "", schoolPin: "",
  courseName: "BSc Physics", courseSpecialization: "", collegeName: "Jiwaji University", enrollmentNumber: "", currentYear: "2nd", currentSemester: "", studyMode: "Regular", collegeState: "Madhya Pradesh", collegeCity: "Gwalior",
  educationSector: "Research & Development", academicSession: "2026-27",
  studentName: "Test Student", fatherName: "Father", motherName: "Mother", dateOfBirth: "2005-01-15", gender: "Female", nationality: "Indian",
  mobile: "9876543210", whatsapp: "", email: "student@example.com", permanentAddress: "House 1, Lashkar", currentAddress: "House 1, Lashkar", state: "Madhya Pradesh", district: "Gwalior", city: "Gwalior", pinCode: "474001",
  guardianName: "", guardianMobile: "", guardianEmail: "", guardianRelationship: "", guardianConsent: false,
  withoutCoordinator: true, coordinatorName: "", coordinatorMobile: "", coordinatorWhatsapp: "", coordinatorEmail: "", coordinatorType: "", coordinatorInstitution: "", coordinatorIdText: "", coordinatorCode: "",
  applicationType: "scholarship_25k", confirmAccurate: true, agreeTerms: true, consentVerification: true, authorizeContact: true, understandFees: true,
};

describe("Education Support fees and links", () => {
  it("charges ₹149 for sponsorship", () => expect(registrationFee("sponsorship")).toBe(149));
  it("charges ₹249 for scholarship up to ₹25,000", () => expect(registrationFee("scholarship_25k")).toBe(249));
  it("charges ₹599 for scholarship up to ₹50,000", () => expect(registrationFee("scholarship_50k")).toBe(599));
  it("uses the supplied Razorpay link for each fee", () => {
    expect(applicationTypes.sponsorship.paymentLink).toBe("https://zohosecurepay.in/checkout/ue370226-iwkpgy8mqbvm2/Registration-Fee-Payment-for-education-sponsorship");
    expect(applicationTypes.scholarship_25k.paymentLink).toBe("https://zohosecurepay.in/checkout/uzxpyffh-d7okgf40jw34j/Registration-Fee--for-UP-TO-25k-scholarship--Rs-625-is-Other-charges-are-applicable-to-all");
    expect(applicationTypes.scholarship_50k.paymentLink).toBe("https://zohosecurepay.in/checkout/qbalg555-ynvcdu67k9osk/Registration-Fee--for-UP-TO-50k-scholarship--Rs-1525-is-Other-charges-are-applicable-to-all");
  });
});

describe("Education Support registration rules", () => {
  it("accepts a complete adult UG registration", () => expect(educationSupportSchema.safeParse(adult).success).toBe(true));
  it("requires guardian details and consent for students under 18", () => {
    const minor = { ...adult, dateOfBirth: "2014-06-01" };
    expect(isMinor("2014-06-01", new Date("2026-11-13"))).toBe(true);
    expect(educationSupportSchema.safeParse(minor).success).toBe(false);
    expect(educationSupportSchema.safeParse({ ...minor, guardianName: "Parent", guardianMobile: "9876500000", guardianRelationship: "Mother", guardianConsent: true }).success).toBe(true);
  });
  it("requires coordinator details unless registering without one", () => {
    expect(educationSupportSchema.safeParse({ ...adult, withoutCoordinator: false }).success).toBe(false);
    expect(educationSupportSchema.safeParse({ ...adult, withoutCoordinator: false, coordinatorName: "Coordinator", coordinatorMobile: "9876511111", coordinatorType: "College Coordinator" }).success).toBe(true);
  });
  it("only allows school classes 4 to 12", () => {
    const school = { ...adult, studentCategory: "school", schoolName: "Govt School", schoolType: "Government", schoolBoard: "CBSE", schoolAddress: "Main Road", schoolCity: "Gwalior", schoolState: "Madhya Pradesh", schoolPin: "474001", educationSector: "" };
    expect(educationSupportSchema.safeParse({ ...school, currentClass: "3" }).success).toBe(false);
    expect(educationSupportSchema.safeParse({ ...school, currentClass: "4" }).success).toBe(true);
  });
  it("requires every declaration", () => expect(educationSupportSchema.safeParse({ ...adult, understandFees: false }).success).toBe(false));
  it("checks one step without needing later steps", () => {
    const fresh = { ...adult, confirmAccurate: false, applicationType: "" };
    expect(stepErrors(fresh, stepFields[0] ?? [])).toEqual({});
    expect(Object.keys(stepErrors({ ...fresh, collegeName: "" }, stepFields[0] ?? []))).toEqual(["collegeName"]);
  });
});

describe('Acknowledgement and verification rules', () => {
  it('uses YYMMDD + state + district + five digit global serial', () => expect(formatAcknowledgement('261113', '13', '01', 1)).toBe('261113130100001'));
  it('supports the final serial 99999 and refuses 100000', () => { expect(formatAcknowledgement('261114', '13', '01', 99999)).toBe('261114130199999'); expect(() => formatAcknowledgement('261114', '13', '01', 100000)).toThrow(); });
  it('keeps all 36 state/UT codes in the existing list order', () => { expect(stateCodes[0]).toEqual({ name: 'Andhra Pradesh', code: '01' }); expect(stateCodes[35]).toEqual({ name: 'Puducherry', code: '36' }); });
  it('allows approval only after payment is confirmed', () => { expect(canApprove('paid')).toBe(true); expect(canApprove('reference_submitted')).toBe(false); expect(canApprove('pending')).toBe(false); });
  it('requires full Aadhaar and matching bank details', () => { expect(educationSupportSchema.safeParse({ ...adult, aadhaarNumber: '0123' }).success).toBe(false); expect(educationSupportSchema.safeParse({ ...adult, bankAccountConfirm: '999999999' }).success).toBe(false); });
});

describe("Education Support lists", () => {
  it("has at least 150 UG and 150 PG courses", () => { expect(ugCourses.length).toBeGreaterThanOrEqual(150); expect(pgCourses.length).toBeGreaterThanOrEqual(150); });
  it("has 40 education sectors and all 36 states/UTs", () => { expect(educationSectors).toHaveLength(40); expect(indianStates).toHaveLength(36); });
});
