import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { feeSchema, type ProgrammeFee } from "./international-programme";

export const getProgrammeFees = createServerFn({ method: "GET" }).handler(async (): Promise<ProgrammeFee[]> => {
  const url = process.env["SUPABASE_URL"] ?? import.meta.env["VITE_SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_ANON_KEY"] ?? import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Registration fees are unavailable.");
  const client = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => {
    const headers = new Headers(init?.headers);
    if (key.startsWith("sb_")) headers.delete("Authorization");
    headers.set("apikey", key);
    return fetch(input, { ...init, headers });
  } } });
  const { data, error } = await client.from("country_programme_fees").select("country,currency,amount");
  if (error) throw new Error("Registration fees could not be loaded.");
  return (data ?? []).map(row => feeSchema.parse(row));
});

export const saveProgrammeFee = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => feeSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: admin, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!admin || roleError) throw new Error("Admin access required.");
    const { error } = await context.supabase.from("country_programme_fees").upsert({ ...data, updated_at: new Date().toISOString() });
    if (error) throw new Error("Registration fee could not be saved.");
    return { ok: true };
  });