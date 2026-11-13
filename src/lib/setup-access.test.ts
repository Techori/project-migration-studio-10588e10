import { describe, expect, it } from 'vitest';
import { requireSetupAdmin } from './setup-access';

describe('setup check admin access', () => {
  it('allows verified admins', () => expect(() => requireSetupAdmin(true, false)).not.toThrow());
  it('rejects ordinary users', () => expect(() => requireSetupAdmin(false, false)).toThrow('Admin access required.'));
  it('rejects missing roles', () => expect(() => requireSetupAdmin(null, false)).toThrow('Admin access required.'));
  it('fails closed on role lookup errors', () => expect(() => requireSetupAdmin(true, true)).toThrow('Admin access required.'));
});