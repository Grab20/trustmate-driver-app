import { MD3LightTheme, configureFonts } from 'react-native-paper'

// Palette matched to the TrustMate Marketplace web app (Grab20/TrustMate) —
// its globals.css and page components use only these greens plus cream/sand
// neutrals, with no gold or teal anywhere. Token *names* below are kept as-is
// so every existing call site picks up the new palette without needing to
// touch ~20 files individually; only the hex values changed to match the
// Marketplace exactly. darkGreen/green/mintGreen are left untouched — they're
// only used for the illustrative SVG shot-guide diagrams' line art, which is
// a separate concern from brand chrome.
export const brandColors = {
  darkGreen: '#12331F',
  green: '#2E7D4F',
  mintGreen: '#8FCB7C',
  errorRed: '#C7433A',

  // Marketplace palette: primary/accent green, cream/sand neutrals.
  deep: '#1A2E1A', // marketplace primary green (buttons, CTA sections)
  emerald: '#1A5C28', // marketplace accent green (links, secondary actions)
  paper: '#FAFAF8', // marketplace cream page background
  grey: '#ECECEA', // marketplace border grey
  charcoal: '#0D1F0E', // marketplace heading/ink green-black
  charcoalSoft: '#666666', // marketplace secondary body-copy grey
  // No gold exists in the Marketplace palette — these now render as greens:
  // a bright pop-accent for highlights on dark cards (gold) and a pale pill
  // background for light-surface badges (goldSoft), matching how the
  // Marketplace itself reuses one light-green pill style for badges/status.
  gold: '#8FCB7C',
  goldSoft: '#D4EDD8',
  success: '#1A5C28',
  successSoft: '#D4EDD8',
  // No teal exists either — repointed to the ink green (a dark, distinct
  // "alternate state" tone) and sand, keeping the whole palette green-only.
  teal: '#0D1F0E',
  tealSoft: '#F0EDE6',
  alert: '#8B2020', // marketplace form-error text
  alertSoft: '#FEE2E2', // marketplace form-error background
  surface: '#FFFFFF',
  line: '#ECECEA',
  cardGreen: '#1A2E1A',
  inkOnCard: '#FFFFFF',
  inkOnCardSoft: '#9AB89C', // marketplace's muted text-on-dark-green tone
  sand: '#F0EDE6', // marketplace's alternating-section background
}

// Marketplace headings are set in Georgia serif with sans-serif body copy —
// mirrored here with PT Serif (Georgia isn't bundled on Android) for the
// "heading-shaped" MD3 variants, leaving body/label variants on the
// platform sans-serif default.
const serifHeading = { fontFamily: 'PTSerif_700Bold', fontWeight: 'normal' as const }
const fonts = configureFonts({
  config: {
    displayLarge: serifHeading,
    displayMedium: serifHeading,
    displaySmall: serifHeading,
    headlineLarge: serifHeading,
    headlineMedium: serifHeading,
    headlineSmall: serifHeading,
    titleLarge: serifHeading,
    titleMedium: serifHeading,
    titleSmall: serifHeading,
  },
})

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
}

export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
}

export const cardShadow = {
  shadowColor: '#1B1B1B',
  shadowOpacity: 0.08,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
}

export const theme = {
  ...MD3LightTheme,
  roundness: 6,
  fonts,
  colors: {
    ...MD3LightTheme.colors,
    primary: brandColors.emerald,
    secondary: brandColors.mintGreen,
    background: brandColors.paper,
    surface: '#FFFFFF',
    error: brandColors.alert,
  },
}
