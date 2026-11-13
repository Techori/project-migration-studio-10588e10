import { createFileRoute } from "@tanstack/react-router";
import { PeoplePage } from "@/components/people-page";

export const Route = createFileRoute("/businesses/")({
  staticData: { sitemap: true },
  head: () => ({ meta: [{ title: "Our Businesses | Riloyd" }, { name: "description", content: 'Approved businesses in the RILOYD network, working on expansion, transformation and capital strategy.' }, { property: "og:title", content: "Our Businesses | Riloyd" }, { property: "og:description", content: 'Approved businesses in the RILOYD network, working on expansion, transformation and capital strategy.' }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }], links: [{ rel: "canonical", href: "/businesses" }] }),
  component: () => <PeoplePage group="businesses" eyebrow="Our businesses" title="Businesses growing with intent." accent="Partners in growth." intro="Approved businesses in the RILOYD network, working on expansion, transformation and capital strategy." sectionTitle="How RILOYD supports businesses." cta="Register your Business" ctaTo="/register/business" items={[['Expansion Strategy', 'Plan market entry and scale with clarity.'], ['Capital Strategy', 'Prepare for funding, valuation and investor conversations.'], ['Transformation', 'Strengthen operations, technology and governance.']]} />,
});
