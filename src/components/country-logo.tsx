import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { countryLogosQuery } from "@/lib/country-logos-query";
import { countryLogoSchema, resolveLogo, type CountryLogo } from "@/lib/country-logo-schemas";
import type { MarketConfig } from "@/lib/market-config";

const LogoContext = createContext<CountryLogo[]>([]);

export function CountryLogosProvider({ children }: { children: ReactNode }) {
  const { data = [] } = useQuery(countryLogosQuery);
  const [draft, setDraft] = useState<CountryLogo | null>(null);
  useEffect(() => {
    function receive(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.source !== window.parent || window.parent === window) return;
      if (event.data?.type !== "riloyd-logo-preview") return;
      const parsed = countryLogoSchema.safeParse(event.data);
      if (!parsed.success || typeof event.data.url !== "string" || !event.data.url.startsWith(`blob:${window.location.origin}/`)) return;
      setDraft({ ...parsed.data, url: event.data.url });
      document.documentElement.classList.toggle("light", parsed.data.theme === "light");
    }
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);
  return <LogoContext.Provider value={draft ? [draft, ...data.filter(logo => logo.country !== draft.country || logo.theme !== draft.theme)] : data}>{children}</LogoContext.Provider>;
}

export function CountryLogo({ market, className = "" }: { market: MarketConfig; className?: string }) {
  const logos = useContext(LogoContext);
  const light = market.logoTone === "dark" ? market.logo : market.logoAlt;
  const dark = market.logoTone === "light" ? market.logo : market.logoAlt;
  return <><img src={resolveLogo(logos, market.slug, "light", light)} alt={`Riloyd ${market.name} logo`} loading="lazy" className={`${className} logo-show-light`} decoding="async" /><img src={resolveLogo(logos, market.slug, "dark", dark)} alt={`Riloyd ${market.name} logo`} loading="lazy" className={`${className} logo-show-dark`} decoding="async" /></>;
}