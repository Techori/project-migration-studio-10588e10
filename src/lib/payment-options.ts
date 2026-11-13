import { z } from "zod";
import type { ApplicationType } from "./education-support/rules";

// Browser-safe rules for admin-editable payment links and Razorpay payment buttons.
export const paymentOptionKeys = [
  "education_sponsorship", "education_scholarship_25k", "education_scholarship_50k",
  "young_innovators_6_8", "young_innovators_9_10", "young_innovators_11_12",
  "funding_programme_registration", "funding_programme_summit", "prototype_funding_registration",
] as const;
export type PaymentOptionKey = (typeof paymentOptionKeys)[number];
export type PaymentOption = { key: string; programme: string; label: string; payment_link: string | null; razorpay_button_id: string | null; sort_order: number };

export const educationPaymentKey = (type: ApplicationType): PaymentOptionKey => `education_${type}` as PaymentOptionKey;
export function youngInnovatorsPaymentKey(schoolClass: number): PaymentOptionKey | null {
  if (schoolClass >= 6 && schoolClass <= 8) return "young_innovators_6_8";
  if (schoolClass >= 9 && schoolClass <= 10) return "young_innovators_9_10";
  if (schoolClass >= 11 && schoolClass <= 12) return "young_innovators_11_12";
  return null;
}

/** Accepts a Razorpay button ID ("pl_…") or the full embed code and returns just the ID; "" clears it. */
export function parseRazorpayButtonId(input: string): string | null | undefined {
  const raw = input.trim();
  if (!raw) return null;
  const match = raw.match(/data-payment_button_id\s*=\s*["']?(pl_[A-Za-z0-9]{6,40})/) ?? raw.match(/^(pl_[A-Za-z0-9]{6,40})$/);
  return match?.[1];
}

export const paymentOptionSaveSchema = z.object({
  key: z.enum(paymentOptionKeys),
  paymentLink: z.string().trim().max(500).refine(v => v === "" || /^https:\/\/[^\s<>"]+$/.test(v), "Payment link must start with https://"),
  razorpayButton: z.string().trim().max(2000).refine(v => parseRazorpayButtonId(v) !== undefined, "Paste the Razorpay button ID (pl_…) or its full embed code."),
});
