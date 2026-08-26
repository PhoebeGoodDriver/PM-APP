import { createLightTheme, type BrandVariants, type Theme } from '@fluentui/react-components';

const brand: BrandVariants = {
  10: '#0A0510',
  20: '#180D28',
  30: '#221240',
  40: '#2B1855',
  50: '#331D66',
  60: '#3C2377',
  70: '#442888',
  80: '#4B2E83',
  90: '#5A3899',
  100: '#6942AA',
  110: '#794EBB',
  120: '#8B5CF6',
  130: '#9E71F8',
  140: '#B187FA',
  150: '#C39EFB',
  160: '#D6B5FC',
};

export const fedexTheme: Theme = {
  ...createLightTheme(brand),
  fontFamilyBase:
    "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif",
  colorNeutralBackground1: '#FFFFFF',
  colorNeutralBackground2: '#F3F2F1',
  colorNeutralBackground3: '#F3F2F1',
  colorNeutralStroke1: '#EDEBE9',
  colorNeutralStroke2: '#EDEBE9',
  colorNeutralForeground1: '#201F1E',
  colorNeutralForeground2: '#605E5C',
  colorNeutralForeground3: '#8A8886',
  borderRadiusMedium: '8px',
  borderRadiusLarge: '8px',
};

export const palette = {
  primaryPurple: '#4B2E83',
  sidebarDark: '#2B1855',
  accentPurple: '#8B5CF6',
  appBackground: '#F3F2F1',
  cardBackground: '#FFFFFF',
  cardBorder: '#EDEBE9',
  textPrimary: '#201F1E',
  textSecondary: '#605E5C',
  textMuted: '#8A8886',
} as const;
