import { z } from "zod";
import { registrationConfigs, type RegistrationCategory } from "./registration-config";

export const reviewStatuses = ["new", "reviewed", "approved", "rejected"] as const;
export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(100),
  email: z.string().trim().email("Please enter a valid business email.").max(255),
  phone: z.string().trim().regex(/^[+\d][\d\s()-]{7,19}$/, "Please enter a valid phone number."),
  service: z.string().trim().min(1).max(120),
  industry: z.string().trim().min(1).max(120),
  message: z.string().trim().min(10, "Please share a little more about your requirement.").max(1000),
});

export function validateRegistration(data: FormData) {
  const base = z.object({
    category: z.enum(["startup", "mentor", "investor", "business"]),
    fullName: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(255),
    phone: z.string().trim().regex(/^[+\d][\d\s()-]{7,19}$/),
    consent: z.literal("on"),
  }).parse(Object.fromEntries(["category", "fullName", "email", "phone", "consent"].map(key => [key, data.get(key)])));
  const details: Record<string, string | string[]> = { consent: "on" };
  for (const section of registrationConfigs[base.category].sections) {
    for (const field of section.fields) {
      if (field.type === "file") continue;
      const values = data.getAll(field.name).map(value => {
        if (typeof value !== "string") throw new Error("Invalid field value.");
        return value.trim();
      }).filter(Boolean);
      if (field.required && !values.length) throw new Error(`Please complete ${field.label}.`);
      if (values.some(value => value.length > (field.maxLength ?? 2000))) throw new Error(`${field.label} is too long.`);
      if (field.options && values.some(value => !field.options?.some(option => option.value === value))) throw new Error(`Please select a valid ${field.label}.`);
      if (field.type !== "checkboxes" && values.length > 1) throw new Error(`Invalid ${field.label}.`);
      if (field.type === "url" && values.some(value => !z.string().url().safeParse(value).success || !/^https?:\/\//.test(value))) throw new Error(`Please enter a valid ${field.label}.`);
      details[field.name] = field.type === "checkboxes" ? values : values[0] ?? "";
    }
  }
  const candidate = data.get("document");
  const document = candidate instanceof File && candidate.size > 0 ? candidate : null;
  if (document) validateDocument(document, base.category);
  return { ...base, details, document };
}

export function validateDocument(file: Pick<File, "name" | "size" | "type">, category: RegistrationCategory) {
  const extensions = category === "mentor" ? ["pdf", "doc", "docx"] : ["pdf", "ppt", "pptx"];
  const mimeByExtension: Record<string, string> = {
    pdf: "application/pdf", doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ppt: "application/vnd.ms-powerpoint", pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  };
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const limit = category === "mentor" ? 5_000_000 : 10_000_000;
  if (!extensions.includes(extension) || mimeByExtension[extension] !== file.type || file.size > limit) throw new Error("Please upload an allowed document within the stated size limit.");
  return extension;
}