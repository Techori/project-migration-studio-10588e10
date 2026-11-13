import { describe, expect, it } from "vitest";
import { countryCurrencies, displayFee, feeSchema, internationalServices, indiaRegistrationOptions, summitParticipation, fundingProcess } from "./international-programme";

describe("International programme rules", () => {
  it("offers only India registration at 999 with 18 percent GST and no participant limit", () => {
    expect(indiaRegistrationOptions).toEqual([{ amount: 999, gstPercent: 18 }]);
  });
  it("charges 3599 per participant for an optional summit package without fare support", () => {
    expect(summitParticipation).toEqual({ amount: 3599, optional: true, perParticipant: true, includes: ["Accommodation", "Food", "Local Travel", "Local Tour"] });
  });
  it("keeps the full process online except the offline Gwalior summit", () => {
    expect(fundingProcess).toEqual({ registration: "online", evaluation: "online", mentorship: "online", pitches: "online", summit: "offline", summitCity: "Gwalior" });
  });
  it("offers exactly the four overseas services", () => {
    expect(internationalServices.map(s => s.title)).toEqual(["Research & Strategy", "Business Fundings & Grants", "Manpower Services", "Mentorship"]);
  });
  it("shows the requested USA USD 169 fee without conversion", () => {
    expect(displayFee(feeSchema.parse({ country: "usa", currency: "USD", amount: 169 }))).toBe("USD 169");
  });
  it("does not invent fees for unspecified countries", () => {
    for (const country of ["uk", "uae", "canada", "singapore", "europe", "australia"] as const) {
      expect(feeSchema.parse({ country, currency: countryCurrencies[country], amount: null }).amount).toBeNull();
    }
  });
  it("requires the country's own currency and a positive amount", () => {
    expect(feeSchema.safeParse({ country: "usa", currency: "INR", amount: 169 }).success).toBe(false);
    expect(feeSchema.safeParse({ country: "usa", currency: "USD", amount: 0 }).success).toBe(false);
  });
});