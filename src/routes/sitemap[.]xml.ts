import { serviceConfigs, serviceOrder } from "@/lib/service-config";
import { isSitemapRouteIncluded, sitemapPathForLocation } from "@/lib/sitemap";
import { createFileRoute } from "@tanstack/react-router";
import { getRouterInstance } from "@tanstack/react-start";
import { sitemapStaticPaths, sitemapXML, type SitemapEntry } from "@/lib/sitemap";

// TODO: If empty, configure the public site origin before publishing.
const BASE_URL = "https://riloyd-project-migration-studio.lovable.app";

export const Route = createFileRoute("/sitemap.xml")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async () => {
        if (!BASE_URL) {
          return new Response("Sitemap domain not configured", {
            status: 503,
            headers: { "Cache-Control": "no-store" },
          });
        }
        const router = await getRouterInstance();
        const entries: SitemapEntry[] = sitemapStaticPaths(router).map((path) => ({ path }));
        if (isSitemapRouteIncluded(router.routesById["/services/$slug"])) {
          for (const key of serviceOrder) {
            const service = serviceConfigs[key];
            if (!service) continue;
            const location = router.buildLocation({ to: "/services/$slug", params: { slug: service.slug }, search: () => ({}), hash: "" });
            const path = sitemapPathForLocation(router, location, "/services/$slug");
            if (path) entries.push({ path });
          }
        }
        if (entries.length === 0) {
          return new Response(
            'No pages are included in this sitemap. Check route decisions and ancestor exclusions. Setting "exclude-subtree" on the root excludes the entire site.',
            { status: 404, headers: { "Cache-Control": "no-store" } },
          );
        }
        return new Response(sitemapXML(BASE_URL, entries), {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
