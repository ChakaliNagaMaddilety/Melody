export const COLORS = {
  // Backgrounds
  bgDarkest: '#0A0A0F',
  bgDark: '#121218',
  bgCard: '#1A1A24',
  bgCardHover: '#22222E',
  bgElevated: '#2A2A38',

  // Gradients
  purple: '#8B5CF6',
  purpleLight: '#A78BFA',
  purpleDark: '#7C3AED',
  coral: '#FF6B6B',
  coralLight: '#FF8E8E',
  coralDark: '#E85555',
  pink: '#EC4899',

  // Accents
  accent: '#8B5CF6',
  accentSecondary: '#FF6B6B',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A1A1B3',
  textTertiary: '#6B6B7B',
  textOnAccent: '#FFFFFF',

  // Borders & misc
  border: '#2A2A38',
  borderLight: '#353545',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayDark: 'rgba(0, 0, 0, 0.8)',
  shadow: 'rgba(0, 0, 0, 0.4)',
  scrim: 'rgba(10, 10, 15, 0.9)',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
} as const;

export const TYPOGRAPHY = {
  hero: 32,
  title: 24,
  subtitle: 18,
  body: 16,
  caption: 14,
  small: 12,
  tiny: 10,
} as const;

export const GRADIENTS = {
  primary: [COLORS.purpleDark, COLORS.purple],
  coral: [COLORS.coralDark, COLORS.coral],
  mixed: [COLORS.purple, COLORS.coral],
  hero: [COLORS.purpleDark, COLORS.purple, COLORS.coral],
};

export const ANIMATION = {
  fast: 200,
  normal: 300,
  slow: 500,
  slower: 800,
};
