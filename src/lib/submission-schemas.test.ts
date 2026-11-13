import { describe, expect, it } from "vitest";
import { enquirySchema, reviewStatuses, validateDocument, validateRegistration } from "./submission-schemas";
import { registrationConfigs, type RegistrationCategory } from "./registration-config";

function registration(category: RegistrationCategory) {
  const form = new FormData();
  form.set("category", category); form.set("consent", "on");
  for (const section of registrationConfigs[category].sections) {
    for (const field of section.fields) {
      if (!field.required || field.type === "file") continue;
      form.set(field.name, field.options?.[0]?.value ?? "Valid test information");
    }
  }
  form.set("email", "backend-test@example.com"); form.set("phone", "9876543210");
  return form;
}
describe("Private registration rules", () => {
  it("accepts mentor PDFs up to 5MB and rejects larger files", () => {
    expect(validateDocument({ name: "resume.pdf", type: "application/pdf", size: 5_000_000 }, "mentor")).toBe("pdf");
    expect(() => validateDocument({ name: "resume.pdf", type: "application/pdf", size: 5_000_001 }, "mentor")).toThrow();
  });
  it.each(["startup", "investor", "business"] as const)("accepts %s PDFs up to 10MB and rejects larger files", category => {
    expect(validateDocument({ name: "deck.pdf", type: "application/pdf", size: 10_000_000 }, category)).toBe("pdf");
    expect(() => validateDocument({ name: "deck.pdf", type: "application/pdf", size: 10_000_001 }, category)).toThrow();
  });
  it("permits precisely the four requested review statuses", () => {
    expect(reviewStatuses).toEqual(["new", "reviewed", "approved", "rejected"]);
  });
  it.each(["startup", "mentor", "investor", "business"] as const)("validates and preserves %s registration fields", category => {
    const data = validateRegistration(registration(category));
    expect(data.category).toBe(category); expect(data.email).toBe("backend-test@example.com");
    expect(data.details["fullName"]).toBe("Valid test information");
  });
  it("rejects registration without consent", () => {
    const form = registration("mentor"); form.delete("consent");
    expect(() => validateRegistration(form)).toThrow();
  });
  it("rejects invalid selectable values", () => {
    const form = registration("mentor"); form.set("experience", "made up");
    expect(() => validateRegistration(form)).toThrow();
  });
  it("rejects mismatched document extensions and MIME types", () => {
    expect(() => validateDocument({ name: "file.exe", type: "application/pdf", size: 10 }, "mentor")).toThrow();
  });
  it("validates enquiry contact details on the server", () => {
    const data = { name: "Test Contact", email: "test@example.com", phone: "9876543210", service: "Funding", industry: "Technology", message: "Test enquiry for backend verification" };
    expect(enquirySchema.safeParse(data).success).toBe(true);
    expect(enquirySchema.safeParse({ ...data, email: "invalid" }).success).toBe(false);
  });
});