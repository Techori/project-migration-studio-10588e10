import { BriefcaseBusiness, HandCoins, Lightbulb, UsersRound, type LucideIcon } from "lucide-react";
import { siteStats } from "@/lib/site-stats";

export type RegistrationCategory = "startup" | "mentor" | "investor" | "business";
export type FieldOption = { label: string; value: string };
export type RegistrationField = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "url" | "date" | "textarea" | "select" | "radio" | "checkboxes" | "file";
  placeholder?: string;
  required?: boolean;
  options?: FieldOption[];
  maxLength?: number;
  accept?: string;
  help?: string;
  full?: boolean;
};
export type RegistrationSection = { title: string; fields: RegistrationField[] };
export type RegistrationConfig = {
  category: RegistrationCategory;
  title: string;
  eyebrow: string;
  headline: string;
  accent: string;
  description: string;
  icon: LucideIcon;
  cardCopy: string;
  benefitsTitle: string;
  benefits: string[];
  stats: readonly (readonly [string, string])[];
  sections: RegistrationSection[];
};

const industries = ["Technology", "Healthcare", "Consumer & FMCG", "Education", "Manufacturing", "Financial Services", "Agriculture", "Real Estate", "Professional Services", "Other"].map((value) => ({ label: value, value }));
const sources = ["Search Engine", "Social Media", "Riloyd Event", "Referral", "Business Network", "Other"].map((value) => ({ label: value, value }));
const support = ["Funding Support", "Mentorship", "Business Strategy", "Market Access", "Investor Connect", "Government Schemes", "Legal & Compliance", "Talent Hiring", "Technology Adoption", "Other"].map((value) => ({ label: value, value }));

