import { useEffect, useState } from "react";
import { Timer } from "lucide-react";
import { countdownParts, registrationDeadline, type CountdownParts } from "@/lib/registration-deadline";

const units: Array<[keyof Omit<CountdownParts, "closed">, string]> = [
  ["days", "Days"],
  ["hours", "Hours"],
  ["minutes", "Minutes"],
  ["seconds", "Seconds"],
];

export function RegistrationCountdown() {
  const [parts, setParts] = useState<CountdownParts | null>(null);

  useEffect(() => {
    const tick = () => setParts(countdownParts(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="rounded-lg border border-primary/40 bg-primary/10 px-5 py-5 text-center">
      <p className="flex items-center justify-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-primary">
        <Timer size={16} strokeWidth={2} /> Registration closes 10 November 2026
      </p>
      {parts === null ? (
        <p className="mt-3 text-sm font-bold text-muted-foreground">Loading countdown…</p>
      ) : parts.closed ? (
        <p className="mt-3 text-lg font-black">Registration is now closed</p>
      ) : (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {units.map(([key, label]) => (
            <div key={key} className="rounded-md border border-border bg-background px-2 py-3">
              <p className="text-2xl font-black tabular-nums sm:text-3xl">{String(parts[key]).padStart(2, "0")}</p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground sm:text-[10px]">{label}</p>
            </div>
          ))}
        </div>
      )}
      <p className="mt-3 text-[10px] text-muted-foreground">
        Seats are limited — register before {registrationDeadline.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} (11:59 PM IST).
      </p>
    </div>
  );
}
