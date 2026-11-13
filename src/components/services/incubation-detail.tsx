import { Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, BarChart3, BriefcaseBusiness, Building2, ChevronRight, CircleDollarSign, Cog, FileCheck2, Layers3, Lightbulb, Network, Rocket, ShieldCheck, UsersRound, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import lobbyAsset from "@/assets/local/riloyd-sunset-corporate-lobby.png.optimized.webp";
import coworkingAsset from "@/assets/local/incubation-coworking.png.optimized.webp";
import cabinsAsset from "@/assets/local/incubation-private-cabins.png.optimized.webp";
import virtualOfficeAsset from "@/assets/local/incubation-virtual-office.png.optimized.webp";
import meetingRoomsAsset from "@/assets/local/incubation-meeting-rooms.png.optimized.webp";
import loungeAsset from "@/assets/local/incubation-community-lounge.webp";
import communityImageAsset from "@/assets/local/incubation-community.jpg.optimized.webp";
const communityImage = communityImageAsset;
import futureImageAsset from "@/assets/local/incubation-future.jpg.optimized.webp";
const futureImage = futureImageAsset;

const lobbyImage = lobbyAsset;

const services = [
  { icon: Building2, title: "Workspace", copy: "Flexible desks, private cabins and meeting spaces for teams at every stage." },
  { icon: Layers3, title: "Business Support", copy: "Research, strategy, planning and hands-on operational guidance." },
  { icon: BarChart3, title: "Sales & Growth", copy: "Go-to-market planning, customer discovery and revenue development." },
  { icon: UsersRound, title: "Mentorship", copy: "Learn from experienced founders and industry professionals." },
  { icon: CircleDollarSign, title: "Finance & Funding", copy: "Build funding readiness and explore suitable capital opportunities." },
  { icon: ShieldCheck, title: "Legal & Compliance", copy: "Navigate registrations, contracts and essential compliance needs." },
  { icon: Cog, title: "Technology", copy: "Digital tools and technology advice to support daily operations." },
  { icon: Network, title: "Networking", copy: "Meet founders, investors and potential business partners." },
  { icon: Video, title: "Media & Content", copy: "Shape your story with content and communication support." },
];

const spaces = [
  { title: "Co-working", copy: "Room to connect and create.", image: coworkingAsset, alt: "Riloyd co-working floor with open desks, city skyline and branded lounge wall" },
  { title: "Private Cabins", copy: "Space for a focused team.", image: cabinsAsset, alt: "Riloyd private cabins along a glass corridor with city view" },
  { title: "Virtual Office", copy: "A professional business base.", image: virtualOfficeAsset, alt: "Riloyd virtual office reception with business address and support services" },
  { title: "Meeting Rooms", copy: "Make every conversation count.", image: meetingRoomsAsset, alt: "Riloyd boardroom meeting room with presentation screen and city view" },
  { title: "Community Lounge", copy: "Ideas grow together.", image: loungeAsset, alt: "Riloyd community lounge with sofas, cafe and startup community" },
];

const journey = [
  { icon: Lightbulb, number: "01", title: "Ideate", copy: "Validate your idea with guidance and support." },
  { icon: Cog, number: "02", title: "Build", copy: "Find the space, people and tools to move forward." },
  { icon: BarChart3, number: "03", title: "Fund", copy: "Prepare your story and connect with capital." },
  { icon: Rocket, number: "04", title: "Scale", copy: "Grow with strategy, connections and momentum." },
];

function Label({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <p className={`eyebrow text-[11px] font-bold uppercase ${light ? "text-card-foreground" : "text-soft"}`}>{children}</p>;
}

export function IncubationDetail() {
  return <>
    <section className="relative min-h-[580px] overflow-hidden border-b border-border sm:min-h-[590px]">
      <img src={lobbyImage} width={1600} height={912} alt="Riloyd startup and business incubation center lobby" className="absolute inset-0 h-full w-full object-cover object-[58%_center]" decoding="async" fetchPriority="high" />
      <div className="hero-shade absolute inset-0" />
      <div className="relative z-10 mx-auto flex min-h-[580px] max-w-[1380px] flex-col justify-center px-5 py-12 sm:min-h-[590px] sm:px-6 lg:px-12">
        <nav aria-label="Breadcrumb" className="mb-10 flex items-center gap-2 text-xs text-soft"><Link to="/">Home</Link><ChevronRight size={12} /><Link to="/services">Services</Link><ChevronRight size={12} /><span>Incubation Centers</span></nav>
        <Label>Startup &amp; business incubation centers</Label>
        <h1 className="headline mt-5 max-w-3xl text-[clamp(2.6rem,5vw,4.5rem)] font-black uppercase leading-[.96]">More than a workspace.<br /><span className="text-primary">A complete startup ecosystem.</span></h1>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-soft sm:text-base">A place for founders and growing businesses to work, connect, build and move forward with the right support around them.</p>
        <div className="mt-7 flex flex-wrap gap-3"><Button asChild size="lg" className="rounded-md px-6 font-bold"><Link to="/register/startup">Join the Incubation Center <ArrowRight size={17} /></Link></Button><Button asChild size="lg" variant="outline" className="rounded-md px-6 font-bold"><a href="#incubation-services">Explore Services</a></Button></div>
        <div className="mt-10 flex flex-wrap gap-x-7 gap-y-4 text-xs font-semibold sm:gap-x-12">{[[Building2, "Workspace for every stage"], [BadgeCheck, "Expert support"], [Network, "Investor connections"]].map(([Icon, label]) => { const Symbol = Icon as typeof Building2; return <span key={label as string} className="flex items-center gap-2"><Symbol size={20} className="text-primary" />{label as string}</span>; })}</div>
      </div>
    </section>

    <section id="incubation-services" className="border-b border-border bg-background py-16 text-foreground"><div className="mx-auto max-w-[1380px] px-5 sm:px-6 lg:px-12">
      <Label>Our services</Label><div className="mt-3 flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><h2 className="max-w-2xl text-3xl font-black leading-tight sm:text-4xl">Everything your startup needs.<br /><span className="text-primary">Under one roof.</span></h2><p className="max-w-md text-sm leading-relaxed text-muted-foreground">Workspace, mentoring, funding guidance and connections — a supportive environment for your next step.</p></div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{services.map(({ icon: Icon, title, copy }) => <article key={title} className="flex gap-4 rounded-md border border-border bg-card p-5 text-card-foreground sm:p-6"><Icon size={30} strokeWidth={1.8} className="mt-0.5 shrink-0 text-primary" /><div><h3 className="font-extrabold">{title}</h3><p className="mt-1 text-sm leading-relaxed text-card-foreground">{copy}</p></div></article>)}</div>
    </div></section>

    <section className="relative overflow-hidden border-b border-border"><img src={lobbyImage} width={1600} height={912} loading="lazy" alt="Riloyd premium incubation workspace" className="absolute inset-0 h-full w-full object-cover" decoding="async" /><div className="hero-shade absolute inset-0" /><div className="relative mx-auto max-w-[1380px] px-5 py-14 sm:px-6 lg:px-12"><Label>Premium workspaces</Label><h2 className="mt-4 max-w-xl text-3xl font-black uppercase leading-[1.02] sm:text-5xl">A workspace for <span className="text-primary">every ambition.</span></h2><p className="mt-4 max-w-lg text-sm leading-relaxed text-soft">Flexible spaces designed for focused work, meaningful meetings and the next big idea.</p><Button asChild className="mt-6 rounded-md px-6 font-bold"><Link to="/contact">Explore Workspaces <ArrowRight size={16} /></Link></Button>
      <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{spaces.map((space) => <article key={space.title} className="relative aspect-[4/5] overflow-hidden rounded-md border border-border sm:aspect-[3/4]"><img src={space.image} alt={space.alt} loading="lazy" width={1600} height={912} className="h-full w-full object-cover" decoding="async" /><div className="absolute inset-x-0 bottom-0 bg-background/80 px-3 py-3 backdrop-blur-sm"><h3 className="text-sm font-bold">{space.title}</h3><p className="mt-1 text-[10px] text-soft">{space.copy}</p></div></article>)}</div>
    </div></section>

    <section className="border-b border-border bg-card py-16 text-card-foreground"><div className="mx-auto max-w-[1380px] px-5 sm:px-6 lg:px-12"><Label light>Your journey with Riloyd</Label><h2 className="mt-3 text-3xl font-black sm:text-4xl">From idea to <span className="text-primary">impact.</span></h2><div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{journey.map(({ icon: Icon, number, title, copy }) => <article key={number} className="border-l-2 border-primary px-5 py-4"><div className="flex items-start justify-between"><span className="text-lg font-extrabold">{number}</span><Icon size={31} strokeWidth={1.8} className="text-primary" /></div><h3 className="mt-6 text-lg font-extrabold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-card-foreground">{copy}</p></article>)}</div></div></section>

    <section className="border-b border-border bg-surface"><div className="mx-auto grid max-w-[1380px] grid-cols-2 gap-0 px-5 sm:px-6 lg:grid-cols-4 lg:px-12">{[[BriefcaseBusiness, "Practical business support"], [UsersRound, "Experienced mentors"], [FileCheck2, "Funding readiness"], [Network, "Founder community"]].map(([Icon, title]) => { const Symbol = Icon as typeof BriefcaseBusiness; return <div key={title as string} className="flex min-h-32 flex-col items-center justify-center gap-3 border-r border-border px-4 py-5 text-center last:border-r-0"><Symbol size={30} className="text-primary" /><p className="text-sm font-bold">{title as string}</p></div>; })}</div></section>

    <section className="relative min-h-[360px] overflow-hidden border-b border-border bg-background text-foreground"><img src={communityImage} width={1600} height={864} loading="lazy" alt="Founders, mentors and investors meeting in the Riloyd incubation center" className="absolute inset-0 h-full w-full object-cover object-[65%_center]" decoding="async" /><div className="incubation-community-shade absolute inset-0" /><div className="relative mx-auto flex min-h-[360px] max-w-[1380px] items-center px-5 py-12 sm:px-6 lg:px-12"><div className="max-w-md"><Label>People. Ideas. Opportunities.</Label><h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">Join a thriving <span className="text-primary">startup community.</span></h2><p className="mt-4 text-sm leading-relaxed">Connect with founders, mentors and industry experts who share your drive to build something meaningful.</p><Button asChild className="mt-6 rounded-md px-6 font-bold"><Link to="/register/startup">Become a Member <ArrowRight size={16} /></Link></Button></div></div></section>

    <section className="relative min-h-[330px] overflow-hidden border-b border-border"><img src={futureImage} width={1600} height={704} loading="lazy" alt="Riloyd incubation center overlooking the city at sunset" className="absolute inset-0 h-full w-full object-cover object-[60%_center]" decoding="async" /><div className="hero-shade absolute inset-0" /><div className="relative mx-auto flex min-h-[330px] max-w-[1380px] flex-col justify-center px-5 py-12 sm:px-6 lg:px-12"><Label>Take the first step</Label><h2 className="mt-4 max-w-2xl text-3xl font-black uppercase leading-[1.02] sm:text-5xl">Build your bigger tomorrow <span className="text-primary">with Riloyd.</span></h2><p className="mt-4 max-w-xl text-sm text-soft">Find the workspace, support and community to move your idea or business forward.</p><Button asChild className="mt-6 w-fit rounded-full px-6 font-bold"><Link to="/register/startup">Join Now <ArrowRight size={16} /></Link></Button></div></section>
  </>;
}