export const registrationConfigs: Record<RegistrationCategory, RegistrationConfig> = {
  startup: {
    category: "startup", title: "Startup Registration", eyebrow: "Startup registration", headline: "Turn your idea into a", accent: "bigger tomorrow.",
    description: "Join Riloyd and get the right guidance, funding support, mentorship and strategic networks to scale your startup.", icon: Lightbulb,
    cardCopy: "Get the right guidance, funding support and strategic direction.", benefitsTitle: "Why register your startup?",
    benefits: ["Access to funding opportunities", "Mentorship from industry experts", "Strategic business guidance", "Investor network and pitch opportunities", "Support for market expansion", "Compliance and registration support"],
    stats: [...siteStats],
    sections: [
      { title: "Founder Information", fields: [
        { name: "fullName", label: "Full Name", required: true, maxLength: 100 }, { name: "designation", label: "Designation", required: true, placeholder: "Founder, Co-Founder, CEO" },
        { name: "email", label: "Business Email", type: "email", required: true }, { name: "phone", label: "Phone Number", type: "tel", required: true },
        { name: "linkedin", label: "LinkedIn Profile", type: "url" }, { name: "coFounders", label: "Co-Founder(s)", placeholder: "Names separated by commas" },
      ]},
      { title: "Startup Details", fields: [
        { name: "startupName", label: "Startup Name", required: true }, { name: "legalStructure", label: "Legal Structure", type: "select", required: true, options: ["Private Limited", "LLP", "Partnership", "Sole Proprietorship", "Not Registered"].map(v=>({label:v,value:v})) },
        { name: "incorporationYear", label: "Year of Incorporation", required: true }, { name: "startupStage", label: "Startup Stage", type: "select", required: true, options: ["Idea", "Prototype", "Early Revenue", "Growth", "Scale"].map(v=>({label:v,value:v})) },
        { name: "headquarter", label: "Startup Headquarter", required: true }, { name: "preferredContact", label: "Preferred Contact Mode", type: "select", required: true, options: ["Phone", "Email", "WhatsApp", "Video Call"].map(v=>({label:v,value:v})) },
        { name: "website", label: "Website", type: "url" }, { name: "location", label: "City / Location", required: true },
      ]},
      { title: "Business Information", fields: [
        { name: "industry", label: "Industry / Sector", type: "select", required: true, options: industries }, { name: "product", label: "Product / Solution", type: "textarea", required: true, full: true },
        { name: "problem", label: "Problem Statement", type: "textarea", required: true }, { name: "targetMarket", label: "Target Market", type: "textarea", required: true },
      ]},
      { title: "Current Status & Support Needed", fields: [
        { name: "fundingStatus", label: "Have you raised funding before?", type: "radio", required: true, options: ["Yes", "No", "Planning to raise"].map(v=>({label:v,value:v})) },
        { name: "supportAreas", label: "What support are you looking for?", type: "checkboxes", required: true, options: support, full: true },
        { name: "traction", label: "Traction", type: "textarea", placeholder: "Revenue, users, pilots, partnerships" }, { name: "additionalInfo", label: "Additional Information", type: "textarea" },
        { name: "document", label: "Upload Pitch Deck", type: "file", accept: ".pdf,.ppt,.pptx", help: "PDF or PPT, maximum 10MB", full: true },
      ]},
    ],
  },
  mentor: {
    category: "mentor", title: "Mentor Registration", eyebrow: "Mentor registration", headline: "Share. Guide.", accent: "Empower.",
    description: "Join Riloyd’s mentor network and help startups, SMEs and businesses grow with practical expertise.", icon: UsersRound,
    cardCopy: "Share your experience. Guide the next generation of businesses.", benefitsTitle: "Why mentor with Riloyd?",
    benefits: ["Guide high-potential startups and SMEs", "Join a curated business ecosystem", "Share your industry expertise", "Connect with investors and founders", "Participate in exclusive events", "Create a lasting impact"],
    stats: [...siteStats],
    sections: [
      { title: "Personal Information", fields: [
        { name: "fullName", label: "Full Name", required: true }, { name: "dateOfBirth", label: "Date of Birth", type: "date" }, { name: "email", label: "Email Address", type: "email", required: true }, { name: "phone", label: "Phone Number", type: "tel", required: true }, { name: "location", label: "Current Location", required: true }, { name: "linkedin", label: "LinkedIn Profile", type: "url" },
      ]},
      { title: "Professional Details", fields: [
        { name: "designation", label: "Current Designation", required: true }, { name: "organization", label: "Organization / Company", required: true }, { name: "experience", label: "Years of Experience", type: "select", required: true, options: ["0–5 years", "6–10 years", "11–20 years", "20+ years"].map(v=>({label:v,value:v})) }, { name: "industry", label: "Primary Industry Expertise", type: "select", required: true, options: industries },
        { name: "expertise", label: "Additional Expertise", type: "checkboxes", full: true, options: ["Strategy", "Funding", "Sales & Marketing", "Operations", "Technology", "Product Development", "HR & Talent", "Other"].map(v=>({label:v,value:v})) },
      ]},
      { title: "Mentorship Preferences", fields: [
        { name: "mentorAudience", label: "I am interested in mentoring", type: "checkboxes", required: true, options: ["Startups", "Growing Businesses", "Students / Young Entrepreneurs"].map(v=>({label:v,value:v})) }, { name: "mentorFormat", label: "Preferred Mentoring Format", type: "checkboxes", required: true, options: ["One-on-One (Virtual)", "One-on-One (In-Person)", "Group Mentoring / Workshops", "Panel Discussions / Events"].map(v=>({label:v,value:v})) },
        { name: "mentorAreas", label: "Areas I can mentor on", type: "textarea", required: true, full: true }, { name: "motivation", label: "Why do you want to be a mentor at Riloyd?", type: "textarea", required: true, full: true },
      ]},
      { title: "Additional Information", fields: [
        { name: "document", label: "Upload Profile / Resume", type: "file", accept: ".pdf,.doc,.docx", help: "PDF or DOC, maximum 5MB" }, { name: "additionalInfo", label: "Additional Information", type: "textarea" },
      ]},
    ],
  },
  investor: {
    category: "investor", title: "Investor Registration", eyebrow: "Investor registration", headline: "Invest in a brighter", accent: "tomorrow.",
    description: "Discover high-potential startups, SMEs and growth businesses. Partner with Riloyd to create measurable impact.", icon: HandCoins,
    cardCopy: "Discover high-potential businesses and growth opportunities.", benefitsTitle: "Why invest with Riloyd?",
    benefits: ["Access to curated, vetted opportunities", "End-to-end deal support and due diligence", "Diverse sectors and high-growth potential", "Transparent process and updates", "Strategic collaboration opportunities", "Create economic and social impact"],
    stats: [...siteStats],
    sections: [
      { title: "Personal Information", fields: [
        { name: "fullName", label: "Full Name", required: true }, { name: "email", label: "Email Address", type: "email", required: true }, { name: "phone", label: "Phone Number", type: "tel", required: true }, { name: "location", label: "Current Location", required: true }, { name: "linkedin", label: "LinkedIn Profile", type: "url" }, { name: "investorType", label: "Investor Type", type: "select", required: true, options: ["Individual / Angel", "Family Office", "Venture Capital", "Corporate Investor", "Institutional Investor"].map(v=>({label:v,value:v})) },
      ]},
      { title: "Investment Profile", fields: [
        { name: "investmentFocus", label: "Investment Focus / Sector(s)", required: true }, { name: "stagePreference", label: "Investment Stage Preference", type: "select", required: true, options: ["Pre-Seed", "Seed", "Series A", "Growth", "Any Stage"].map(v=>({label:v,value:v})) }, { name: "ticketSize", label: "Typical Ticket Size (INR)", required: true }, { name: "geography", label: "Investment Geography", required: true },
      ]},
      { title: "Investment Interests", fields: [
        { name: "interests", label: "Opportunity types", type: "checkboxes", required: true, full: true, options: ["Startups (Early Stage)", "Growth Stage Companies", "SMEs", "Social Impact Businesses", "Technology & Innovation", "Manufacturing", "Healthcare", "Education", "Consumer & FMCG", "Sustainability / Clean Tech", "Real Estate Infrastructure", "Other"].map(v=>({label:v,value:v})) },
      ]},
      { title: "Additional Information", fields: [
        { name: "investmentThesis", label: "Tell us about your investment thesis", type: "textarea", required: true }, { name: "source", label: "How did you hear about Riloyd?", type: "select", required: true, options: sources }, { name: "additionalInfo", label: "Notes or Questions", type: "textarea" }, { name: "document", label: "Upload Investor Profile / Deck", type: "file", accept: ".pdf,.ppt,.pptx", help: "PDF or PPT, maximum 10MB" },
      ]},
    ],
  },
  business: {
    category: "business", title: "Business Registration", eyebrow: "Business registration", headline: "Grow your business", accent: "with Riloyd.",
    description: "Get strategic guidance, funding support, market access and end-to-end advisory to take your business forward.", icon: BriefcaseBusiness,
    cardCopy: "Access expert advisory, funding, sales support and transformation.", benefitsTitle: "Why register your business?",
    benefits: ["Get expert business advisory", "Access funding opportunities", "Scale sales and market reach", "Improve operational efficiency", "Connect with industry experts", "Support for digital adoption", "Leverage government schemes"],
    stats: [...siteStats],
    sections: [
      { title: "Business / Company Information", fields: [
        { name: "businessName", label: "Business Name", required: true }, { name: "legalStructure", label: "Legal Structure", type: "select", required: true, options: ["Private Limited", "LLP", "Partnership", "Sole Proprietorship", "Public Limited", "Other"].map(v=>({label:v,value:v})) }, { name: "businessType", label: "Business Type", required: true }, { name: "registrationNumber", label: "CIN / UDYAM / GST Number", required: true }, { name: "establishmentYear", label: "Year of Establishment", required: true }, { name: "pan", label: "PAN Number", required: true }, { name: "registeredAddress", label: "Registered Address", type: "textarea", required: true }, { name: "website", label: "Website", type: "url" },
      ]},
      { title: "Primary Contact Information", fields: [
        { name: "fullName", label: "Full Name", required: true }, { name: "designation", label: "Designation", required: true }, { name: "email", label: "Email Address", type: "email", required: true }, { name: "phone", label: "Phone Number", type: "tel", required: true },
      ]},
      { title: "Business Details", fields: [
        { name: "industry", label: "Industry / Sector", type: "select", required: true, options: industries }, { name: "products", label: "Products / Services", type: "textarea", required: true }, { name: "turnover", label: "Annual Turnover", required: true }, { name: "targetMarkets", label: "Target Markets", required: true }, { name: "employees", label: "Number of Employees", required: true }, { name: "expansionPlan", label: "Business Expansion Plan (Next 1–3 Years)", type: "textarea", required: true },
      ]},
      { title: "Support Areas", fields: [
        { name: "supportAreas", label: "Select all that apply", type: "checkboxes", required: true, full: true, options: [...support, ...["Process Improvement", "Brand Building", "E-commerce Enablement", "Export / International Markets", "Business Networking"].map(v=>({label:v,value:v}))] },
      ]},
      { title: "Additional Information", fields: [
        { name: "source", label: "How did you hear about Riloyd?", type: "select", required: true, options: sources }, { name: "additionalInfo", label: "Specific Requirements or Questions", type: "textarea" }, { name: "document", label: "Upload Company Profile / Brochure", type: "file", accept: ".pdf,.ppt,.pptx", help: "PDF or PPT, maximum 10MB", full: true },
      ]},
    ],
  },
};

export const categoryOrder: RegistrationCategory[] = ["mentor", "investor", "startup", "business"];
