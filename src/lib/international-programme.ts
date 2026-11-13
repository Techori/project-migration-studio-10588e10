import { z } from "zod";

export const countryCurrencies = { india: "INR", uk: "GBP", uae: "AED", canada: "CAD", usa: "USD", singapore: "SGD", europe: "EUR", australia: "AUD" } as const;
export type ProgrammeCountry = keyof typeof countryCurrencies;
export const feeSchema = z.object({
  country: z.enum(["india", "uk", "uae", "canada", "usa", "singapore", "europe", "australia"]),
  currency: z.enum(["INR", "GBP", "AED", "CAD", "USD", "SGD", "EUR", "AUD"]),
  amount: z.number().finite().positive().max(1000000).nullable(),
}).refine(row => row.currency === countryCurrencies[row.country], "Choose the country's currency.");
export type ProgrammeFee = z.infer<typeof feeSchema>;
export const indiaRegistrationOptions = [
  { amount: 999, gstPercent: 18 },
] as const;
export const summitParticipation = { amount: 3599, optional: true, perParticipant: true, includes: ["Accommodation", "Food", "Local Travel", "Local Tour"] } as const;
export const fundingProcess = { registration: "online", evaluation: "online", mentorship: "online", pitches: "online", summit: "offline", summitCity: "Gwalior" } as const;
export function indiaRegistrationSummary() {
  return indiaRegistrationOptions.map(option => `₹${option.amount.toLocaleString("en-IN")}/- +${option.gstPercent}% GST`).join("; ");
}
export const internationalServices = [
  { id: "research", title: "Research & Strategy", copy: "Market evidence, competitor insight and a practical strategy shaped around your local market and connections with India." },
  { id: "funding", title: "Business Fundings & Grants", copy: "Funding-readiness, pitch preparation and relevant grant research. Eligibility, due diligence and funder decisions apply; funding is not guaranteed." },
  { id: "manpower", title: "Manpower Services", copy: "Talent sourcing and workforce planning aligned with your business needs. Local employment and immigration requirements must be assessed separately." },
  { id: "mentorship", title: "Mentorship", copy: "Founder guidance on your idea, business model and investor pitch, bringing an Indian entrepreneurial perspective to your local ambition." },
] as const;

export const marketContext: Record<ProgrammeCountry, { focus: string; bridge: string }> = {
  india: { focus: "Indian ambition. A world of possibilities.", bridge: "From Gwalior to India's entrepreneurial centres, we bring research, funding readiness, talent and mentorship together with our wider Indian service offering." },
  uk: { focus: "British innovation. Indian entrepreneurial energy.", bridge: "Explore Britain's fintech, research and creative-business landscape with a perspective that connects UK founders and India's entrepreneurial ecosystem." },
  uae: { focus: "Gulf ambition. Indian enterprise.", bridge: "From Dubai's international trade to Abu Dhabi's innovation agenda, build a considered business plan with the UAE's commercial culture and India–Gulf connections in mind." },
  canada: { focus: "Canadian ideas. An India-connected outlook.", bridge: "From Toronto's diverse founder community to Canada's technology and clean-growth ecosystems, ground your decisions in Canadian market context and an Indian entrepreneurial perspective." },
  usa: { focus: "American ambition. Indian ingenuity.", bridge: "From New York's commercial networks to America's startup communities, sharpen your proposition for a competitive market while connecting with India's founder and mentor ecosystem." },
  singapore: { focus: "Singapore precision. Indian possibility.", bridge: "Approach Southeast Asia from Singapore's connected business ecosystem, combining disciplined market research with an India-connected perspective on founders, talent and capital." },
  europe: { focus: "European diversity. Indian entrepreneurial spirit.", bridge: "Europe is many distinct markets, not one. Compare local demand, languages and business cultures before choosing a focus, with India's entrepreneurial ecosystem as a complementary connection." },
  australia: { focus: "Australian ingenuity. Indian connections.", bridge: "From Sydney's startup scene to Australia's wider innovation communities, develop a locally informed plan that recognises the growing connections between Australia and India." },
};

export function displayFee(fee: ProgrammeFee | undefined) {
  if (!fee || fee.amount === null) return "Fee to be announced";
  return `${fee.currency} ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(fee.amount)}`;
}