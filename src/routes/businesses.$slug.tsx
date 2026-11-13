import { createFileRoute } from "@tanstack/react-router";
import { ProfileDetail } from "@/components/people-profiles";

export const Route = createFileRoute("/businesses/$slug")({
  staticData: { sitemap: false },
  head: () => ({ meta: [{ title: "Business Profile | Riloyd" }, { name: "description", content: "Riloyd Business profile, available to signed-in members." }, { property: "og:title", content: "Business Profile | Riloyd" }, { property: "og:description", content: "Riloyd Business profile, available to signed-in members." }, { property: "og:type", content: "profile" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { slug } = Route.useParams();
  return <ProfileDetail group="businesses" slug={slug} />;
}
