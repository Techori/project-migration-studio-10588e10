import { createFileRoute } from "@tanstack/react-router";
import { RegistrationPage } from "@/components/registration/registration-page";
import { registrationConfigs } from "@/lib/registration-config";

export const Route = createFileRoute("/register/startup")({
  staticData: { sitemap: true },
  head: () => ({ meta: [
    { title: "Startup Registration | Riloyd" },
    { name: "description", content: "Register as a startup with Riloyd and access relevant expertise, connections and growth opportunities." },
    { property: "og:title", content: "Startup Registration | Riloyd" },
    { property: "og:description", content: "Join Riloyd's ecosystem as a startup." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ], links: [{ rel: "canonical", href: "/register/startup" }]}),
  component: () => <RegistrationPage config={registrationConfigs.startup} />,
});
