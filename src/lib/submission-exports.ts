import fontUrl from "@/assets/fonts/submission-report.ttf?url";
import { spreadsheetRows, submissionFields, type Submission } from "./submission-export-data";

export async function createSubmissionPdf(row: Submission): Promise<Blob> {
  const [{ jsPDF }, { default: autoTable }, response] = await Promise.all([import("jspdf"), import("jspdf-autotable"), fetch(fontUrl)]);
  if (!response.ok) throw new Error("The PDF font could not be loaded.");
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  const pdf = new jsPDF();
  pdf.addFileToVFS("report.ttf", btoa(binary)); pdf.addFont("report.ttf", "Report", "normal"); pdf.setFont("Report", "normal");
  pdf.setFontSize(20); pdf.text("RILOYD", 14, 20);
  pdf.setFontSize(12); pdf.text("category" in row ? "Registration application" : "Contact enquiry", 14, 29);
  autoTable(pdf, {
    startY: 36, body: submissionFields(row), theme: "plain",
    styles: { font: "Report", fontStyle: "normal", fontSize: 9, cellPadding: 3, overflow: "linebreak" },
    columnStyles: { 0: { cellWidth: 55 }, 1: { cellWidth: 127 } },
    margin: { top: 16, bottom: 18 }, rowPageBreak: "avoid",
    didDrawPage: () => { pdf.setFontSize(8); pdf.text(`Private admin copy • Page ${pdf.getNumberOfPages()}`, 14, 288); },
  });
  return pdf.output("blob");
}

export async function createInboxWorkbook(applications: Submission[], enquiries: Submission[]): Promise<Blob> {
  const { default: ExcelJS } = await import("exceljs");
  const book = new ExcelJS.Workbook(); book.creator = "Riloyd";
  for (const [name, rows] of [["Registrations", applications], ["Enquiries", enquiries]] as const) {
    const sheet = book.addWorksheet(name);
    const matrix = spreadsheetRows([...rows]);
    if (!rows.length) matrix[0] = ["Entry ID", "Submitted at (UTC)", "Full name", "Email", "Phone", "Review status"];
    sheet.addRows(matrix); sheet.views = [{ state: "frozen", ySplit: 1 }]; sheet.getRow(1).font = { bold: true };
    sheet.columns.forEach(column => { column.width = 28; });
    sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: Math.max(1, sheet.rowCount), column: matrix[0]?.length ?? 1 } };
  }
  const buffer = await book.xlsx.writeBuffer();
  return new Blob([new Uint8Array(buffer)], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}