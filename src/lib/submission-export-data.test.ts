import { describe, expect, it } from "vitest";
import { spreadsheetRows, submissionFields, type Application, type Enquiry } from "./submission-export-data";
const application: Application = {
  id: "entry-1", application_code: "RIL-26-TEST", category: "mentor", full_name: "Test Mentor",
  email: "test@example.com", phone: "9876543210", details: { mentorAreas: "Funding ₹10L", expertise: ["Strategy", "Funding"] },
  status: "new", admin_notes: "Private note", created_at: "2026-10-28T06:00:00Z", document_path: "private/test.pdf", document_name: "resume.pdf",
  coordinator_code: null, coordinator_id: null,
};
const enquiry: Enquiry = { id: "enquiry-1", name: "Test Contact", email: "test@example.com", phone: "9876543210", service: "Funding", industry: "Technology", message: '=HYPERLINK("https://example.com")', status: "new", admin_notes: "", created_at: "2026-10-28T06:00:00Z", coordinator_code: null, coordinator_id: null };
describe("Submission exports", () => {
  it("includes complete registration details and document name without exposing its private path", () => {
    const fields = new Map(submissionFields(application));
    expect(fields.get("Application reference")).toBe("RIL-26-TEST");
    expect(fields.get("Areas I can mentor on")).toBe("Funding ₹10L");
    expect(fields.get("Additional Expertise")).toBe("Strategy, Funding");
    expect(fields.get("Uploaded document")).toBe("resume.pdf");
    expect([...fields.values()]).not.toContain("private/test.pdf");
  });
  it("exports every entry, including more than the 25-row inbox page", () => {
    const matrix = spreadsheetRows(Array.from({ length: 31 }, (_, i) => ({ ...application, id: `entry-${i}` })));
    expect(matrix).toHaveLength(32); expect(matrix[31]?.[0]).toBe("entry-30");
  });
  it("keeps user-entered formula-like values as strings", () => {
    const matrix = spreadsheetRows([enquiry]);
    expect(matrix[1]?.[matrix[0]?.indexOf("Message") ?? -1]).toBe(enquiry.message);
    expect(typeof matrix[1]?.[matrix[0]?.indexOf("Message") ?? -1]).toBe("string");
  });
});