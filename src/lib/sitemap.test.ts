import { describe, expect, it } from "vitest";
import { sitemapXML } from "./sitemap";

describe("sitemap output", () => {
  it("omits unverified change dates", () => {
    expect(sitemapXML("https://riloyd-project-migration-studio.lovable.app", [{ path: "/young-innovators-2026" }])).not.toContain("lastmod");
  });
  it("rejects external paths", () => {
    expect(() => sitemapXML("https://riloyd-project-migration-studio.lovable.app", [{ path: "//example.com" }])).toThrow();
  });
  it("deduplicates pages", () => {
    expect(sitemapXML("https://riloyd-project-migration-studio.lovable.app", [{ path: "/about" }, { path: "/about" }]).match(/<url>/g)).toHaveLength(1);
  });
});