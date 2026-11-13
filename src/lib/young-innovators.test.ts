import { describe, expect, it } from "vitest";
import { youngInnovators } from "./young-innovators";

describe("Young Innovators student business and startup scope", () => {
  it("is for school students with business or startup ideas", () => {
    expect(youngInnovators.audiences).toEqual(["school-students"]);
    expect(youngInnovators.ideaScope).toEqual(["business", "startup"]);
  });
  it("keeps the supplied class 6 to 12 audience", () => {
    expect([youngInnovators.minClass, youngInnovators.maxClass]).toEqual([6, 12]);
  });
  it("does not invent confirmed registration fees", () => {
    expect(youngInnovators.registrationFee).toBeNull();
  });
  it("preserves the 60-second idea video", () => {
    expect(youngInnovators.videoSeconds).toBe(60);
  });
  it("does not represent draft details as confirmed registration", () => {
    expect(youngInnovators.detailsConfirmed).toBe(false);
  });
  it("preserves the supplied fee bands and GST", () => {
    expect(youngInnovators.feeBands.map(b => [b.amount, b.gstPercent])).toEqual([[249, 18], [349, 18], [499, 18]]);
  });
  it("preserves the supplied total rewards of 7.5 lakh", () => {
    expect(youngInnovators.prizes.reduce((sum, p) => sum + p.amount, 0) + youngInnovators.additionalPrizes.count * youngInnovators.additionalPrizes.amount).toBe(750000);
  });
  it("retains the poster registration and video dates", () => {
    expect(youngInnovators.schedule).toEqual({ registrationOpens: "2026-11-02", registrationCloses: "2026-11-06", videoDeadline: "2026-11-06", finalEvent: null });
  });
  it("limits the separate likes reward to the first 100 participants", () => {
    expect(youngInnovators.likesReward.count).toBe(100);
  });
  it("requires crossing 5000 likes", () => {
    expect(youngInnovators.likesReward.likesThresholdExclusive).toBe(5000);
  });
  it("awards 5000 rupees per qualifying participant", () => {
    expect(youngInnovators.likesReward.amount).toBe(5000);
  });
  it("requires a claim", () => {
    expect(youngInnovators.likesReward.claimRequired).toBe(true);
  });
  it("applies terms and conditions", () => {
    expect(youngInnovators.likesReward.termsApply).toBe(true);
  });
  it("keeps likes rewards separate from existing prizes", () => {
    expect(youngInnovators.likesReward.separateFromPrizePool).toBe(true);
  });
});