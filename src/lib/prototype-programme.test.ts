import { describe, expect, it } from "vitest";
import { prototypeProgramme, prototypeRegistrationTotal, prototypeScorecard } from "./prototype-programme";

describe("Prototype programme rules", () => {
  it("charges 999 plus 18 percent GST", () => {
    expect(prototypeProgramme.registrationFee).toBe(999);
    expect(prototypeProgramme.gstPercent).toBe(18);
    expect(prototypeRegistrationTotal()).toBe(1178.82);
  });
  it("focuses only on prototype and seed funding", () => {
    expect(prototypeProgramme.fundingFocus).toEqual(["Prototype funding", "Seed funding"]);
  });
  it("limits idea videos to 60 seconds", () => {
    expect(prototypeProgramme.videoMaxSeconds).toBe(60);
  });
  it("limits shortlisted pitches to five minutes", () => {
    expect(prototypeProgramme.pitchMaxMinutes).toBe(5);
  });
  it("retains the document's indicative prototype support range", () => {
    expect(prototypeProgramme.supportRange).toEqual({ min: 25000, max: 50000 });
  });
  it("retains the proposed 100-point scorecard weights", () => {
    expect(prototypeScorecard.map(row => row[1])).toEqual([20, 20, 20, 15, 10, 10, 5]);
    expect(prototypeScorecard.reduce((total, row) => total + row[1], 0)).toBe(100);
  });
});