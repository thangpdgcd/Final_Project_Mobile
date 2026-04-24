import { Platform } from 'react-native';

/**
 * Synced from web tokens:
 * - web_frontend/src/styles/themescss/themes.scss
 * - web_frontend/src/styles/globalcss/globals.css
 */
const brandPrimaryLight = '#a0645a';
const brandPrimaryDark = '#c69c6d';

export const Colors = {
  light: {
    text: '#2f1f18', // --text-main
    background: '#efe2d2', // --bg-main
    surface: '#f5eadc', // --bg-surface
    muted: '#ead8c3', // --bg-surface-2
    tint: brandPrimaryLight,
    icon: '#6a4e3d', // --text-muted
    tabIconDefault: '#6a4e3d',
    tabIconSelected: brandPrimaryLight,
    danger: '#d4380d',
    success: '#039855',
    border: 'rgba(0,0,0,0.08)', // --border-soft
    accent: '#d4a574', // --accent
  },
  dark: {
    text: 'rgba(255,255,255,0.92)', // --text-main
    background: '#0f1113', // --bg-main
    surface: '#15181b', // --bg-surface
    muted: '#101214', // --bg-surface-2
    tint: brandPrimaryDark,
    icon: 'rgba(255,255,255,0.6)', // --text-muted
    tabIconDefault: 'rgba(255,255,255,0.6)',
    tabIconSelected: brandPrimaryDark,
    danger: '#F97066',
    success: '#32D583',
    border: 'rgba(255,255,255,0.12)', // --border-soft
    accent: '#f5a623', // --accent
  },
} as const;

export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
} as const;

export const Typography = {
  display: {
    fontFamily: 'ViaodaLibre_400Regular',
  },
  body: {
    fontFamily: 'Inter_400Regular',
  },
  bodySemi: {
    fontFamily: 'Inter_600SemiBold',
  },
  bodyBold: {
    fontFamily: 'Inter_700Bold',
  },
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

