import { describe, expect, it } from 'vitest';
import { applySqlAlters, compareSchema, parseSqlTables, expectedTables, type Table } from './setup-contract';
const table: Table = { name: 'employees', rls: true, columns: [{ name: 'id', type: 'uuid', nullable: false }] };
describe('read-only schema comparison', () => {
  it('detects missing tables', () => expect(compareSchema([table], [])).toEqual([{ severity: 'error', object: 'employees', expected: 'Table present', actual: 'Missing table' }]));
  it('detects type mismatch', () => expect(compareSchema([table], [{ ...table, columns: [{ name: 'id', type: 'text', nullable: false }] }])[0]?.actual).toBe('text'));
  it('detects nullable mismatch', () => expect(compareSchema([table], [{ ...table, columns: [{ name: 'id', type: 'uuid', nullable: true }] }])[0]?.actual).toBe('Nullable'));
  it('detects missing columns', () => expect(compareSchema([table], [{ ...table, columns: [] }])[0]?.actual).toBe('Missing column'));
  it('flags disabled row security', () => expect(compareSchema([table], [{ ...table, rls: false }])[0]?.actual).toBe('Disabled'));
  it('reports additional tables', () => expect(compareSchema([], [table])[0]?.actual).toBe('Additional table'));
  it('does not mutate inputs', () => { const before = JSON.stringify(table); compareSchema([table], [table]); expect(JSON.stringify(table)).toBe(before); });
  it('retains all required tables', () => expect(expectedTables.map(t => t.name).sort()).toEqual(['contact_submissions','country_logos','country_programme_fees','crm_activities','crm_customers','crm_employee_profiles','crm_leads','crm_memberships','crm_targets','crm_tasks','crm_tickets','customer_reports','education_district_codes','education_staff_access','education_support_registrations','employee_verification_attempts','employees','form_submission_limits','people_profiles','profiles','prototype_ai_access_state','prototype_submissions','registration_applications','user_roles','young_innovators_registrations']));
  it('reads compact SQL with nested defaults and array types', () => expect(parseSqlTables("CREATE TABLE public.test (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tags text[] NOT NULL DEFAULT '{}', label text DEFAULT 'a,b', UNIQUE(id,label));")[0]?.columns).toEqual([{name:'id',type:'uuid',nullable:false},{name:'tags',type:'text[]',nullable:false},{name:'label',type:'text',nullable:true}]));
  it('parses SQL requiredness', () => expect(parseSqlTables('CREATE TABLE public.test (\n id uuid PRIMARY KEY,\n note text\n);')[0]?.columns).toEqual([{ name: 'id', type: 'uuid', nullable: false }, { name: 'note', type: 'text', nullable: true }]));
  it('applies later added columns and relaxed NOT NULL', () => {
    const tables = parseSqlTables('CREATE TABLE public.pay (id uuid PRIMARY KEY, ref text NOT NULL);');
    applySqlAlters(tables, "ALTER TABLE public.pay ADD COLUMN provider text NOT NULL DEFAULT 'a', ADD COLUMN note text;\nALTER TABLE public.pay ALTER COLUMN ref DROP NOT NULL;");
    expect(tables[0]?.columns).toEqual([{ name: 'id', type: 'uuid', nullable: false }, { name: 'ref', type: 'text', nullable: true }, { name: 'provider', type: 'text', nullable: false }, { name: 'note', type: 'text', nullable: true }]);
  });
});
