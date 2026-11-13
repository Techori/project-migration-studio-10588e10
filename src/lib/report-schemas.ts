import { z } from "zod";
export const reportCategories = { business: "Business report", valuation: "Business valuation report", research: "Business research & reports", document: "Other documents" };
export const reportLookupSchema = z.object({
  reportNumber: z.string().trim().min(1, "Enter the report number.").max(100).transform(value => value.toUpperCase()),
  publishDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter the publish date.").refine(value => {
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, "Enter a valid publish date."),
});
export const reportMetadataSchema = reportLookupSchema.extend({ title: z.string().trim().min(1).max(200), category: z.enum(["business", "valuation", "research", "document"]) });
export function reportMatches(report: { report_number: string; publish_date: string; active: boolean }, input: z.infer<typeof reportLookupSchema>) {
  return report.active && report.report_number === input.reportNumber && report.publish_date === input.publishDate;
}
export function validateReportFile(file: { name: string; size: number; type: string }) {
  const types: Record<string, string> = { pdf: "application/pdf", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation" };
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!types[extension] || (file.type && file.type !== types[extension])) throw new Error("Upload a PDF, DOCX, XLSX or PPTX file.");
  if (file.size < 1 || file.size > 20_000_000) throw new Error("Report files must be between 1 byte and 20MB.");
  return { extension, type: types[extension] };
}