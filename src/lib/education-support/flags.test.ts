import { describe, expect, it } from "vitest";
import { approvalBlocker, computeRuleFlags, namesMatch, type FlagInput } from "./flags";
import { formatAcknowledgement } from "./numbering";

const clean: FlagInput = {
  studentName: "Rahul Kumar", fatherName: "Suresh Kumar", motherName: "Sunita Devi", guardianName: null, bankHolder: "RAHUL KUMAR",
  studentCategory: "school", currentClass: "10", courseName: null, dateOfBirth: "2011-05-01", registeredOn: new Date("2026-11-13"),
  applicationType: "scholarship_25k", registrationFee: 249, paymentStatus: "paid", paymentReference: "pay_QA1234567890AB",
  withoutCoordinator: false, coordinatorCode: "RIL-BDE01", coordinatorNameEntered: "Amit Sharma", codeOwnerName: "Amit Sharma",
};
const fields = (v: Partial<FlagInput>) => computeRuleFlags({ ...clean, ...v }).map(f => `${f.field}:${f.severity}`);

describe("Education Support mismatch flags", () => {
  it("raises no flag for a consistent paid registration", () => expect(computeRuleFlags(clean)).toEqual([]));
  it("matches names ignoring case and initials", () => { expect(namesMatch("R. Kumar", "Rahul Kumar")).toBe(true); expect(namesMatch("Rahul Kr", "Rahul Kumar")).toBe(true); expect(namesMatch("Rohit Singh", "Rahul Kumar")).toBe(false); });
  it("flags a bank holder that matches nobody as high", () => expect(fields({ bankHolder: "Vikas Yadav" })).toContain("name:high"));
  it("flags a parent's bank account as medium", () => expect(fields({ bankHolder: "Suresh Kumar" })).toEqual(["name:medium"]));
  it("flags age 25 in Class 4 as a class mismatch", () => expect(fields({ currentClass: "4", dateOfBirth: "2001-01-01" })).toContain("class:high"));
  it("accepts age 15 in Class 10", () => expect(fields({ currentClass: "10", dateOfBirth: "2011-05-01" })).not.toContain("class:medium"));
  it("flags a ₹149 fee recorded for the ₹249 scholarship", () => expect(fields({ registrationFee: 149 })).toContain("payment:high"));
  it("flags paid without a transaction ID as high", () => expect(fields({ paymentReference: null })).toContain("payment:high"));
  it("accepts a Zoho payment ID as-is once payment is confirmed", () => expect(fields({ paymentReference: "2000000123456789" })).not.toContain("payment:medium"));
  it("asks admins to check Zoho while a payment ID awaits confirmation", () => expect(fields({ paymentReference: "2000000123456789", paymentStatus: "reference_submitted" })).toContain("payment:medium"));
  it("flags a coordinator code that belongs to nobody as high", () => expect(fields({ codeOwnerName: null })).toEqual(["coordinator:high"]));
  it("flags a code whose owner differs from the entered coordinator name", () => expect(fields({ coordinatorNameEntered: "Neha Gupta" })).toEqual(["coordinator:medium"]));
  it("flags a named coordinator with no code", () => expect(fields({ coordinatorCode: "" })).toEqual(["coordinator:medium"]));
  it("ignores coordinator checks when registering without a coordinator", () => expect(fields({ withoutCoordinator: true, codeOwnerName: null })).toEqual([]));
});

describe("Education Support approval gate", () => {
  it("blocks approval before payment is confirmed", () => expect(approvalBlocker({ payment_status: "reference_submitted", flags_checked_at: "x", flags_confirmed_at: "x" })).not.toBeNull());
  it("blocks approval until a person confirms the check", () => expect(approvalBlocker({ payment_status: "paid", flags_checked_at: "x", flags_confirmed_at: null })).not.toBeNull());
  it("allows approval after payment and human confirmation", () => expect(approvalBlocker({ payment_status: "paid", flags_checked_at: "x", flags_confirmed_at: "y" })).toBeNull());
});

describe("Acknowledgement number format", () => {
  it("builds YYMMDD + state + district + 5-digit series", () => expect(formatAcknowledgement("261113", "13", "01", 1)).toBe("261113130100001"));
  it("rejects series above 99999", () => expect(() => formatAcknowledgement("261113", "13", "01", 100000)).toThrow());
});
