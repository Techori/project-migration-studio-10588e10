import { Link } from "@tanstack/react-router";
import {
  ArrowRight, BadgeCheck, BarChart3, CalendarDays, ChevronRight, ClipboardList, FileText,
  Headphones, MessageSquare, Search, Settings, ShieldCheck, TrendingUp, UserPlus, Users, Wallet,
} from "lucide-react";
import heroAsset from "@/assets/local/manpower-hero.png.optimized.webp";
import valuesAsset from "@/assets/local/manpower-values.png.optimized.webp";
import teamAsset from "@/assets/local/manpower-team.png.optimized.webp";

const heroPoints = [
  [Users, "Skilled Workforce"],
  [FileText, "Payroll Management"],
  [ShieldCheck, "HR Compliance"],
  [BarChart3, "Flexible Hiring Models"],
] as const;

const solutions = [
  [Users, "Staff Hiring", "Source and provide skilled manpower as per your business requirements."],
  [FileText, "Payroll Management", "Complete salary processing, statutory compliance and disbursement on our payroll."],
  [ShieldCheck, "HR & Legal Compliance", "Manage PF, ESIC, contracts and all legal formalities."],
  [Settings, "Flexible Hiring Models", "Short-term, long-term, project-based and scalable manpower solutions."],
] as const;

const steps = [
  [MessageSquare, "01", "Understand Your Need", "Discuss your manpower requirements and roles."],
  [Search, "02", "Source & Screen", "Identify and shortlist suitable candidates."],
  [Users, "03", "Hire & Deploy", "Complete onboarding and deploy staff on our payroll."],
  [FileText, "04", "Manage & Support", "Handle payroll, compliance and ongoing employee support."],
  [TrendingUp, "05", "Scale as You Grow", "Easily scale your team as your business expands."],
] as const;

const deliverables = [
  [BadgeCheck, "Skilled & Verified Manpower"],
  [UserPlus, "Recruitment & Onboarding"],
  [Wallet, "Payroll Processing & Salary Disbursement"],
  [ShieldCheck, "PF, ESIC & Statutory Compliance"],
  [CalendarDays, "Attendance & Leave Management"],
  [Headphones, "Employee Support & Grievance Handling"],
  [BarChart3, "Performance Tracking & Reporting"],
  [ClipboardList, "Flexible Workforce Scaling"],
] as const;

function Eyebrow({ children, onLight = false }: { children: React.ReactNode; onLight?: boolean }) {
  return (
    <p className={`flex items-center gap-4 text-xs font-bold uppercase tracking-[0.25em] ${onLight ? "text-card-foreground" : "text-muted-foreground"}`}>
      <span className="block h-0.5 w-10 bg-primary" />
      {children}
    </p>
  );
}

export function ManpowerDetail() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <img src={heroAsset} alt="Riloyd boardroom overlooking a city skyline at sunset" className="absolute inset-0 h-full w-full object-cover" decoding="async" fetchPriority="high" />
        <div className="hero-shade absolute inset-0" />
        <div className="relative z-10 mx-auto max-w-[1380px] px-5 py-16 sm:px-6 lg:px-12 lg:py-24">
          <nav className="flex items-center gap-2 text-xs text-soft">
            <Link to="/">Home</Link><ChevronRight size={12} />
            <Link to="/services">Services</Link><ChevronRight size={12} />
            <span>Manpower Service</span>
          </nav>
          <div className="mt-6"><Eyebrow>Manpower services</Eyebrow></div>
          <h1 className="headline mt-4 max-w-3xl text-[clamp(2.25rem,5vw,4.5rem)] font-black leading-[0.95]">
            Get your staff at <span className="text-primary">our payroll.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg font-semibold">Hire the right people. Without the HR &amp; payroll hassle.</p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-soft">
            Riloyd provides skilled, reliable and compliant manpower for your business — managed end to end on our payroll. You focus on growth, we take care of the people.
          </p>
          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <Link to="/contact" className="solid-cta inline-flex w-fit items-center gap-3 rounded-full bg-primary px-7 py-3.5 text-sm font-extrabold text-primary-foreground">
              Talk to Our Manpower Team <ArrowRight size={17} />
            </Link>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {heroPoints.map(([Icon, label]) => (
                <div key={label} className="flex items-center gap-3">
                  <Icon size={22} className="shrink-0 text-primary" />
                  <p className="text-sm font-bold leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card text-card-foreground">
        <div className="mx-auto grid max-w-[1380px] items-center gap-10 px-5 py-16 sm:px-6 lg:grid-cols-2 lg:px-12">
          <img src={valuesAsset} alt="Riloyd office wall reading people, process, performance, growth" className="w-full rounded-md object-cover" loading="lazy" decoding="async" />
          <div>
            <Eyebrow onLight>What we do</Eyebrow>
            <h2 className="mt-4 text-3xl font-black uppercase leading-[0.98] sm:text-4xl">
              Complete manpower solutions for <span className="text-primary">your business.</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-card-foreground sm:text-base">
              From recruitment to payroll, compliance to performance — we provide end-to-end manpower solutions so you can focus on your core business.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {solutions.map(([Icon, title, copy]) => (
                <article key={title} className="flex gap-4 rounded-md border border-border p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Icon size={20} />
                  </span>
                  <div>
                    <h3 className="font-extrabold">{title}</h3>
                    <p className="mt-1 text-sm text-card-foreground">{copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-border">
        <img src={teamAsset} alt="Business team meeting at sunset" className="absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" />
        <div className="hero-shade absolute inset-0" />
        <div className="relative z-10 mx-auto max-w-[1380px] px-5 py-16 sm:px-6 lg:px-12">
          <Eyebrow>Our process</Eyebrow>
          <h2 className="headline mt-4 text-3xl font-black uppercase leading-[0.98] sm:text-5xl">
            From requirement<br /><span className="text-primary">to deployment.</span>
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map(([Icon, n, title, copy]) => (
              <article key={n} className="rounded-md border border-border bg-background/70 p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-black text-primary">{n}</p>
                  <Icon size={22} className="text-primary" />
                </div>
                <h3 className="mt-3 font-extrabold">{title}</h3>
                <p className="mt-2 text-sm text-soft">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card text-card-foreground">
        <div className="mx-auto max-w-[1380px] px-5 py-16 sm:px-6 lg:px-12">
          <Eyebrow onLight>Key deliverables</Eyebrow>
          <h2 className="mt-4 text-3xl font-black uppercase sm:text-4xl">
            What <span className="text-primary">you get</span>
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {deliverables.map(([Icon, title]) => (
              <article key={title} className="flex items-start gap-3 rounded-md border border-border p-5">
                <Icon size={22} className="shrink-0 text-primary" />
                <h3 className="text-sm font-bold leading-snug text-card-foreground">{title}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-border">
        <img src={heroAsset} alt="Riloyd office at sunset" className="absolute inset-0 h-full w-full object-cover" decoding="async" fetchPriority="high" />
        <div className="hero-shade absolute inset-0" />
        <div className="relative z-10 mx-auto max-w-[1380px] px-5 py-16 sm:px-6 lg:px-12">
          <h2 className="headline text-3xl font-black uppercase leading-[0.98] sm:text-5xl">
            Build your team<br /><span className="text-primary">without the complexity.</span>
          </h2>
          <p className="mt-5 max-w-xl text-base text-soft">Reliable manpower. Simplified hiring. Complete payroll support.</p>
          <Link to="/contact" className="solid-cta mt-8 inline-flex items-center gap-3 rounded-full bg-primary px-8 py-3.5 text-sm font-extrabold text-primary-foreground">
            Talk to Riloyd <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </>
  );
}
