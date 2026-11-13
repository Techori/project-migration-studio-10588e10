import { describe, expect, it } from "vitest";
import { studentFee, studentFeeTotal, studentIdeaSchema, studentRegistrationSchema } from "./young-innovators-forms";

describe("Student participation rules", () => {
  it("charges Classes 6–8 249 plus 18 percent GST", () => { for (const c of [6, 7, 8]) { expect(studentFee(c)).toBe(249); expect(studentFeeTotal(c)).toBe(293.82); } });
  it("charges Classes 9–10 349 plus 18 percent GST", () => { for (const c of [9, 10]) { expect(studentFee(c)).toBe(349); expect(studentFeeTotal(c)).toBe(411.82); } });
  it("charges Classes 11–12 499 plus 18 percent GST", () => { for (const c of [11, 12]) { expect(studentFee(c)).toBe(499); expect(studentFeeTotal(c)).toBe(588.82); } });
  it("rejects classes outside 6–12", () => { expect(() => studentFee(5)).toThrow(); expect(() => studentFee(13)).toThrow(); });
  it("requires guardian approval for AI", () => { expect(studentIdeaSchema.safeParse({ schoolClass: 8, idea: "A low cost pencil organizer for students who lose their stationery.", customer: "School students", consent: false }).success).toBe(false); });
  it("requires guardian consent for registration", () => { const form = { studentName: "Test student", schoolClass: 8, city: "Gwalior", guardianName: "Test guardian", guardianEmail: "guardian@example.com", guardianPhone: "9999999999", ideaTitle: "Pencil organizer", idea: "A low cost pencil organizer for students who lose their stationery.", guardianConsent: false }; expect(studentRegistrationSchema.safeParse(form).success).toBe(false); expect(studentRegistrationSchema.safeParse({ ...form, guardianConsent: true }).success).toBe(true); });
});