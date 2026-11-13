import drizzleSource from '../../drizzle/schema.ts?raw';
// Migration history may be reset on remix, so read whatever SQL files exist instead of fixed names.
const migrationSources = Object.entries(import.meta.glob('../../drizzle/migrations/*.sql', { query: '?raw', import: 'default', eager: true }) as Record<string, string>)
  .sort(([a], [b]) => a.localeCompare(b)).map(([, sql]) => sql);

export type Column = { name: string; type: string; nullable: boolean };
export type Table = { name: string; columns: Column[]; rls: boolean };
export type Metadata = { tables: Table[]; functions: string[] };
export type Finding = { severity: 'error' | 'warning'; object: string; expected: string; actual: string };
const aliases: Record<string, string> = { timestamptz: 'timestamp with time zone', int: 'integer', int4: 'integer', int8: 'bigint', bool: 'boolean' };
export const normalizeType = (type: string) => aliases[type.toLowerCase()] ?? type.toLowerCase();
export function parseSqlTables(source: string): Table[] {
  // Copied declarations remain useful expectations even when their replay was disabled.
  const sql = source.replace(/^-- /gm, '');
  return Array.from(sql.matchAll(/CREATE TABLE public\.(\w+)\s*\(([\s\S]*?)\);/g), match => ({
    name: match[1] ?? '', rls: true,
    columns: splitSqlColumns(match[2] ?? '').flatMap(line => {
      const column = line.trim().match(/^(\w+)\s+(uuid|text\[\]|text|jsonb|timestamptz|integer|boolean|date|bigint|public\.app_role)(.*)/i);
      if (!column?.[1] || !column[2]) return [];
      return [{ name: column[1], type: normalizeType(column[2].replace('public.', '')), nullable: !/NOT NULL|PRIMARY KEY/i.test(column[3] ?? '') }];
    }),
  }));
}
// Later migrations may add columns or relax NOT NULL; apply those in file order so expectations match the live schema.
export function applySqlAlters(tables: Table[], source: string): Table[] {
  const sql = source.replace(/^-- /gm, '');
  for (const match of sql.matchAll(/ALTER TABLE public\.(\w+)\s+([\s\S]*?);/g)) {
    const table = tables.find(t => t.name === match[1]);
    if (!table) continue;
    for (const clause of splitSqlColumns(match[2] ?? '')) {
      const text = clause.trim();
      const add = text.match(/^ADD COLUMN (?:IF NOT EXISTS )?(\w+)\s+(uuid|text\[\]|text|jsonb|timestamptz|integer|boolean|date|bigint)(.*)/i);
      if (add?.[1] && add[2]) { table.columns.push({ name: add[1], type: normalizeType(add[2]), nullable: !/NOT NULL|PRIMARY KEY/i.test(add[3] ?? '') }); continue; }
      const nullability = text.match(/^ALTER COLUMN (\w+) (DROP|SET) NOT NULL/i);
      const column = nullability ? table.columns.find(c => c.name === nullability[1]) : undefined;
      if (column && nullability) column.nullable = nullability[2]?.toUpperCase() === 'DROP';
    }
  }
  return tables;
}
function splitSqlColumns(body: string) {
  let depth = 0, quoted = false, start = 0;
  const fields: string[] = [];
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (c === "'") { if (quoted && body[i + 1] === "'") { i++; continue; } quoted = !quoted; }
    if (quoted) continue;
    if (c === '(') depth++;
    if (c === ')') depth--;
    if (c === ',' && depth === 0) { fields.push(body.slice(start, i)); start = i + 1; }
  }
  fields.push(body.slice(start));
  return fields;
}
const baseline = (name: string, fields: string): Table => ({ name, rls: true, columns: fields.split(' ').flatMap(field => {
  const [column, type] = field.split(':');
  if (!column || !type) return [];
  return [{ name: column, type: normalizeType(type.replace('?', '')), nullable: type.endsWith('?') }];
}) });
const parsedTables = migrationSources.flatMap(parseSqlTables);
// Only fall back to the baseline when no migration declares the table, so it is never listed twice.
if (!parsedTables.some(t => t.name === 'education_support_registrations')) parsedTables.push(baseline('education_support_registrations', 'id:uuid ack_number:text student_category:text current_class:text? course_name:text? education_sector:text? institution_name:text education:jsonb student_name:text father_name:text mother_name:text date_of_birth:date gender:text nationality:text mobile:text whatsapp:text? email:text permanent_address:text current_address:text state:text district:text city:text pin_code:text is_minor:boolean guardian_name:text? guardian_mobile:text? guardian_email:text? guardian_relationship:text? guardian_consent_at:timestamptz? without_coordinator:boolean coordinator:jsonb coordinator_code:text? coordinator_id:uuid? application_type:text registration_fee:integer payment_status:text payment_reference:text? payment_reference_at:timestamptz? receipt_token_hash:text status:text status_reason:text declarations:jsonb created_at:timestamptz updated_at:timestamptz'));
for (const source of migrationSources) applySqlAlters(parsedTables, source);
export const expectedTables: Table[] = [
  ...parsedTables,
  ...[
    baseline('employees', 'id:uuid employee_id:text code_hash:text full_name:text photo_url:text? designation:text department:text status:text valid_until:date? created_at:timestamptz updated_at:timestamptz'),
    baseline('employee_verification_attempts', 'id:bigint employee_id:text success:boolean created_at:timestamptz'),
    baseline('people_profiles', 'id:uuid person_group:text slug:text name:text role:text location:text focus:text[] summary:text bio:text photo_url:text? sort_order:integer source_application_id:uuid? created_at:timestamptz'),
    baseline('contact_submissions', 'id:uuid name:text email:text phone:text service:text industry:text message:text status:text admin_notes:text created_at:timestamptz'),
    baseline('customer_reports', 'id:uuid report_number:text publish_date:date title:text category:text file_path:text file_name:text file_size:int4 active:bool created_at:timestamptz'),
    baseline('form_submission_limits', 'key_hash:text window_started_at:timestamptz attempts:int4'),
    baseline('registration_applications', 'id:uuid application_code:text category:text full_name:text email:text phone:text details:jsonb document_path:text? document_name:text? status:text admin_notes:text created_at:timestamptz'),
    baseline('user_roles', 'id:uuid user_id:uuid role:app_role'),
    baseline('prototype_ai_access_state', 'model_id:text status_code:integer message:text blocked_at:timestamptz'),
    baseline('prototype_submissions', 'id:uuid idea:text prototype:text funding_goal:text eligibility_context:text ai_output:text created_at:timestamptz'),
    baseline('profiles', 'id:uuid display_name:text avatar_url:text preferences:jsonb'),
    baseline('country_logos', 'country:text theme:text file_path:text updated_at:timestamptz'),
    baseline('country_programme_fees', 'country:text currency:text amount:integer? updated_at:timestamptz'),
    baseline('young_innovators_registrations', 'id:uuid application_code:text student_name:text school_class:integer city:text guardian_name:text guardian_email:text guardian_phone:text idea_title:text idea:text guardian_consent:boolean consent_at:timestamptz fee_amount:integer gst_percent:integer status:text created_at:timestamptz'),
    // Declared by migrations of the source project; kept here because remixes start with an empty migration history.
    baseline('education_district_codes', 'state_code:text district_key:text district_name:text code:integer'),
    baseline('education_staff_access', 'user_id:uuid designation:text manager_id:uuid? referral_code:text active:boolean created_at:timestamptz'),
    baseline('crm_memberships', 'user_id:uuid role:text manager_id:uuid? active:boolean created_at:timestamptz'),
    baseline('crm_employee_profiles', 'user_id:uuid employee_code:text full_name:text phone:text designation:text photo_url:text? joining_date:date'),
    baseline('crm_customers', 'id:uuid customer_code:text full_name:text email:text phone:text company:text acknowledgement:text? owner_id:uuid? created_at:timestamptz'),
    baseline('crm_leads', 'id:uuid customer_id:uuid title:text stage:text amount:numeric source:text source_id:uuid? owner_id:uuid? next_follow_up:date? notes:text created_at:timestamptz updated_at:timestamptz referral_code:text?'),
    baseline('crm_tasks', 'id:uuid title:text owner_id:uuid customer_id:uuid? due_date:date status:text priority:text created_at:timestamptz'),
    baseline('crm_tickets', 'id:uuid ticket_code:text customer_id:uuid owner_id:uuid subject:text description:text status:text priority:text created_at:timestamptz updated_at:timestamptz'),
    baseline('crm_activities', 'id:uuid owner_id:uuid actor_id:uuid lead_id:uuid? ticket_id:uuid? kind:text body:text created_at:timestamptz'),
    baseline('crm_targets', 'id:uuid owner_id:uuid month:date revenue_target:numeric wins_target:integer calls_target:integer'),
  ].filter(t => !parsedTables.some(p => p.name === t.name)),
];
export const expectedFunctions = ['has_role', 'admin_save_employee', 'verify_employee', 'consume_form_submission_limit', 'claim_first_admin', 'first_admin_setup_status', 'admin_import_records', 'create_account_profile', 'admin_setup_metadata', 'sync_approved_application_profile', 'assign_education_ack_number', 'guard_education_approval', 'crm_role', 'crm_can_access', 'crm_owner_for_code', 'crm_intake_submission', 'crm_assign_lead'];
export const expectedTriggers = ['create_account_profile', 'sync_approved_application_profile', 'assign_education_ack', 'guard_education_approval', 'crm_intake'];
export const drizzleSchemaEmpty = !/\b(?:pgTable|pgSchema)\s*\(/.test(drizzleSource);
export function compareSchema(expected: Table[], actual: Table[]): Finding[] {
  const findings: Finding[] = [];
  for (const table of expected) {
    const live = actual.find(t => t.name === table.name);
    if (!live) { findings.push({ severity: 'error', object: table.name, expected: 'Table present', actual: 'Missing table' }); continue; }
    if (!live.rls) findings.push({ severity: 'error', object: table.name, expected: 'Row security enabled', actual: 'Disabled' });
    for (const column of table.columns) {
      const found = live.columns.find(c => c.name === column.name);
      const object = `${table.name}.${column.name}`;
      if (!found) { findings.push({ severity: 'error', object, expected: column.type, actual: 'Missing column' }); continue; }
      if (normalizeType(found.type) !== normalizeType(column.type)) findings.push({ severity: 'error', object, expected: column.type, actual: found.type });
      if (found.nullable !== column.nullable) findings.push({ severity: 'error', object, expected: column.nullable ? 'Nullable' : 'Not nullable', actual: found.nullable ? 'Nullable' : 'Not nullable' });
    }
    for (const column of live.columns) if (!table.columns.some(c => c.name === column.name)) findings.push({ severity: 'warning', object: `${table.name}.${column.name}`, expected: 'Not declared', actual: 'Additional column' });
  }
  for (const table of actual) if (!expected.some(t => t.name === table.name)) findings.push({ severity: 'warning', object: table.name, expected: 'Not declared', actual: 'Additional table' });
  return findings;
}
