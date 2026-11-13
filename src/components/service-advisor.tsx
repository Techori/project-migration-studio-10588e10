import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recommendServices, type ServiceRecommendation } from "@/lib/service-advisor.functions";

export function ServiceAdvisor() {
  const [needs, setNeeds] = useState("");
  const advise = useServerFn(recommendServices);
  const mutation = useMutation<ServiceRecommendation, Error, string>({
    mutationFn: (value: string) => advise({ data: { needs: value } }),
  });

  return (
    <section id="advisor" className="border-b border-border bg-background">
      <div className="mx-auto max-w-[1380px] px-5 py-12 sm:px-6 lg:px-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
          <div>
            <p className="section-label">Find your service</p>
            <h2 className="mt-4 text-2xl font-black leading-tight sm:text-3xl lg:text-4xl">
              Tell us your goal, get a <span className="text-primary">matched service</span>
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              Describe what you are building or struggling with. Our assistant suggests the RILOYD services that fit
              best, so you start the conversation in the right place.
            </p>
            <form
              className="mt-6"
              onSubmit={(event) => {
                event.preventDefault();
                if (needs.trim().length >= 20) mutation.mutate(needs.trim());
              }}
            >
              <label htmlFor="advisor-needs" className="text-xs font-bold uppercase tracking-wide">
                Your project needs
              </label>
              <textarea
                id="advisor-needs"
                value={needs}
                onChange={(event) => setNeeds(event.target.value)}
                rows={5}
                maxLength={1500}
                placeholder="e.g. We run a food manufacturing unit in Indore and need working capital plus a plan to double retail distribution this year."
                className="mt-2 w-full rounded-xl border border-border bg-surface p-3 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/60"
              />
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Button type="submit" className="h-10 rounded-full px-5 text-xs font-bold" disabled={mutation.isPending || needs.trim().length < 20}>
                  {mutation.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
                  {mutation.isPending ? "Matching..." : "Suggest a service"}
                </Button>
                <span className="text-[11px] text-muted-foreground">At least 20 characters. No details are stored.</span>
              </div>
            </form>
            {mutation.isError && (
              <p role="alert" className="mt-3 text-xs font-semibold text-primary">
                {mutation.error.message}
              </p>
            )}
          </div>

          <div aria-live="polite" className="rounded-2xl border border-border bg-surface p-5 sm:p-7">
            {mutation.data ? (
              <div>
                <p className="text-sm leading-relaxed">{mutation.data.summary}</p>
                <div className="mt-5 flex flex-col gap-3">
                  {mutation.data.recommendations.map((item) => (
                    <Link
                      key={item.key}
                      to="/services/$slug"
                      params={{ slug: item.slug }}
                      className="group rounded-xl border border-border p-4 transition-colors hover:border-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    >
                      <span className="flex items-center justify-between gap-3 text-sm font-bold">
                        {item.title}
                        <ArrowRight size={16} className="text-primary" />
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{item.reason}</span>
                    </Link>
                  ))}
                </div>
                <Link to="/contact" className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-primary">
                  Talk to our team <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="text-xs leading-relaxed text-muted-foreground">
                <p className="text-sm font-bold text-foreground">What you will get</p>
                <ul className="mt-3 flex flex-col gap-2">
                  <li>A short read of your situation in plain language.</li>
                  <li>Up to three RILOYD services matched to your goal.</li>
                  <li>A direct link to each service and to our team.</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
