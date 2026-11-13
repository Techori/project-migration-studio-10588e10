import { createFileRoute } from "@tanstack/react-router";
import { ProfileDetail } from "@/components/people-profiles";

export const Route = createFileRoute("/startups/$slug")({
  staticData: { sitemap: false },
  head: () => ({ meta: [{ title: "Startup Profile | Riloyd" }, { name: "description", content: "Riloyd Startup profile, available to signed-in members." }, { property: "og:title", content: "Startup Profile | Riloyd" }, { property: "og:description", content: "Riloyd Startup profile, available to signed-in members." }, { property: "og:type", content: "profile" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { slug } = Route.useParams();
  return <ProfileDetail group="startups" slug={slug} />;
}
