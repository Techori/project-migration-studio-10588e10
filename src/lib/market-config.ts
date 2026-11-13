import type { StaticImageData } from "./service-types";
import britainLogo from "@/assets/local/regions/riloyd-britain-transparent-light-theme.webp";
import uaeLogo from "@/assets/local/regions/riloyd-uae-transparent-light-theme.webp";
import americaLogo from "@/assets/local/regions/riloyd-america-transparent.png.optimized.webp";
import singaporeLogo from "@/assets/local/regions/riloyd-singapore-transparent-light-theme.webp";
import europeLogo from "@/assets/local/regions/riloyd-europe-transparent-light-theme.webp";
import australiaLogo from "@/assets/local/regions/riloyd-australia-transparent-light-theme.webp";
import indiaLogoLightTheme from "@/assets/local/regions/riloyd-india-transparent-light-theme.webp";
import canadaLogoLightTheme from "@/assets/local/regions/riloyd-canada-transparent-light-theme.webp";
import americaLogoLightTheme from "@/assets/local/regions/riloyd-america-transparent-light-theme.webp";
import britainLogoDarkTheme from "@/assets/local/regions/riloyd-britain-transparent-dark-theme.webp";
import uaeLogoDarkTheme from "@/assets/local/regions/riloyd-uae-transparent-dark-theme.webp";
import singaporeLogoDarkTheme from "@/assets/local/regions/riloyd-singapore-transparent-dark-theme.webp";
import europeLogoDarkTheme from "@/assets/local/regions/riloyd-europe-transparent-dark-theme.webp";
import australiaLogoDarkTheme from "@/assets/local/regions/riloyd-australia-transparent-dark-theme.webp";
import canadaLogoDarkTheme from "@/assets/local/regions/riloyd-canada-transparent-dark-theme.webp";
import indiaLogoDarkTheme from "@/assets/local/regions/riloyd-india-transparent-dark-theme.webp";
import indiaImageAsset from "@/assets/countries/india-hd.webp";
const indiaImage = indiaImageAsset;
import britainImageAsset from "@/assets/countries/uk-hd.webp";
const britainImage = britainImageAsset;
import uaeImageAsset from "@/assets/countries/uae-hd.webp";
const uaeImage = uaeImageAsset;
import canadaImageAsset from "@/assets/countries/canada-hd.webp";
const canadaImage = canadaImageAsset;
import americaImageAsset from "@/assets/countries/usa-hd.webp";
const americaImage = americaImageAsset;
import singaporeImageAsset from "@/assets/countries/singapore-hd.webp";
const singaporeImage = singaporeImageAsset;
import europeImageAsset from "@/assets/countries/europe-hd.webp";
const europeImage = europeImageAsset;
import australiaImageAsset from "@/assets/countries/australia-hd.webp";
const australiaImage = australiaImageAsset;

export type MarketConfig = {
  slug: string;
  name: string;
  region: string;
  headline: string;
  description: string;
  introduction: string;
  image: StaticImageData;
  logo: string;
  logoAlt: string;
  logoTone: "light" | "dark";
  landmark: string;
  opportunities: [string, string][];
};

export const marketOrder = ["india", "uk", "uae", "canada", "usa", "singapore", "europe", "australia"] as const;

