import Papa from 'papaparse';
import { z } from 'zod';
import { logoCountries } from './country-logo-schemas';
import { reviewStatuses } from './submission-schemas';

const text = z.string().max(50000);
const required = text.min(1);
const id = z.string().uuid().optional();
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0,10) === v, 'Invalid date');
const path = required.refine(v => !v.startsWith('/') && !v.split('/').includes('..') && !v.includes('\\'), 'Invalid storage path');
const base = { id, created_at: z.string().datetime({ offset: true }).optional() };
const status = z.enum(reviewStatuses).optional();
export const importSchemas = {
  contact_submissions: z.object({ ...base, name: required, email: z.string().email(), phone: text.optional(), service: text.optional(), industry: text.optional(), message: text.optional(), status, admin_notes: text.optional() }).strict(),
  registration_applications: z.object({ ...base, application_code: required, category: z.enum(['startup','mentor','investor','business']), full_name: required, email: z.string().email(), phone: text.optional(), details: z.record(z.string(), z.unknown()).optional(), document_path: path.nullable().optional(), document_name: text.nullable().optional(), status, admin_notes: text.optional() }).strict(),
  employees: z.object({ ...base, employee_id: required, code_hash: z.string().regex(/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/, 'Export the original hashed code, not a password'), full_name: required, photo_url: z.string().url().nullable().optional(), designation: text.optional(), department: text.optional(), status: z.enum(['active','inactive']).optional(), valid_until: date.nullable().optional(), updated_at: z.string().datetime({ offset:true }).optional() }).strict(),
  people_profiles: z.object({ ...base, person_group: z.enum(['investors','mentors','team','startups','businesses']), slug: required, name: required, role: text.optional(), location: text.optional(), focus: z.array(text).optional(), summary: text.optional(), bio: text.optional(), photo_url: z.string().url().nullable().optional(), sort_order: z.number().int().optional(), source_application_id: z.string().uuid().nullable().optional() }).strict(),
  customer_reports: z.object({ ...base, report_number: required, publish_date: date, title: required, category: z.enum(['business','valuation','research','document']).optional(), file_path: path, file_name: required, file_size: z.number().int().nonnegative().optional(), active: z.boolean().optional() }).strict(),
  country_logos: z.object({ country: z.enum(logoCountries), theme: z.enum(['light','dark']), file_path: path, updated_at: z.string().datetime({offset:true}).optional() }).strict(),
  country_programme_fees: z.object({ country: z.enum(logoCountries), currency: z.string().regex(/^[A-Z]{3}$/), amount: z.number().int().nonnegative().nullable().optional(), updated_at: z.string().datetime({offset:true}).optional() }).strict(),
  prototype_submissions: z.object({ ...base, idea: required, prototype: required, funding_goal: text.optional(), eligibility_context: text.optional(), ai_output: text.optional() }).strict(),
  young_innovators_registrations: z.object({ ...base, application_code: required, student_name: required, school_class: z.number().int().min(6).max(12), city: required, guardian_name: required, guardian_email: z.string().email(), guardian_phone: required, idea_title: required, idea: required, guardian_consent: z.literal(true), consent_at: z.string().datetime({offset:true}).optional(), fee_amount: z.number().int().nonnegative(), gst_percent: z.number().int().nonnegative().optional(), status }).strict(),
};
export type ImportTable = keyof typeof importSchemas;
export function importFields(table: ImportTable): Record<string, z.ZodType> { return importSchemas[table].shape; }
export const importLabels: Record<ImportTable,string> = { contact_submissions:'Enquiries', registration_applications:'Applications', employees:'Employees', people_profiles:'People profiles', customer_reports:'Customer reports', country_logos:'Country logos', country_programme_fees:'Registration fees', prototype_submissions:'Prototype submissions', young_innovators_registrations:'Young Innovators' };
export function parseCsv(source: string) {
  const result = Papa.parse<Record<string,string>>(source.replace(/^\uFEFF/, ''), { header:true, skipEmptyLines:'greedy' });
  if (result.errors.length) throw new Error(`CSV error: ${result.errors[0]?.message}`);
  const headers = result.meta.fields ?? [];
  if (!headers.length || new Set(headers).size !== headers.length || result.meta.renamedHeaders) throw new Error('CSV needs unique column headers.');
  if (!result.data.length || result.data.length > 1000) throw new Error('Choose a CSV with 1–1000 records.');
  return { headers, rows:result.data };
}
export function mapCsvRows(table: ImportTable, rows: Record<string,string>[], mapping: Record<string,string>) {
  const numeric = ['amount','sort_order','file_size','school_class','fee_amount','gst_percent'];
  const boolean = ['active','guardian_consent'];
  return rows.map((row,index) => {
    const record: Record<string,unknown> = {};
    const errors: string[] = [];
    for (const [field, source] of Object.entries(mapping)) {
      if (!source) continue;
      const value = row[source] ?? '';
      if (value === '' || value === 'NULL' || value === '\\N') continue;
      try {
        if (numeric.includes(field)) record[field] = Number(value);
        else if (boolean.includes(field)) { if (!/^(true|false|t|f|1|0)$/i.test(value)) throw new Error('Use true or false'); record[field] = /^(true|t|1)$/i.test(value); }
        else if (field === 'details' || field === 'focus') record[field] = JSON.parse(value);
        else record[field] = value;
      } catch { errors.push(`${field}: invalid value`); }
    }
    const result = importSchemas[table].safeParse(record);
    if (!result.success) errors.push(...result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`));
    return { row:index+2, record:(result.success ? result.data : record) as Record<string,unknown>, errors };
  });
}