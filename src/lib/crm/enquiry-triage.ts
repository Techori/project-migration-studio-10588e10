import { z } from "zod";

// Browser-safe shape for the CRM admin's AI enquiry helper.
export const enquiryCategories = ["Funding programme", "Education support / scholarship", "Young Innovators", "Prototype funding", "Business services", "Partnership / investor", "Support / complaint", "Other"] as const;
export const urgencyLevels = ["high", "medium", "low"] as const;

export const triageInputSchema = z.object({
  message: z.string().trim().min(10, "Paste the enquiry message (at least 10 characters).").max(4000, "Keep the message under 4,000 characters."),
  senderName: z.string().trim().max(100).default(""),
  tone: z.enum(["friendly", "formal"]).default("friendly"),
  language: z.enum(["English", "Hindi"]).default("English"),
});
export type TriageInput = z.input<typeof triageInputSchema>;

export const triageResultSchema = z.object({
  category: z.enum(enquiryCategories),
  urgency: z.enum(urgencyLevels),
  urgencyReason: z.string(),
  summary: z.string(),
  suggestedNextStep: z.string(),
  replySubject: z.string(),
  replyBody: z.string(),
});
export type TriageResult = z.infer<typeof triageResultSchema>;

export const triageJsonSchema = {
  type: "object", additionalProperties: false,
  required: ["category", "urgency", "urgencyReason", "summary", "suggestedNextStep", "replySubject", "replyBody"],
  properties: {
    category: { type: "string", enum: [...enquiryCategories] },
    urgency: { type: "string", enum: [...urgencyLevels] },
    urgencyReason: { type: "string" },
    summary: { type: "string" },
    suggestedNextStep: { type: "string" },
    replySubject: { type: "string" },
    replyBody: { type: "string" },
  },
} as const;
