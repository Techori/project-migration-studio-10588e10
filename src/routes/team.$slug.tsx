import { createFileRoute } from "@tanstack/react-router";
import { ProfileDetail } from "@/components/people-profiles";

export const Route = createFileRoute("/team/$slug")({
  staticData: { sitemap: false },
  head: () => ({ meta: [{ title: "Team Member Profile | Riloyd" }, { name: "description", content: "Riloyd Team Member profile, available to signed-in members." }, { property: "og:title", content: "Team Member Profile | Riloyd" }, { property: "og:description", content: "Riloyd Team Member profile, available to signed-in members." }, { property: "og:type", content: "profile" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { slug } = Route.useParams();
  return <ProfileDetail group="team" slug={slug} />;
}
