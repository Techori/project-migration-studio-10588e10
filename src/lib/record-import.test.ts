import { describe, expect, it } from 'vitest';
import { importSchemas, mapCsvRows, parseCsv } from './record-import';

describe('guided imports',()=>{
 it('reads quoted multiline exported CSV fields',()=>{const csv=parseCsv('name,email,message\n"Example, Person",person@example.test,"Line one\nLine two"');expect(csv.rows[0]?.['message']).toBe('Line one\nLine two');expect(csv.rows[0]?.['name']).toBe('Example, Person');});
 it('maps renamed columns and requires a valid email before import',()=>{const rows=[{Name:'Example',Mail:'not-an-email'}];const result=mapCsvRows('contact_submissions',rows,{name:'Name',email:'Mail'});expect(result[0]?.errors.some(e=>e.startsWith('email:'))).toBe(true);});
 it('excludes auth and role destinations',()=>{expect(Object.keys(importSchemas)).not.toContain('user_roles');expect(importSchemas.contact_submissions.safeParse({name:'Example',email:'person@example.test',role:'admin'}).success).toBe(false);});
 it('preserves record IDs to avoid duplicate imports',()=>{const id='bd53f722-30d2-4ce5-9111-40bbf2c33f9a';expect(mapCsvRows('contact_submissions',[{id,name:'Example',email:'person@example.test'}],{id:'id',name:'name',email:'email'})[0]?.record['id']).toBe(id);});
 it('rejects unsafe file destinations',()=>{expect(importSchemas.country_logos.safeParse({country:'india',theme:'light',file_path:'../private.png'}).success).toBe(false);});
 it('converts JSON, integers and consent without fabricating consent',()=>{const r=mapCsvRows('people_profiles',[{name:'Example',slug:'example',group:'team',focus:'["Finance"]',order:'2'}],{name:'name',slug:'slug',person_group:'group',focus:'focus',sort_order:'order'});expect(r[0]?.errors).toEqual([]);expect(r[0]?.record['focus']).toEqual(['Finance']);expect(r[0]?.record['sort_order']).toBe(2);expect(importSchemas.young_innovators_registrations.shape.guardian_consent.safeParse(false).success).toBe(false);});
 it('blocks an invalid calendar date',()=>{expect(importSchemas.customer_reports.shape.publish_date.safeParse('2026-02-30').success).toBe(false);});
});