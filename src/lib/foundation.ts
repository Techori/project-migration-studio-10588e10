import { z } from "zod";

// Browser-safe RILOYD Foundation content and form rules, shared by the page, server functions and tests.

export const foundationKinds = ["scholarship", "school_fee", "volunteer", "partner", "donation_pledge", "assistance", "contact"] as const;
export type FoundationKind = (typeof foundationKinds)[number];

export const foundationKindLabels: Record<FoundationKind, string> = {
  scholarship: "Scholarship application",
  school_fee: "School fee assistance",
  volunteer: "Volunteer registration",
  partner: "Partnership enquiry",
  donation_pledge: "Donation pledge",
  assistance: "Assistance request",
  contact: "Contact message",
};

export const foundationPrograms = [
  { id: "education", title: "Education & Scholarships", description: "Helping deserving students stay in school and continue to higher education.", items: ["School Fee Assistance", "Student Scholarships", "Higher Education Support", "Books & Stationery", "Uniform Assistance", "Digital Education"], kind: "scholarship" as FoundationKind },
  { id: "animal-welfare", title: "Animal Welfare & Protection", description: "Care, food and treatment for animals in need, with respect for every life.", items: ["Animal Rescue", "Animal Food Support", "Medical Treatment", "Shelter Assistance", "Animal Protection"], kind: "volunteer" as FoundationKind },
  { id: "healthcare", title: "Healthcare & Medical Assistance", description: "Support for families facing medical costs and access to basic health care.", items: ["Medical Financial Assistance", "Medicine Support", "Emergency Medical Assistance", "Medical Camps", "Health Awareness"], kind: "assistance" as FoundationKind },
  { id: "humanitarian", title: "Humanitarian Charity & Relief", description: "Food, clothing and practical help for people and families during hard times.", items: ["Food Distribution", "Clothing Assistance", "Financial Assistance", "Elderly Support", "Emergency Relief"], kind: "assistance" as FoundationKind },
  { id: "environment", title: "Environment & Community Development", description: "Greener, cleaner neighbourhoods built together with local communities.", items: ["Tree Plantation", "Environmental Protection", "Cleanliness Campaigns", "Water Conservation", "Community Development"], kind: "volunteer" as FoundationKind },
] as const;

export const foundationSteps = [
  { title: "Apply for Assistance", text: "Submit a short application with your details and the support you need." },
  { title: "Application Review", text: "Our team reads every application and contacts you if anything is missing." },
  { title: "Verification & Assessment", text: "We verify the information and assess the need fairly and confidentially." },
  { title: "Assistance Decision", text: "You are informed of the decision and the next steps for any support." },
];

// Impact figures stay null until verified numbers are published; the page must never invent them.
export const foundationImpact: { label: string; value: number | null }[] = [
  { label: "Students Supported", value: null },
  { label: "Animals Helped", value: null },
  { label: "People Assisted", value: null },
  { label: "Families Supported", value: null },
];

export const PROFIT_COMMITMENT_PERCENT = 20;

const phone = z.string().trim().regex(/^[+\d][\d\s()-]{7,19}$/, "Please enter a valid mobile number.");
const detailValue = z.string().trim().max(2000);

export const foundationSubmissionSchema = z.object({
  kind: z.enum(foundationKinds),
  fullName: z.string().trim().min(2, "Please enter your full name.").max(100),
  email: z.string().trim().email("Please enter a valid email address.").max(255),
  phone,
  coordinatorCode: z.string().trim().max(40).regex(/^[A-Za-z0-9-]*$/, "Coordinator code can contain only letters, numbers and dashes.").optional().default(""),
  details: z.record(z.string().max(60), detailValue).refine(d => Object.keys(d).length <= 20, "Too many fields."),
  message: z.string().trim().max(2000).optional().default(""),
}).superRefine((value, ctx) => {
  if (value.kind === "contact" && value.message.length < 10) ctx.addIssue({ code: "custom", path: ["message"], message: "Please write a message of at least 10 characters." });
});
export type FoundationSubmission = z.input<typeof foundationSubmissionSchema>;

export const foundationReviewSchema = z.object({ id: z.string().uuid(), status: z.enum(["reviewed", "approved", "rejected"]) });
