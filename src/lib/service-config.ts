import type { StaticImageData } from "./service-types";

export type ServiceConfig = {
  slug: string;
  title: string;
  shortTitle: string;
  tagline: string;
  eyebrow: string;
  description: string;
  image: StaticImageData;
  imageAlt: string;
  intro: string;
  outcomes: string[];
  process: [string, string, string][];
  highlights: [string, string][];
};

import researchAsset from "@/assets/local/research-hero.png.optimized.webp";
import fundingAsset from "@/assets/local/funding-hero.png.optimized.webp";
import growthImageAsset from "@/assets/local/growth-hero.jpg.optimized.webp";
const growthImage = growthImageAsset;
import transformationAsset from "@/assets/local/transformation-hero.png.optimized.webp";
import manpowerAsset from "@/assets/local/manpower-hero.png.optimized.webp";
import incubationAsset from "@/assets/local/riloyd-sunset-corporate-lobby.png.optimized.webp";

export const serviceConfigs: Record<string, ServiceConfig> = {
  research: {
    slug: "business-research-analysis-strategy",
    title: "Business Research, Analysis & Strategy",
    shortTitle: "Research & Strategy",
    tagline: "See the opportunity. Choose the right direction.",
    eyebrow: "Business research, analysis & strategy",
    description: "Turn complex market signals into clear priorities, confident decisions and a practical plan for growth.",
    image: researchAsset,
    imageAlt: "Riloyd strategy boardroom with a market intelligence dashboard",
    intro: "We combine market intelligence, commercial analysis and strategic thinking to help leaders understand where they stand and what to do next.",
    outcomes: ["A sharper view of your market and competitors", "Priorities aligned to your goals, resources and timing", "A practical roadmap your team can execute", "Decision support backed by evidence, not assumptions"],
    process: [["01", "Understand", "We listen to your ambition, constraints and current operating reality."], ["02", "Analyse", "We study the market, customer, competition and financial signals that matter."], ["03", "Activate", "We translate the findings into decisions, owners and measurable next steps."]],
    highlights: [["Market intelligence", "Know where demand is moving."], ["Strategic planning", "Align people, money and momentum."], ["Performance review", "See what is working and why."]],
  },
  funding: {
    slug: "business-funding",
    title: "Business Funding",
    shortTitle: "Business Funding",
    tagline: "Connect with capital for your next phase.",
    eyebrow: "Business funding",
    description: "Prepare your business for the right capital and connect your growth story with relevant funding opportunities.",
    image: fundingAsset,
    imageAlt: "Riloyd office desk with growth charts and city skyline at sunset",
    intro: "The right funding is more than a transaction. We help you build a credible case, understand your options and move through the process with clarity.",
    outcomes: ["Funding-readiness assessment and gap analysis", "Investor-ready business and financial narrative", "Support across debt, equity and strategic capital options", "A clear process for conversations, diligence and follow-through"],
    process: [["01", "Prepare", "We strengthen the story, numbers and documents behind your funding need."], ["02", "Position", "We identify the capital route and partners that fit your stage and ambition."], ["03", "Connect", "We support conversations and next steps from introduction to diligence."]],
    highlights: [["Capital readiness", "Build confidence before you pitch."], ["Funding strategy", "Choose capital that fits."], ["Investor connect", "Open relevant conversations."]],
  },
  growth: {
    slug: "sales-revenue-growth",
    title: "Sales & Revenue Growth",
    shortTitle: "Sales & Revenue Growth",
    tagline: "Build markets. Scale faster.",
    eyebrow: "Sales & revenue growth",
    description: "Create a focused growth engine around the right customers, offer, channels and sales discipline.",
    image: growthImage,
    imageAlt: "Laptop showing a rising sales chart in a city boardroom at sunset",
    intro: "Growth becomes repeatable when your market promise, sales motion and customer experience work together. We help you make that system stronger.",
    outcomes: ["Sharper customer segments and value proposition", "A sales process with clear stages and ownership", "Revenue opportunities across existing and new markets", "Simple metrics to keep growth visible and accountable"],
    process: [["01", "Focus", "We identify the customers, markets and offers with the strongest potential."], ["02", "Build", "We shape the pipeline, sales process and commercial message."], ["03", "Scale", "We establish rhythms and metrics that turn momentum into repeatable revenue."]],
    highlights: [["Go-to-market", "Enter with a clear commercial plan."], ["Sales enablement", "Give teams the tools to convert."], ["Revenue systems", "Track the levers that matter."]],
  },
  transformation: {
    slug: "business-transformation",
    title: "Business Transformation",
    shortTitle: "Business Transformation",
    tagline: "People, process and technology for tomorrow.",
    eyebrow: "Business transformation",
    description: "Make change useful, measurable and owned by the people who will carry it forward.",
    image: transformationAsset,
    imageAlt: "Chess pieces on a boardroom table overlooking a city at sunset",
    intro: "Transformation is not a presentation or a software rollout. It is a coordinated shift in how your people work, how decisions move and how value reaches customers.",
    outcomes: ["A practical transformation agenda tied to business goals", "Simpler processes and stronger accountability", "Technology choices grounded in adoption and return", "Teams equipped to sustain improvement after launch"],
    process: [["01", "Diagnose", "We map the friction, opportunities and capabilities shaping performance."], ["02", "Design", "We create a focused future-state plan with clear owners and milestones."], ["03", "Deliver", "We help teams implement, learn and improve without losing momentum."]],
    highlights: [["Operating model", "Make the business easier to run."], ["Digital adoption", "Use technology where it creates value."], ["Change leadership", "Bring people with the plan."]],
  },
  manpower: {
    slug: "manpower-service",
    title: "Manpower Service",
    shortTitle: "Manpower Service",
    tagline: "Get your staff at our payroll.",
    eyebrow: "Manpower service",
    description: "Build a dependable workforce while Riloyd supports payroll, coordination and the operational details behind it.",
    image: manpowerAsset,
    imageAlt: "Riloyd boardroom overlooking a city skyline at sunset",
    intro: "When your team needs to grow quickly, the employment and payroll layer should not slow the business down. We help you deploy capable people with a clear operating structure.",
    outcomes: ["Flexible staffing aligned to your operating needs", "Payroll coordination and workforce administration", "Clear roles, onboarding and performance expectations", "A dependable partner as your team evolves"],
    process: [["01", "Plan", "We understand the role, skills and workforce model your business needs."], ["02", "Place", "We help identify and onboard people suited to the work and context."], ["03", "Support", "We coordinate the payroll and people operations that keep work moving."]],
    highlights: [["Workforce planning", "Match people to the work ahead."], ["Payroll support", "Keep administration dependable."], ["Team continuity", "Build capacity without chaos."]],
  },
  incubation: {
    slug: "startup-business-incubation-centers",
    title: "Startup & Business Incubation Centers",
    shortTitle: "Incubation Centers",
    tagline: "A complete startup ecosystem.",
    eyebrow: "Startup & business incubation centers",
    description: "A place for founders and growing businesses to work, connect, build and move forward with the right support around them.",
    image: incubationAsset,
    imageAlt: "Riloyd startup and business incubation center lobby",
    intro: "A connected space for founders and businesses to grow.",
    outcomes: [],
    process: [],
    highlights: [],
  },
};

export const serviceOrder = ["research", "funding", "growth", "transformation", "manpower", "incubation"];