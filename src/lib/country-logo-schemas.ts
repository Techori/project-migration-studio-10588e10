import { z } from "zod";

export const logoCountries = ["india", "uk", "uae", "canada", "usa", "singapore", "europe", "australia"] as const;
export const countryLogoSchema = z.object({ country: z.enum(logoCountries), theme: z.enum(["light", "dark"]) });
export type LogoTheme = "light" | "dark";
export type LogoCountry = (typeof logoCountries)[number];
export type CountryLogo = { country: LogoCountry; theme: LogoTheme; url: string };

export function validateLogoFile(file: { type: string; size: number }) {
  if (!file.size || file.size > 5 * 1024 * 1024) throw new Error("Choose an image up to 5 MB.");
  const extensions: Record<string, string> = { "image/png": "png", "image/webp": "webp", "image/jpeg": "jpg" };
  const extension = extensions[file.type];
  if (!extension) throw new Error("Choose a PNG, WebP or JPG logo.");
  return extension;
}

export function matchesLogoSignature(bytes: Uint8Array, extension: string) {
  if (extension === "png") return [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value);
  if (extension === "jpg") return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  return extension === "webp" && new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
}

export function resolveLogo(logos: CountryLogo[], country: string, theme: LogoTheme, fallback: string) {
  return logos.find(logo => logo.country === country && logo.theme === theme)?.url ?? fallback;
}