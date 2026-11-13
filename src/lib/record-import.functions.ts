import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { importSchemas, type ImportTable } from './record-import';
import type { Json } from '@/integrations/supabase/types';

export const importRecords = createServerFn({ method:'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((input:unknown) => z.object({ table:z.string(), rows:z.array(z.record(z.string(),z.unknown())).min(1).max(1000) }).parse(input))
  .handler(async ({ data, context }) => {
    const { data:admin, error:roleError } = await context.supabase.rpc('has_role',{ _user_id:context.userId, _role:'admin' });
    if (!admin || roleError) throw new Error('Admin access required.');
    if (!Object.hasOwn(importSchemas,data.table)) throw new Error('Unsupported import destination.');
    const table = data.table as ImportTable;
    const rows = data.rows.map(r => importSchemas[table].parse(r));
    const { data:result, error } = await context.supabase.rpc('admin_import_records',{ _table:table, _rows:rows as Json });
    if (error) throw new Error('Import cancelled; no rows were saved. Check duplicate values, dates, and required fields.');
    const counts = z.object({ inserted:z.number(), skipped:z.number() }).parse(result);
    return counts;
  });