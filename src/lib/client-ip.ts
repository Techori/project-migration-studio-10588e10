/** The visitor's IP for rate limiting, as set by the hosting edge. */
export function requestClientIp(request: Request): string | null {
  return request.headers.get("cf-connecting-ip") ?? null;
}
