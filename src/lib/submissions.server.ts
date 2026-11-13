import { getRequestHeader } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function limitSubmission(email: string) {
  const ip = getRequestHeader("cf-connecting-ip");
  // The hosting edge sets this header; do not trust arbitrary forwarded headers.
  for (const value of [email.trim().toLowerCase(), ...(ip ? [ip] : [])]) {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
    const key = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
    const { data, error } = await supabaseAdmin.rpc("consume_form_submission_limit", { _key_hash: key });
    if (error) throw new Error("Submissions are unavailable right now. Please try again.");
    if (!data) throw new Error("Too many submissions. Please try again after 15 minutes.");
  }
}

export async function storeRegistration(parsed: ReturnType<typeof import("./submission-schemas").validateRegistration>) {
  await limitSubmission(parsed.email);
  const id = crypto.randomUUID();
  const applicationCode = `RIL-${new Date().getUTCFullYear().toString().slice(-2)}-${id.replaceAll("-", "").slice(0, 12).toUpperCase()}`;
  let documentPath: string | null = null;
  if (parsed.document) {
    const file = parsed.document;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const extension = file.name.split(".").pop()?.toLowerCase();
    const isPdf = extension === "pdf" && new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-";
    const isZip = ["docx", "pptx"].includes(extension ?? "") && bytes[0] === 0x50 && bytes[1] === 0x4b;
    const isOffice = ["doc", "ppt"].includes(extension ?? "") && bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0;
    if (!isPdf && !isZip && !isOffice) throw new Error("The document content does not match its file type.");
    documentPath = `${id}/document.${extension}`;
    const { error } = await supabaseAdmin.storage.from("registration-documents").upload(documentPath, bytes, { contentType: file.type, upsert: false });
    if (error) throw new Error("Your document could not be saved. Please try again.");
  }
  const { error } = await supabaseAdmin.from("registration_applications").insert({
    id, application_code: applicationCode, category: parsed.category,
    full_name: parsed.fullName, email: parsed.email, phone: parsed.phone,
    details: parsed.details, document_path: documentPath, document_name: parsed.document?.name ?? null,
  });
  if (error) {
    if (documentPath) await supabaseAdmin.storage.from("registration-documents").remove([documentPath]);
    throw new Error("Registration could not be saved. Please try again.");
  }
  return { ok: true, duplicate: false, applicationCode };
}