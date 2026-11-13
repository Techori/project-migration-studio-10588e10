import { createServerOnlyFn } from '@tanstack/react-start';

async function key(secret: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret));
  return crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['encrypt', 'decrypt']);
}
export const encryptDetails = createServerOnlyFn(async (details: Record<string, string>, secret: string) => {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await key(secret), new TextEncoder().encode(JSON.stringify(details)));
  return JSON.stringify({ iv: Array.from(iv), data: Array.from(new Uint8Array(encrypted)) });
});
export const decryptDetails = createServerOnlyFn(async (ciphertext: string, secret: string): Promise<Record<string, string>> => {
  const payload = JSON.parse(ciphertext) as { iv: number[]; data: number[] };
  const decoded = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(payload.iv) }, await key(secret), new Uint8Array(payload.data));
  return JSON.parse(new TextDecoder().decode(decoded));
});