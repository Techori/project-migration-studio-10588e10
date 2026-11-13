// Profiles are stored in the backend (managed at /admin) and visible only to signed-in visitors.
export type PersonGroup = "investors" | "mentors" | "team" | "startups" | "businesses";

export type PersonProfile = {
  id: string;
  person_group: PersonGroup;
  slug: string;
  name: string;
  role: string;
  location: string;
  focus: string[];
  summary: string;
  bio: string;
  photo_url: string | null;
  sort_order: number;
};

export const peopleGroups: Record<PersonGroup, { label: string; singular: string }> = {
  investors: { label: "Our Investors", singular: "Investor" },
  mentors: { label: "Our Mentors", singular: "Mentor" },
  team: { label: "Our Team Members", singular: "Team Member" },
  startups: { label: "Our Startups", singular: "Startup" },
  businesses: { label: "Our Businesses", singular: "Business" },
};

export function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

export function slugify(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export const managementRoles = [
  ["Chief Executive Officer", "CEO", "Leads vision, strategy and the overall direction of RILOYD."],
  ["Chief Financial Officer", "CFO", "Oversees financial strategy, governance and capital decisions."],
  ["Chief Revenue Officer", "CRO", "Drives revenue growth, client development and commercial strategy."],
  ["Chief Operating Officer", "COO", "Ensures delivery excellence and operational effectiveness."],
  ["Chief Strategy Officer", "CSO", "Shapes advisory frameworks and long-term strategic priorities."],
  ["Chief Technology Officer", "CTO", "Leads technology, digital capability and transformation tools."],
  ["Chief Risk Officer", "CRiO", "Guides risk management, compliance and responsible growth."],
] as const;
