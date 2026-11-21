import { AppSettings } from '../types';

export const DEFAULT_APP_SETTINGS: AppSettings = {
  appName: 'Les Anciens',
  logo: '/assets/aistudio/logo_ancien_323e7a8f.png',
  accentColor: '#d4a843',
};

export interface AccentPreset {
  name: string;
  hex: string;
}

export const ACCENT_COLOR_PRESETS: AccentPreset[] = [
  { name: 'Or Impérial', hex: '#d4a843' },
  { name: 'Émeraude', hex: '#10b981' },
  { name: 'Bleu Royal', hex: '#3b82f6' },
  { name: 'Améthyste', hex: '#a855f7' },
  { name: 'Rubis', hex: '#f43f5e' },
  { name: 'Cuivre', hex: '#f97316' },
  { name: 'Turquoise', hex: '#06b6d4' },
  { name: 'Argent', hex: '#cbd5e1' },
];

export const LOGO_PRESETS: string[] = [
  '/assets/aistudio/logo_ancien_323e7a8f.png',
  '🎓',
  '🏛️',
  '🌍',
  '🤝',
  '⭐',
  '🦅',
  '📚',
  '🔥',
  '💎',
  '🛡️',
];

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

const clampChannel = (value: number): number => Math.max(0, Math.min(255, Math.round(value)));

const hexToRgb = (hex: string): [number, number, number] => {
  const safe = HEX_COLOR_RE.test(hex) ? hex : DEFAULT_APP_SETTINGS.accentColor;
  const r = parseInt(safe.slice(1, 3), 16);
  const g = parseInt(safe.slice(3, 5), 16);
  const b = parseInt(safe.slice(5, 7), 16);
  return [r, g, b];
};

const rgbToHex = (r: number, g: number, b: number): string =>
  `#${[r, g, b]
    .map(c => clampChannel(c).toString(16).padStart(2, '0'))
    .join('')}`;

const mixWithWhite = (rgb: [number, number, number], ratio: number): string =>
  rgbToHex(
    rgb[0] + (255 - rgb[0]) * ratio,
    rgb[1] + (255 - rgb[1]) * ratio,
    rgb[2] + (255 - rgb[2]) * ratio
  );

const getRelativeLuminance = ([r, g, b]: [number, number, number]): number => {
  const linearize = (v: number) => {
    const srgb = v / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
};

export const computeThemePalette = (hex: string) => {
  const accent = HEX_COLOR_RE.test(hex) ? hex.toLowerCase() : DEFAULT_APP_SETTINGS.accentColor;
  const rgb = hexToRgb(accent);
  const accentLight = mixWithWhite(rgb, 0.22);
  const accentHighlight = mixWithWhite(rgb, 0.36);
  const luminance = getRelativeLuminance(rgb);
  const contrast = luminance > 0.36 ? '#111111' : '#ffffff';

  return {
    accent,
    accentLight,
    accentHighlight,
    rgbString: `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`,
    contrast,
  };
};

export const applyThemeToDocument = (settings: AppSettings) => {
  if (typeof document === 'undefined') return;
  const palette = computeThemePalette(settings.accentColor);
  const rootStyle = document.documentElement.style;
  rootStyle.setProperty('--app-accent', palette.accent);
  rootStyle.setProperty('--app-accent-light', palette.accentLight);
  rootStyle.setProperty('--app-accent-highlight', palette.accentHighlight);
  rootStyle.setProperty('--app-accent-rgb', palette.rgbString);
  rootStyle.setProperty('--app-accent-contrast', palette.contrast);

  const safeName = settings.appName.trim() || DEFAULT_APP_SETTINGS.appName;
  document.title = `${safeName} — Réseau des Anciens Étudiants`;
};
