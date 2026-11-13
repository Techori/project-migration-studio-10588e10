import { ArrowRight, CalendarDays, GraduationCap, Lightbulb, Trophy, Users, Rocket, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import hero from '@/assets/young-innovators-hero-refreshed-1920.webp';
import hero1280 from '@/assets/young-innovators-hero-refreshed-1280.webp';
import hero768 from '@/assets/young-innovators-hero-refreshed-768.webp';

export function YoungInnovatorsHero() {
  return <>
    <section className="relative isolate overflow-hidden border-b border-border bg-background text-foreground">
      <img src={hero} srcSet={`${hero768} 768w, ${hero1280} 1280w, ${hero} 1920w`} sizes="100vw" width={1920} height={768} alt="Riloyd Young Innovators Challenge 2026 — Big Ideas. Brighter Bharat. Indian students exploring innovation" fetchPriority="high" decoding="async" className="block h-auto w-full" />
      <div className="relative mx-auto max-w-[1380px] px-5 py-6 sm:px-6 lg:px-12">
        <div className="max-w-[620px]">
          <p className="text-xs font-bold uppercase">Riloyd presents</p>
          <h1 className="sr-only">Riloyd Young Innovators Challenge 2026</h1>
          <p className="mt-5 text-xl font-semibold italic sm:text-2xl">Big Ideas. Brighter Bharat.</p>
          <div className="mt-5 flex flex-wrap gap-5"><div className="flex items-center gap-3"><GraduationCap size={32} className="text-primary"/><p className="text-xs font-bold">For school students<br/>Classes 6–12</p></div><div className="flex items-center gap-3 border-l border-border pl-5"><CalendarDays size={28} className="text-primary"/><p className="text-xs font-bold">2–6 November<br/>2026</p></div></div>
          <p className="mt-5 max-w-[420px] text-sm leading-relaxed text-muted-foreground"><strong className="text-foreground">For school students in Classes 6–12 with a startup or business idea.</strong> Start with a customer problem, imagine a useful solution and share how it could become a business.</p>
          <div className="mt-6 flex flex-wrap gap-3"><Button asChild size="lg"><a href="#registration">Register your idea <ArrowRight size={18}/></a></Button><Button asChild variant="outline"><a href="#idea-video"><Video size={16}/>Your 60-second idea</a></Button></div>
        </div>
      </div>
    </section>
    <div className="young-benefits-band border-b border-border"><div className="mx-auto grid max-w-[1380px] grid-cols-2 gap-5 px-5 py-5 sm:px-6 md:grid-cols-5 lg:px-12">{[[Lightbulb,'Turn ideas into real solutions'],[GraduationCap,'Learn from industry experts'],[Trophy,'Exciting challenge rewards'],[Users,'Mentorship & guidance'],[Rocket,'Young business & startup ideas']].map(([Icon,label])=>{const BenefitIcon=Icon as typeof Lightbulb;return <div key={label as string} className="flex items-center gap-3"><BenefitIcon size={27} className="shrink-0 text-challenge-gold"/><span className="text-xs font-semibold leading-relaxed">{label as string}</span></div>;})}</div></div>
  </>;
}