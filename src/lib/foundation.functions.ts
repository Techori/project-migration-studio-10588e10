import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { foundationKinds, foundationReviewSchema, foundationSubmissionSchema } from "./foundation";

export const submitFoundationForm = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => foundationSubmissionSchema.parse(input))
  .handler(async ({ data }) => {
    const { limitSubmission } = await import("./submissions.server");
    await limitSubmission(data.email);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const code = data.coordinatorCode.toUpperCase();
    let coordinatorId: string | null = null;
    if (code) {
      const { data: coordinator } = await supabaseAdmin.from("coordinators").select("id").eq("referral_code", code).eq("active", true).maybeSingle();
      coordinatorId = coordinator?.id ?? null;
    }
    const details = data.message ? { ...data.details, message: data.message } : data.details;
    const { error } = await supabaseAdmin.from("foundation_submissions").insert({
      kind: data.kind, full_name: data.fullName, email: data.email, phone: data.phone,
      details, coordinator_code: code || null, coordinator_id: coordinatorId,
    });
    if (error) throw new Error("Your form could not be sent. Please try again.");
    return { ok: true };
  });

export const listFoundationSubmissions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ page: z.number().int().min(0).max(10000), kind: z.enum(foundationKinds).optional() }).parse(input))
  .handler(async ({ context, data }) => {
    const { data: admin, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!admin || roleError) throw new Error("Admin access required.");
    let query = context.supabase.from("foundation_submissions").select("*", { count: "exact" });
    if (data.kind) query = query.eq("kind", data.kind);
    const { data: rows, error, count } = await query.order("created_at", { ascending: false }).range(data.page * 20, data.page * 20 + 19);
    if (error) throw new Error("Foundation submissions could not be loaded.");
    return { rows: rows ?? [], count: count ?? 0 };
  });

export const reviewFoundationSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => foundationReviewSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { data: admin, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!admin || roleError) throw new Error("Admin access required.");
    const { error } = await context.supabase.from("foundation_submissions").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error("The submission could not be updated.");
    return { status: data.status };
  });
