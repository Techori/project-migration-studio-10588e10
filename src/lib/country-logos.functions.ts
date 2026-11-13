import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { countryLogoSchema, matchesLogoSignature, validateLogoFile, type CountryLogo } from "./country-logo-schemas";

export const getCountryLogos = createServerFn({ method: "GET" }).handler(async (): Promise<CountryLogo[]> => {
  // Uploaded logos are admin-only now; visitors fall back to bundled artwork, so never fail the page.
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_ANON_KEY"];
  if (!url || !key) return [];
  const client = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => {
    const headers = new Headers(init?.headers);
    if (key.startsWith("sb_")) headers.delete("Authorization");
    headers.set("apikey", key);
    return fetch(input, { ...init, headers });
  } } });
  const { data, error } = await client.from("country_logos").select("country,theme,file_path");
  if (error || !data?.length) return [];
  const results = await Promise.all(data.map(async row => {
    const parsed = countryLogoSchema.safeParse(row);
    if (!parsed.success) return null;
    const { data: signed, error: signError } = await client.storage.from("country-logos").createSignedUrl(row.file_path, 3600);
    if (signError || !signed) return null;
    const browserUrl = new URL(import.meta.env['VITE_SUPABASE_URL']);
    const assetUrl = new URL(signed.signedUrl);
    assetUrl.host = browserUrl.host; assetUrl.protocol = browserUrl.protocol;
    return { ...parsed.data, url: assetUrl.toString() };
  }));
  return results.filter((r): r is CountryLogo => r !== null);
});

export const saveCountryLogo = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => { if (!(input instanceof FormData)) throw new Error("Invalid logo upload."); return input; })
  .handler(async ({ data, context }) => {
    const { data: admin, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!admin || roleError) throw new Error("Admin access required.");
    const metadata = countryLogoSchema.parse(Object.fromEntries(data.entries()));
    const file = data.get("file");
    if (!(file instanceof File)) throw new Error("Choose a logo.");
    const extension = validateLogoFile(file);
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!matchesLogoSignature(bytes, extension)) throw new Error("The image does not match its file type.");
    const path = `${metadata.country}/${metadata.theme}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await context.supabase.storage.from("country-logos").upload(path, bytes, { contentType: file.type });
    if (uploadError) throw new Error("Logo upload failed. Please try again.");
    const { error } = await context.supabase.from("country_logos").upsert({ ...metadata, file_path: path, updated_at: new Date().toISOString() }, { onConflict: "country,theme" });
    if (error) {
      await context.supabase.storage.from("country-logos").remove([path]);
      throw new Error("Logo could not be saved.");
    }
    return { ok: true };
  });