import type { Database } from "@/integrations/supabase/types";
import { registrationConfigs, type RegistrationCategory } from "./registration-config";

export type Application = Database["public"]["Tables"]["registration_applications"]["Row"];
export type Enquiry = Database["public"]["Tables"]["contact_submissions"]["Row"];
export type Submission = Application | Enquiry;

export function displayValue(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) return value.map(displayValue).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function submissionFields(row: Submission): [string, string][] {
  const common: [string, string][] = [
    ["Entry ID", row.id], ["Submitted at (UTC)", row.created_at],
    ["Full name", "full_name" in row ? row.full_name : row.name],
    ["Email", row.email], ["Phone", row.phone], ["Review status", row.status],
    ["Private admin notes", row.admin_notes],
  ];
  if (!("category" in row)) return [...common, ["Service", row.service], ["Industry", row.industry], ["Message", row.message]];
  const config = registrationConfigs[row.category as RegistrationCategory];
  const labels = new Map(config.sections.flatMap(section => section.fields.map(field => [field.name, field.label] as const)));
  const details = row.details && typeof row.details === "object" && !Array.isArray(row.details) ? row.details : {};
  return [...common, ["Registration type", config.title], ["Application reference", row.application_code],
    ...Object.entries(details).map(([key, value]): [string, string] => [labels.get(key) ?? key, displayValue(value)]),
    ["Uploaded document", row.document_name ?? ""],
  ];
}

// Keep all values as strings: user-entered formulas must never become spreadsheet formulas.
export function spreadsheetRows(rows: Submission[]): string[][] {
  const mapped = rows.map(submissionFields);
  const headers = [...new Set(mapped.flatMap(fields => fields.map(([key]) => key)))];
  return [headers, ...mapped.map(fields => {
    const values = new Map(fields);
    return headers.map(header => values.get(header) ?? "");
  })];
}