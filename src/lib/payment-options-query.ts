import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { PaymentOption } from "./payment-options";

export const paymentOptionsQuery = queryOptions({
  queryKey: ["payment-options"],
  queryFn: async (): Promise<PaymentOption[]> => {
    const { data, error } = await supabase.from("payment_options").select("key, programme, label, payment_link, razorpay_button_id, sort_order").order("sort_order");
    if (error) throw new Error("Payment options could not be loaded.");
    return data ?? [];
  },
  staleTime: 60_000,
  retry: 1,
});
