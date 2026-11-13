import { createFileRoute } from "@tanstack/react-router";
import { ProfileDetail } from "@/components/people-profiles";

export const Route = createFileRoute("/investors/$slug")({
  staticData: { sitemap: false },
  head: () => ({ meta: [{ title: "Investor Profile | Riloyd" }, { name: "description", content: "Riloyd Investor profile, available to signed-in members." }, { property: "og:title", content: "Investor Profile | Riloyd" }, { property: "og:description", content: "Riloyd Investor profile, available to signed-in members." }, { property: "og:type", content: "profile" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { slug } = Route.useParams();
  return <ProfileDetail group="investors" slug={slug} />;
}
