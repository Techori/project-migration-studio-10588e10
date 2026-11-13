import { CountryLogo } from "@/components/country-logo";
import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown, Instagram, Linkedin, Menu, Moon, Sun, Flame } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { applyFestiveDecoration, applySiteTheme, festiveDecorationAt, msUntilNextDecorationSwitch, nextSiteTheme, readSiteTheme, siteThemeLabels, usesLightSurfaces, type SiteTheme } from '@/lib/site-theme';
import diwaliToran from '@/assets/diwali-toran.webp';
import chhathToran from '@/assets/chhath-toran.webp';
import { Button } from "@/components/ui/button";
import logoAsset from "@/assets/local/riloyd-logo.png.optimized.nav.webp";
import darkLogoAsset from "@/assets/local/riloyd-logo-dark.png.optimized.nav.webp";
const darkLogo = darkLogoAsset;
import globalGlossy from "@/assets/local/riloyd-global-glossy.png.webp";
import globalLight from "@/assets/local/riloyd-global-light.png.webp";
import { serviceOrder, serviceConfigs } from "@/lib/service-config";
import { marketOrder, marketConfigs, findMarket } from "@/lib/market-config";
import { internationalServices } from "@/lib/international-programme";

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isGlobalPage = pathname.startsWith("/global-presence");
  const activeMarket = isGlobalPage ? findMarket(pathname.split("/")[2] ?? "") : undefined;
  const [theme, setTheme] = useState<SiteTheme>("festive");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setTheme(readSiteTheme(localStorage.getItem("riloyd-theme")));
  }, []);

  // Festive stays in Chhath Puja colours; only the garland and pictures swap Chhath ↔ Diwali every 5 seconds.
  useEffect(() => {
    applySiteTheme(theme);
    if (theme !== "festive") return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const tick = () => {
      const now = Date.now();
      applyFestiveDecoration(festiveDecorationAt(now));
      timer = setTimeout(tick, msUntilNextDecorationSwitch(now) + 20);
    };
    tick();
    return () => clearTimeout(timer);
  }, [theme]);

  function toggleTheme() {
    const next = nextSiteTheme(theme);
    setTheme(next);
    localStorage.setItem("riloyd-theme", next);
  }
  const lightSurfaces = usesLightSurfaces(theme);
  const nextLabel = siteThemeLabels[nextSiteTheme(theme)];

  const navItems = [
    { label: "Home", to: "/" as const },
    { label: "About", to: "/about" as const },
    { label: "Services", to: "/services" as const },
    { label: "Contact", to: "/contact" as const },
  ];

  return <header className="relative z-30 border-b border-border bg-background text-foreground">
    <div className="mx-auto grid h-[70px] max-w-[1380px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 sm:px-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:px-12">
      <Link to="/" aria-label={activeMarket ? `Riloyd ${activeMarket.name} home` : isGlobalPage ? "Riloyd Global home" : "Riloyd home"} className="block h-[59px] w-[188px] shrink-0 sm:w-[208px]">{activeMarket ? <CountryLogo market={activeMarket} className="h-full w-full object-contain object-left" /> : <img src={isGlobalPage ? (lightSurfaces ? globalLight : globalGlossy) : (lightSurfaces ? darkLogo : logoAsset)} alt={isGlobalPage ? "Riloyd Global" : "Riloyd"} className="h-full w-full object-contain object-left" decoding="async" />}</Link>
      <nav aria-label="Main navigation" className="hidden items-center justify-center gap-6 text-xs font-bold xl:gap-9 lg:flex">
        {navItems.map((item) => activeMarket && activeMarket.slug !== "india" && item.label === "Services" ? <Link key={item.label} to="/global-presence/$slug" params={{ slug: activeMarket.slug }} hash="services" className="nav-link">Services</Link> : <Link key={item.label} to={item.to} className={`nav-link ${pathname === item.to ? "nav-active" : ""}`}>{item.label}</Link>)}
        <DropdownMenu><DropdownMenuTrigger className={`nav-link inline-flex items-center gap-1 outline-none ${pathname === "/foundation" || pathname === "/education-support" ? "nav-active" : ""}`}>RILOYD Foundation <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" /></DropdownMenuTrigger><DropdownMenuContent align="start" className="min-w-52"><DropdownMenuItem asChild><Link to="/foundation">RILOYD Foundation</Link></DropdownMenuItem><DropdownMenuItem asChild><Link to="/education-support">Education Support – Scholarship Registration</Link></DropdownMenuItem></DropdownMenuContent></DropdownMenu>
      </nav>
      <div className="flex shrink-0 items-center gap-2">
        <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={toggleTheme} aria-label={`Switch to ${nextLabel} theme`} title={`Switch to ${nextLabel} theme`}>{theme === "dark" ? <Sun className="h-4 w-4" /> : theme === "light" ? <Flame className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</Button>
        <Button asChild variant="outline" className="hidden h-8 rounded-full border-primary px-4 text-[11px] font-bold lg:inline-flex"><Link to="/register">Register Now <ArrowRight size={14} /></Link></Button>
        <Button type="button" variant="ghost" size="icon" className="h-9 w-9 lg:hidden" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><Menu size={19} /></Button>
      </div>
    </div>
    {menuOpen && <nav aria-label="Mobile navigation" className="absolute inset-x-0 top-full z-40 flex flex-col border-b border-border bg-background px-5 py-3 shadow-xl lg:hidden">
      {navItems.map((item) => activeMarket && activeMarket.slug !== "india" && item.label === "Services" ? <Link key={item.label} to="/global-presence/$slug" params={{ slug: activeMarket.slug }} hash="services" onClick={() => setMenuOpen(false)} className="border-b border-border py-3 text-sm font-semibold">Services</Link> : <Link key={item.label} to={item.to} onClick={() => setMenuOpen(false)} className="border-b border-border py-3 text-sm font-semibold last:border-0">{item.label}</Link>)}
      <Link to="/foundation" onClick={() => setMenuOpen(false)} className="py-3 text-sm font-semibold">RILOYD Foundation</Link><Link to="/education-support" onClick={() => setMenuOpen(false)} className="border-b border-border pb-3 pl-4 text-sm text-muted-foreground">↳ Education Support</Link>
      <Link to="/register" onClick={() => setMenuOpen(false)} className="py-3 text-sm font-bold text-primary">Register Now →</Link>
    </nav>}
    {theme === 'festive' && <div className="diwali-decoration" aria-hidden="true"><div className="diwali-toran festive-toran-chhath" style={{ backgroundImage: `url(${chhathToran})` }} /><div className="diwali-toran festive-toran-diwali" style={{ backgroundImage: `url(${diwaliToran})` }} /></div>}
  </header>;
}

