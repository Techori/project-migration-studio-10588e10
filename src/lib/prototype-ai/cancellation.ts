export function isAssessmentAbort(error: unknown, signal: AbortSignal) {
  return signal.aborted || (typeof error === "object" && error !== null && "name" in error && error.name === "AbortError");
}

export function reportAssessmentStreamError(error: unknown, signal: AbortSignal) {
  // Explicit Stop/disconnect is normal lifecycle, not a preview runtime error.
  if (isAssessmentAbort(error, signal)) return;
  console.error("Prototype assessment stream failed", error);
}