import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const pageSchema = z.object({ page: z.number().int().min(0).max(10000) });
export const listPrototypeSubmissions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => pageSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { data: admin, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!admin || roleError) throw new Error("Admin access required.");
    const { data: rows, error, count } = await context.supabase.from("prototype_submissions").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(data.page * 20, data.page * 20 + 19);
    if (error) throw new Error("Prototype submissions could not be loaded.");
    return { rows: rows ?? [], count: count ?? 0 };
  });