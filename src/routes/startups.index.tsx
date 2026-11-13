import { createFileRoute } from "@tanstack/react-router";
import { PeoplePage } from "@/components/people-page";

export const Route = createFileRoute("/startups/")({
  staticData: { sitemap: true },
  head: () => ({ meta: [{ title: "Our Startups | Riloyd" }, { name: "description", content: 'Approved startups in the RILOYD network, working on funding readiness, strategy and growth.' }, { property: "og:title", content: "Our Startups | Riloyd" }, { property: "og:description", content: 'Approved startups in the RILOYD network, working on funding readiness, strategy and growth.' }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }], links: [{ rel: "canonical", href: "/startups" }] }),
  component: () => <PeoplePage group="startups" eyebrow="Our startups" title="Founders building what's next." accent="Startups we back." intro="Approved startups in the RILOYD network, working on funding readiness, strategy and growth." sectionTitle="How RILOYD supports startups." cta="Register your Startup" ctaTo="/register/startup" items={[['Funding Readiness', 'Strengthen narrative, numbers and investor preparation.'], ['Mentorship', 'Access experienced mentors across strategy, product and operations.'], ['Investor Connect', 'Explore introductions shaped around sector and stage.']]} />,
});
