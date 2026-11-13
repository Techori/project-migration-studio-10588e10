import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { serviceConfigs, serviceOrder } from "@/lib/service-config";
import officeAsset from "@/assets/local/riloyd-office.png.optimized.webp";

export const Route = createFileRoute("/services/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Services | Riloyd" },
      {
        name: "description",
        content:
          "Research, funding, sales growth, transformation, manpower and startup incubation services from Riloyd.",
      },
      { property: "og:title", content: "Services | Riloyd" },
      {
        property: "og:description",
        content: "Explore Riloyd's business services and startup and business incubation centers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: ServicesIndex,
});

function ServicesIndex() {
  const services = serviceOrder.map((key) => serviceConfigs[key]).filter((service) => service !== undefined);

  return (
    <div className="min-h-screen bg-background text-foreground">

      <section className="relative min-h-[380px] overflow-hidden border-b border-border sm:min-h-[430px]">
        <img src={officeAsset} alt="Riloyd office building at sunset" className="absolute inset-0 h-full w-full object-cover object-[60%_center]" fetchPriority="high" decoding="async" />
        <div className="hero-shade absolute inset-0" />
        <div className="relative mx-auto flex min-h-[380px] max-w-[1380px] flex-col justify-center px-5 py-12 sm:min-h-[430px] sm:px-6 lg:px-12">
          <nav aria-label="Breadcrumb" className="mb-9 flex items-center gap-2 text-xs text-soft">
            <Link to="/">Home</Link><ChevronRight size={12} /><span>Services</span>
          </nav>
          <p className="flex items-center gap-3 text-xs font-bold uppercase text-soft"><span className="h-0.5 w-9 bg-primary" />What we do</p>
          <h1 className="headline mt-5 max-w-3xl text-[clamp(2.4rem,5vw,4.8rem)] font-black uppercase leading-[0.95]">
            Riloyd <span className="text-primary">services.</span>
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-soft sm:text-base">
            From market clarity and capital to sales, people and incubation — choose the support your next phase needs.
          </p>
        </div>
      </section>

      {services.map((service, index) => {
        const onLight = index % 2 === 0;
        return (
          <section key={service.slug} className={`border-b border-border ${onLight ? "bg-card text-card-foreground" : "bg-background text-foreground"}`}>
            <div className={`mx-auto grid max-w-[1380px] items-center gap-8 px-5 py-12 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-12 lg:py-16 ${index % 2 === 1 ? "lg:[&>img]:order-2" : ""}`}>
              <img
                src={service.image}
                alt={service.imageAlt}
                loading="lazy"
                className="aspect-[16/10] w-full rounded-md object-cover" decoding="async" />
              <div className="min-w-0">
                <p className={`flex items-center gap-3 text-xs font-bold uppercase ${onLight ? "text-card-foreground" : "text-soft"}`}>
                  <span className="h-0.5 w-9 shrink-0 bg-primary" />Service {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-5 max-w-xl text-3xl font-black uppercase leading-[1.02] sm:text-4xl lg:text-5xl">
                  {service.title}
                </h2>
                <p className={`mt-5 max-w-lg text-sm leading-relaxed sm:text-base ${onLight ? "text-card-foreground" : "text-soft"}`}>
                  {service.description}
                </p>
                <Button asChild size="lg" className="mt-7 h-12 rounded-full px-7 text-sm font-extrabold">
                  <Link to="/services/$slug" params={{ slug: service.slug }}>Learn More <ArrowRight size={17} /></Link>
                </Button>
              </div>
            </div>
          </section>
        );
      })}

    </div>
  );
}
