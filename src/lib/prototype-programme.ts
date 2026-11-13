export const prototypeProgramme = {
  registrationFee: 999,
  gstPercent: 18,
  videoMaxSeconds: 60,
  pitchMaxMinutes: 5,
  fundingFocus: ["Prototype funding", "Seed funding"],
  supportRange: { min: 25000, max: 50000 },
} as const;

export function prototypeRegistrationTotal() {
  return Math.round(prototypeProgramme.registrationFee * (1 + prototypeProgramme.gstPercent / 100) * 100) / 100;
}

export const prototypeEligibility = [
  ["Founders & innovators", "Individual innovators, aspiring founders, student founders and early-stage startups with an original idea or a product needing prototype development."],
  ["India-focused ventures", "Be based in India or build a venture intended to operate in India. Founders should be 18 or older; younger applicants may apply through a parent or legal guardian where permitted."],
  ["Early-stage ideas welcome", "Idea validation, proof of concept (PoC), prototype development and early-stage product improvement are eligible stages."],
  ["No company required initially", "A registered company is not mandatory for initial idea submission. Identity, entity, tax and bank documents may be required before disbursement, as applicable."],
  ["A clear next step", "Explain the problem, target users and a realistic plan for what you will build or test next."],
  ["Your idea, your rights", "Own or have permission to use all submitted ideas, designs, software, content and other intellectual property."],
] as const;

export const ideaVideoTimeline = [
  ["0–10 sec", "Introduce yourself", "Founder name, startup or idea name and a one-line introduction."],
  ["10–25 sec", "Explain the problem", "What problem are you solving, and who faces it?"],
  ["25–45 sec", "Present your solution", "Describe the solution and how it works."],
  ["45–60 sec", "Your next milestone", "Explain what you want to build or validate next."],
] as const;

export const prototypeScorecard = [
  ["Problem significance & customer need", 20, "Evidence of a real need"],
  ["Innovation & differentiation", 20, "Distinct value or an improved approach"],
  ["Prototype plan & feasibility", 20, "Practical scope, timeline and budget"],
  ["Market potential & impact", 15, "Target users, demand and relevance"],
  ["Team capability & commitment", 10, "Skills, ownership and ability to execute"],
  ["Business model & scalability", 10, "Adoption and sustainability"],
  ["Pitch clarity & responsiveness", 5, "Clear, credible communication"],
] as const;

export const prototypePitchTimeline = [
  ["0:00–0:30", "Introduction", "Founder, idea and vision."],
  ["0:30–1:15", "Problem & solution", "Customer pain point, solution and key difference."],
  ["1:15–2:00", "Market & users", "Who needs it and why the opportunity matters."],
  ["2:00–3:00", "Progress & model", "Prototype status, validation, revenue model or adoption plan."],
  ["3:00–4:15", "Prototype budget", "Amount requested, cost breakdown and intended use."],
  ["4:15–5:00", "Milestones", "Specific outcomes and timeline after support."],
] as const;