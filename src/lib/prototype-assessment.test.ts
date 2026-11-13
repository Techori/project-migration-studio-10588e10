import { describe, expect, it } from "vitest";
import { consumeAssessmentLines, prototypeAssessmentSchema } from "./prototype-assessment";

const valid = { idea: "An affordable sensor for small farms to measure soil moisture.", prototype: "Build and test five sensor kits over eight weeks with an INR 40000 budget.", context: "India-based adult founder owning the design and available to pitch.", fundingGoal: "INR 40000 for five sensor kits and a farmer pilot within eight weeks.", consent: true };
describe("Prototype assessment safeguards", () => {
  it("does not persist advice without explicit storage consent", () => {
    expect(prototypeAssessmentSchema.parse(valid).saveSubmission).toBe(false);
    expect(prototypeAssessmentSchema.parse({ ...valid, saveSubmission: true }).saveSubmission).toBe(true);
  });
  it("requires a funding goal for personalized preparation advice", () => {
    expect(prototypeAssessmentSchema.safeParse(valid).success).toBe(true);
    expect(prototypeAssessmentSchema.safeParse({ ...valid, fundingGoal: "" }).success).toBe(false);
    const { fundingGoal: _goal, ...withoutGoal } = valid;
    expect(prototypeAssessmentSchema.safeParse(withoutGoal).success).toBe(false);
  });
  it("requires explicit AI consent", () => {
    expect(prototypeAssessmentSchema.safeParse(valid).success).toBe(true);
    expect(prototypeAssessmentSchema.safeParse({ ...valid, consent: false }).success).toBe(false);
  });
  it("rejects oversized descriptions", () => {
    expect(prototypeAssessmentSchema.safeParse({ ...valid, idea: "a".repeat(4001) }).success).toBe(false);
  });
  it("rejects missing prototype details", () => {
    expect(prototypeAssessmentSchema.safeParse({ ...valid, prototype: "" }).success).toBe(false);
  });
  it("consumes split frames and metadata before text without stalling", async () => {
    const encoder = new TextEncoder();
    const chunks = ['{"type":"started"}\n', '{"type":"text","te', 'xt":"Hello"}\n{"type":"done"}', '\n'];
    const stream = new ReadableStream<Uint8Array>({ start(controller) { chunks.forEach(chunk => controller.enqueue(encoder.encode(chunk))); controller.close(); } });
    const events: string[] = [];
    await consumeAssessmentLines(stream.getReader(), event => events.push(event.type));
    expect(events).toEqual(["started", "text", "done"]);
  });
});