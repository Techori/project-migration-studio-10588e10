import { afterEach, describe, expect, it, vi } from "vitest";
import { isAssessmentAbort, reportAssessmentStreamError } from "./cancellation";

afterEach(() => vi.restoreAllMocks());
describe("Assessment cancellation", () => {
  it("does not report Stop as a runtime error", () => {
    const controller = new AbortController(); controller.abort();
    const logger = vi.spyOn(console, "error").mockImplementation(() => {});
    reportAssessmentStreamError(new DOMException("This operation was aborted", "AbortError"), controller.signal);
    expect(logger).not.toHaveBeenCalled();
    expect(isAssessmentAbort(new Error("disconnected"), controller.signal)).toBe(true);
  });
  it("recognizes AbortError before the request signal changes", () => {
    expect(isAssessmentAbort(new DOMException("Stopped", "AbortError"), new AbortController().signal)).toBe(true);
  });
  it("still reports genuine failures", () => {
    const logger = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("Unexpected provider failure");
    reportAssessmentStreamError(error, new AbortController().signal);
    expect(logger).toHaveBeenCalledWith("Prototype assessment stream failed", error);
  });
});