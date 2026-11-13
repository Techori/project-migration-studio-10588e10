import { describe, expect, it } from "vitest";
import { backupAckNumber, fromSheetRow, isBackupAck, sheetHeaders, toSheetRow } from "./sheet";
import { buildSheetRecord } from "./record-mapping";
import { applicationTypeChangeBlocker, editBlocker } from "./editing";
import { ackNumberPattern, educationBasicSchema, educationLookupSchema, eduStepKeys, firstDetailsStep } from "./rules";
import { parseRazorpayButtonId, youngInnovatorsPaymentKey } from "../payment-options";

describe("Google Sheet backup", () => {
  it("keeps the acknowledgement number and form answers when written and read back", () => {
    const record = buildSheetRecord({ studentName: "Asha Verma", mobile: "9876543210", state: "Bihar", withoutCoordinator: true }, { ackNumber: "261113040100001", formStatus: "Started" });
    const back = fromSheetRow(sheetHeaders(), toSheetRow(record));
    expect(back.meta.ackNumber).toBe("261113040100001");
    expect(back.values.studentName).toBe("Asha Verma");
    expect(back.values.withoutCoordinator).toBe(true);
  });
  it("reads columns by heading even after the owner reorders them", () => {
    const header = [...sheetHeaders()].reverse();
    const record = buildSheetRecord({ studentName: "Ravi" }, { ackNumber: "B261113040000123" });
    expect(fromSheetRow(header, toSheetRow(record, header)).values.studentName).toBe("Ravi");
  });
  it("never writes full bank account or Aadhaar numbers to the sheet", () => {
    const record = buildSheetRecord({ studentName: "Ravi", bankAccount: "123456789012", aadhaarNumber: "234567890123" } as never, { ackNumber: "261113040100001", bankLast4: "9012", aadhaarLast4: "0123" });
    const row = toSheetRow(record).join("|");
    expect(row).not.toContain("123456789012");
    expect(row).not.toContain("234567890123");
  });
  it("backup numbers start with B, carry India date and state code, and are accepted for reopening", () => {
    const ack = backupAckNumber(new Date("2026-11-13T20:00:00Z"), "04", 42);
    expect(ack).toBe("B261114040000042");
    expect(isBackupAck(ack)).toBe(true);
    expect(ackNumberPattern.test(ack)).toBe(true);
    expect(isBackupAck("261114040100001")).toBe(false);
  });
});

describe("Scholarship steps and reopening", () => {
  it("step 1 is basic details, step 2 payment, and reopening starts at step 3", () => {
    expect(eduStepKeys(false).slice(0, 3)).toEqual(["basic", "payment", "education"]);
    expect(firstDetailsStep).toBe(2);
    expect(eduStepKeys(true)).toContain("guardian");
    expect(eduStepKeys(false)).not.toContain("guardian");
  });
  it("reopening needs acknowledgement number, date of birth and state", () => {
    expect(educationLookupSchema.safeParse({ ackNumber: "261113040100001", dateOfBirth: "2010-05-01", state: "Bihar" }).success).toBe(true);
    expect(educationLookupSchema.safeParse({ ackNumber: "261113040100001", dateOfBirth: "2010-05-01", state: "" }).success).toBe(false);
    expect(educationLookupSchema.safeParse({ ackNumber: "261113040100001", state: "Bihar" }).success).toBe(false);
  });
  it("step 1 accepts only the basic set", () => {
    const ok = educationBasicSchema.safeParse({ studentName: "Asha Verma", dateOfBirth: "2010-05-01", mobile: "9876543210", email: "a@example.com", state: "Bihar", district: "Patna", studentCategory: "school", applicationType: "sponsorship" });
    expect(ok.success).toBe(true);
    expect(educationBasicSchema.safeParse({ studentName: "Asha Verma", dateOfBirth: "2010-05-01", mobile: "9876543210", email: "a@example.com", state: "Bihar", district: "", studentCategory: "school", applicationType: "sponsorship" }).success).toBe(false);
  });
});

describe("Editing limits", () => {
  it("students can edit until payment is confirmed; admins always", () => {
    expect(editBlocker("pending", "student")).toBeNull();
    expect(editBlocker("reference_submitted", "student")).toBeNull();
    expect(editBlocker("paid", "student")).not.toBeNull();
    expect(editBlocker("paid", "admin")).toBeNull();
  });
  it("students cannot change the fee type after sharing a payment ID", () => {
    expect(applicationTypeChangeBlocker("sponsorship", "scholarship_50k", "pending", "student")).toBeNull();
    expect(applicationTypeChangeBlocker("sponsorship", "scholarship_50k", "reference_submitted", "student")).not.toBeNull();
    expect(applicationTypeChangeBlocker("sponsorship", "scholarship_50k", "reference_submitted", "admin")).toBeNull();
  });
});

describe("Admin payment options", () => {
  it("accepts a Razorpay button ID or its full embed code", () => {
    expect(parseRazorpayButtonId("pl_ABC123xyz")).toBe("pl_ABC123xyz");
    expect(parseRazorpayButtonId('<form><script src="https://checkout.razorpay.com/v1/payment-button.js" data-payment_button_id="pl_QwErTy1234" async> </script> </form>')).toBe("pl_QwErTy1234");
    expect(parseRazorpayButtonId("")).toBeNull();
    expect(parseRazorpayButtonId("<script>alert(1)</script>")).toBeUndefined();
  });
  it("Young Innovators uses the fee band for the student's class", () => {
    expect(youngInnovatorsPaymentKey(7)).toBe("young_innovators_6_8");
    expect(youngInnovatorsPaymentKey(10)).toBe("young_innovators_9_10");
    expect(youngInnovatorsPaymentKey(12)).toBe("young_innovators_11_12");
    expect(youngInnovatorsPaymentKey(5)).toBeNull();
  });
});
