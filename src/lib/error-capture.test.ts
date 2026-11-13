import { describe, expect, it } from "vitest";
import { isExpectedAbort } from "./error-capture";

describe("Server disconnect classification", () => {
  it("recognizes framework-wrapped aborts", () => {
    expect(isExpectedAbort(new Error("HTTPError", { cause: new DOMException("Stopped", "AbortError") }))).toBe(true);
  });
  it("does not suppress actual failures", () => {
    expect(isExpectedAbort(new Error("HTTPError", { cause: new Error("Database failure") }))).toBe(false);
  });
});