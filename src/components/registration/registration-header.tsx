import { Link } from "@tanstack/react-router";
import { ArrowRight, House } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoAsset from "@/assets/local/riloyd-logo.png.optimized.640.webp";

export function RegistrationHeader() {
  return (
    <header className="relative z-20 border-b border-border bg-background/90">
      <div className="mx-auto flex h-[70px] max-w-[1380px] items-center justify-between gap-4 px-5 sm:px-6 lg:px-12">
        <Link to="/" aria-label="Riloyd home" className="block h-[59px] w-[188px] shrink-0 md:w-[208px]"><img src={logoAsset} alt="Riloyd" className="h-full w-full object-contain object-left" decoding="async" /></Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <Button asChild variant="ghost" size="icon" aria-label="Home"><Link to="/"><House /></Link></Button>
          <Button asChild className="h-9 rounded-full px-4 text-xs font-bold sm:px-5"><Link to="/register">Register Now <ArrowRight /></Link></Button>
        </div>
      </div>
    </header>
  );
}
