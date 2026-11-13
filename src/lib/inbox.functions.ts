import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { reviewStatuses } from "./submission-schemas";

const kindSchema = z.enum(["applications", "enquiries"]);

export const listInbox = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ kind: kindSchema, status: z.enum(["all", ...reviewStatuses]), category: z.enum(["all", "startup", "mentor", "investor", "business"]).default("all"), page: z.number().int().min(0) }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: admin, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (roleError || !admin) throw new Error("Admin access required.");
    const base = data.kind === "applications"
      ? context.supabase.from("registration_applications").select("*", { count: "exact" }).in("category", data.category === "all" ? ["startup", "mentor", "investor", "business"] : [data.category])
      : context.supabase.from("contact_submissions").select("*", { count: "exact" });
    let query = base.order("created_at", { ascending: false }).range(data.page * 25, data.page * 25 + 24);
    if (data.status !== "all") query = query.eq("status", data.status);
    const { data: rows, count, error } = await query;
    if (error) throw new Error("The inbox could not be loaded.");
    return { rows: rows ?? [], count: count ?? 0 };
  });

export const reviewInbox = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ kind: kindSchema, id: z.string().uuid(), status: z.enum(reviewStatuses), notes: z.string().max(4000) }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: admin, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (roleError || !admin) throw new Error("Admin access required.");
    const table = data.kind === "applications" ? "registration_applications" : "contact_submissions";
    const { data: row, error } = await context.supabase.from(table).update({ status: data.status, admin_notes: data.notes }).eq("id", data.id).select("id").single();
    if (error || !row) throw new Error("The review could not be saved.");
    return { ok: true };
  });

export const downloadRegistrationDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: admin, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (roleError || !admin) throw new Error("Admin access required.");
    const { data: application, error } = await context.supabase.from("registration_applications").select("document_path, document_name").eq("id", data.id).single();
    if (error || !application?.document_path) throw new Error("Document not found.");
    // Admin authorization and the owning application are verified before using privileged Storage access.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: document, error: downloadError } = await supabaseAdmin.storage.from("registration-documents").download(application.document_path);
    if (downloadError || !document) throw new Error("The document could not be downloaded.");
    return { name: application.document_name ?? "document", type: document.type, bytes: Array.from(new Uint8Array(await document.arrayBuffer())) };
  });