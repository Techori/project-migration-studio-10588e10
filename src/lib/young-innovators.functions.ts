import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { studentRegistrationSchema, studentFee } from "./young-innovators-forms";
import { studentReviewSchema } from "./student-review";

export const registerStudentIdea = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => studentRegistrationSchema.parse(input))
  .handler(async ({ data }) => {
    const { limitSubmission } = await import("./submissions.server");
    await limitSubmission(data.guardianEmail);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const applicationCode = `YI26-${crypto.randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`;
    const { error } = await supabaseAdmin.from("young_innovators_registrations").insert({ application_code: applicationCode, student_name: data.studentName, school_class: data.schoolClass, city: data.city, guardian_name: data.guardianName, guardian_email: data.guardianEmail, guardian_phone: data.guardianPhone, idea_title: data.ideaTitle, idea: data.idea, guardian_consent: true, fee_amount: studentFee(data.schoolClass), gst_percent: 18 });
    if (error) throw new Error("Registration could not be saved. Your details are still here; please try again later.");
    return { applicationCode };
  });

export const listStudentRegistrations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ page: z.number().int().min(0).max(10000) }).parse(input))
  .handler(async ({ context, data }) => {
    const { data: admin, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!admin || roleError) throw new Error("Admin access required.");
    const { data: rows, error, count } = await context.supabase.from("young_innovators_registrations").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(data.page * 20, data.page * 20 + 19);
    if (error) throw new Error("Student registrations could not be loaded.");
    return { rows: rows ?? [], count: count ?? 0 };
  });

export const reviewStudentRegistration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => studentReviewSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { data: admin, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!admin || roleError) throw new Error("Admin access required.");
    const { data: row, error } = await context.supabase.from("young_innovators_registrations")
      .update({ status: data.status }).eq("id", data.id).select("id,status").single();
    if (error || !row) throw new Error("Student review could not be saved. Please try again.");
    return row;
  });