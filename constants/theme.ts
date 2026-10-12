/**
 * Calm, low-contrast palette: misty sage backgrounds, a soft sea-green primary
 * and muted accents, so the app feels restful during a stressful commute.
 */
export const colors = {
  background: '#F3F7F5',
  surface: '#FFFFFF',
  surfaceMuted: '#EDF3F0',
  border: '#E6EEEA',
  text: '#1E2F2C',
  textSecondary: '#5A6E69',
  textMuted: '#91A39E',

  primary: '#3E8E83',
  primaryDark: '#2B6A61',
  /** Deep teal for the home hero and other high-emphasis surfaces. */
  ink: '#1F4F48',
  inkSoft: 'rgba(255, 255, 255, 0.12)',
  onInk: '#FFFFFF',
  onInkMuted: 'rgba(255, 255, 255, 0.72)',
  primarySoft: '#E3F1EE',
  accent: '#5E8FB8',
  accentSoft: '#E7EFF7',

  success: '#3F8A5C',
  successSoft: '#E6F3EA',
  warning: '#B7772F',
  warningSoft: '#FAF0E2',
  danger: '#C25B5B',
  dangerSoft: '#FBEDEC',
  violet: '#7F72C2',
  violetSoft: '#F0EEFA',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 } as const;

export const radius = { sm: 10, md: 14, lg: 20, xl: 26, pill: 999 } as const;

export const font = {
  display: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  title: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  heading: { fontSize: 17, fontWeight: '700' as const },
  body: { fontSize: 15, fontWeight: '500' as const },
  small: { fontSize: 13, fontWeight: '500' as const },
  caption: { fontSize: 12, fontWeight: '600' as const },
};

/** Wide, faint shadow — cards float gently instead of popping. */
export const shadow = { boxShadow: '0px 10px 30px rgba(30, 60, 52, 0.06)' } as const;

/** For the one surface that sits above everything else (search card, tab bar). */
export const shadowLifted = { boxShadow: '0px 18px 40px rgba(20, 50, 44, 0.14)' } as const;

/** Unhurried timings (ms) for entrance and loading animations. */
export const motion = { enter: 380, stagger: 70, breathe: 1400 } as const;

/** Minimum comfortable touch target (Android guideline is 48dp). */
export const touchTarget = 48;
