// School students with business/startup ideas; entry terms remain unconfirmed.
export const youngInnovators = {
  year: 2026,
  audiences: ["school-students"],
  ideaScope: ["business", "startup"],
  minClass: 6,
  maxClass: 12,
  videoSeconds: 60,
  detailsConfirmed: false,
  registrationFee: null,
  feeBands: [
    { classes: "Class 6–8", amount: 249, gstPercent: 18 },
    { classes: "Class 9–10", amount: 349, gstPercent: 18 },
    { classes: "Class 11–12", amount: 499, gstPercent: 18 },
  ],
  prizes: [{ place: "First prize", amount: 250000 }, { place: "Second prize", amount: 150000 }, { place: "Third prize", amount: 100000 }],
  additionalPrizes: { count: 25, amount: 10000 },
  likesReward: { count: 100, likesThresholdExclusive: 5000, amount: 5000, claimRequired: true, termsApply: true, separateFromPrizePool: true },
  schedule: { registrationOpens: "2026-11-02", registrationCloses: "2026-11-06", videoDeadline: "2026-11-06", finalEvent: null },
};

export const innovationThemes = [
  { id: "business-model", title: "Business idea", prompt: "What would you offer, who would use it and why might they pay for it? Start with a simple idea you can explain.", examples: ["A useful product idea", "A service people need", "A simple way to earn revenue"] },
  { id: "product", title: "Product & prototype", prompt: "Show your startup idea through a drawing, model or simple demonstration.", examples: ["A labelled product sketch", "A handmade model", "A simple app mock-up"] },
  { id: "market", title: "Know your customer", prompt: "Think about the people your idea could help and the problem they face.", examples: ["Describe your first customer", "Ask for feedback with adult guidance", "Compare existing solutions"] },
  { id: "growth", title: "Startup plan", prompt: "Imagine the first small steps that could turn your idea into a startup.", examples: ["Choose one thing to test", "Explain how you would reach customers", "Plan your next improvement"] },
  { id: "operations", title: "Costs & pricing", prompt: "Think about what your idea would cost to make and a sensible price someone might pay.", examples: ["List basic materials", "Estimate the cost of one product", "Explain a possible selling price"] },
  { id: "investment", title: "Pitch your idea", prompt: "Tell a clear story about the problem, your business solution and what you want to try next.", examples: ["A 60-second idea explanation", "A sketch or model to show", "One realistic next step"] },
];