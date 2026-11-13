import { describe, expect, it } from "vitest";
import { backupAckNumber, fromSheetRow, isBackupAck, sheetHeaders, toSheetRow } from "./sheet";
import { buildSheetRecord } from "./record-mapping";
import { applicationTypeChangeBlocker, editBlocker } from "./editing";
import { ackNumberPattern, educationBasicSchema, educationLookupSchema, eduStepKeys, firstDetailsStep } from "./rules";
import { isZohoCheckoutUrl, normalizePaymentLink, paymentIdFromSearch, readPaymentMessage, readStoredPaymentId, youngInnovatorsPaymentKey, zohoPrefillUrl, PAYMENT_MESSAGE_TYPE } from "../payment-options";

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
  it("accepts the Zoho Checkout embed code and keeps only its https page address", () => {
    const code = '<iframe width="768" height="998" src="https://zohosecurepay.in/checkout/ue370226-iwkpgy8mqbvm2/Registration-Fee-Payment-for-education-sponsorship" style="border:none;"></iframe>';
    expect(normalizePaymentLink(code)).toBe("https://zohosecurepay.in/checkout/ue370226-iwkpgy8mqbvm2/Registration-Fee-Payment-for-education-sponsorship");
    expect(normalizePaymentLink("")).toBeNull();
    expect(normalizePaymentLink('<iframe src="javascript:alert(1)"></iframe>')).toBeUndefined();
    expect(normalizePaymentLink("http://zohosecurepay.in/checkout/x")).toBeUndefined();
  });
  it("only Zoho Checkout pages are shown inside the form", () => {
    expect(isZohoCheckoutUrl("https://zohosecurepay.in/checkout/abc")).toBe(true);
    expect(isZohoCheckoutUrl("https://zohosecurepay.in.evil.com/checkout/abc")).toBe(false);
    expect(isZohoCheckoutUrl("https://rzp.io/rzp/Qxq0Jnp")).toBe(false);
  });
  it("pre-fills the Zoho page with the student's name, email and mobile", () => {
    const u = new URL(zohoPrefillUrl("https://zohosecurepay.in/checkout/abc", { name: "Asha Kumari Verma", email: "a@example.com", mobile: "9876543210" }));
    expect(u.searchParams.get("first_name")).toBe("Asha");
    expect(u.searchParams.get("last_name")).toBe("Kumari Verma");
    expect(u.searchParams.get("mobile")).toBe("9876543210");
  });
  it("reads the payment ID from the return address and ignores unsafe values", () => {
    expect(paymentIdFromSearch(new URLSearchParams("payment_id=2000000123456789"))).toBe("2000000123456789");
    expect(paymentIdFromSearch(new URLSearchParams("payment_id=<script>"))).toBeNull();
    expect(paymentIdFromSearch(new URLSearchParams(""))).toBeNull();
  });
  it("hands the payment ID to the form only from our own message format and for 2 hours", () => {
    expect(readPaymentMessage({ type: PAYMENT_MESSAGE_TYPE, paymentId: "2000000123456789" })).toBe("2000000123456789");
    expect(readPaymentMessage({ type: "other", paymentId: "2000000123456789" })).toBeNull();
    const now = 1_000_000_000_000;
    expect(readStoredPaymentId(JSON.stringify({ id: "2000000123456789", at: now - 60_000 }), now)).toBe("2000000123456789");
    expect(readStoredPaymentId(JSON.stringify({ id: "2000000123456789", at: now - 3 * 60 * 60 * 1000 }), now)).toBeNull();
  });
  it("Young Innovators uses the fee band for the student's class", () => {
    expect(youngInnovatorsPaymentKey(7)).toBe("young_innovators_6_8");
    expect(youngInnovatorsPaymentKey(10)).toBe("young_innovators_9_10");
    expect(youngInnovatorsPaymentKey(12)).toBe("young_innovators_11_12");
    expect(youngInnovatorsPaymentKey(5)).toBeNull();
  });
});
