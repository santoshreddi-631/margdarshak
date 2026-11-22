/**
 * Global Design Tokens & Theme Specification
 * AI-Powered Multilingual Career Guidance System (Margdarshak)
 * 
 * Aesthetic Direction: Clean, soft, humanistic modern education UI
 * Inspired by the reference design system (Fustat typography, pastel palette):
 * - Primary Dark / Charcoal: #222222 (Text, active pill chips, floating dock bar)
 * - Accent Lavender / Periwinkle: #A28EF9 (Profile banner, active date pill, accent highlights)
 * - Accent Pastel Mint: #A4F5A6 (Active schedule card, progress fill, achievements)
 * - Pure White: #FFFFFF (Cards, floating nav active capsule, search containers)
 * - Soft Light Background: #F3F5F9 (Clean, airy, modern canvas)
 * - Subdued Slate / Grey: #7E828E / #8E929C (Secondary text, metadata)
 * - Subtle Borders: #ECEEF2
 */

export const Colors = {
  // Brand & Core Palette (Fustat Reference Swatches)
  dark: '#222222',             // Primary dark slate / charcoal
  primary: '#A28EF9',          // Soft Lavender / Periwinkle accent
  primaryDark: '#8B74E8',      // Lavender pressed / hover state
  primaryLight: '#C5B7FC',     // Light lavender tint
  primaryBg: '#EDE9FE',        // Very soft lavender pill background
  
  mint: '#A4F5A6',             // Pastel Mint Green (active card, progress fill)
  mintDark: '#6EE7B7',         // Mint pressed state
  mintLight: '#D1FAE5',        // Very soft mint pill background
  mintBg: '#E8FDE9',           // Mint card background tint

  // Canvas & Surfaces
  background: '#F3F5F9',       // Clean, soft off-white / light-grey canvas
  surface: '#FFFFFF',          // Pure white card & container surface
  surfaceElevated: '#FFFFFF',  // Elevated white cards with soft shadow
  surfaceMuted: '#F8F9FB',     // Subtle inset container
  surfaceSecondary: '#F3F5F9', // Secondary container background
  surfaceHighlight: '#A4F5A6', // Full pastel mint card highlight ("Now" state)
  surfaceLavender: '#A28EF9',  // Full lavender card highlight ("My notes" state)

  // Floating Dock Navigation
  dockBackground: '#222222',   // Floating black capsule bar
  dockActiveCapsule: '#FFFFFF',// Active tab white pill capsule
  dockActiveIcon: '#222222',   // Active icon inside white capsule
  dockInactiveIcon: '#FFFFFF', // Inactive white stroke icons

  // Typography
  textPrimary: '#222222',      // Deep charcoal for headings & primary labels
  text: '#222222',             // Alias for textPrimary
  textSecondary: '#7E828E',    // Soft grey for descriptions, subheadings, & dates
  textMuted: '#A3A7B2',        // Muted grey for captions & placeholders
  textInverse: '#FFFFFF',      // White text on dark buttons / lavender banners
  textAccent: '#A28EF9',       // Highlighted lavender text
  textMint: '#15803D',         // Deep green text for mint backgrounds

  // Boundaries & Dividers
  border: '#ECEEF2',           // Subtle divider & border lines
  borderStrong: '#D7DAE2',     // Focused borders & inputs
  divider: '#ECEEF2',          // Subtle divider line

  // Functional Semantic Accents & Badges
  tagAmberBg: '#FEF3C7',       // In-progress tag background
  tagAmberText: '#D97706',     // In-progress tag text
  tagLavenderBg: '#EDE9FE',    // To-do / Draft tag background
  tagLavenderText: '#7C3AED',   // To-do / Draft tag text
  tagMintBg: '#DCFCE7',        // Done / Eligible tag background
  tagMintText: '#16A34A',      // Done / Eligible tag text
  tagDarkBg: '#222222',        // Active filter pill
  tagDarkText: '#FFFFFF',      // Active filter pill text

  success: '#16A34A',          // Mint / green success
  successBg: '#DCFCE7',
  warning: '#D97706',          // Warm amber
  warningBg: '#FEF3C7',
  danger: '#EF4444',           // Soft red for validation errors
  dangerBg: '#FEE2E2',
  info: '#6366F1',             // Indigo info
  infoBg: '#EEF2FF',
} as const;

export const Typography = {
  fontSizes: {
    caption: 11,
    subtext: 13,
    body: 15,
    subtitle: 17,
    title: 20,
    heading: 24,
    display: 32,
  },
  lineHeights: {
    caption: 16,
    subtext: 20,
    body: 24,
    subtitle: 26,
    title: 30,
    heading: 34,
    display: 40,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
  // Text style presets for clean rounded composition
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '800' as const,
    color: '#222222',
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: 24,
    lineHeight: 34,
    fontWeight: '700' as const,
    color: '#222222',
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700' as const,
    color: '#222222',
  },
  h3: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600' as const,
    color: '#222222',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const,
    color: '#7E828E',
  },
  bodyBold: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600' as const,
    color: '#222222',
  },
  caption: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500' as const,
    color: '#A3A7B2',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 24,
  full: 9999,
  pill: 9999,
};

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#222222',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#222222',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#222222',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  dock: {
    shadowColor: '#222222',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 10,
  },
};
