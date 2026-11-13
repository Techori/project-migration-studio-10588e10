import { describe, expect, it } from "vitest";
import { paymentAccounts } from "./payment-accounts";

describe("Published payment accounts", () => {
  it("shows all six available accounts without inventing missing accounts", () => {
    expect(paymentAccounts.filter(account => account.methods.length > 0).map(account => account.currency)).toEqual(["USD", "GBP", "AED", "EUR", "CAD", "AUD"]);
    expect(paymentAccounts.find(account => account.country === "singapore")?.methods).toEqual([]);
  });
});