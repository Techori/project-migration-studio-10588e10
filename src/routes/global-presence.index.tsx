import { CountryLogo } from "@/components/country-logo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Globe2, Handshake, MapPin, Menu, Network, PackageOpen, Target, TrendingUp, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { internationalServices } from "@/lib/international-programme";
import { marketConfigs, marketOrder } from "@/lib/market-config";
import { countryPreviewImages } from "@/lib/country-preview-images";
import globeImageAsset from "@/assets/local/global-globe.jpg.optimized.webp";
const globeImage = globeImageAsset;
import mapImageAsset from "@/assets/local/global-map.jpg.optimized.webp";
const mapImage = mapImageAsset;
import boardroomImageAsset from "@/assets/local/global-boardroom.jpg.optimized.webp";
const boardroomImage = boardroomImageAsset;

export const Route = createFileRoute("/global-presence/")({
  staticData: { sitemap: false },
  head: () => ({ meta: [
    { title: "Global Presence | Riloyd" },
    { name: "description", content: "Explore Riloyd's global presence across India, Britain, UAE, Canada, America, Singapore, Europe and Australia." },
    { property: "og:title", content: "Global Presence | Riloyd" },
    { property: "og:description", content: "Local insight. Global impact. Explore the markets connecting Riloyd's global outlook." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "robots", content: "noindex" },
  ] }),
  component: GlobalPresence,
});

const markets = marketOrder.map((key) => marketConfigs[key]);

const capabilities = internationalServices.map((service, index) => ({ ...service, icon: [BarChart3, Handshake, UsersRound, Network][index] ?? Globe2 }));

