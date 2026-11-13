import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Validated but not stored yet, same as the full registration form.
export const fundingApplicationSchema = z.object({
  founderName: z.string().trim().min(2, "Please enter founder name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  mobile: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  startupName: z.string().trim().min(2, "Please enter startup name").max(120),
  stage: z.string().trim().min(1, "Select startup stage").max(50),
  industry: z.string().trim().min(1, "Select industry / sector").max(80),
  description: z.string().trim().min(10, "Please write at least 10 characters").max(200),
});

export type FundingApplication = z.infer<typeof fundingApplicationSchema>;

export const submitFundingApplication = createServerFn({ method: "POST" })
  .inputValidator((data: FundingApplication) => fundingApplicationSchema.parse(data))
  .handler(async () => {
    const code = `RIL-${new Date().getUTCFullYear().toString().slice(-2)}-${crypto
      .randomUUID()
      .replaceAll("-", "")
      .slice(0, 8)
      .toUpperCase()}`;
    return { ok: true, applicationCode: code };
  });