export const marketConfigs: Record<(typeof marketOrder)[number], MarketConfig> = {
  india: { slug: "india", name: "India", region: "South Asia", headline: "Ambition at scale.", description: "Connecting Indian businesses with strategy, capital and opportunities across markets.", introduction: "India combines entrepreneurial energy, deep talent and expanding consumer demand. RILOYD helps leaders assess opportunities, strengthen readiness and build routes to sustainable growth.", image: indiaImage, logo: indiaLogoLightTheme, logoAlt: indiaLogoDarkTheme, logoTone: "dark", landmark: "India Gate in New Delhi", opportunities: [["Growth Strategy", "Shape priorities for complex, fast-moving markets."], ["Funding Readiness", "Prepare a credible business and capital narrative."], ["Global Expansion", "Connect Indian ambition with international pathways."]] },
  uk: { slug: "uk", name: "UK", region: "United Kingdom", headline: "A gateway to global business.", description: "Building practical pathways into one of the world’s most connected commercial markets.", introduction: "The UK offers access to mature capital, specialist expertise and international networks. RILOYD supports businesses evaluating entry, partnerships and long-term positioning.", image: britainImage, logo: britainLogo, logoAlt: britainLogoDarkTheme, logoTone: "dark", landmark: "Big Ben in London", opportunities: [["Market Entry", "Understand positioning, requirements and routes to market."], ["Investor Networks", "Prepare for relevant funding and stakeholder conversations."], ["Strategic Partnerships", "Identify relationships that can accelerate progress."]] },
  uae: { slug: "uae", name: "UAE", region: "Middle East", headline: "Opportunity at the crossroads.", description: "Helping businesses approach the UAE with commercial clarity and regional perspective.", introduction: "The UAE is a dynamic platform for the Middle East, Africa and Asia. RILOYD helps businesses examine market potential, establish priorities and develop the relationships needed to move forward.", image: uaeImage, logo: uaeLogo, logoAlt: uaeLogoDarkTheme, logoTone: "dark", landmark: "Burj Khalifa in Dubai", opportunities: [["Regional Expansion", "Build a considered pathway into connected Gulf markets."], ["Business Setup Insight", "Clarify commercial choices before committing resources."], ["Capital Connections", "Strengthen readiness for investor and partner discussions."]] },
  canada: { slug: "canada", name: "Canada", region: "North America", headline: "Build with confidence.", description: "Exploring innovation, partnership and growth opportunities across Canada.", introduction: "Canada brings together a stable business environment, diverse talent and strong innovation ecosystems. RILOYD helps businesses assess fit and convert market interest into an informed plan.", image: canadaImage, logo: canadaLogoLightTheme, logoAlt: canadaLogoDarkTheme, logoTone: "dark", landmark: "Toronto skyline and CN Tower", opportunities: [["Market Research", "Understand demand, competition and commercial fit."], ["Innovation Networks", "Explore ecosystems aligned with your growth agenda."], ["Expansion Planning", "Turn market potential into phased action."]] },
  usa: { slug: "usa", name: "USA", region: "North America", headline: "Scale into possibility.", description: "Supporting informed access to a vast, competitive and opportunity-rich market.", introduction: "The USA rewards sharp positioning, strong execution and a clear understanding of customers. RILOYD helps businesses frame the opportunity and build practical expansion decisions.", image: americaImage, logo: americaLogo, logoAlt: americaLogoLightTheme, logoTone: "light", landmark: "New York City skyline", opportunities: [["Go-to-Market", "Focus the audience, offer and channel strategy."], ["Commercial Research", "Test assumptions against market evidence."], ["Growth Partnerships", "Explore relationships that support market traction."]] },
  singapore: { slug: "singapore", name: "Singapore", region: "Asia-Pacific", headline: "Connected to Asia.", description: "Using Singapore’s strategic position to explore opportunity across Asia-Pacific.", introduction: "Singapore is a trusted centre for regional operations, finance and innovation. RILOYD supports businesses seeking a disciplined base for Asia-Pacific growth.", image: singaporeImage, logo: singaporeLogo, logoAlt: singaporeLogoDarkTheme, logoTone: "dark", landmark: "Marina Bay Sands in Singapore", opportunities: [["Regional Strategy", "Prioritise markets and sequence expansion decisions."], ["Business Networks", "Explore relevant commercial and investor relationships."], ["Operating Perspective", "Align regional ambition with practical execution."]] },
  europe: { slug: "europe", name: "Europe", region: "European Markets", headline: "Many markets. One clear direction.", description: "Helping businesses navigate opportunity across diverse European markets.", introduction: "Europe brings varied customers, regulations and commercial cultures. RILOYD helps businesses identify where to focus and how to approach growth with the right context.", image: europeImage, logo: europeLogo, logoAlt: europeLogoDarkTheme, logoTone: "dark", landmark: "Eiffel Tower in Paris", opportunities: [["Market Prioritisation", "Compare opportunities and select the strongest fit."], ["Strategic Research", "Build decisions around evidence and local context."], ["Partner Discovery", "Identify relationships that support entry and growth."]] },
  australia: { slug: "australia", name: "Australia", region: "Oceania", headline: "Connect across the Pacific.", description: "Creating informed pathways to customers, talent and partners in Australia.", introduction: "Australia combines sophisticated markets with strong links to Asia-Pacific. RILOYD helps businesses understand commercial potential and build a realistic route forward.", image: australiaImage, logo: australiaLogo, logoAlt: australiaLogoDarkTheme, logoTone: "dark", landmark: "Sydney Opera House", opportunities: [["Market Assessment", "Evaluate demand, competition and strategic fit."], ["Business Expansion", "Create a phased plan for entry and growth."], ["Cross-Border Connections", "Explore relevant market and partnership networks."]] },
};

export function findMarket(slug: string) {
  return marketOrder.map((key) => marketConfigs[key]).find((market) => market.slug === slug);
}