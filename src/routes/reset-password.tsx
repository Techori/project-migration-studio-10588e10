import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const searchSchema = z.object({ next: z.string().optional() });
const passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(72);

// Only same-site paths are allowed after the reset, so the link can't send people elsewhere.
const safeNext = (next?: string) => (next && next.startsWith("/") && !next.startsWith("//") ? next : "/admin");

export const Route = createFileRoute("/reset-password")({
  validateSearch: searchSchema,
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Set a new password — Riloyd" },
      { name: "description", content: "Choose a new password for your Riloyd account." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Set a new password — Riloyd" },
      { property: "og:description", content: "Choose a new password for your Riloyd account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setHasSession(Boolean(session));
      setReady(true);
    });
    void supabase.auth.getSession().then(({ data }) => { setHasSession(Boolean(data.session)); setReady(true); });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMsg(null);
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) { setMsg(parsed.error.issues[0]?.message ?? "Check the password"); return; }
    if (password !== confirm) { setMsg("The two passwords don't match."); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data });
    setBusy(false);
    if (error) { setMsg(error.message); return; }
    setMsg("Password saved. Taking you back…");
    await navigate({ to: safeNext(next) as "/admin" });
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-2xl font-extrabold">Set a new password</h1>
      {!ready ? <p className="mt-4 text-sm text-muted-foreground">Checking your link…</p>
        : !hasSession ? <p className="mt-4 text-sm text-muted-foreground">This link has expired or was already used. Go back to the sign-in page and request a new one.</p>
        : <form onSubmit={submit} className="mt-8 grid max-w-md gap-4 border border-border bg-surface p-6">
            <div className="grid gap-2"><Label htmlFor="r-pass">New password</Label><Input id="r-pass" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <div className="grid gap-2"><Label htmlFor="r-confirm">Confirm new password</Label><Input id="r-confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></div>
            {msg && <p role="status" className="text-sm text-muted-foreground">{msg}</p>}
            <Button type="submit" disabled={busy}>{busy ? "Please wait…" : "Save new password"}</Button>
          </form>}
    </main>
  );
}
