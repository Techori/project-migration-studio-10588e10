import { applicationTypes, paymentStatusLabels, type ApplicationType } from "./rules";

// Builds the acknowledgement PDF in the browser; jsPDF loads only when requested.
export type AckData = { ackNumber: string; studentName: string; createdAt: string; category: string; classOrCourse: string; sector: string; applicationType: ApplicationType; paymentStatus: keyof typeof paymentStatusLabels; coordinatorName: string };

export async function buildAcknowledgementPdf(d: AckData): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const app = applicationTypes[d.applicationType];
  doc.setFillColor(11, 31, 75); doc.rect(0, 0, 595, 110, "F");
  doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(20);
  doc.text("RILOYD Foundation", 40, 50);
  doc.setFontSize(12); doc.setFont("helvetica", "normal");
  doc.text("Education Support – Student Scholarship & Sponsorship Registration", 40, 75);
  doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.setFontSize(14);
  doc.text("Registration Acknowledgement", 40, 150);
  doc.setFontSize(22); doc.setTextColor(29, 78, 216); doc.text(d.ackNumber, 40, 182);
  const rows: [string, string][] = [
    ["Student name", d.studentName], ["Registration date", new Date(d.createdAt).toLocaleString("en-IN")], ["Student category", d.category],
    ["Class / course", d.classOrCourse || "—"], ["Education sector", d.sector || "—"], ["Applied for", app.en],
    ["Registration fee", `Rs. ${app.fee}`], ["Payment status", paymentStatusLabels[d.paymentStatus]], ["Coordinator", d.coordinatorName || "Registered without a coordinator"],
  ];
  doc.setFontSize(11); let y = 220;
  for (const [k, v] of rows) { doc.setTextColor(100, 116, 139); doc.setFont("helvetica", "normal"); doc.text(k, 40, y); doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "bold"); doc.text(doc.splitTextToSize(v, 330), 220, y); y += 28; }
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(71, 85, 105);
  doc.text(doc.splitTextToSize("Scholarship amounts are maximum potential awards, not guaranteed payments. The registration fee is separate from selection; final eligibility and award amounts depend on verification and the official decision. Keep this acknowledgement number for all communication.", 515), 40, y + 20);
  const QRCode = await import('qrcode');
  const qr = await QRCode.toDataURL(`RILOYD Education Support\nAcknowledgement: ${d.ackNumber}`, { width: 240, margin: 2, errorCorrectionLevel: 'M' });
  doc.addImage(qr, 'PNG', 40, y + 90, 90, 90);
  doc.text('Registration reference QR — not proof of payment or approval.', 145, y + 135);
  return doc.output("blob");
}
