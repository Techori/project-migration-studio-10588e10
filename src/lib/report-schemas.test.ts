import { describe, expect, it } from "vitest";
import { reportLookupSchema, reportMatches, validateReportFile } from "./report-schemas";
describe("Customer report downloads", () => {
  const report = { report_number: "RIL-REPORT-01", publish_date: "2026-10-28", active: true };
  it("allows download only when both report number and publish date match", () => {
    expect(reportMatches(report, { reportNumber: "RIL-REPORT-01", publishDate: "2026-10-28" })).toBe(true);
    expect(reportMatches(report, { reportNumber: "RIL-REPORT-02", publishDate: "2026-10-28" })).toBe(false);
    expect(reportMatches(report, { reportNumber: "RIL-REPORT-01", publishDate: "2026-10-27" })).toBe(false);
  });
  it("blocks withdrawn reports even with matching details", () => {
    expect(reportMatches({ ...report, active: false }, { reportNumber: report.report_number, publishDate: report.publish_date })).toBe(false);
  });
  it("rejects impossible publication dates", () => {
    expect(reportLookupSchema.safeParse({ reportNumber: "RIL-01", publishDate: "2026-02-30" }).success).toBe(false);
  });
  it("validates document formats and size", () => {
    expect(validateReportFile({ name: "report.pdf", type: "application/pdf", size: 100 }).extension).toBe("pdf");
    expect(() => validateReportFile({ name: "report.exe", type: "application/pdf", size: 100 })).toThrow();
    expect(() => validateReportFile({ name: "report.pdf", type: "application/pdf", size: 20_000_001 })).toThrow();
  });
});