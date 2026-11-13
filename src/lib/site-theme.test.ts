import { describe, expect, it } from 'vitest';
import { FESTIVE_DECORATION_MS, festiveDecorationAt, festiveDecorations, msUntilNextDecorationSwitch, nextSiteTheme, readSiteTheme, siteThemes, usesLightSurfaces } from './site-theme';

describe('three site themes', () => {
  it('offers only dark, light and festive', () => {
    expect(siteThemes).toEqual(['dark', 'light', 'festive']);
  });
  it('cycles dark to light to festive and back to dark', () => {
    expect(nextSiteTheme('dark')).toBe('light');
    expect(nextSiteTheme('light')).toBe('festive');
    expect(nextSiteTheme('festive')).toBe('dark');
  });
  it('defaults to festive and migrates the old Diwali choice', () => {
    expect(readSiteTheme('dark')).toBe('dark');
    expect(readSiteTheme('light')).toBe('light');
    expect(readSiteTheme('diwali')).toBe('festive');
    expect(readSiteTheme(null)).toBe('festive');
  });
});

describe('festive Chhath Puja design', () => {
  it('always uses the light Chhath colours, never the dark Diwali theme', () => {
    expect(usesLightSurfaces('festive')).toBe(true);
    expect(usesLightSurfaces('dark')).toBe(false);
  });
  it('swaps decorations between Chhath and Diwali every 5 seconds', () => {
    expect(festiveDecorations).toEqual(['chhath', 'diwali']);
    expect(FESTIVE_DECORATION_MS).toBe(5_000);
    expect(festiveDecorationAt(0)).toBe('chhath');
    expect(festiveDecorationAt(4_999)).toBe('chhath');
    expect(festiveDecorationAt(5_000)).toBe('diwali');
    expect(festiveDecorationAt(10_000)).toBe('chhath');
  });
  it('waits until the next 5-second mark', () => {
    expect(msUntilNextDecorationSwitch(500)).toBe(4_500);
  });
});
