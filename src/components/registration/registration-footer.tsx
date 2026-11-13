import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/local/riloyd-logo.png.optimized.640.webp";
import globalAsset from "@/assets/local/riloyd-global.png.optimized.webp";

export function RegistrationFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-[1380px] gap-8 px-5 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.5fr_.8fr_.9fr_1.1fr] lg:px-12">
        <div><img src={logoAsset} alt="Riloyd" className="h-auto w-36" loading="lazy" decoding="async" /><p className="mt-4 max-w-xs text-xs leading-relaxed text-muted-foreground">Helping ambitious people and businesses access expertise, capital and opportunities.</p></div>
        <div><h3 className="text-xs font-bold">Quick Links</h3><div className="mt-4 flex flex-col gap-2 text-xs text-muted-foreground"><Link to="/">Home</Link><Link to="/contact">Contact</Link><Link to="/register">Register</Link></div></div>
        <div><h3 className="text-xs font-bold">Register As</h3><div className="mt-4 flex flex-col gap-2 text-xs text-muted-foreground"><Link to="/register/startup">Startup</Link><Link to="/register/mentor">Mentor</Link><Link to="/register/investor">Investor</Link><Link to="/register/business">Business</Link></div></div>
        <div><p className="text-[9px] font-bold uppercase leading-relaxed text-soft">Global perspective.<br />Real impact.</p><span className="mt-3 block h-0.5 w-7 bg-primary" /><img src={globalAsset} alt="Connected global markets" className="mt-4 h-24 w-full object-cover object-left" loading="lazy" decoding="async" /></div>
      </div>
      <div className="border-t border-border px-5 py-5 text-center text-[10px] text-muted-foreground">© 2026 RILOYD. All rights reserved. · Privacy Policy · Terms of Use</div>
    </footer>
  );
}
