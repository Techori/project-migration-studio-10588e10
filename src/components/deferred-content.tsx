import { useEffect, useRef, useState, type ReactNode } from "react";

/** Keep optional interactive bundles off the critical path. */
export function DeferredContent({ children, fallback = null, mode = "viewport", className }: { children: ReactNode; fallback?: ReactNode; mode?: "viewport" | "idle"; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (mode === "idle") {
      let idle: number | undefined;
      const timer = window.setTimeout(() => {
        if ("requestIdleCallback" in window) idle = window.requestIdleCallback(() => setReady(true), { timeout: 2000 });
        else setReady(true);
      }, 1500);
      return () => { window.clearTimeout(timer); if (idle !== undefined) window.cancelIdleCallback(idle); };
    }
    const element = ref.current;
    if (!element) return;
    if (!("IntersectionObserver" in window)) { setReady(true); return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setReady(true); observer.disconnect(); }
    }, { rootMargin: "300px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, [mode]);
  return <div ref={ref} className={className}>{ready ? children : fallback}</div>;
}