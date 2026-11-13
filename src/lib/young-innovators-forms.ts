import { z } from "zod";

export const studentIdeaSchema = z.object({
  schoolClass: z.number().int().min(6).max(12),
  idea: z.string().trim().min(40, "Describe your idea in at least 40 characters.").max(3000),
  customer: z.string().trim().min(10, "Describe who your idea could help.").max(1000),
  consent: z.literal(true, { errorMap: () => ({ message: "A parent or guardian must approve sending this idea to AI." }) }),
});
export const studentRegistrationSchema = z.object({
  studentName: z.string().trim().min(2).max(100),
  schoolClass: z.number().int().min(6).max(12),
  city: z.string().trim().min(2).max(100),
  guardianName: z.string().trim().min(2).max(100),
  guardianEmail: z.string().trim().email().max(254),
  guardianPhone: z.string().trim().regex(/^\+?[0-9 ()-]{8,20}$/, "Enter a valid guardian phone number."),
  ideaTitle: z.string().trim().min(3).max(120),
  idea: z.string().trim().min(40).max(3000),
  guardianConsent: z.literal(true, { errorMap: () => ({ message: "A parent or legal guardian must consent to registration." }) }),
});
export function studentFee(schoolClass: number) {
  if (!Number.isInteger(schoolClass) || schoolClass < 6 || schoolClass > 12) throw new Error("Only Classes 6–12 are eligible.");
  return schoolClass <= 8 ? 249 : schoolClass <= 10 ? 349 : 499;
}
export function studentFeeTotal(schoolClass: number) { return Math.round(studentFee(schoolClass) * 118) / 100; }