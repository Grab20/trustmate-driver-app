import { MD3LightTheme } from 'react-native-paper'

// Matches trustmate.co.za's dark forest-green brand: deep green header/hero
// surfaces, a brighter green for CTAs, and a light mint-green accent for
// highlighted text.
export const brandColors = {
  darkGreen: '#12331F',
  green: '#2E7D4F',
  mintGreen: '#8FCB7C',
  errorRed: '#C7433A',
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
