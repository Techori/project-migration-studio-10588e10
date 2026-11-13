import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { reportLookupSchema, reportMatches, reportMetadataSchema, validateReportFile } from "./report-schemas";

export const findReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => reportLookupSchema.parse(input))
  .handler(async ({ data }) => {
    const { limitSubmission } = await import("./submissions.server");
    await limitSubmission(`report-download:${data.reportNumber}`);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: report, error } = await supabaseAdmin.from("customer_reports").select("report_number,publish_date,active,title,file_name,file_path,category").eq("report_number", data.reportNumber).eq("publish_date", data.publishDate).eq("active", true).maybeSingle();
    if (error) throw new Error("Reports are unavailable right now. Please try again.");
    if (!report || !reportMatches(report, data)) return { found: false as const };
    const { data: signed, error: fileError } = await supabaseAdmin.storage.from("customer-reports").createSignedUrl(report.file_path, 60, { download: report.file_name });
    if (fileError || !signed) throw new Error("The report could not be downloaded.");
    const storageUrl = import.meta.env['VITE_SUPABASE_URL'];
    if (!storageUrl) throw new Error("Report downloads are unavailable right now. Please try again.");
    const url = new URL(signed.signedUrl);
    const browserUrl = new URL(storageUrl);
    url.protocol = browserUrl.protocol; url.host = browserUrl.host;
    return { found: true as const, title: report.title, name: report.file_name, url: url.toString() };
  });

export const listReports = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: admin, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (!admin || roleError) throw new Error("Admin access required.");
  const { data, error } = await context.supabase.from("customer_reports").select("*").order("created_at", { ascending: false });
  if (error) throw new Error("Reports could not be loaded.");
  return data ?? [];
});

export const uploadReport = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => { if (!(input instanceof FormData)) throw new Error("Invalid report upload."); return input; })
  .handler(async ({ data, context }) => {
    const { data: admin, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!admin || roleError) throw new Error("Admin access required.");
    const metadata = reportMetadataSchema.parse(Object.fromEntries(data.entries()));
    const file = data.get("file");
    if (!(file instanceof File)) throw new Error("Choose the report file.");
    const format = validateReportFile(file);
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (format.extension === "pdf" ? new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-" : !(bytes[0] === 0x50 && bytes[1] === 0x4b)) throw new Error("The document content does not match its file type.");
    const path = `${crypto.randomUUID()}/report.${format.extension}`;
    const { error: uploadError } = await context.supabase.storage.from("customer-reports").upload(path, bytes, { contentType: format.type });
    if (uploadError) throw new Error("Report upload failed. Please try again.");
    const { error } = await context.supabase.from("customer_reports").insert({ report_number: metadata.reportNumber, publish_date: metadata.publishDate, title: metadata.title, category: metadata.category, file_path: path, file_name: file.name, file_size: file.size });
    if (error) {
      await context.supabase.storage.from("customer-reports").remove([path]);
      throw new Error(error.code === "23505" ? "This report number already exists. Use a unique report number." : "Report could not be saved.");
    }
    return { ok: true };
  });

export const setReportActive = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid(), active: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: admin, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!admin || roleError) throw new Error("Admin access required.");
    const { error } = await context.supabase.from("customer_reports").update({ active: data.active }).eq("id", data.id);
    if (error) throw new Error("Report status could not be changed.");
    return { ok: true };
  });