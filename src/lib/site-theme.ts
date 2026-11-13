/** The switch offers exactly three choices; "festive" is the Chhath Puja design. */
export const siteThemes = ['dark', 'light', 'festive'] as const;
export type SiteTheme = typeof siteThemes[number];

/** Decorations shown inside the Chhath Puja design, in rotation order (colours never change). */
export const festiveDecorations = ['chhath', 'diwali'] as const;
export type FestiveDecoration = typeof festiveDecorations[number];

/** The garland and pictures swap between Chhath and Diwali every 5 seconds. */
export const FESTIVE_DECORATION_MS = 5 * 1000;

export const siteThemeLabels: Record<SiteTheme, string> = { dark: 'Dark', light: 'Light', festive: 'Festive' };
export const festiveDecorationLabels: Record<FestiveDecoration, string> = { chhath: 'Chhath Puja', diwali: 'Diwali' };

export function readSiteTheme(value: string | null): SiteTheme {
  if (value === 'dark' || value === 'light' || value === 'festive') return value;
  return 'festive'; // default, and migrates the earlier stored "diwali" choice
}

export function nextSiteTheme(theme: SiteTheme): SiteTheme {
  return theme === 'dark' ? 'light' : theme === 'light' ? 'festive' : 'dark';
}

/** Tied to the clock so every visitor sees the same decoration at the same time. */
export function festiveDecorationAt(timeMs: number): FestiveDecoration {
  return festiveDecorations[Math.floor(timeMs / FESTIVE_DECORATION_MS) % festiveDecorations.length] ?? 'chhath';
}

export function msUntilNextDecorationSwitch(timeMs: number): number {
  return FESTIVE_DECORATION_MS - (timeMs % FESTIVE_DECORATION_MS);
}

/** Festive is the light-coloured Chhath Puja design, so it builds on the light surfaces. */
export function usesLightSurfaces(theme: SiteTheme): boolean {
  return theme === 'light' || theme === 'festive';
}

export function applySiteTheme(theme: SiteTheme) {
  const root = document.documentElement;
  const light = usesLightSurfaces(theme);
  root.classList.toggle('light', light);
  root.classList.remove('diwali');
  root.classList.toggle('chhath', theme === 'festive');
  if (theme !== 'festive') delete root.dataset['festiveDecor'];
  root.style.colorScheme = light ? 'light' : 'dark';
}

export function applyFestiveDecoration(decoration: FestiveDecoration) {
  document.documentElement.dataset['festiveDecor'] = decoration;
}
