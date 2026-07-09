import { MD3LightTheme } from 'react-native-paper'

// Placeholder brand palette — swap for TrustMate's real brand colors once
// extracted from the website's CSS (we don't have the site's source in this repo).
export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#0F5C4F',
    secondary: '#1B7A6B',
    background: '#F7F8F7',
    surface: '#FFFFFF',
    error: '#B3261E',
  },
}
