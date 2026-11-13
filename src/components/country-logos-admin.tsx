import { useEffect, useRef, useState } from "react";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Eye, Moon, Save, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { marketConfigs, marketOrder } from "@/lib/market-config";
import { countryLogosQuery } from "@/lib/country-logos-query";
import { saveCountryLogo } from "@/lib/country-logos.functions";
import { resolveLogo, validateLogoFile, type LogoCountry, type LogoTheme } from "@/lib/country-logo-schemas";

export function CountryLogosAdmin() {
  const { data: logos } = useSuspenseQuery(countryLogosQuery);
  const queryClient = useQueryClient();
  const saveLogo = useServerFn(saveCountryLogo);
  const [country, setCountry] = useState<LogoCountry>("india");
  const [theme, setTheme] = useState<LogoTheme>("light");
  const [file, setFile] = useState<File | null>(null);
  const [draftUrl, setDraftUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const market = marketConfigs[country];
  const fallback = (theme === "light") === (market.logoTone === "dark") ? market.logo : market.logoAlt;
  const savedUrl = resolveLogo(logos, country, theme, fallback);

  useEffect(() => {
    if (!file) { setDraftUrl(""); return; }
    const url = URL.createObjectURL(file); setDraftUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function clear() { setFile(null); setMessage(""); if (input.current) input.current.value = ""; }
  async function choose(next: File | undefined) {
    if (!next) return;
    try {
      validateLogoFile(next);
      const image = await createImageBitmap(next);
      image.close(); setFile(next); setMessage("");
    } catch (error) { clear(); setMessage(error instanceof Error ? error.message : "Choose a valid image."); }
  }
  async function save() {
    if (!file || busy) return;
    setBusy(true); setMessage("");
    const data = new FormData(); data.set("country", country); data.set("theme", theme); data.set("file", file);
    try {
      await saveLogo({ data });
      await queryClient.invalidateQueries({ queryKey: countryLogosQuery.queryKey });
      clear(); setMessage(`${market.name} ${theme} logo saved.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Logo could not be saved."); }
    finally { setBusy(false); }
  }
  function sendPreview() {
    if (draftUrl) frame.current?.contentWindow?.postMessage({ type: "riloyd-logo-preview", country, theme, url: draftUrl }, window.location.origin);
  }

  return <section className="mt-8">
    <h2 className="text-2xl font-black uppercase">Country logos</h2>
    <div className="mt-6 grid gap-6 border-y border-border py-6 lg:grid-cols-[.8fr_1.2fr]">
      <div className="grid content-start gap-5">
        <div className="grid gap-2"><Label htmlFor="logo-country">Country</Label><select id="logo-country" disabled={busy} value={country} onChange={event => { clear(); setCountry(event.target.value as LogoCountry); }} className="h-10 rounded-md border border-input bg-background px-3 text-sm">{marketOrder.map(key => <option key={key} value={key}>{key === "uk" ? "Britain" : marketConfigs[key].name}</option>)}</select></div>
        <div className="grid gap-2"><Label>Theme</Label><div className="flex gap-2" role="group" aria-label="Logo theme">{(["light", "dark"] as const).map(value => <Button key={value} disabled={busy} variant={theme === value ? "default" : "outline"} aria-pressed={theme === value} onClick={() => { clear(); setTheme(value); }}>{value === "light" ? <Sun size={16} /> : <Moon size={16} />}{value === "light" ? "Light" : "Dark"}</Button>)}</div></div>
        <div className="grid gap-2"><Label htmlFor="country-logo-file">Logo · PNG, WebP, JPG · up to 5 MB</Label><Input ref={input} id="country-logo-file" type="file" accept="image/png,image/webp,image/jpeg" disabled={busy} onChange={event => void choose(event.target.files?.[0])} /></div>
        {file && <div className="flex min-w-0 items-center justify-between gap-3"><span className="truncate text-xs text-muted-foreground">{file.name}</span><Button size="icon" variant="ghost" disabled={busy} aria-label="Discard selected logo" onClick={clear}><X size={16} /></Button></div>}
        <div className="flex flex-wrap gap-2"><Button disabled={!file || !draftUrl || busy} onClick={() => void save()}><Save size={16} />{busy ? "Saving…" : "Save logo"}</Button><Button variant="outline" disabled={!draftUrl || busy} onClick={() => setPreview(true)}><Eye size={16} />Preview website</Button></div>
        {message && <p role="status" className="text-sm text-primary">{message}</p>}
      </div>
      <div className={`logo-preview ${theme === "light" ? "logo-preview-light" : "logo-preview-dark"} min-w-0 rounded-md border border-border bg-surface p-6 text-foreground`}>
        <div className="flex items-center justify-between gap-3"><h3 className="font-bold">Riloyd {market.name}</h3><span className="text-xs">{file ? "Unsaved preview" : "Current logo"}</span></div>
        <div className="flex h-48 items-center justify-center"><img src={draftUrl || savedUrl} alt={`${market.name} ${theme} logo preview`} className="max-h-36 w-auto max-w-full object-contain" /></div>
        <div className="border-t border-border pt-4"><h4 className="text-xs font-bold">Footer</h4><img src={draftUrl || savedUrl} alt={`${market.name} footer preview`} className="mt-4 h-9 w-auto max-w-full object-contain" /></div>
      </div>
    </div>
    <Dialog open={preview} onOpenChange={setPreview}><DialogContent className="flex h-[85vh] max-w-[1200px] flex-col gap-3 p-4"><DialogHeader><DialogTitle>Riloyd {market.name} · {theme} preview</DialogTitle></DialogHeader><iframe ref={frame} title="Website logo preview" src={`/global-presence/${country}`} onLoad={() => { sendPreview(); window.setTimeout(sendPreview, 500); window.setTimeout(sendPreview, 1500); }} className="min-h-0 w-full flex-1 rounded-md border border-border" /></DialogContent></Dialog>
  </section>;
}