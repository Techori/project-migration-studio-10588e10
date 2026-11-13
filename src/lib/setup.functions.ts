import { createServerFn } from '@tanstack/react-start';
import { setResponseHeader } from '@tanstack/react-start/server';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { compareSchema, drizzleSchemaEmpty, expectedFunctions, expectedTables, expectedTriggers, type Finding } from './setup-contract';
import { requireSetupAdmin } from './setup-access';
const metadataSchema = z.object({ tables: z.array(z.object({ name: z.string(), rls: z.boolean(), columns: z.array(z.object({ name: z.string(), type: z.string(), nullable: z.boolean() })) })), functions: z.array(z.string()), triggers: z.array(z.string()) });
export const checkSetup = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    setResponseHeader('Cache-Control', 'no-store');
    const { data: admin, error: roleError } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
    requireSetupAdmin(admin, Boolean(roleError));
    const { data, error } = await context.supabase.rpc('admin_setup_metadata');
    if (error) throw new Error('Setup metadata could not be read. No changes were made.');
    const metadata = metadataSchema.parse(data);
    const findings: Finding[] = compareSchema(expectedTables, metadata.tables);
    if (drizzleSchemaEmpty) findings.unshift({ severity: 'warning', object: 'drizzle/schema.ts', expected: 'Declared Drizzle tables', actual: 'Empty placeholder; comparing retained SQL declarations and application baseline instead' });
    for (const name of expectedFunctions) if (!metadata.functions.includes(name)) findings.push({ severity: 'error', object: name, expected: 'Required function present', actual: 'Missing function' });
    for (const name of expectedTriggers) if (!metadata.triggers.includes(name)) findings.push({ severity: 'error', object: name, expected: 'Required trigger present', actual: 'Missing trigger' });
    // Only metadata is read; no rows, limiter, verification or repair functions are called.
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: buckets, error: bucketError } = await supabaseAdmin.storage.listBuckets();
    for (const name of ['registration-documents', 'customer-reports', 'country-logos']) {
      const bucket = buckets?.find(b => b.name === name);
      if (bucketError) findings.push({ severity: 'warning', object: name, expected: 'Private storage verified', actual: 'Storage check unavailable' });
      else if (!bucket || bucket.public) findings.push({ severity: 'error', object: name, expected: 'Private bucket', actual: bucket ? 'Public bucket' : 'Missing bucket' });
    }
    return { checkedAt: new Date().toISOString(), tableCount: metadata.tables.length, expectedCount: expectedTables.length, findings, drizzleSchemaEmpty };
  });

export const resetPrototypeAiPause = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    setResponseHeader('Cache-Control', 'no-store');
    const { data: admin, error } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
    requireSetupAdmin(admin, Boolean(error));
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { error: resetError } = await supabaseAdmin.from('prototype_ai_access_state').delete().eq('model_id', 'openai/gpt-6-astra');
    if (resetError) throw new Error('AI pause could not be reset.');
    return { ok: true };
  });
