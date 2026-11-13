import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/prototype-assessment")({
  staticData: { sitemap: false },
  server: { handlers: { POST: async ({ request }) => {
    const { assessPrototype } = await import("@/lib/prototype-ai/assessment.server");
    return assessPrototype(request);
  } } },
});