// Browser-safe rules for editing an Education Support registration after submission.

export type EditActor = "student" | "admin";

/** Students may edit only until payment is confirmed; admins may always edit. */
export function editBlocker(paymentStatus: string, actor: EditActor): string | null {
  if (actor === "admin") return null;
  if (paymentStatus === "paid") return "Your payment is confirmed, so this registration can no longer be edited online. Please contact the RILOYD Foundation team for changes.";
  return null;
}

/** Changing the application type changes the fee, so students can do it only before sharing a payment ID. */
export function applicationTypeChangeBlocker(oldType: string, newType: string, paymentStatus: string, actor: EditActor): string | null {
  if (actor === "admin" || oldType === newType) return null;
  if (paymentStatus !== "pending") return "You have already shared a payment ID, so the application type can no longer be changed. Please contact the Foundation team.";
  return null;
}

/** Last 10 digits of an Indian mobile number, so "+91 98765 43210" matches "9876543210". */
export const normalizeMobile = (m: string) => m.replace(/\D/g, "").slice(-10);
export const sameMobile = (a: string, b: string) => normalizeMobile(a).length === 10 && normalizeMobile(a) === normalizeMobile(b);
