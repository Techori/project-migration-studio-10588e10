import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { ArrowRight, Check } from "lucide-react";
import { serviceConfigs, serviceOrder } from "@/lib/service-config";
import type { ServiceConfig } from "@/lib/service-config";
const ResearchDetail = lazy(() => import("@/components/services/research-detail").then(module => ({ default: module.ResearchDetail })));
const FundingDetail = lazy(() => import("@/components/services/funding-detail").then(module => ({ default: module.FundingDetail })));
const ManpowerDetail = lazy(() => import("@/components/services/manpower-detail").then(module => ({ default: module.ManpowerDetail })));
const TransformationDetail = lazy(() => import("@/components/services/transformation-detail").then(module => ({ default: module.TransformationDetail })));
const GrowthDetail = lazy(() => import("@/components/services/growth-detail").then(module => ({ default: module.GrowthDetail })));
const IncubationDetail = lazy(() => import("@/components/services/incubation-detail").then(module => ({ default: module.IncubationDetail })));

function findService(slug: string): ServiceConfig | undefined {
  return serviceOrder.map((key) => serviceConfigs[key]).find((service) => service?.slug === slug);
}

export const Route = createFileRoute("/services/$slug")({
  staticData: { sitemap: true },
  loader: ({ params }) => {
    const service = findService(params.slug);
    if (!service) throw notFound();
    return { service };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Service unavailable | Riloyd" }, { name: "robots", content: "noindex" }] };
    }
    const { title, description, slug } = loaderData.service;
    return {
      meta: [
        { title: `${title} | Riloyd` },
        { name: "description", content: description },
        { property: "og:title", content: `${title} | Riloyd` },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/services/${slug}` }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify({
        "@context": "https://schema.org", "@type": "Service", name: title, description,
        provider: { "@type": "Organization", name: "Riloyd" },
      }) }],
    };
  },
  component: ServiceDetail,
});

function ServiceDetail() {
  const { service } = Route.useLoaderData();
  const others = serviceOrder.map((key) => serviceConfigs[key]).filter((item): item is ServiceConfig => Boolean(item) && item?.slug !== service.slug);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Suspense fallback={<section className="flex min-h-[570px] items-center border-b border-border px-5"><h1 className="mx-auto w-full max-w-[1280px] text-4xl font-black">{service.title}</h1></section>}>
      {service.slug === "business-research-analysis-strategy" ? <ResearchDetail /> : service.slug === "business-funding" ? <FundingDetail /> : service.slug === "manpower-service" ? <ManpowerDetail /> : service.slug === "business-transformation" ? <TransformationDetail /> : service.slug === "sales-revenue-growth" ? <GrowthDetail /> : service.slug === "startup-business-incubation-centers" ? <IncubationDetail /> : <>
      <section className="relative border-b border-border">
        {service.image ? (
          <img src={service.image} alt={service.imageAlt} className="absolute inset-0 h-full w-full object-cover" decoding="async" />
        ) : null}
        <div className="hero-shade absolute inset-0" />
        <div className="relative z-10 mx-auto max-w-[1380px] px-5 py-20 sm:px-6 lg:px-12 lg:py-28">
          <p className="eyebrow text-xs font-bold uppercase">{service.eyebrow}</p>
          <h1 className="headline mt-4 max-w-4xl text-[clamp(2.25rem,4.4vw,4rem)] font-black uppercase leading-[0.9]">
            {service.tagline}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-soft md:text-lg">{service.description}</p>
          <Link
            to="/contact"
            className="solid-cta mt-8 inline-flex items-center gap-3 rounded-md bg-primary px-8 py-3.5 text-sm font-extrabold text-primary-foreground"
          >
            Let&apos;s Talk <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-[1380px] gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:px-12">
          <div>
            <h2 className="text-2xl font-extrabold leading-tight sm:text-3xl">{service.title}</h2>
            <span className="mt-4 block h-0.5 w-10 bg-primary" />
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base">{service.intro}</p>
          </div>
          <ul className="grid gap-3 self-center">
            {service.outcomes.map((outcome) => (
              <li key={outcome} className="flex items-start gap-3 border border-border p-4 text-sm leading-relaxed">
                <Check size={18} className="mt-0.5 shrink-0 text-primary" />
                <span>{outcome}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-[1380px] px-5 py-16 sm:px-6 lg:px-12">
          <p className="eyebrow text-xs font-bold uppercase">How we work</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {service.process.map(([step, heading, copy]) => (
              <article key={step} className="border border-border p-6">
                <p className="text-3xl font-black text-primary">{step}</p>
                <h3 className="mt-4 text-base font-extrabold">{heading}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-[1380px] gap-6 px-5 py-16 sm:grid-cols-3 sm:px-6 lg:px-12">
          {service.highlights.map(([heading, copy]) => (
            <div key={heading}>
              <h3 className="text-base font-extrabold">{heading}</h3>
              <span className="mt-3 block h-0.5 w-8 bg-primary" />
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>
      </section>
      </>}
      </Suspense>

      <section className="border-b border-border">
        <div className="mx-auto max-w-[1380px] px-5 py-16 sm:px-6 lg:px-12">
          <h2 className="text-xl font-extrabold uppercase">Other services</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {others.map((item) => (
              <Link
                key={item.slug}
                to="/services/$slug"
                params={{ slug: item.slug }}
                className="border border-border p-5 transition-colors hover:border-primary"
              >
                <h3 className="text-sm font-extrabold leading-tight">{item.shortTitle}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.tagline}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold">
                  Learn More <ArrowRight size={14} className="text-primary" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
