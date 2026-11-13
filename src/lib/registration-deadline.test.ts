import { describe, expect, it } from "vitest";
import { countdownParts, registrationDeadline } from "./registration-deadline";

describe("Registration countdown", () => {
  it("closes registration at the end of 10 November 2026 IST", () => {
    expect(registrationDeadline.toISOString()).toBe("2026-11-10T18:29:59.000Z");
  });
  it("counts down days, hours, minutes and seconds before the deadline", () => {
    const parts = countdownParts(new Date("2026-11-09T18:30:00.000Z"));
    expect(parts).toEqual({ days: 0, hours: 23, minutes: 59, seconds: 59, closed: false });
  });
  it("reports nine days and nearly 24 hours remaining on 31 October 2026 IST evening", () => {
    const parts = countdownParts(new Date("2026-10-31T18:30:00.000Z"));
    expect(parts).toEqual({ days: 9, hours: 23, minutes: 59, seconds: 59, closed: false });
  });
  it("marks registration closed at and after the deadline", () => {
    expect(countdownParts(new Date("2026-11-10T18:30:00.000Z")).closed).toBe(true);
    expect(countdownParts(new Date("2026-12-01T00:00:00.000Z"))).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, closed: true });
  });
});
