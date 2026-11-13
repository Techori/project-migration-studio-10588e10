export function requireSetupAdmin(admin: boolean | null, failed: boolean) {
  if (failed || admin !== true) throw new Error('Admin access required.');
}