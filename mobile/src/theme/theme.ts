import { MD3LightTheme } from 'react-native-paper'

// Legacy keys (darkGreen/green/mintGreen/errorRed) are kept as-is so screens
// not yet migrated to the fintech redesign keep their current look. New
// screens should use the design-system tokens below instead.
export const brandColors = {
  darkGreen: '#12331F',
  green: '#2E7D4F',
  mintGreen: '#8FCB7C',
  errorRed: '#C7433A',

  // Fintech redesign palette — nude background, deep-green cards, gold accents.
  deep: '#1B5E20',
  emerald: '#2E7D32',
  paper: '#EDE0C9',
  grey: '#E8ECEA',
  charcoal: '#3A2E22',
  charcoalSoft: '#7A6A56',
  gold: '#F9A825',
  goldSoft: '#FDF0D8',
  success: '#35A64A',
  successSoft: '#E1F3E3',
  teal: '#2E8B84',
  tealSoft: '#E0F0EE',
  alert: '#C1443B',
  alertSoft: '#FBE9E7',
  surface: '#FFFFFF',
  line: '#E3E7E2',
  cardGreen: '#2F6B4A',
  inkOnCard: '#FFFFFF',
  inkOnCardSoft: 'rgba(255,255,255,0.78)',
}

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
  colors: {
    ...MD3LightTheme.colors,
    primary: brandColors.green,
    secondary: brandColors.mintGreen,
    background: '#F7F8F5',
    surface: '#FFFFFF',
    error: brandColors.errorRed,
  },
}
