import { useEffect, useRef, useState } from "react";

/** Defer offscreen footage; retain silent inline autoplay when it is visible. */
export function ViewportVideo({ src, fallbackSrc, poster, label, className }: { src: string; fallbackSrc: string; poster?: string; label: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (!("IntersectionObserver" in window)) { setReady(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setReady(true);
        void video.play().catch(() => { /* Browser autoplay policy may defer playback. */ });
      } else video.pause();
    }, { rootMargin: "200px" });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);
  return <video ref={ref} src={ready ? (fallback ? fallbackSrc : src) : undefined} onError={() => { if (ready && !fallback) setFallback(true); }} autoPlay muted loop playsInline preload="none" poster={poster} className={className} aria-label={label} />;
}