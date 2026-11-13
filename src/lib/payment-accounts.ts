export type PaymentAccount = { country: string; currency: string; methods: { name: string; fields: [string, string][] }[]; bank?: string; address?: string; addressLabel?: string };
export const paymentAccounts: PaymentAccount[] = [
  { country: "usa", currency: "USD", bank: "Community Federal Savings Bank", address: "5 Penn Plaza, 14th Floor, New York, NY 10001, US", methods: [
    { name: "ACH", fields: [["Account number", "8336709886"], ["ACH routing number", "026073150"]] },
    { name: "Fedwire", fields: [["Account number", "8336709886"], ["Fedwire routing number", "026073008"]] },
  ] },
  { country: "uk", currency: "GBP", bank: "Banking Circle", address: "68 King William Street, London, EC4N 7HR, United Kingdom", methods: [{ name: "FPS / CHAPS / BACS", fields: [["Account number", "45627976"], ["Sort code", "608382"]] }] },
  { country: "uae", currency: "AED", bank: "Zand Bank PJSC", address: "1st Floor, Emaar Square, Building 6, Dubai, United Arab Emirates", methods: [{ name: "IPP / FTS", fields: [["IBAN", "AE510960000691060025216"], ["BIC / SWIFT", "ZANDAEAAXXX"]] }] },
  { country: "europe", currency: "EUR", bank: "Banking Circle", address: "Banking Circle S.A. – German Branch, Maximilianstraße 54, 80538 München", methods: [{ name: "SEPA / SEPA Instant", fields: [["IBAN", "DE66202208000045627976"], ["BIC / SWIFT", "SXPYDEHH"]] }] },
  { country: "canada", currency: "CAD", bank: "Digital Commerce Bank", address: "736 Meridian Road N.E, Calgary, Alberta, CA", methods: [{ name: "EFT", fields: [["Account number", "977364231"], ["Routing number", "035210009"], ["Institution number", "352"], ["Transit number", "10009"]] }] },
  { country: "australia", currency: "AUD", bank: "BC Payments", address: "Level 11/10 Carrington St, Sydney NSW 2000, Australia", addressLabel: "Beneficiary address", methods: [{ name: "BECS / NPP / OSKO", fields: [["Account number", "045627976"], ["BSB number", "252000"]] }] },
  { country: "singapore", currency: "SGD", methods: [] },
];
export const accountHolder = "Rishishwar Industry Private Limited";