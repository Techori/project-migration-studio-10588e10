import { describe, it, expect } from "vitest";
import { redactContacts } from "./people-profiles";
describe("redactContacts", () => {
  it("removes emails, phones and links", () => {
    const out = redactContacts("Call +91 98765 43210 or mail a.b@x.com, see www.x.com today");
    expect(out).not.toMatch(/@|98765|www/);
    expect(out).toContain("today");
  });
});
