import { createFileRoute } from "@tanstack/react-router";
import { RegistrationPage } from "@/components/registration/registration-page";
import { registrationConfigs } from "@/lib/registration-config";

export const Route = createFileRoute("/register/business")({
  staticData: { sitemap: true },
  head: () => ({ meta: [
    { title: "Business Registration | Riloyd" },
    { name: "description", content: "Register as a business with Riloyd and access relevant expertise, connections and growth opportunities." },
    { property: "og:title", content: "Business Registration | Riloyd" },
    { property: "og:description", content: "Join Riloyd's ecosystem as a business." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ], links: [{ rel: "canonical", href: "/register/business" }]}),
  component: () => <RegistrationPage config={registrationConfigs.business} />,
});
