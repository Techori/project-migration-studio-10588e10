import { describe, expect, it } from "vitest";
import { siteStats } from "@/lib/site-stats";
import { registrationConfigs } from "@/lib/registration-config";

describe("site stats consistency", () => {
  it("keeps the four canonical impact numbers", () => {
    expect(siteStats).toEqual([
      ["₹150Cr+", "Funding Enabled"],
      ["15+", "Industries Served"],
      ["75+", "Businesses Advised"],
      ["200+", "Startup Ideas Analyzed"],
    ]);
  });

  it("shows the same stats on every registration page", () => {
    for (const config of Object.values(registrationConfigs)) {
      expect(config.stats).toEqual([...siteStats]);
    }
  });
});