const aboutLinks = [
  { label: "Our Vision", hash: "vision" },
  { label: "Our Mission", hash: "mission" },
  { label: "Who We Serve", hash: "who-we-serve" },
  { label: "What We Do", hash: "what-we-do" },
  { label: "How We Think", hash: "how-we-think" },
  { label: "Our Difference", hash: "our-difference" },
];

export function SiteFooter() {
  const pathname = useRouterState({ select: s => s.location.pathname });
  const footerMarket = pathname.startsWith("/global-presence/") ? findMarket(pathname.split("/")[2] ?? "") : undefined;
  const overseas = footerMarket && footerMarket.slug !== "india";
  const [theme, setTheme] = useState("dark");
  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(document.documentElement.classList.contains("light") ? "light" : "dark"));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    setTheme(document.documentElement.classList.contains("light") ? "light" : "dark");
    return () => observer.disconnect();
  }, []);
  return <footer className="border-t border-border bg-footer text-foreground">
    <div className="mx-auto grid max-w-[1380px] grid-cols-6 gap-x-4 gap-y-[2mm] px-5 pt-[5mm] pb-7 sm:gap-y-4 sm:px-6 lg:px-12 xl:grid-cols-[1.35fr_.75fr_.72fr_.7fr_.85fr_.8fr_.8fr_.8fr]">
      <div className="order-1 col-span-6 xl:col-span-1"><div className="flex items-center gap-[2mm] sm:block"><Link to="/" aria-label="Riloyd home" className="-ml-[3mm] block w-[40%] shrink-0 sm:w-auto"><img src={theme === "light" ? darkLogo : logoAsset} alt="Riloyd" loading="lazy" className="h-auto w-full sm:w-36" decoding="async" /></Link><p className="flex-1 min-w-0 text-[11px] leading-[1.5] text-muted-foreground sm:mt-[2mm] sm:text-xs"><span className="block">RILOYD helps ambitious businesses</span><span className="block">find expertise, capital and</span><span className="block">opportunities for sustainable growth.</span></p></div></div>
      <div className="order-2 col-span-2 sm:col-span-2 xl:col-span-1"><h2 className="text-xs font-bold">Explore</h2><div className="mt-3 flex flex-col gap-1.5 text-xs text-muted-foreground"><Link to="/">Home</Link><Link to="/about">About</Link><Link to="/contact">Contact</Link><Link to="/register">Register</Link><Link to="/funding-programme">Funding Programme</Link><Link to="/prototype-funding">Prototype Funding</Link><Link to="/young-innovators-2026">Young Innovators 2026</Link></div>
      </div>
      <div className="footer-people order-3 col-span-2 sm:col-span-2 xl:col-span-1"><h2 className="text-xs font-bold">Our People</h2><div className="mt-3 flex flex-col gap-1.5 text-xs text-muted-foreground"><Link to="/investors">Our Investors</Link><Link to="/mentors">Our Mentors</Link><Link to="/team">Our Team Members</Link><Link to="/startups">Our Startups</Link><Link to="/businesses">Our Businesses</Link></div>
        <Button asChild variant="outline" size="sm" className="mt-3 h-[22px] min-h-0 max-w-full py-0 text-xs"><Link to="/admin">Login <ArrowRight size={14} aria-hidden="true" /></Link></Button>
        <div className="mt-[6mm] hidden sm:block"><h2 className="text-xs font-bold">Follow Us</h2><div className="mt-3 flex items-center gap-2"><a className="social-link" href="https://www.linkedin.com/company/145354558" target="_blank" rel="noopener noreferrer" aria-label="Riloyd on LinkedIn"><Linkedin className="h-4 w-4" aria-hidden="true" /></a><a className="social-link" href="https://www.instagram.com/riloyd.in/" target="_blank" rel="noopener noreferrer" aria-label="Riloyd on Instagram"><Instagram className="h-4 w-4" aria-hidden="true" /></a></div></div>
      </div>
      <div className="footer-about order-4 col-span-2 sm:col-span-2 sm:row-span-1 xl:col-span-1"><h2 className="text-xs font-bold">About Us</h2><div className="mt-3 flex flex-col gap-1.5 text-xs text-muted-foreground">{aboutLinks.map((l) => <Link key={l.hash} to="/about" hash={l.hash}>{l.label}</Link>)}<Link to="/payment" search={{ country: "usa" }}>Payment Accounts</Link></div></div>
      <div className="order-10 col-span-6 mt-0 sm:order-10 sm:col-span-6 sm:mt-5 xl:col-start-1 xl:col-span-8 xl:row-start-2 xl:mt-1">
        <div className="hidden border-b border-border pb-4 xl:flex xl:justify-center">
          <Link to="/global-presence" aria-label="Explore Riloyd Global presence" className="block w-fit max-w-full"><img src={theme === "light" ? globalLight : globalGlossy} alt="Riloyd Global — explore our global presence" loading="lazy" className="h-12 w-auto max-w-full object-contain" decoding="async" /></Link>
        </div>
        <div className="mt-1 grid grid-cols-4 items-center gap-x-3 gap-y-3 sm:mt-3 xl:grid-cols-8">
          {marketOrder.map((key) => { const market = marketConfigs[key]; return <Link key={key} to="/global-presence/$slug" params={{ slug: market.slug }} aria-label={`Explore Riloyd ${market.name}`} className="flex items-center justify-start"><CountryLogo market={market} className="h-9 w-auto max-w-full object-contain object-left" /></Link>; })}
        </div>
      </div>
      <div className="contents sm:order-10 sm:col-span-2 sm:block sm:min-w-0 xl:contents">
      <div className="order-9 col-span-6 text-xs leading-relaxed text-muted-foreground sm:mt-5 xl:col-start-7 xl:col-span-2 xl:row-start-1 xl:mt-0">
        <h2 className="text-sm font-bold text-foreground">Contact</h2>
        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] [&>a]:whitespace-nowrap xl:text-[10.5px]">
          <a className="font-medium text-foreground hover:underline" href="mailto:info@riloyd.in">info@riloyd.in</a>
          <a className="font-medium text-foreground hover:underline" href="mailto:business@riloyd.in">business@riloyd.in</a>
          <a className="font-medium text-foreground hover:underline" href="mailto:careers@riloyd.in">careers@riloyd.in</a>
          <a className="font-medium text-foreground hover:underline" href="mailto:idea@riloyd.in">idea@riloyd.in</a>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3 sm:mt-4 xl:mt-5 xl:grid-cols-1 xl:gap-y-3 xl:text-[10.5px]">
          <div>
            <h3 className="text-xs font-bold text-foreground">Registered Office</h3>
            <p className="mt-2 xl:mt-1">Rishishwar Industry Pvt. Ltd., Mahadaji Nagar, Lashkar,<br />Gird, Gwalior M.P. - 474001</p>
            <div className="mt-3 xl:hidden">

              <Link to="/global-presence" aria-label="Explore Riloyd Global presence" className="block w-fit max-w-full"><img src={theme === "light" ? globalLight : globalGlossy} alt="Riloyd Global — explore our global presence" loading="lazy" className="h-10 w-auto max-w-full object-contain object-left" decoding="async" /></Link>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-foreground">Corporate Office</h3>
            <p className="mt-2 xl:mt-1">Gincube Center, Motimal, Lashkar,<br />Gird, Gwalior &ndash; 474009</p>
            <div className="mt-3 sm:hidden">
              <h2 className="text-xs font-bold">Follow Us</h2>
              <div className="mt-3 flex items-center gap-2">
                <a className="social-link" href="https://www.linkedin.com/company/145354558" target="_blank" rel="noopener noreferrer" aria-label="Riloyd on LinkedIn"><Linkedin className="h-4 w-4" aria-hidden="true" /></a>
                <a className="social-link" href="https://www.instagram.com/riloyd.in/" target="_blank" rel="noopener noreferrer" aria-label="Riloyd on Instagram"><Instagram className="h-4 w-4" aria-hidden="true" /></a>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      <div className="order-7 col-span-3 sm:order-8 sm:col-span-2 xl:col-span-1"><h2 className="text-xs font-bold">Our Services</h2><div className="mt-3 flex flex-col gap-1.5 text-xs text-muted-foreground">{overseas ? internationalServices.map(service => <Link key={service.id} to="/global-presence/$slug" params={{ slug: footerMarket.slug }} hash={service.id}>{service.title}</Link>) : serviceOrder.map((key) => { const service = serviceConfigs[key]; return service ? <Link key={key} to="/services/$slug" params={{ slug: service.slug }}>{service.shortTitle}</Link> : null; })}</div></div>
      <div className="order-8 col-span-3 sm:order-9 sm:col-span-2 xl:col-span-1"><h2 className="text-xs font-bold">Downloads</h2><div className="mt-3 flex flex-col gap-1.5 text-xs text-muted-foreground"><Link to="/research" className="font-medium text-foreground">Our Researchs</Link><Link to="/downloads">Business Valuation Reports</Link><Link to="/downloads">Business Reports &amp; Documents</Link><Link to="/downloads">All Reports</Link></div></div>
    </div>
    <div className="copyright-bar border-t border-border px-3 py-[5mm] text-center text-muted-foreground sm:px-5">
      <div className="mx-auto max-w-[1380px]">
        <div>
          <p>© {new Date().getFullYear()} RILOYD. All rights reserved by RISHISHWAR INDUSTRY PRIVATE LIMITED.</p>
          <p className="mt-1">Riloyd &mdash; a unit of RISHISHWAR INDUSTRY PRIVATE LIMITED</p>
          <p className="mt-1">CIN Number: U85500MP2023PTC068770</p>
        </div>
      </div>
    </div>
  </footer>;
}