function GlobalPresence() {
  return <main className="overflow-hidden bg-background text-foreground">
    <section className="relative h-[431px] overflow-hidden border-b border-border bg-background sm:h-[442px]">
      <img src={globeImage} width={1600} height={912} alt="Earth at night with connections radiating from India" className="absolute inset-0 h-full w-full object-cover object-[57%_center] sm:object-center" decoding="async" fetchPriority="high" />
      <div className="global-hero-shade absolute inset-0" />
      <div className="relative z-10 mx-auto flex h-full max-w-[1380px] items-center px-5 py-5 sm:px-6 lg:px-12">
        <div className="max-w-xl"><p className="eyebrow text-xs font-bold uppercase text-soft">Global presence</p>
          <h1 className="headline mt-3 text-[clamp(2.1rem,4vw,4rem)] font-black uppercase leading-[.94]">Riloyd<br /><span className="text-primary">Global.</span></h1>
          <p className="mt-3 max-w-md text-xs leading-relaxed text-soft sm:text-sm">RILOYD connects businesses, investors and partners across borders to discover opportunities and build stronger enterprises.</p>
          <Button asChild className="mt-3 h-9 rounded-md px-4 text-[11px] font-bold"><a href="#markets">Explore Global Opportunities <ArrowRight size={15} /></a></Button>
        </div>
      </div>
    </section>

    <section className="border-b border-border bg-surface"><div className="mx-auto grid max-w-[1380px] grid-cols-3 px-4 sm:px-6 lg:px-12">
      {[{ icon: Globe2, value: "8", label: "Featured markets" }, { icon: MapPin, value: "4", label: "Continents" }, { icon: UsersRound, value: "1", label: "Connected outlook" }].map(({ icon: Icon, value, label }) => <div key={label} className="flex min-h-28 flex-col justify-center gap-2 border-r border-border px-3 py-5 last:border-r-0 sm:flex-row sm:items-center sm:gap-5 sm:px-8"><Icon className="shrink-0 text-primary" size={30} strokeWidth={1.8} /><div><strong className="block text-xl font-black sm:text-3xl">{value}</strong><span className="text-[10px] text-soft sm:text-sm">{label}</span></div></div>)}
    </div></section>

    <section className="border-b border-border bg-surface text-foreground"><div className="mx-auto grid max-w-[1380px] gap-6 px-5 py-12 sm:px-6 lg:grid-cols-[.38fr_.62fr] lg:items-center lg:gap-12 lg:px-12 lg:py-16">
      <div><p className="eyebrow text-[11px] font-bold uppercase text-card-foreground">Our global network</p><h2 className="mt-4 text-3xl font-black uppercase leading-[.98] sm:text-4xl">Bridging opportunities <span className="text-primary">worldwide.</span></h2><p className="mt-5 max-w-sm text-sm leading-relaxed">Outside India, our focus is Research & Strategy, Business Fundings & Grants, Manpower Services and Mentorship. Indian and international startups and ideas are welcome in our funding programme.</p></div>
      <img src={mapImage} width={1600} height={656} loading="lazy" alt="World map showing routes connecting India with other markets" className="w-full object-contain" decoding="async" />
    </div></section>

    <section id="markets" className="border-b border-border bg-background py-14 text-foreground sm:py-20"><div className="mx-auto max-w-[1380px] px-5 sm:px-6 lg:px-12">
      <p className="eyebrow text-[11px] font-bold uppercase text-soft">Our regional presence</p>
      <h2 className="mt-3 max-w-2xl text-3xl font-black uppercase leading-[1.02] sm:text-4xl">Growing together <span className="text-primary">across key markets.</span></h2>
      <nav aria-label="Country tabs" className="mt-7 flex flex-wrap gap-2">{markets.map(market => <Button asChild variant="outline" key={market.slug}><Link to="/global-presence/$slug" params={{ slug: market.slug }}>{market.name}</Link></Button>)}</nav>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {markets.map((market) => <article key={market.name} className="overflow-hidden rounded-md border border-border bg-surface text-foreground shadow-sm">
          <img src={countryPreviewImages[market.slug] ?? market.image} alt={market.landmark} width={640} height={363} loading="lazy" className="aspect-[1.5] w-full object-cover" decoding="async" />
          <div className="px-4 pb-5 pt-4"><CountryLogo market={market} className="h-12 w-auto max-w-full object-contain object-left" /><h3 className="mt-4 text-base font-extrabold">{market.name}</h3><p className="mt-1 min-h-12 text-xs leading-relaxed text-muted-foreground">{market.description}</p><Link to="/global-presence/$slug" params={{ slug: market.slug }} aria-label={`Explore Riloyd ${market.name}`} className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-primary">Explore market <ArrowRight size={15} /></Link></div>
        </article>)}
      </div>
    </div></section>

    <section className="border-b border-border bg-surface py-16 text-foreground"><div className="mx-auto grid max-w-[1380px] gap-8 px-5 sm:px-6 lg:grid-cols-[.34fr_.66fr] lg:items-center lg:px-12"><div><p className="eyebrow text-[11px] font-bold uppercase">What we enable</p><h2 className="mt-4 text-3xl font-black uppercase leading-[1.02] sm:text-4xl">Global reach,<br /><span className="text-primary">real advantages.</span></h2></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{capabilities.map(({ icon: Icon, title }) => <div key={title} className="flex min-h-24 items-center gap-3 border border-border bg-background px-3 py-4"><Icon size={25} className="shrink-0 text-primary" /><span className="text-[11px] font-semibold leading-snug">{title}</span></div>)}</div></div></section>

    <section className="relative min-h-[390px] overflow-hidden border-b border-border"><img src={boardroomImage} width={1600} height={656} loading="lazy" alt="Modern meeting room overlooking a global city at sunset" className="absolute inset-0 h-full w-full object-cover object-center" decoding="async" /><div className="global-cta-shade absolute inset-0" /><div className="relative mx-auto flex min-h-[390px] max-w-[1380px] items-center px-5 py-12 sm:px-6 lg:px-12"><div className="max-w-lg"><p className="eyebrow text-xs font-bold uppercase text-soft">Global presence</p><h2 className="mt-4 text-4xl font-black uppercase leading-[.99] sm:text-5xl">Let&apos;s build a <span className="text-primary">borderless tomorrow.</span></h2><p className="mt-4 text-sm text-soft">Partner with RILOYD to explore opportunities for your business.</p><Button asChild size="lg" className="mt-6 rounded-md px-6 font-bold"><Link to="/contact">Talk to Our Team <ArrowRight size={16} /></Link></Button></div></div></section>
  </main>;
}