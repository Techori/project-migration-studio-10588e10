import { describe, expect, it } from "vitest";
import { countryLogoSchema, matchesLogoSignature, resolveLogo, validateLogoFile } from "./country-logo-schemas";

describe("Country logo management", () => {
  it("keeps country and theme replacements separate", () => {
    const logos = [{ country: "uae" as const, theme: "dark" as const, url: "new-logo" }];
    expect(resolveLogo(logos, "uae", "dark", "old")).toBe("new-logo");
    expect(resolveLogo(logos, "uae", "light", "old")).toBe("old");
    expect(resolveLogo(logos, "uk", "dark", "old")).toBe("old");
  });
  it("accepts only supported countries and light or dark theme", () => {
    expect(countryLogoSchema.safeParse({ country: "uk", theme: "light" }).success).toBe(true);
    expect(countryLogoSchema.safeParse({ country: "unknown", theme: "light" }).success).toBe(false);
    expect(countryLogoSchema.safeParse({ country: "uae", theme: "auto" }).success).toBe(false);
  });
  it("rejects non-image uploads and oversized files", () => {
    expect(validateLogoFile({ type: "image/png", size: 1024 })).toBe("png");
    expect(() => validateLogoFile({ type: "image/svg+xml", size: 100 })).toThrow();
    expect(() => validateLogoFile({ type: "image/png", size: 5 * 1024 * 1024 + 1 })).toThrow();
  });
  it("rejects spoofed image contents", () => {
    expect(matchesLogoSignature(new Uint8Array([137,80,78,71,13,10,26,10]), "png")).toBe(true);
    expect(matchesLogoSignature(new TextEncoder().encode("<script>"), "png")).toBe(false);
  });
});