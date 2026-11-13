import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { normalizePaymentLink, paymentOptionSaveSchema } from "./payment-options";

export const savePaymentOption = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => paymentOptionSaveSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { data: admin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!admin) throw new Error("Admin access required.");
    const { data: rows, error } = await context.supabase.from("payment_options")
      .update({ payment_link: normalizePaymentLink(data.paymentLink) ?? null, razorpay_button_id: null, updated_at: new Date().toISOString() })
      .eq("key", data.key).select("key");
    if (error || !rows?.length) throw new Error("The payment option could not be saved.");
    return { ok: true };
  });
